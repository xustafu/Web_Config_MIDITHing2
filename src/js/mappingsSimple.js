// Mappings tab — port view. One box per port that has a function, listing only the
// parameters that make sense to control from MIDI for that function, each with a
// "which MIDI message" dropdown. Curves and value ranges are fixed per parameter, so
// the user never sees slots, curves or min/max.
//
// How rows map onto the module's 32 mapping slots (firmware MIDIMapCfg.cpp,
// MapDefaultsPreset; addressing in MIDIMapManager.cpp matchAndApplySlot()):
//   - ADSR/LFO rows edit factory slots 0-8. Those target every voice on the channel
//     the message arrives on, so they are shared by all voices ("shared" in the UI).
//   - Glide rows edit factory slots 9-20, one per MIDI channel 1-12 (srcChan = ch),
//     shared by every port on that channel. A port on channel 13-16 has no factory
//     glide slot and uses a free slot instead.
//   - Everything else (Max/Min value, clock divider) uses a free slot, 21-31,
//     targeting that one port (tgt_number = port + 1) on the port's own channel.
//   - Tempo (internal clock box, only shown while the module runs on its internal
//     clock) uses a free slot targeting the internal clock port (tgt_number = 100,
//     GENMIDIMERGEPORT) and its PORTPERIOD, on any channel. The firmware stores a
//     period, not a BPM, and its range clamp needs min < max, so for now a higher
//     value means a longer period: knob up = slower, with most travel at slow tempos.
// The full slot editor is still available behind "Advanced" (mappingsUI.js).

import { q } from './globals.js';
import { sendMappingParam, sendMappingRestore } from './backend/sysexMgt.js';

const FIRST_FREE_SLOT = 21; // slots 21-31 carry no factory preset
const GLIDE_SLOT_BASE = 8;  // glide factory slot for MIDI channel ch (1-12) is 8 + ch
const GLIDE_CC = 5;
const MAX_TIME_ADSR = 9900;        // VoiceCfg.h MAXTIMEADSR
const MIN_LFO_PERIOD = 100;        // VoiceCfg.h MINLFOPeriod
const MAX_LFO_PERIOD = 1000000;    // VoiceCfg.h MAXLFOPeriod
const MAX_LFO_PREDELAY = 9990;     // VoiceCfg.h MAX_LFOPREDELAY
const MAX_PORT_GLIDE_TIME = 99990; // IOPortCfg.h MAXPORTGLIDETIME
const CURVE = { LIN: 0, EXP: 1, LOG: 2 }; // VoiceCfg.h ccTypeConv
const GENMIDIMERGEPORT = 100;      // Definitions.h: the internal clock's port
const TEMPO_MIN_PERIOD = 250000;   // µs per beat = 240 BPM
const TEMPO_MAX_PERIOD = 1000000;  // µs per beat = 60 BPM
const CLOCK_BOX = 'clock';         // box id for the internal clock (not a physical port)
// An LFO shape is four settings, one curve per quarter cycle. The Shape row writes the
// same source to all four (4 free slots), mapping the value onto curves 1-7
// (VoiceCfg.h LFO_Curves: tri, round, sine, square, saw up, saw down, random).
const SHAPE_QUADS = [LFOCurveTypeQ1, LFOCurveTypeQ2, LFOCurveTypeQ3, LFOCurveTypeQ4];
const SHAPE_FIRST = 1;             // LFO_TRI_CURVE
const SHAPE_LAST = 7;              // LFO_RANDOM_CURVE (LFO_LAST_CURVE - 1)
const WRITE_GAP_MS = 15; // bursts of back-to-back SysEx have been seen to drop messages

