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
};

// What each port function offers. Functions not listed get no box.
const FUNCTION_PARAMS = {
  [MIDIVOICENOTE]: ['glide'],
  [MIDIVOICEADSR]: ['attack', 'decay', 'sustain', 'release', 'level'],
  [MIDIVOICELFO]:  ['period', 'depth', 'delay', 'offset'],
  [MIDIVOICEVEL]:  ['max', 'min'],
  [MIDIMODECC]:    ['max', 'min', 'glide'],
  [MIDIMODERPN]:   ['max', 'min', 'glide'],
  [MIDIMODENRPN]:  ['max', 'min', 'glide'],
  [MIDIPITCHBEND]: ['max', 'min', 'glide'],
  [MIDICHPRESS]:   ['max', 'min', 'glide'],
  [MIDIKEYPRESS]:  ['max', 'min', 'glide'],
  [MIDIPRGCHANGE]: ['max', 'min', 'glide'],
  [MIDICLOCK]:     ['divider'],
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

// Resolves which slot a row edits and how. kind: 'voice' | 'glide' | 'port'.
function _rowFor(portIdx, port, key) {
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
  return { key, label: p.label, kind: 'port', slot: _findPortSlot(portIdx, p.tgt), shared: null,
           fields: { chan: ch, tgtType: PORT, tgtNumber: portIdx + 1, tgt: p.tgt, curve: p.curve, outMin, outMax },
           factory: null };
}

// A free-slot mapping that already targets this port's parameter, or -1.
function _findPortSlot(portIdx, tgt) {
  for (let s = FIRST_FREE_SLOT; s < MAXMIDIMAPS; s++) {
    const m = DeviceConfig.mappings[s];
    if (m && m.enabled && m.tgt_type === PORT && m.tgt_number === portIdx + 1 && m.tgt_param === tgt) return s;
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

async function _applyRow(portIdx, key, source, number) {
  const port = DeviceConfig.ports[portIdx];
  const row = _rowFor(portIdx, port, key);
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
  const port = DeviceConfig.ports[portIdx];
  for (const key of FUNCTION_PARAMS[port.funct] || []) {
    const row = _rowFor(portIdx, port, key);
    if (row.kind === 'port') {
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

  DeviceConfig.ports.forEach((port, portIdx) => {
    if (!port || !port.funct) return;
    const keys = FUNCTION_PARAMS[port.funct];
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
  if (!grid.children.length) {
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
  const box = document.createElement('section');
  box.className = 'mbox';
  box.style.setProperty('--port-color', _portColor(portIdx));
  box.setAttribute('aria-label', `Port ${BoxNames[portIdx]} ${FUNCTION_LABELS[port.funct] || ''}`);
  box.innerHTML = `
    <header class="mbox-header">
      <div class="mbox-port">${BoxNames[portIdx]}</div>
      <div class="mbox-func"><b>${FUNCTION_LABELS[port.funct] || ''}</b><small>${_subtitle(port)}</small></div>
      <div class="mbox-ch"><h2>Midi Ch</h2><span>${port.funct === MIDICLOCK ? '–' : port.midi_ch}</span></div>
    </header>
    <div class="mbox-rows"></div>
    <footer class="mbox-foot"><span></span><button type="button" class="mbox-reset">Restore defaults</button></footer>`;

  const rows = box.querySelector('.mbox-rows');
  let changed = 0;
  keys.forEach(key => {
    const row = _rowFor(portIdx, port, key);
    const m = row.slot === -1 ? null : DeviceConfig.mappings[row.slot];
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
  const id = `mbox-${BoxNames[portIdx]}-${row.key}`;
  const note = row.shared ? `<em class="shared">shared · ${row.shared}</em>` : (isFactory ? '<em>factory default</em>' : '');
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
