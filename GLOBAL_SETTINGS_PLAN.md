# Global Settings Implementation Plan

Re-implement the Global Settings view (MIDI routing matrix + master clock config) using the
correct HardwareBeta4Test SysEx schema. The May 3rd commits (4a705b7→47b87e3) built this
feature but were reset because commit b6fc820 "Test RP2354" introduced two new params that
shifted the clock constants. This plan fixes the schema first, then re-applies the UI work.

**Reference branch for SysEx schema:** `HardwareBeta4Test` in repo `xustafu/MidiThing2`
**Reference file:** `SysEx Details.md`

---

## Schema problem (why the May commits were reset)

Commit b6fc820 "Test RP2354" (SergioRetamero, 2026-05-31) inserted two new GENERAL params
for a future RP2354 firmware that are NOT in the HardwareBeta4Test spec:

| Param | b6fc820 (current, WRONG) | HardwareBeta4Test (correct) |
|-------|--------------------------|------------------------------|
| 12    | `SER_DEV_OUT_OPTIONS`    | `USE_MIDI_CLOCK`             |
| 13    | `SER_DEV_IN_OPTIONS`     | `CLOCK_PERIOD`               |
| 14    | `USE_MIDI_CLOCK`         | `USB_DEV_NUMBER`             |
| 15    | `CLOCK_PERIOD`           | —                            |
| 16    | `USB_DEV_NUMBER`         | —                            |

The rest of that commit (sendIdentityRequest, onSysexReceive rework, RP device detection)
is schema-independent and must be kept.

---

## Step 0 — Fix `dataStructures.js` constants and SYSEX_OBJ

**File:** `src/js/backend/dataStructures.js`

### Constants block (after `USB_HOST4_OPTIONS = 11`)

Remove the two new lines and restore correct values:

```js
// REMOVE:
const SER_DEV_OUT_OPTIONS = 12;
const SER_DEV_IN_OPTIONS  = 13;

// RESTORE:
const USE_MIDI_CLOCK  = 12;   // was 14 in b6fc820
const CLOCK_PERIOD    = 13;   // was 15 in b6fc820
const USB_DEV_NUMBER  = 14;   // was 16 in b6fc820
```

### SYSEX_OBJ[GENERAL] block

Remove the two new entries; fix the clock entries (USE_MIDI_CLOCK type was wrongly Uint16
before b6fc820 — the SysEx Details.md `02 00 nn` format encodes 1 byte so Uint8 is correct):

```js
// REMOVE:
[SER_DEV_OUT_OPTIONS]: { index: 12, type: "Uint8",  length: 1 },
[SER_DEV_IN_OPTIONS]:  { index: 13, type: "Uint8",  length: 1 },

// KEEP (indices now match corrected constants):
[USE_MIDI_CLOCK]:  { index: 12, type: "Uint8",  length: 1 },
[CLOCK_PERIOD]:    { index: 13, type: "Uint32", length: 4 },
[USB_DEV_NUMBER]:  { index: 14, type: "Uint8",  length: 1 },
```

---

## Step 1 — Fix `_processGeneralSysex()` switch cases in `sysexMgt.js`

**File:** `src/js/backend/sysexMgt.js`

The switch uses `SYSEX_OBJ[0][param].index` (equals the constant). After Step 0 the
indices shift. Update the case comments and remove the dead RP2354 cases:

```js
// REMOVE cases 12 (SER_DEV_OUT_OPTIONS) and 13 (SER_DEV_IN_OPTIONS)

// RENAME/RENUMBER:
case 12: //"USE_MIDI_CLOCK"   (was case 14)
case 13: //"CLOCK_PERIOD"     (was case 15)
case 14: //"USB_DEV_NUMBER"   (was case 16)
```

Also add `_storeGeneralData()` calls for cases 12 and 13 (currently they only log, so
received config never populates DeviceConfig).

The sendIdentityRequest() and all other RP2354 logic from b6fc820 are unchanged.

---

## Step 2 — Add `sendGeneralSysex()`, helpers, and `_storeGeneralData()` to `sysexMgt.js`

**File:** `src/js/backend/sysexMgt.js`
**Reference:** commit 4d2bb86 (same code, now correct because constants are fixed)

