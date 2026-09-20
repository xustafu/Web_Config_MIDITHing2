# Editor status, and compatibility with older firmware

Last updated 2026-09-18. Companion to `USB_DEV_OPTIONS_CLOBBER_NOTES.md`.

## Is it safe to leave the editor as it is?

**Yes, with one caveat**, described under "The one real compatibility risk"
below. Three of the four changes made in this round are *strictly safer* than
what they replaced, including against older firmware. One of them removes a
behaviour that could, in a specific and unlikely situation, have rescued a
misconfigured module.

## What changed, and how each behaves against older firmware

| Change | Commit | Older-firmware behaviour |
|---|---|---|
| Stop blind-writing `USB_DEV_OPTIONS` on connect | `198e907` | **The one risk** - see below |
| Warn on unknown port-function id | `97c2d64` | Strictly safer |
| `voices_port` bounds `<= 12` -> `< 12` | `9d4ff71` | Strictly safer |
| Guard null `li` in `_selectWebFunction`, plus `getParent`/`getLiPortNumber` | this round | Strictly safer |

The last three only change behaviour in cases that previously threw an
exception. They are *more* tolerant of version skew, not less: an older or
newer firmware sending a function id or voice index this build doesn't know now
degrades to a warning and a skipped field, where before it threw. That matters
because the null-`li` case was aborting `refreshWeb()`'s `forEach` outright, so
one unrecognised port left **every later port stale** - a whole-UI failure
caused by one unknown value.

## The one real compatibility risk

`initMidi.js` used to force the SysEx bit on for the USB device port on every
connect, before reading anything:

```js
const usbOpts = (DeviceConfig.device_options[1] || 0x0B) | 0x10;
sendGeneralSysex(USB_DEV_OPTIONS, usbOpts);
```

That was removed because it clobbered the user's routing on every connect (full
reasoning in `USB_DEV_OPTIONS_CLOBBER_NOTES.md`). Repair now happens the other
way round: read the real value, and only correct it if the SysEx bit is
genuinely missing.

The consequence for old firmware: **if a module's USB device port has SysEx
output disabled, the editor can no longer force it back on blind.** It would
have to learn the current value first, and it cannot read anything over USB
while that bit is off.

How much this matters:

- The **current** firmware default has the bit **on**
  (`MIDIDevice.h`: `usbDevDefOpt(1, 1, 0, 1, 1)` = 1+2+0+8+16 = 27, and
  `0x10` is set), so out of the box there is nothing to repair.
- The removed code's own comment claimed the opposite - "firmware default after
  EEPROM wipe has USB_DEV_OPTIONS with SYX bit off". That is **not** true of the
  firmware as it stands. It may have been true of an older build, which is
  precisely where this risk would bite.
- There is still a recovery path: the connect handler adds a `sysex` listener to
  **every** MIDI input, so a module answering over TRS instead of USB is still
  heard, and the repair in `_storeGeneralData()` then fires. The gap only opens
  if SysEx-over-USB is off *and* there is no TRS link.

**If you need to support older firmware in the field**, the right shape is a
timed fallback rather than restoring the blind write: request config, and only
if no reply arrives within N ms assume SysEx-over-USB is off and send the
recovery value. `sendIdentityRequest()` already takes a `fallbackDelay` and uses
exactly this pattern. It was deliberately not implemented because the case has
not been observed on current firmware - but it is the known answer if it shows
up.

## Known outstanding issue: GENERAL param 21 is not implemented

The firmware sends mapping-slot data as GENERAL parameter **21**
(`genComMappingDefaultSinglePar`). This editor does not handle that parameter,
so every such message is logged and discarded:

```
Unknown GENERAL param 21 — ignored
```

Two consequences, one cosmetic and one not:

- 32 mapping slots per full config dump, several messages each, twice per
  reconnect - hundreds of console lines, which makes debugging painful and the
  page feel sluggish.
- More importantly the data is **thrown away**, so the editor never reads
  mapping-slot state at all.

The firmware pins that value deliberately (`genComMappingDefaultSinglePar = 21`,
after `genComMappingSinglePar` at 20 was retired - see
`planes/user-mapping-bank-retirement-proposal.md` in the firmware repo), so the
fix belongs here: implement param 21, do not renumber the firmware.

**This is the next task.** It was agreed as the follow-up to the current round
and is not started.

## To investigate: the editor renders defaults first, then applies the loaded config

Observed 2026-09-20. On connect the page briefly shows a **default** configuration
and then switches to the values loaded from the module. **A couple of times it
stayed on the default** and never switched.

This is worth chasing because it produces a symptom that is easy to blame on the
firmware: "the module loaded defaults". If the editor renders defaults and then
fails to apply the incoming config, the module's stored configuration can be
perfectly intact while the UI insists otherwise. At least some past
"loads to default" reports may be this rather than a persistence fault - so when
it happens, confirm against the firmware side (probe UART log, or a slot-status
request) before concluding anything about EEPROM.

Likely shape of it: `refreshWeb()` paints from `DeviceConfig`, which starts at
its `dataModel.js` defaults and is only filled in as config replies arrive. So
anything that interrupts or drops the reply stream leaves the defaults on screen.
Candidates, roughly in order:

- An exception part-way through applying the dump. One such case was fixed on
  2026-09-20 (a null `li` in `_selectWebFunction()` aborting `refreshWeb()`'s
  `forEach`), but that was one instance of a general fragility, not necessarily
  the only one.
- Dropped or unparsed messages - note that every GENERAL param 21 message is
  currently discarded (see above), so part of each dump never lands.
- A race between the initial default render and the arrival of the reply,
  especially with the duplicate `REQ_CONFIG` traffic described below.

Not yet investigated.

## Also outstanding: the editor repeats commands

While debugging the firmware side, a single UI interaction was measured sending
the **same port-function command seven times**, plus repeated full config
requests (10 `REQ_CONFIG` in one short session). That is worth investigating
here: it inflates every config dump, and on the firmware side it multiplies
EEPROM save churn - which is currently implicated in save-area corruption (see
`planes/port-function-autosave-findings.md` in the firmware repo).

Some call sites already use `requestConfigDebounced()` and others call
`requestConfig()` directly; that asymmetry is the obvious place to start.