// Factory voice slots, in MapDefaultsPreset order. Curves and ranges copied 1:1.
const VOICE_PARAMS = {
  release: { label: 'Release', slot: 0, tgt: ADSRTRelease, curve: CURVE.EXP, min: 1, max: MAX_TIME_ADSR, cc: 72 },
  attack:  { label: 'Attack',  slot: 1, tgt: ADSRTAttack,  curve: CURVE.EXP, min: 1, max: MAX_TIME_ADSR, cc: 73 },
  level:   { label: 'Level',   slot: 2, tgt: ADSRLMax,     curve: CURVE.LOG, min: 1, max: 100, cc: 74 },
  decay:   { label: 'Decay',   slot: 3, tgt: ADSRTDecay,   curve: CURVE.EXP, min: 1, max: MAX_TIME_ADSR, cc: 75 },
  period:  { label: 'Period',  slot: 4, tgt: LFOPeriod,    curve: CURVE.EXP, min: MIN_LFO_PERIOD, max: MAX_LFO_PERIOD, cc: 76 },
  depth:   { label: 'Depth',   slot: 5, tgt: LFOMaxLevel,  curve: CURVE.LIN, min: 1, max: 100, cc: 77 },
  delay:   { label: 'Delay',   slot: 6, tgt: LFOPreDelay,  curve: CURVE.EXP, min: 0, max: MAX_LFO_PREDELAY, cc: 78 },
  sustain: { label: 'Sustain', slot: 7, tgt: ADSRLSustain, curve: CURVE.LOG, min: 1, max: 100, cc: 79 },
  offset:  { label: 'Offset',  slot: 8, tgt: LFOOffset,    curve: CURVE.LIN, min: 0, max: 100, cc: 80 },
};

// Port parameters. Output range for Max/Min value follows the port function's own
// value range (DEF_FUNCT_VALUES), so a Pitch Bend port gets 0-16383.
const PORT_PARAMS = {
  glide:   { label: 'Glide time', tgt: PORTGLIDETIME, curve: CURVE.EXP, range: () => [0, MAX_PORT_GLIDE_TIME] },
  max:     { label: 'Max value',  tgt: PORTMAXVAL,    curve: CURVE.LIN, range: f => _functRange(f) },
  min:     { label: 'Min value',  tgt: PORTMINVAL,    curve: CURVE.LIN, range: f => _functRange(f) },
  divider: { label: 'Divider',    tgt: PORTCLKDIV,    curve: CURVE.LIN, range: () => [1, 96] },
  tempo:   { label: 'Tempo',      tgt: PORTPERIOD,    curve: CURVE.LIN, range: () => [TEMPO_MIN_PERIOD, TEMPO_MAX_PERIOD] },
};

// What each port function offers. Functions not listed get no box.
const FUNCTION_PARAMS = {
  [MIDIVOICENOTE]: ['glide'],
  [MIDIVOICEADSR]: ['attack', 'decay', 'sustain', 'release', 'level'],
  [MIDIVOICELFO]:  ['period', 'depth', 'delay', 'offset', 'shape'],
  [MIDIVOICEVEL]:  ['max', 'min'],
  [MIDIMODECC]:    ['max', 'min', 'glide'],
  [MIDIMODERPN]:   ['max', 'min', 'glide'],
  [MIDIMODENRPN]:  ['max', 'min', 'glide'],
  [MIDIPITCHBEND]: ['max', 'min', 'glide'],
  [MIDICHPRESS]:   ['max', 'min', 'glide'],
  [MIDIKEYPRESS]:  ['max', 'min', 'glide'],
  [MIDIPRGCHANGE]: ['max', 'min', 'glide'],
  [MIDICLOCK]:     ['divider'],
  [CLOCK_BOX]:     ['tempo'],
};

const FUNCTION_LABELS = {
  [MIDIVOICENOTE]: 'Note', [MIDIVOICEVEL]: 'Velocity', [MIDIVOICEGATE]: 'Gate',
  [MIDIVOICEADSR]: 'ADSR', [MIDIVOICEOSC]: 'Oscillator', [MIDIVOICELFO]: 'LFO',
  [MIDIDRUMTRIG]: 'Drum', [MIDIMODECC]: 'CC', [MIDIMODERPN]: 'RPN', [MIDIMODENRPN]: 'NRPN',
  [MIDIPRGCHANGE]: 'Prog. Change', [MIDIPITCHBEND]: 'Pitch Bend', [MIDIKEYPRESS]: 'Poly AT',
  [MIDICHPRESS]: 'Ch. Pressure', [MIDICLOCK]: 'Clock',
};