### Exports to add

```js
export function bpmToPeriod(bpm)       { return Math.round(60_000_000 / bpm); }
export function periodToBpm(period_us) { return 60_000_000 / period_us; }

export function sendGeneralSysex(param, value) {
  if (MIDIoutput == null) return;
  const entry = SYSEX_OBJ[GENERAL][param];
  if (!entry) { console.error('sendGeneralSysex: unknown param', param); return; }
  value = Number(value);
  _storeGeneralData(param, value);
  const dec_data = new Uint8Array(entry.length);
  new DataView(dec_data.buffer)['set' + entry.type.trim()](0, value, true);
  const enc_data  = new Uint8Array(entry.length + 2);
  const enc_length = _encodeSysEx(dec_data, enc_data);
  const send_arr  = new Uint8Array(enc_length + 4);
  send_arr[0] = _deviceByte();
  send_arr[1] = 0;           // GENERAL type (0) + number (0)
  send_arr[2] = entry.index;
  send_arr[3] = enc_length;
  send_arr.set(enc_data.slice(0, enc_length), 4);
  MIDIoutput.sendSysex(0x7d, Array.from(send_arr));
  if (LogSentSysex) {
    const hex = Array.from(send_arr).map(x => x.toString(16).padStart(2,'0')).join(' ');
    console.log('GENERAL SYSEX SENT: F0 7D ' + hex.toUpperCase() + ' F7');
  }
}
```

### Internal helper

```js
function _storeGeneralData(param, value) {
  switch (param) {
    case SER_DEV_OPTIONS: case USB_DEV_OPTIONS:
    case USB_HOST1_OPTIONS: case USB_HOST2_OPTIONS:
    case USB_HOST3_OPTIONS: case USB_HOST4_OPTIONS:
      DeviceConfig.device_options[param - SER_DEV_OPTIONS] = value; break;
    case USE_MIDI_CLOCK:   // 12
      DeviceConfig.global_use_midi_clock = !!value; break;
    case CLOCK_PERIOD:     // 13
      DeviceConfig.global_clock_period = value; break;
  }
}
```

---

## Step 3 — Add global fields to `DeviceConfig` in `dataModel.js`

**File:** `src/js/backend/dataModel.js`
**Reference:** commit dcb82b9

Add after `voices_assigned` in the `DeviceConfig` object:

```js
global_use_midi_clock: false,    // USE_MIDI_CLOCK (12): false=internal, true=external
global_clock_period:   500000,   // CLOCK_PERIOD (13): µs — 500000 µs = 120 BPM
// One bitmask per device for params 6–11 (SER, USB_DEV, HOST1–4).
// Bits: 0=IN, 1=OUT, 2=THRU, 3=CLK, 4=SYX  (union MidiOption in MIDIDevice.h)
device_options: [0, 0, 0, 0, 0, 0],
```

---

## Step 4 — Add Global Settings view files (new files)

**Reference:** commits 4a705b7 + 4f10ed5

### `src/includes/global_settings.php` (new)

Two-card layout inside `<div class="gs-wrap">`:

**Card 1 — MIDI MATRIX SET-UP**

6 × 5 toggle matrix. Rows = MIDI devices, columns = routing options.

| Row label  | `data-device` | GENERAL param sent |
|------------|:------------:|-------------------|
| MIDI TRS   | 0            | `SER_DEV_OPTIONS` (6)   |
| USB Device | 1            | `USB_DEV_OPTIONS` (7)   |
| USB Host 1 | 2            | `USB_HOST1_OPTIONS` (8) |
| USB Host 2 | 3            | `USB_HOST2_OPTIONS` (9) |
| USB Host 3 | 4            | `USB_HOST3_OPTIONS` (10)|
| USB Host 4 | 5            | `USB_HOST4_OPTIONS` (11)|

Columns (bits): `data-bit` 0=IN, 1=OUT, 2=THRU, 3=CLK, 4=SYX.
Each cell: `<div class="routing-dot inactive" data-device="N" data-bit="B">`.

**Card 2 — MAIN CLOCK**

