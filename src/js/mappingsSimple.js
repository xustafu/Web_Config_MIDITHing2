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
//   - Tempo uses a free slot targeting PORTPERIOD with Unit = BPM, on any channel: the
//     module turns the value into a tempo (CC: 2 x value, 2-254 BPM; Pitch Bend /
//     CC 14-bit: 1-739 BPM, finer below 101) and ignores the slot's ranges and curve.
//     The internal clock box (only shown while the module runs on its internal clock)
//     targets the internal clock port (tgt_number = 100, GENMIDIMERGEPORT); a clock
//     port running free (not following MIDI clock) targets itself (port + 1).
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
const CLOCK_BOX = 'clock';         // box id for the internal clock (not a physical port)
// An LFO shape is four settings, one curve per quarter cycle. The Shape row uses one
// free slot targeting LFOCurveTypeAll, which sets all four live (firmware
// Voice::applyLiveVoiceParam), mapping the value onto curves 1-7
// (VoiceCfg.h LFO_Curves: tri, round, sine, square, saw up, saw down, random).
// The row has a scope the user picks:
//   'voice'   - only this LFO (tgt_number = voice + 1); 1 slot per LFO.
//   'channel' - every LFO on the incoming channel (tgt_number 0); one shared slot,
//               shown in every LFO box.
// A per-LFO mapping and the shared one can coexist; each LFO box shows its own if it
// has one, otherwise the shared one.
// Older editor versions wrote the shape as four slots, one per quarter
// (LFOCurveTypeQ1-Q4). Those are still recognised and replaced by the single slot
// the next time the row is edited.
const SHAPE_SCOPES = [
  { value: 'voice',   label: 'This LFO' },
  { value: 'channel', label: 'All LFOs on channel' },
];
const _shapeScopePref = {}; // scope chosen on a row that has no Shape mapping yet
const LEGACY_SHAPE_QUADS = [LFOCurveTypeQ1, LFOCurveTypeQ2, LFOCurveTypeQ3, LFOCurveTypeQ4];
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
  // Unit = BPM: the module ignores the range and curve, kept at the full period range
  tempo:   { label: 'Tempo',      tgt: PORTPERIOD,    curve: CURVE.LIN, range: () => [40, 60000000], unit: MAP_UNIT_BPM },
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
  [MIDICLOCK]:     ['divider', 'tempo'], // narrowed by clock mode in _paramsFor()
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
// maxNum marks a source with a controller number (and its highest valid value).
const SOURCES = [
  { value: 'none', label: 'Not mapped' },
  { value: 'cc',   label: 'CC',         msg: CONTROL_CHANGE,    srcMax: 127,   maxNum: 127 },
  { value: 'cc14', label: 'CC 14-bit',  msg: MAP_SRC_CC14BIT,   srcMax: 16383, maxNum: 31 },
  { value: 'pb',   label: 'Pitch Bend', msg: PITCH_BEND_CHANGE, srcMax: 16383 },
  { value: 'at',   label: 'Aftertouch', msg: CHANNEL_PRESSURE,  srcMax: 127 },
];
const _maxNum = source => (SOURCES.find(s => s.value === source) || {}).maxNum;

let _renderTimer = null;
let _busy = false;