// Sources offered in each dropdown. Anything else a slot may hold (set from the
// Advanced view) is shown as a disabled "Other" entry rather than overwritten.
const SOURCES = [
  { value: 'none', label: 'Not mapped' },
  { value: 'cc',   label: 'CC',         msg: CONTROL_CHANGE,    srcMax: 127 },
  { value: 'pb',   label: 'Pitch Bend', msg: PITCH_BEND_CHANGE, srcMax: 16383 },
  { value: 'at',   label: 'Aftertouch', msg: CHANNEL_PRESSURE,  srcMax: 127 },
];

let _renderTimer = null;
let _busy = false;

// Rows a port's box shows. An LFO synced to MIDI clock takes its rate from the clock,
// so its Period does nothing and is left out (same flag the Ports tab uses to grey out
// the LFO frequency, refreshWeb.js _setLFOParams).
function _paramsFor(port) {
  const keys = FUNCTION_PARAMS[port.funct];
  if (!keys || port.funct !== MIDIVOICELFO) return keys;
  const voice = DeviceConfig.voices_port[port.voice];
  const synced = voice && Number(voice.lfo_use_midi_clock) === 1;
  return synced ? keys.filter(k => k !== 'period') : keys;
}

function _functRange(funct) {
  const def = DEF_FUNCT_VALUES[funct];
  return def ? [def.min, def.max] : [0, 127];
}

const _sleep = ms => new Promise(r => setTimeout(r, ms));

function _sourceOf(m) {
  if (!m || !m.enabled) return { value: 'none' };
  const s = SOURCES.find(x => x.msg === m.src_msgtype);
  return s ? { value: s.value, number: m.src_number } : { value: 'other', label: MAP_MSGTYPE_NAMES[m.src_msgtype] || 'Other' };
}

// ── Row model ────────────────────────────────────────────────────────────────

// The port a box stands for; the internal clock box has no physical port.
function _portOf(portIdx) {
  return portIdx === CLOCK_BOX ? { funct: CLOCK_BOX } : DeviceConfig.ports[portIdx];
}

// Resolves which slot a row edits and how. kind: 'voice' | 'glide' | 'port' | 'shape'.
// 'shape' spans four slots (row.slots); the others edit row.slot.
function _rowFor(portIdx, port, key) {
  if (key === 'shape') {
    return { key, label: 'Shape', kind: 'shape', slot: -1, shared: 'all voices',
             slots: SHAPE_QUADS.map(_findVoiceSlot),
             fields: { chan: 0, tgtType: VOICE, tgtNumber: 0, curve: CURVE.LIN, outMin: SHAPE_FIRST, outMax: SHAPE_LAST },
             factory: null, hint: 'uses 4 slots' };
  }
  if (key === 'tempo') {
    const p = PORT_PARAMS.tempo;
    return { key, label: p.label, kind: 'port', slot: _findSlot(GENMIDIMERGEPORT, p.tgt), shared: null,
             fields: { chan: 0, tgtType: PORT, tgtNumber: GENMIDIMERGEPORT, tgt: p.tgt, curve: p.curve,
                       outMin: TEMPO_MIN_PERIOD, outMax: TEMPO_MAX_PERIOD },
             factory: null, hint: 'knob up = slower' };
  }
  if (VOICE_PARAMS[key]) {
    const p = VOICE_PARAMS[key];
    return { key, label: p.label, kind: 'voice', slot: p.slot, shared: 'all voices',
             fields: { chan: 0, tgtType: VOICE, tgtNumber: 0, tgt: p.tgt, curve: p.curve, outMin: p.min, outMax: p.max },
             factory: { value: 'cc', number: p.cc } };
  }
  const p = PORT_PARAMS[key];
  const [outMin, outMax] = p.range(port.funct);
  const ch = Number(port.midi_ch) || 0;
  if (key === 'glide' && ch >= 1 && ch <= 12) {
    return { key, label: p.label, kind: 'glide', slot: GLIDE_SLOT_BASE + ch, shared: `all ports ch ${ch}`,
             fields: { chan: ch, tgtType: PORT, tgtNumber: 0, tgt: p.tgt, curve: p.curve, outMin, outMax },
             factory: { value: 'cc', number: GLIDE_CC } };
  }
  return { key, label: p.label, kind: 'port', slot: _findSlot(portIdx + 1, p.tgt), shared: null,
           fields: { chan: ch, tgtType: PORT, tgtNumber: portIdx + 1, tgt: p.tgt, curve: p.curve, outMin, outMax },
           factory: null };
}

