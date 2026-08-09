// Mappings tab — list of user-created MIDI-message-to-config-parameter mappings.
// The 32 underlying device slots and the target Type/Number split are deliberately not
// shown to the user: "Add mapping" finds a free slot automatically, and one combined
// "Target" picker (built from live port/voice state) replaces separate type+number
// controls. See planes/MIDI-message-mapping-implementation-plan.md (MidiThing2 repo)
// for the on-device design, and dataStructures.js/mappingTargets.js for the wire
// protocol and human-readable parameter tables this UI is built on.

import { q, qA } from './globals.js';
import { calculateVoiceId } from './helpers.js';
import { sendMappingParam, requestMappingSlot } from './backend/sysexMgt.js';

// Maps the data-map-field attribute (a readable name in the markup, e.g. "MAP_ENABLED")
// back to its numeric Config_MapID_t id. These consts are classic-script globals
// (dataStructures.js), not window properties, so a plain object literal — not
// window[...] — is what actually resolves them.
const MAP_FIELD_IDS = {
  MAP_ENABLED, MAP_SRC_MSGTYPE, MAP_SRC_CHANNEL, MAP_SRC_NUMBER,
  MAP_SRC_MIN, MAP_SRC_MAX, MAP_CURVE_TYPE, MAP_TGT_PARAM,
  MAP_OUT_MIN, MAP_OUT_MAX,
};

// Message types with no independent "number" concept — CC#/note# input is disabled
// for these (matches the protocol doc: ignored for Program Change/Channel Pressure/
// Pitch Bend).
const NO_NUMBER_MSGTYPES = [PROGRAM_CHANGE, CHANNEL_PRESSURE, PITCH_BEND_CHANGE];

// Sensible starting output ranges for the Quick CC->ADSR panel, one per ADSR target
// param — taken from each field's own firmware min/max (dataStructures.js comments,
// copied from VoiceCfg.h's DEF_CFG table), except the three *time* fields (Predelay/
// Attack/Decay/Release) whose real firmware max (MAXTIMEADSR) is large and impractical
// to sweep with one CC — 5000ms is a more useful default range for a quick test than
// the full firmware ceiling; still freely editable in the panel.
const ADSR_QUICK_DEFAULTS = {
  [ADSRTPredelay]: { min: 0, max: 5000 },
  [ADSRLMax]:       { min: 1, max: 100 },
  [ADSRTAttack]:    { min: 1, max: 5000 },
  [ADSRTDecay]:     { min: 1, max: 5000 },
  [ADSRLSustain]:   { min: 1, max: 100 },
  [ADSRRSustain]:   { min: -500, max: 500 },
  [ADSRTRelease]:   { min: 1, max: 5000 },
};

let _openSlot = null; // slot currently shown in the editor, or null if editor is closed

export function initMappingsTab() {
  _populateStaticDropdowns();
  _initQuickPanel();

  q('#map-add-btn').addEventListener('click', addMapping);
  q('#map-done-btn').addEventListener('click', closeEditor);
  q('#map-delete-btn').addEventListener('click', () => {
    if (_openSlot !== null) deleteMapping(_openSlot);
  });

  q('#map-list').addEventListener('click', e => {
    const row = e.target.closest('[data-slot]');
    if (row) editMapping(Number(row.dataset.slot));
  });

  q('#map-target').addEventListener('change', e => {
    const opt = e.target.selectedOptions[0];
    if (!opt || _openSlot === null) return;
    const tgtType = Number(opt.dataset.tgtType);
    const tgtNumber = Number(opt.dataset.tgtNumber);
    sendMappingParam(_openSlot, MAP_TGT_TYPE, tgtType);
    sendMappingParam(_openSlot, MAP_TGT_NUMBER, tgtNumber);
    _rebuildTargetParamOptions(tgtType);
    renderMappingList();
  });

  q('#map-src-type').addEventListener('change', _updateSourceNumberEnabled);

  qA('#map-editor [data-map-field]').forEach(el => {
    el.addEventListener('change', () => {
      if (_openSlot === null) return;
      const fieldId = MAP_FIELD_IDS[el.dataset.mapField];
      const value = el.type === 'checkbox' ? (el.checked ? 1 : 0) : Number(el.value);
      sendMappingParam(_openSlot, fieldId, value);
      renderMappingList();
    });
  });

  renderMappingList();
}

