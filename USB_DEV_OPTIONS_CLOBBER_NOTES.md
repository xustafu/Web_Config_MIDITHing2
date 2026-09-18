# The editor was overwriting the module's USB routing options on every connect

Status: **root-caused and fixed 2026-09-18.** Found from the firmware side, by
watching a live UART log over a Picoprobe while reproducing "I changed
something in the editor, rebooted, and my change was gone."

## Symptom

Change a setting in the editor, power-cycle the module, and the change is not
there. Saving to a slot explicitly and loading it back *did* work, which made
it look like an autosave or EEPROM-persistence problem in the firmware.

## What was actually happening

`initMidi.js`, in the connect handler, wrote `USB_DEV_OPTIONS` **before**
reading anything from the module:

```js
const usbOpts = (DeviceConfig.device_options[1] || 0x0B) | 0x10;
sendGeneralSysex(USB_DEV_OPTIONS, usbOpts);
```

The intent was to guarantee the SysEx bit is on for the USB device port -
otherwise the firmware answers SysEx over TRS only and the editor goes deaf
over USB. The comment said it OR-ed the bit "on top of whatever value
DeviceConfig holds from a previous session, preserving other routing bits
where possible."

It never preserved anything:

- `DeviceConfig.device_options` is initialised to `[0, 0, 0, 0, 0, 0, 0, 0]` on
  every page load (`dataModel.js`). Nothing persists it across sessions.
- It is only populated later, from the module's config reply, in
  `_storeGeneralData()` (`sysexMgt.js`).
- The write ran *before* `sendIdentityRequest(requestConfig)`, i.e. before any
  reply could have arrived.

So `device_options[1]` was always `0` at that point - falsy - the `|| 0x0B`
fallback always won, and the editor sent a hardcoded

```
0x0B | 0x10 = 0x1B = 27
```

on every single connect, discarding whatever routing the user had configured.
The user then read the config back, saw 27, and concluded their change had not
been saved.

## Why it was hard to spot

`27` is *exactly* the firmware's own default for that port
(`MIDIDevice.h`: `const MidiOption usbDevDefOpt (1, 1, 0, 1, 1)` -> In 1 +
Out 2 + Thru 0 + Clock 8 + SysEx 16 = 27). So on the firmware side the write
was a genuine no-op: `mergeConfig.set()` saw no change, the autosave correctly
reported `No Merger config data changed`, and nothing was written to EEPROM -
because there was nothing to write. Every layer behaved "correctly" and the
value still appeared to revert.

The firmware-side UART log made it visible:

```
Command 0/0/7 receive
Change 7 to 27
No Merger config data changed
```

Parameter 7 is `genComUSBDEVOPTIONS`. That line was the editor's own connect
handshake - not a user edit at all.

## Also: the comment's premise was wrong

It claimed "firmware default after EEPROM wipe has USB_DEV_OPTIONS with SYX
bit off". In the current firmware the default is `usbDevDefOpt (1, 1, 0, 1, 1)`
- SysEx is **on** (bit 4 set, hence 27 includes `0x10`). So the blind write was
not achieving anything on a default module either. It may have been true of an
older firmware.

## The fix

Repair in the other order - read the real value first, and correct it only if
the bit is genuinely missing.

- `initMidi.js`: the unconditional pre-write is removed (the old code is kept
  as a comment explaining why, so nobody reinstates it).
- `sysexMgt.js`, in `_storeGeneralData()`: when a `USB_DEV_OPTIONS` reply
  arrives and the SysEx bit is clear, OR it into the value **just read** and
  send that back. The user's other routing bits survive, because they came from
  the module rather than from a hardcoded constant. Guarded by a one-shot flag
  (`_usbSysExRepairTried`) so a module that ignores the write cannot cause a
  send/reply loop, and it logs a `console.warn` when it fires.

Reaching that repair path requires the reply to arrive over some other port -
which already works: the connect handler adds a `sysex` listener to **every**
input, specifically so the firmware can answer via TRS when USB SysEx output
is disabled.

## Residual risk, and why it is acceptable

If a user disables SysEx output on the USB port *and* has no TRS link, the
editor now cannot read config and therefore cannot self-repair, where the old
blind write would have fixed it. That is judged the better trade:

- It requires deliberately turning the bit off, and the firmware default has
  it on, so it is not the out-of-the-box state.
- The old behaviour paid for that rare recovery by silently corrupting every
  user's routing settings on every connect.

If that recovery path is ever actually needed, the right shape is a *timed
fallback* - request config, and only if no reply arrives within N ms assume
SysEx-over-USB is off and send the recovery write. `sendIdentityRequest()`
already uses that pattern (it takes a `fallbackDelay`). It is deliberately not
implemented here, to avoid adding machinery for a case that has not been
observed.

## How to verify

1. In the editor, change the USB device port's routing (e.g. enable Thru, which
   should send `27 | 4 = 31`).
2. Reload the editor page and reconnect.
3. The routing dots should still show your value. Before this fix they reverted
   to 27 (In/Out/Clock/SysEx, Thru off).

With a firmware log available (`pio run -e MidiThingyRP_2354_uartlog` in the
MidiThing2 repo, plus `LOCAL_DEBUG_LEVEL DEBUG_LEVEL_TRACE` in
`EEPROMManager.cpp`, read at 115200 on the Picoprobe's CDC port), a connect
should no longer produce a `Change 7 to 27` line at all.