// A free-slot mapping that already targets this port parameter (tgt_number as sent
// on the wire: port + 1, or GENMIDIMERGEPORT), or -1.
function _findSlot(tgtNumber, tgt) {
  for (let s = FIRST_FREE_SLOT; s < MAXMIDIMAPS; s++) {
    const m = DeviceConfig.mappings[s];
    if (m && m.enabled && m.tgt_type === PORT && m.tgt_number === tgtNumber && m.tgt_param === tgt) return s;
  }
  return -1;
}

// A free-slot mapping that targets every voice (tgt_number 0) on this voice
// parameter, or -1. Used by the Shape row's four quarter-curve slots.
function _findVoiceSlot(tgt) {
  for (let s = FIRST_FREE_SLOT; s < MAXMIDIMAPS; s++) {
    const m = DeviceConfig.mappings[s];
    if (m && m.enabled && m.tgt_type === VOICE && m.tgt_number === 0 && m.tgt_param === tgt) return s;
  }
  return -1;
}

function _freeSlots() {
  const free = [];
  for (let s = FIRST_FREE_SLOT; s < MAXMIDIMAPS; s++) {
    const m = DeviceConfig.mappings[s];
    if (!m || !m.enabled) free.push(s);
  }
  return free;
}

// ── Writes ───────────────────────────────────────────────────────────────────

// Disable first and enable last, so a half-written slot never matches live traffic.
async function _writeSlot(slot, row, source, number) {
  const f = row.fields;
  const src = SOURCES.find(s => s.value === source);
  const steps = [[MAP_ENABLED, 0]];
  if (src && src.msg !== undefined) {
    steps.push(
      [MAP_SRC_MSGTYPE, src.msg], [MAP_SRC_CHANNEL, f.chan], [MAP_SRC_NUMBER, source === 'cc' ? number : 0],
      [MAP_SRC_MIN, 0], [MAP_SRC_MAX, src.srcMax], [MAP_CURVE_TYPE, f.curve],
      [MAP_TGT_TYPE, f.tgtType], [MAP_TGT_NUMBER, f.tgtNumber], [MAP_TGT_PARAM, f.tgt],
      [MAP_OUT_MIN, f.outMin], [MAP_OUT_MAX, f.outMax], [MAP_ENABLED, 1]);
  }
  for (const [field, value] of steps) {
    sendMappingParam(slot, field, value);
    await _sleep(WRITE_GAP_MS);
  }
}

async function _applyShape(row, source, number) {
  const used = row.slots.filter(s => s !== -1);
  if (source === 'none') {
    for (const s of used) {
      sendMappingParam(s, MAP_ENABLED, 0);
      await _sleep(WRITE_GAP_MS);
    }
    return;
  }
  // Reuse the quarters already mapped, take free slots for the rest - all or nothing,
  // so a shape is never left mapped on only some quarters.
  const free = _freeSlots();
  const missing = row.slots.filter(s => s === -1).length;
  if (free.length < missing) {
    _setStatus(`Shape needs ${missing} free mapping slots and only ${free.length} are left. Clear a mapping first.`, 'fail');
    return;
  }
  const slots = row.slots.map(s => (s === -1 ? free.shift() : s));
  for (let i = 0; i < SHAPE_QUADS.length; i++) {
    const quadRow = { ...row, fields: { ...row.fields, tgt: SHAPE_QUADS[i] } };
    await _writeSlot(slots[i], quadRow, source, number);
  }
  _setStatus('', '');
}