// Called whenever the tab is opened — no batch read exists for mapping slots (see
// SysEx Details.md §5), so this is 32 individual requests, same per-item cost class
// already accepted for Voice/MIDI Channel config in this app.
export function syncAllMappingSlots() {
  for (let i = 0; i < MAXMIDIMAPS; i++) requestMappingSlot(i);
  _populateQuickVoiceOptions(); // refresh in case ports/voices changed since last open
}

// Called from sysexMgt.js on every genComMappingSinglePar reply.
export function onMappingSlotUpdated(slot) {
  renderMappingList();
  if (_openSlot === slot) _renderEditorFields(slot);
}

export function renderMappingList() {
  const list = q('#map-list');
  if (!list) return;
  list.innerHTML = '';
  let count = 0;
  DeviceConfig.mappings.forEach((m, slot) => {
    if (!m || !m.enabled) return;
    count++;
    const row = document.createElement('div');
    row.className = 'map-list-row';
    row.dataset.slot = slot;
    row.textContent = _summarizeMapping(m);
    list.appendChild(row);
  });
  const countEl = q('#map-count');
  if (countEl) countEl.textContent = `(${count} / ${MAXMIDIMAPS})`;
  if (count === 0) {
    const empty = document.createElement('div');
    empty.className = 'map-list-empty';
    empty.textContent = 'No mappings yet.';
    list.appendChild(empty);
  }
}

// Shared by "Add mapping" and the Quick CC->ADSR panel: first slot that's either
// never been touched or was disabled (and so free to reuse).
function _findFreeSlot() {
  for (let i = 0; i < MAXMIDIMAPS; i++) {
    if (!DeviceConfig.mappings[i] || !DeviceConfig.mappings[i].enabled) return i;
  }
  return -1;
}

// Shared by the Target picker and the Quick panel's Voice dropdown: voice ids
// currently in use by any port, in ascending order.
function _getUsedVoices() {
  return Array.from(new Set(DeviceConfig.ports.map(p => p.voice)))
    .filter(v => v !== 100 && v !== -1)
    .sort((a, b) => a - b);
}

function addMapping() {
  const freeSlot = _findFreeSlot();
  if (freeSlot === -1) {
    _setListStatus('All 32 mapping slots are in use', 'fail');
    return;
  }
  _setListStatus('', '');
  if (!DeviceConfig.mappings[freeSlot]) DeviceConfig.mappings[freeSlot] = new MappingConfig(freeSlot);
  _openSlot = freeSlot;
  q('#map-editor').classList.remove('hidden');
  _renderEditorFields(freeSlot);
}

function editMapping(slot) {
  _setListStatus('', '');
  requestMappingSlot(slot); // refresh from device in case stale
  _openSlot = slot;
  q('#map-editor').classList.remove('hidden');
  _renderEditorFields(slot);
}

function deleteMapping(slot) {
  sendMappingParam(slot, MAP_ENABLED, 0);
  if (DeviceConfig.mappings[slot]) DeviceConfig.mappings[slot].enabled = false;
  closeEditor();
  renderMappingList();
}

function closeEditor() {
  _openSlot = null;
  q('#map-editor').classList.add('hidden');
}

function _renderEditorFields(slot) {
  const m = DeviceConfig.mappings[slot] || new MappingConfig(slot);
  q('#map-enabled').checked = m.enabled;
  q('#map-src-type').value = m.src_msgtype;
  q('#map-src-channel').value = m.src_channel;
  q('#map-src-number').value = m.src_number;
  q('#map-src-min').value = m.src_min;
  q('#map-src-max').value = m.src_max;
  q('#map-curve').value = m.curve_type;
  _buildTargetOptions(m.tgt_type, m.tgt_number);
  _rebuildTargetParamOptions(m.tgt_type, m.tgt_param);
  q('#map-out-min').value = m.out_min;
  q('#map-out-max').value = m.out_max;
  _updateSourceNumberEnabled();
}

