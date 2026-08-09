# MIDI Channel Arrow → Port Loses Function — Debug Notes
*Session: 2026-08-09 — Web_Config_MIDITHing2*

---

## Symptom (as reported)

> "started to change midi channel pressing the arrows in either port of the voice...
> was working fine until it showed something different for a blink then came back to
> its value. after changing the channel several times, port changed to no function"

Two distinct symptoms, same root cause:
1. **The "blink"** — clicking a port's MIDI-channel arrow made the port's function
   flash to "no function" in the UI for a moment, then self-correct.
2. **The permanent regression** — after several channel changes, a port's function
   was actually, durably cleared to "no function" on the hardware — not just a display
   glitch.

Two other, unrelated bugs were found and fixed earlier in the same investigation
(see "Related bugs fixed first" below) before this root cause was isolated.

---

## Root cause

Changing a port's **MIDI channel** does not send a standalone "set channel" SysEx
message. `sendSysex()`'s `is_port_midich` branch (`src/js/backend/sysexMgt.js`,
`sendSysex()`) bundles it together with the port's **function** and **function
parameter (voice id)** into one combined message — `[funct, midi_ch, param...]` sent
under the `PORTFUNCTION` parameter index. This is not a web-app quirk: the firmware's
own protocol requires it (`MtCV2SysEx.cpp` — `sendPortParameters()` explicitly skips
`PORTMIDICHAN` when iterating individual fields, "Port function midi channel and
parameter already sent"; the SysEx doc's own wire format only exposes channel bundled
with function).

For a port that's part of a multi-port voice ("add to voice", e.g. the VELOCITY or
GATE component of a NOTE+GATE+VELOCITY voice), firmware's handler for this bundle
(`processPortFunction()` → the "add to existing voice" path) calls
`setupPortElement()`, which **tears down and rebuilds** the port. While that's in
flight, firmware can send an **individual reply reporting a transient
`funct=0` (NO-FUNC) state** before the real function is reapplied a moment later —
confirmed by decoding the raw bytes in a live console log:

```
SENT:     F0 7D 0C 22 03 07 00 02 02 00 00 00 00 F7   → funct=2(VELOCITY), ch=2, param=0 (correct)
RECEIVED: F0 7D 0C 22 03 07 00 00 01 00 00 00 00 F7   → funct=0(NO-FUNC),  ch=1, param=0 (transient)
          ...(a long stream of individual field replies for the same port)...
          ...(~200-500ms later, a full batch REQ_CONFIG reply arrives showing
             funct=2/VELOCITY again — correct, and always correct in every log seen)
```