```html
<input type="number" id="global-clock-bpm" class="gs-bpm-input no-trigger"
       value="120.00" min="1" max="300" step="0.01" />

<input type="radio" name="global-clock-mode" id="global-clock-internal"
       class="no-trigger" value="0" checked> Internal
<input type="radio" name="global-clock-mode" id="global-clock-external"
       class="no-trigger" value="1"> External
```

Both inputs have `class="no-trigger"` so the generic `sendParameterSysex` handler
in events.js does not fire on them.

### `src/styles/global-settings.css` (new)

Styles for `.gs-wrap`, `.gs-card`, `.gs-matrix`, `.routing-dot.active`,
`.routing-dot.inactive`, `.gs-clock-body`, `.gs-bpm-input`, etc.
Take from commit 4a705b7 verbatim.

---

## Step 5 — Navigation plumbing

**Reference:** commits 4a705b7 + 4f10ed5

### `src/includes/banner.php`

Replace the single "Settings" link with a two-item sub-menu:
- **Ports** → `onclick="switchView('ports')"`
- **Global settings** → `onclick="switchView('global')"`

### `src/includes/main.php`

1. Wrap the existing port boxes section in `<div id="ports-view" style="display:contents">`.
2. Add after it:
   ```php
   <div id="global-settings-view" style="display:none">
     <?php include 'global_settings.php'; ?>
   </div>
   ```

`display:contents` on `#ports-view` means its children remain direct flex items of
`<main>`, preserving the existing port-box layout.

### `src/js/domScripts.js`

Export a new function and wire it to the menu:

```js
export function switchView(name) {
  q('#ports-view').style.display          = (name === 'ports')  ? 'contents' : 'none';
  q('#global-settings-view').style.display = (name === 'global') ? 'block'    : 'none';
}
```

---

## Step 6 — Wire events in `events.js`

**File:** `src/js/events.js`
**Reference:** commits 47b87e3 + 4a705b7

### Import update

```js
import { sendParameterSysex, sendGeneralSysex, bpmToPeriod } from './backend/sysexMgt.js';
```

### BPM blur handler

```js
q('#global-clock-bpm').addEventListener('blur', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    e.target.value = v.toFixed(2);
    sendGeneralSysex(CLOCK_PERIOD, bpmToPeriod(v));   // param 13
  }
});
```

### Clock mode radio handler

```js
qA('input[name="global-clock-mode"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const isExternal = e.target.id === 'global-clock-external';
    q('#global-clock-bpm').disabled = isExternal;
    sendGeneralSysex(USE_MIDI_CLOCK, isExternal ? 1 : 0);  // param 12
  });
});
```

### Routing dot click handler

```js
qA('.routing-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    dot.classList.toggle('active');
    dot.classList.toggle('inactive');
    const device = Number(dot.dataset.device);
    let mask = 0;
    qA(`.routing-dot[data-device="${device}"]`).forEach(d => {
      if (d.classList.contains('active')) mask |= (1 << Number(d.dataset.bit));
    });
    // param = SER_DEV_OPTIONS(6) + device index  →  params 6–11
    sendGeneralSysex(SER_DEV_OPTIONS + device, mask);
  });
});
```

---

## Checklist

- [ ] Step 0 — `dataStructures.js`: remove SER_DEV_OUT/IN_OPTIONS, restore USE_MIDI_CLOCK=12, CLOCK_PERIOD=13, USB_DEV_NUMBER=14, fix USE_MIDI_CLOCK type to Uint8
- [ ] Step 1 — `sysexMgt.js`: fix `_processGeneralSysex` case numbers; add `_storeGeneralData` calls for cases 12–13
- [ ] Step 2 — `sysexMgt.js`: add `sendGeneralSysex()`, `bpmToPeriod()`, `periodToBpm()`, `_storeGeneralData()`
- [ ] Step 3 — `dataModel.js`: add `global_use_midi_clock`, `global_clock_period`, `device_options`
- [ ] Step 4 — New files: `global_settings.php`, `global-settings.css`
- [ ] Step 5 — Navigation: `banner.php`, `main.php`, `domScripts.js`
- [ ] Step 6 — `events.js`: BPM blur, clock mode radio, routing dot click handlers