function _populateStaticDropdowns() {
  const srcType = q('#map-src-type');
  Object.entries(MAP_MSGTYPE_NAMES).forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    srcType.appendChild(opt);
  });
  const curve = q('#map-curve');
  Object.entries(MAP_CURVE_NAMES).forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    curve.appendChild(opt);
  });
}

// One combined Target picker (Ports/Voices/MIDI Channels), replacing separate
// type+number controls — built fresh from live DeviceConfig state each time the
// editor opens, so port/voice labels always reflect current device config.
function _buildTargetOptions(selectedType, selectedNumber) {
  const select = q('#map-target');
  select.innerHTML = '';

  const portsGroup = document.createElement('optgroup');
  portsGroup.label = 'Ports';
  DeviceConfig.ports.forEach((port, i) => {
    const opt = document.createElement('option');
    opt.dataset.tgtType = PORT;
    opt.dataset.tgtNumber = i;
    const funcName = FirmwareFunctions2Web[port.funct] || 'no function';
    opt.textContent = `Port ${BoxNames[i]} — ${funcName}`;
    if (selectedType === PORT && selectedNumber === i) opt.selected = true;
    portsGroup.appendChild(opt);
  });
  select.appendChild(portsGroup);

  const usedVoices = _getUsedVoices();
  if (usedVoices.length) {
    const voicesGroup = document.createElement('optgroup');
    voicesGroup.label = 'Voices';
    usedVoices.forEach(voiceId => {
      const opt = document.createElement('option');
      opt.dataset.tgtType = VOICE;
      opt.dataset.tgtNumber = voiceId;
      opt.textContent = `Voice ${calculateVoiceId(voiceId)}`;
      if (selectedType === VOICE && selectedNumber === voiceId) opt.selected = true;
      voicesGroup.appendChild(opt);
    });
    select.appendChild(voicesGroup);
  }

  const channelsGroup = document.createElement('optgroup');
  channelsGroup.label = 'MIDI Channels';
  for (let ch = 1; ch <= 16; ch++) {
    const opt = document.createElement('option');
    opt.dataset.tgtType = MIDICH;
    opt.dataset.tgtNumber = ch;
    opt.textContent = `Channel ${ch}`;
    if (selectedType === MIDICH && selectedNumber === ch) opt.selected = true;
    channelsGroup.appendChild(opt);
  }
  select.appendChild(channelsGroup);
}

function _rebuildTargetParamOptions(targetType, selectedId) {
  const select = q('#map-tgt-param');
  select.innerHTML = '';
  getMappingTargetParams(targetType).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    if (selectedId != null && p.id === selectedId) opt.selected = true;
    select.appendChild(opt);
  });
}

function _updateSourceNumberEnabled() {
  const msgType = Number(q('#map-src-type').value);
  q('#map-src-number').disabled = NO_NUMBER_MSGTYPES.includes(msgType);
}

function _describeTarget(type, number) {
  if (type === PORT) {
    const port = DeviceConfig.ports[number];
    const funcName = port ? (FirmwareFunctions2Web[port.funct] || 'no function') : '';
    return `Port ${BoxNames[number]}${funcName ? ' (' + funcName + ')' : ''}`;
  }
  if (type === VOICE) return `Voice ${calculateVoiceId(number)}`;
  if (type === MIDICH) return `Channel ${number}`;
  return 'Target';
}

function _summarizeMapping(m) {
  const msgName = MAP_MSGTYPE_NAMES[m.src_msgtype] || 'Message';
  const numberPart = NO_NUMBER_MSGTYPES.includes(m.src_msgtype) ? '' : ` #${m.src_number}`;
  const chanPart = m.src_channel === 0 ? 'any ch' : `ch ${m.src_channel}`;
  const targetLabel = _describeTarget(m.tgt_type, m.tgt_number);
  const paramEntry = getMappingTargetParams(m.tgt_type).find(p => p.id === m.tgt_param);
  const paramLabel = paramEntry ? paramEntry.label : `param ${m.tgt_param}`;
  return `${msgName}${numberPart} (${chanPart}) → ${targetLabel}: ${paramLabel}`;
}