The web app's `_processPortFunctionSysex()` applied **every** incoming reply —
including this transient one — straight into `DeviceConfig.ports[n].funct` (plus
resetting `min`/`max`/`clip_min`/`clip_max` to that function's defaults). That alone
only produced the harmless "blink," since the next full-config batch reply (always
correct) overwrote it moments later.

The permanent-regression case: `sendSysex()` reads `DeviceConfig.ports[n].funct`
**live**, at the moment of every send, to build the bundle
(`dec_data[0] = port.funct`). If the user clicked the channel arrow again **before**
that correcting batch reply arrived, the next send read back the corrupted
`funct=0` and **re-sent it as a real command** — and firmware applied it for real,
permanently clearing the port's function. This is why "slow but not slow enough"
clicking reproduced it: the vulnerable window is the full round trip (individual
per-field echo stream + debounced `REQ_CONFIG` cycle), which can run several hundred
ms to over a second — easily shorter than a person's "deliberate" click cadence.

---

## Fix

**File:** `src/js/backend/sysexMgt.js`

Added `_pendingFunctPorts` (a `Map<port_num, fallbackTimeoutId>`) tracking which ports
have a funct/midich/param bundle send currently "in flight" / unsettled:

- `sendSysex()` calls `_markFunctPending(number)` right after building and sending the
  bundle (the `is_port_param || is_port_funct || is_port_midich` branch).
- `_processPortFunctionSysex(port_num, data, is_batch)`:
  - If the incoming reply is **individual** (`is_batch === false`) and that port is
    pending, the reply is **ignored entirely** (no write to `DeviceConfig`, no log
    beyond a debug line) — it's presumed to be a transient mid-rebuild echo.
  - If the incoming reply is a **batch** `REQ_CONFIG` reply, it always clears that
    port's pending state (batch replies were confirmed correct in every log observed)
    and is applied normally, same as before.
- A 3-second fallback timeout auto-clears a port's pending state even if no batch
  reply ever arrives (e.g. `RequestConfig` disabled, or some other send path with no
  follow-up refresh), so a port can never get stuck permanently ignoring updates.

Net effect: `DeviceConfig.ports[n].funct` can now only ever be updated by a reply this
app trusts as final (the batch reply), so a rapid follow-up send can never read back
and re-transmit a corrupted transient value. This also removes the visual "blink" as a
side effect, since the UI never displays the transient wrong state either.

---

## Related bugs fixed first (same investigation, different mechanisms)

These were real, confirmed-live bugs but did **not** fully explain the reported
symptom on their own — found and fixed before the above root cause was isolated:

1. **Un-debounced `requestConfig()` on every arrow click / input change**
   (`settingsFuncs.js` — added `requestConfigDebounced()`, 200ms coalescing window;
   wired into `arrowsFunc` in `domScripts.js` and the generic change listeners in
   `events.js`).
2. **Broken batch param decode formula** (`_processPortFunctionSysex`'s `is_batch`
   branch used `parseInt(data[2]) + parseInt(data[3])*16 + parseInt(data[3])*16*3 +
   parseInt(data[4])*16*3` — double-counted `data[3]`, never read `data[5]`. Fixed to
   `(data[2] | (data[3]<<8) | (data[4]<<16) | (data[5]<<24)) >>> 0`).
3. **Duplicate `REQ_CONFIG` on every connect** — `sendIdentityRequest(requestConfig)`
   was always paired with an independent `setTimeout(requestConfig, 500)` fallback in
   the calling code (`initMidi.js`, `domScripts.js`), which fired regardless of
   whether the identity reply (and its own triggered `requestConfig`) had already
   happened — guaranteeing two overlapping full-config requests on every page load.
   Confirmed live: the second batch reply arrived visibly truncated, mis-chunked into
   6-byte port records regardless, producing a port read as "no function" with a
   garbage param and crashing `refreshWeb()`. Fixed by moving fallback-timer
   ownership *into* `sendIdentityRequest()` itself (`sysexMgt.js`), which now
   guarantees `onReply` fires exactly once; the now-redundant external
   `setTimeout(requestConfig, 500)` calls were removed from both callers.

---

## Files changed this session

| File | Change |
|------|--------|
| `src/js/backend/sysexMgt.js` | `_pendingFunctPorts` tracking + `_markFunctPending()`; individual PORTFUNCTION replies ignored for pending ports; batch replies clear pending state; `sendIdentityRequest()` owns its own fallback timer; fixed batch param decode formula |
| `src/js/backend/initMidi.js` | Removed redundant `setTimeout(requestConfig, 500)` fallback (now owned by `sendIdentityRequest`) |
| `src/js/domScripts.js` | Removed redundant `setTimeout(requestConfig, 500)` fallback (same reason); `arrowsFunc` now calls `requestConfigDebounced()` |
| `src/js/events.js` | Input-change listeners now call `requestConfigDebounced()` instead of un-debounced `setTimeout(requestConfig, 200)` |
| `src/js/settingsFuncs.js` | Added `requestConfigDebounced()` |

**No firmware changes were needed** — the bundled funct+channel+param message and its
transient teardown/rebuild echo are intentional firmware protocol behavior; the bug
was entirely in how the web app trusted that transient reply.

---

## If this regresses again

Check with `LogRcvdSysex = true` and `LogSentSysex = true` in the console:
- A healthy channel-change: `SENT` bundle → (transient reply now silently dropped,
  logged as "Ignored transient port function reply for port N (settling)" if it lands
  while pending) → individual field echoes → batch `REQ_CONFIG` reply confirming the
  correct function.
- If the function is wrong **after** the batch reply too, the bug has moved upstream
  of this fix (e.g. wrong data actually sent, or a firmware-side issue) — re-decode
  the raw SysEx bytes by hand (device byte / TypeAndNumber / Parameter / Length /
  7-bit-encoded payload) rather than trusting the console's own decoded log lines,
  same approach used to find this bug.

---

## Open issue (2026-08-09, same day, after the fix above shipped) — possible Chrome/Web MIDI flakiness

**Symptom:** After confirming the "no function" regression is fixed, user reports
other intermittent "hiccups" — e.g. the UI showing a **negative MIDI channel** value —
that sometimes require rebooting the device and/or restarting Chrome to clear.

**Not yet root-caused.** Two things suspected to both be true, not mutually exclusive:

1. **Chrome's Web MIDI implementation itself is known to be unreliable**, especially
   on Windows: SysEx bytes can be dropped/corrupted when messages are sent in quick
   succession or after a port has been open a long time, and `MIDIOutput`/`MIDIInput`
   objects can go stale (still listed in `navigator.requestMIDIAccess()`'s
   `.outputs`/`.inputs`, but stop actually delivering) without the page having any way
   to detect it. This is a documented Chromium-level issue, not specific to this app,
   and matches "needing to reboot device and/or Chrome" well.
2. **The web app has no defense against a corrupted/desynced message once one occurs.**
   A negative channel is the same general failure signature as the truncated-batch bug
   fixed earlier this session (see "Bug 3" under "Related bugs fixed first" above) — a
   byte-offset desync feeding garbage into `DeviceConfig`. `_setHeaderParams()`
   (`refreshWeb.js:199-200`) writes `port.midi_ch` straight into the channel input with
   no range check, so any garbage value (including one that decodes to negative,
   e.g. via a signed-type misread on a misaligned byte) gets displayed as-is.

**Proposed mitigation (not yet implemented):** regardless of exactly which of the two
above is at fault, add defensive validation on the receive path — reject/ignore a
port-function or batch reply whose length doesn't match what's expected, and clamp
`midi_ch` to 1-16 (and similarly sane ranges for other fields) before writing into
`DeviceConfig`/the DOM. This won't fix Chrome-side message loss, but turns "garbage
value displayed, state silently corrupted" into "value just doesn't update," which is
far less confusing and non-destructive.

**Next step:** get a console log (`LogRcvdSysex=true`) captured at the moment a
negative channel appears, to see the raw `SYSEX RECEIVED` bytes immediately before it
and confirm whether it's the same byte-desync mechanism as the earlier truncated-batch
bug or something new.