// Rows a port's box shows. An LFO synced to MIDI clock takes its rate from the clock,
// so its Period does nothing and is left out (same flag the Ports tab uses to grey out
// the LFO frequency, refreshWeb.js _setLFOParams).
// A clock port following MIDI clock divides the incoming ticks (Divider); one running
// free pulses at its own period (Tempo).
function _paramsFor(port) {
  const keys = FUNCTION_PARAMS[port.funct];
  if (keys && port.funct === MIDICLOCK) {
    const following = Number(port.use_midi_clock) === 1;
    return keys.filter(k => k !== (following ? 'tempo' : 'divider'));
  }
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
// 'shape' also carries any legacy four-quarter slots for its scope (row.legacy).
function _rowFor(portIdx, port, key) {
  if (key === 'shape') {
    const vt = _voiceTarget(port);
    const own = vt === -1 ? { slot: -1, legacy: [] } : _shapeSlots(vt);
    const chan = _shapeSlots(0);
    const used = s => s.slot !== -1 || s.legacy.length > 0;
    const scope = used(own) ? 'voice' : used(chan) ? 'channel' : (_shapeScopePref[portIdx] || 'voice');
    const isVoice = scope === 'voice';
    const cur = isVoice ? own : chan;
    return { key, label: 'Shape', kind: 'shape', slot: cur.slot, legacy: cur.legacy, portIdx, scope, own, chan,
             unavailable: vt === -1,
             shared: isVoice ? null : 'all LFOs on the channel',
             fields: { chan: 0, tgtType: VOICE, tgtNumber: isVoice ? vt : 0, tgt: LFOCurveTypeAll,
                       curve: CURVE.LIN, outMin: SHAPE_FIRST, outMax: SHAPE_LAST },
             factory: null };
  }
  if (key === 'tempo') {
    const p = PORT_PARAMS.tempo;
    const [outMin, outMax] = p.range();
    const tgtNumber = portIdx === CLOCK_BOX ? GENMIDIMERGEPORT : portIdx + 1;
    return { key, label: p.label, kind: 'port', slot: _findSlot(tgtNumber, p.tgt), shared: null,
             fields: { chan: 0, tgtType: PORT, tgtNumber, tgt: p.tgt, curve: p.curve, outMin, outMax, unit: p.unit },
             factory: null, hint: 'BPM · CC: 2 × value' };
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

// A free-slot mapping on this voice parameter for tgt_number (voice + 1, or 0 = every
// voice on the channel), or -1.
function _findVoiceSlot(tgtNumber, tgt) {
  for (let s = FIRST_FREE_SLOT; s < MAXMIDIMAPS; s++) {
    const m = DeviceConfig.mappings[s];
    if (m && m.enabled && m.tgt_type === VOICE && m.tgt_number === tgtNumber && m.tgt_param === tgt) return s;
  }
  return -1;
}

// The Shape slot for one tgt_number, plus any legacy quarter slots still mapped there.
function _shapeSlots(tgtNumber) {
  return { slot: _findVoiceSlot(tgtNumber, LFOCurveTypeAll),
           legacy: LEGACY_SHAPE_QUADS.map(q => _findVoiceSlot(tgtNumber, q)).filter(s => s !== -1) };
}

// The slot whose source the Shape row shows: the single slot, else a legacy quarter.
function _shapeShownSlot(row) {
  return row.slot !== -1 ? row.slot : (row.legacy.length ? row.legacy[0] : -1);
}

// The mapping target number for a port's voice: its firmware voice index + 1 (0 means
// "every voice"), or -1 if the voice is not known yet. Same numbering the editor uses
// for VOICE SysEx (sysexMgt.js _extractNum).
function _voiceTarget(port) {
  const idx = DeviceConfig.voices_port_used.indexOf(port.voice);
  return idx === -1 ? -1 : idx + 1;
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
      [MAP_SRC_MSGTYPE, src.msg], [MAP_SRC_CHANNEL, f.chan], [MAP_SRC_NUMBER, src.maxNum ? number : 0],
      [MAP_SRC_MIN, 0], [MAP_SRC_MAX, src.srcMax], [MAP_CURVE_TYPE, f.curve],
      [MAP_TGT_TYPE, f.tgtType], [MAP_TGT_NUMBER, f.tgtNumber], [MAP_TGT_PARAM, f.tgt],
      // Always sent, so a reused slot never keeps another row's unit
      [MAP_OUT_MIN, f.outMin], [MAP_OUT_MAX, f.outMax], [MAP_OUT_UNIT, f.unit || MAP_UNIT_RAW],
      [MAP_ENABLED, 1]);
  }
  for (const [field, value] of steps) {
    sendMappingParam(slot, field, value);
    await _sleep(WRITE_GAP_MS);
  }
}

async function _disableSlots(slots) {
  for (const s of slots.filter(s => s !== -1)) {
    sendMappingParam(s, MAP_ENABLED, 0);
    await _sleep(WRITE_GAP_MS);
  }
}

// Writes (or clears) the Shape mapping for one scope. Returns false if it could not.
// Any legacy quarter slots for that scope are cleared, reusing one of them if needed.
async function _applyShape(row, source, number, scope = row.scope) {
  const isVoice = scope === 'voice';
  const target = isVoice ? row.own : row.chan;
  if (source === 'none') {
    await _disableSlots([target.slot, ...target.legacy]);
    return true;
  }
  if (isVoice && row.unavailable) {
    _setStatus("This LFO's voice is not known yet. Open the Mappings tab again once the module's config has loaded.", 'fail');
    return false;
  }
  const legacy = [...target.legacy];
  let slot = target.slot;
  if (slot === -1) slot = legacy.length ? legacy.shift() : (_freeSlots()[0] ?? -1);
  if (slot === -1) {
    _setStatus('No free mapping slots left. Clear a mapping first.', 'fail');
    return false;
  }
  const tgtNumber = isVoice ? _voiceTarget(_portOf(row.portIdx)) : 0;
  await _writeSlot(slot, { ...row, fields: { ...row.fields, tgtNumber } }, source, number);
  await _disableSlots(legacy);
  _setStatus('', '');
  return true;
}

// Switching scope keeps whatever source the row shows:
//   to 'channel' - the shared mapping takes this source (created if missing) and this
//                  LFO's own mapping is removed;
//   to 'voice'   - this LFO gets its own copy; the shared one stays for the others.
async function _changeScope(portIdx, newScope) {
  const port = _portOf(portIdx);
  const row = _rowFor(portIdx, port, 'shape');
  _shapeScopePref[portIdx] = newScope;
  const shown = _shapeShownSlot(row);
  if (shown === -1 || newScope === row.scope) return; // nothing mapped: just remember the choice
  const cur = _sourceOf(DeviceConfig.mappings[shown]);
  if (cur.value === 'none' || cur.value === 'other') return;
  if (newScope === 'channel') {
    if (await _applyShape(row, cur.value, cur.number, 'channel')) await _disableSlots([row.own.slot, ...row.own.legacy]);
  } else {
    await _applyShape(row, cur.value, cur.number, 'voice');
  }
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
      await _applyShape(row, 'none'); // clears what this box shows: its own, or the shared one
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
    const slot = row.kind === 'shape' ? _shapeShownSlot(row) : row.slot;
    const m = slot === -1 ? null : DeviceConfig.mappings[slot];
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
  const scope = row.kind === 'shape'
    ? `<select class="mbox-scope no-trigger" id="${id}-scope" aria-label="${row.label} applies to">${
        SHAPE_SCOPES.map(s => `<option value="${s.value}"${s.value === row.scope ? ' selected' : ''}>${s.label}</option>`).join('')
      }</select>`
    : '';
  el.innerHTML = `
    <div class="mbox-label"><label for="${id}">${row.label}${note}</label>${scope}</div>
    <select class="mbox-msg no-trigger" id="${id}">${options}</select>
    <input class="mbox-num no-trigger" id="${id}-cc" type="number" min="0" max="${_maxNum(cur.value) || 127}" inputmode="numeric"
      aria-label="${row.label} CC number" value="${_maxNum(cur.value) ? cur.number : ''}"
      placeholder="–" ${_maxNum(cur.value) ? '' : 'disabled'}>`;

  const select = el.querySelector('.mbox-msg');
  const num = el.querySelector('.mbox-num');
  const scopeSelect = el.querySelector('.mbox-scope');
  if (scopeSelect) scopeSelect.addEventListener('change', () => _run(() => _changeScope(portIdx, scopeSelect.value)));
  select.addEventListener('change', () => {
    const v = select.value;
    const maxNum = _maxNum(v);
    if (maxNum) {
      // Start from the factory CC when there is one, so switching back is one click.
      const n = v === 'cc' && row.factory ? row.factory.number : 1;
      num.disabled = false;
      num.max = maxNum;
      num.value = n;
      _run(() => _applyRow(portIdx, row.key, v, n));
    } else {
      _run(() => _applyRow(portIdx, row.key, v));
    }
  });
  num.addEventListener('change', () => {
    const v = select.value;
    const n = Math.max(0, Math.min(_maxNum(v) || 127, parseInt(num.value, 10) || 0));
    num.value = n;
    _run(() => _applyRow(portIdx, row.key, v, n));
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