// ── Quick CC -> ADSR panel ───────────────────────────────────────────────────
// A focused shortcut for the single most common test case (map a CC straight to one
// ADSR parameter on a voice) so it doesn't require touching all ~10 fields of the
// general editor above. Still just creates a normal mapping in a free slot — nothing
// about the wire protocol or the slot itself is special-cased.

function _initQuickPanel() {
  const paramSelect = q('#quick-param');
  if (!paramSelect) return; // markup not present on this page

  getMappingTargetParams(VOICE)
    .filter(p => p.label.startsWith('ADSR'))
    .forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.label;
      paramSelect.appendChild(opt);
    });

  _populateQuickVoiceOptions();
  _applyQuickDefaultRange();

  paramSelect.addEventListener('change', _applyQuickDefaultRange);
  q('#quick-set-btn').addEventListener('click', _setQuickMapping);
}

function _populateQuickVoiceOptions() {
  const select = q('#quick-voice');
  if (!select) return;
  const previous = select.value;
  select.innerHTML = '';
  _getUsedVoices().forEach(voiceId => {
    const opt = document.createElement('option');
    opt.value = voiceId;
    opt.textContent = `Voice ${calculateVoiceId(voiceId)}`;
    select.appendChild(opt);
  });
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
}

// Pre-fills a sensible output range for the selected ADSR parameter (see
// ADSR_QUICK_DEFAULTS) — still just a starting point, the fields stay editable.
function _applyQuickDefaultRange() {
  const paramId = Number(q('#quick-param').value);
  const range = ADSR_QUICK_DEFAULTS[paramId] || { min: 0, max: 127 };
  q('#quick-out-min').value = range.min;
  q('#quick-out-max').value = range.max;
}

function _setQuickMapping() {
  const voiceSelect = q('#quick-voice');
  if (!voiceSelect.value) {
    _setQuickStatus('No voice available — set up a voice on the Ports tab first', 'fail');
    return;
  }
  const cc = Number(q('#quick-cc').value);
  if (!Number.isInteger(cc) || cc < 0 || cc > 127) {
    _setQuickStatus('CC number must be 0–127', 'fail');
    return;
  }
  const slot = _findFreeSlot();
  if (slot === -1) {
    _setQuickStatus('All 32 mapping slots are in use', 'fail');
    return;
  }

  const voiceId = Number(voiceSelect.value);
  const paramId = Number(q('#quick-param').value);
  const outMin = Number(q('#quick-out-min').value);
  const outMax = Number(q('#quick-out-max').value);

  // Everything but voice/param/CC/output-range is defaulted: CC on any channel,
  // straight 0-127 input range, linear curve.
  sendMappingParam(slot, MAP_SRC_MSGTYPE, CONTROL_CHANGE);
  sendMappingParam(slot, MAP_SRC_CHANNEL, 0);
  sendMappingParam(slot, MAP_SRC_NUMBER, cc);
  sendMappingParam(slot, MAP_SRC_MIN, 0);
  sendMappingParam(slot, MAP_SRC_MAX, 127);
  sendMappingParam(slot, MAP_CURVE_TYPE, 0);
  sendMappingParam(slot, MAP_TGT_TYPE, VOICE);
  sendMappingParam(slot, MAP_TGT_NUMBER, voiceId);
  sendMappingParam(slot, MAP_TGT_PARAM, paramId);
  sendMappingParam(slot, MAP_OUT_MIN, outMin);
  sendMappingParam(slot, MAP_OUT_MAX, outMax);
  sendMappingParam(slot, MAP_ENABLED, 1);

  const paramEntry = getMappingTargetParams(VOICE).find(p => p.id === paramId);
  const paramLabel = paramEntry ? paramEntry.label : `param ${paramId}`;
  _setQuickStatus(`CC${cc} → Voice ${calculateVoiceId(voiceId)}: ${paramLabel} — mapping created`, 'ok');
  renderMappingList();
}

function _setQuickStatus(text, cls) {
  const status = q('#quick-status');
  if (!status) return;
  status.textContent = text;
  status.className = 'map-status' + (cls ? ' ' + cls : '');
}

function _setListStatus(text, cls) {
  const status = q('#map-list-status');
  if (!status) return;
  status.textContent = text;
  status.className = 'map-status' + (cls ? ' ' + cls : '');
}

initMappingsTab();