async function _applyRow(portIdx, key, source, number) {
  const port = _portOf(portIdx);
  const row = _rowFor(portIdx, port, key);
  if (row.kind === 'shape') return _applyShape(row, source, number);
  let slot = row.slot;
  if (slot === -1) {
    if (source === 'none') return; // nothing mapped, nothing to clear
    const free = _freeSlots();
    if (!free.length) {
      _setStatus('No free mapping slots left. Clear a mapping first.', 'fail');
      return;
    }
    slot = free[0];
  }
  await _writeSlot(slot, row, source, number);
  _setStatus('', '');
}

async function _restorePort(portIdx) {
  const port = _portOf(portIdx);
  for (const key of _paramsFor(port) || []) {
    const row = _rowFor(portIdx, port, key);
    if (row.kind === 'shape') {
      await _applyShape(row, 'none');
    } else if (row.kind === 'port') {
      if (row.slot !== -1) {
        sendMappingParam(row.slot, MAP_ENABLED, 0);
        await _sleep(WRITE_GAP_MS);
      }
    } else {
      sendMappingRestore(row.slot); // module echoes the restored slot back
      await _sleep(WRITE_GAP_MS * 4);
    }
  }
}

async function _run(task) {
  if (_busy) return;
  _busy = true;
  try { await task(); } finally { _busy = false; renderSimpleMappings(); }
}

// ── Rendering ────────────────────────────────────────────────────────────────

export function scheduleSimpleRender() {
  clearTimeout(_renderTimer);
  _renderTimer = setTimeout(renderSimpleMappings, 60); // slot sync arrives field by field
}

export function renderSimpleMappings() {
  const grid = q('#mbox-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const hidden = [];

  // Tempo only means something while the module generates its own clock.
  if (!DeviceConfig.global_use_midi_clock) grid.appendChild(_renderBox(CLOCK_BOX, _portOf(CLOCK_BOX), FUNCTION_PARAMS[CLOCK_BOX]));

  DeviceConfig.ports.forEach((port, portIdx) => {
    if (!port || !port.funct) return;
    const keys = _paramsFor(port);
    if (!keys) { hidden.push(`${BoxNames[portIdx]} ${FUNCTION_LABELS[port.funct] || ''}`.trim()); return; }
    grid.appendChild(_renderBox(portIdx, port, keys));
  });

  const free = _freeSlots().length;
  const total = MAXMIDIMAPS - FIRST_FREE_SLOT;
  q('#mbox-slots-free').textContent = `${free} / ${total}`;
  const meter = q('#mbox-meter');
  meter.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const b = document.createElement('i');
    if (i < total - free) b.className = 'used';
    meter.appendChild(b);
  }
  q('#mbox-hidden-note').textContent = hidden.length ? `Nothing to map on: ${hidden.join(', ')}` : '';
  if (!grid.querySelector('.mbox:not([data-box="clock"])')) {
    const empty = document.createElement('p');
    empty.className = 'mbox-empty';
    empty.textContent = 'No port has a function with mappable parameters. Set up ports on the Ports tab first.';
    grid.appendChild(empty);
  }
}

function _portColor(portIdx) {
  const title = q(`#box-${BoxNames[portIdx]} .box-header-title`);
  const c = title && title.style.borderColor;
  return c && c !== 'none' ? c : 'var(--border)';
}

function _subtitle(port) {
  if (port.isVoiceFunction) return `Voice ${port.voice_rep}`;
  if (port.funct === MIDIMODECC) return `CC ${port.param}`;
  return '';
}

function _renderBox(portIdx, port, keys) {
  const isClock = portIdx === CLOCK_BOX;
  const box = document.createElement('section');
  box.className = 'mbox';
  box.dataset.box = isClock ? CLOCK_BOX : BoxNames[portIdx];
  box.style.setProperty('--port-color', isClock ? 'var(--green)' : _portColor(portIdx));
  const tag = isClock ? 'CLK' : BoxNames[portIdx];
  const func = isClock ? 'Internal clock' : (FUNCTION_LABELS[port.funct] || '');
  const sub = isClock ? `${Math.round(60000000 / (DeviceConfig.global_clock_period || 500000))} BPM` : _subtitle(port);
  const ch = isClock ? 'Any' : (port.funct === MIDICLOCK ? '–' : port.midi_ch);
  box.setAttribute('aria-label', isClock ? 'Internal clock' : `Port ${tag} ${func}`);
  box.innerHTML = `
    <header class="mbox-header">
      <div class="mbox-port">${tag}</div>
      <div class="mbox-func"><b>${func}</b><small>${sub}</small></div>
      <div class="mbox-ch"><h2>Midi Ch</h2><span>${ch}</span></div>
    </header>
    <div class="mbox-rows"></div>
    <footer class="mbox-foot"><span></span><button type="button" class="mbox-reset">Restore defaults</button></footer>`;

  const rows = box.querySelector('.mbox-rows');
  let changed = 0;
  keys.forEach(key => {
    const row = _rowFor(portIdx, port, key);
    const slot = row.kind === 'shape' ? row.slots.find(s => s !== -1) : row.slot;
    const m = slot === undefined || slot === -1 ? null : DeviceConfig.mappings[slot];
    const cur = _sourceOf(m);
    const isFactory = row.factory && cur.value === row.factory.value && cur.number === row.factory.number;
    if (row.factory ? !isFactory : cur.value !== 'none') changed++;
    rows.appendChild(_renderRow(portIdx, port, row, cur, isFactory));
  });

  box.querySelector('.mbox-foot span').textContent = changed ? `${changed} changed from default` : 'All defaults';
  box.querySelector('.mbox-reset').addEventListener('click', () => _run(() => _restorePort(portIdx)));
  return box;
}

function _renderRow(portIdx, port, row, cur, isFactory) {
  const el = document.createElement('div');
  el.className = 'mbox-row' + (cur.value === 'none' ? ' unmapped' : '') + (isFactory ? ' is-default' : '');
  const id = `mbox-${portIdx === CLOCK_BOX ? CLOCK_BOX : BoxNames[portIdx]}-${row.key}`;
  const note = row.shared ? `<em class="shared">shared · ${row.shared}${row.hint ? ' · ' + row.hint : ''}</em>`
    : isFactory ? '<em>factory default</em>'
    : row.hint ? `<em>${row.hint}</em>` : '';
  const options = SOURCES.map(s => `<option value="${s.value}"${s.value === cur.value ? ' selected' : ''}>${s.label}</option>`).join('')
    + (cur.value === 'other' ? `<option value="other" selected disabled>${cur.label}</option>` : '');
  el.innerHTML = `
    <label for="${id}">${row.label}${note}</label>
    <select class="mbox-msg no-trigger" id="${id}">${options}</select>
    <input class="mbox-num no-trigger" id="${id}-cc" type="number" min="0" max="127" inputmode="numeric"
      aria-label="${row.label} CC number" value="${cur.value === 'cc' ? cur.number : ''}"
      placeholder="–" ${cur.value === 'cc' ? '' : 'disabled'}>`;

  const select = el.querySelector('select');
  const num = el.querySelector('input');
  select.addEventListener('change', () => {
    const v = select.value;
    if (v === 'cc') {
      // Start from the factory CC when there is one, so switching back is one click.
      const n = row.factory ? row.factory.number : 1;
      num.disabled = false;
      num.value = n;
      _run(() => _applyRow(portIdx, row.key, 'cc', n));
    } else {
      _run(() => _applyRow(portIdx, row.key, v));
    }
  });
  num.addEventListener('change', () => {
    const n = Math.max(0, Math.min(127, parseInt(num.value, 10) || 0));
    num.value = n;
    _run(() => _applyRow(portIdx, row.key, 'cc', n));
  });
  return el;
}

function _setStatus(text, cls) {
  const s = q('#mbox-status');
  if (!s) return;
  s.textContent = text;
  s.className = 'map-status' + (cls ? ' ' + cls : '');
}

export function initSimpleMappings() {
  const toggle = q('#map-view-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const advanced = q('#map-advanced');
    const showAdvanced = advanced.classList.contains('hidden');
    advanced.classList.toggle('hidden', !showAdvanced);
    q('#map-simple-grid-wrap').classList.toggle('hidden', showAdvanced);
    toggle.textContent = showAdvanced ? 'Back to port view' : 'Advanced';
    if (!showAdvanced) renderSimpleMappings();
  });
  renderSimpleMappings();
}
