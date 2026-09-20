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

## Fixed 2026-09-20: the mapping bank was talking to a retired parameter

The firmware sends mapping-slot data as GENERAL parameter **21**
(`genComMappingDefaultSinglePar`). This editor still used **20**
(`genComMappingSinglePar`), which the firmware retired along with the user
mapping bank - see `planes/user-mapping-bank-retirement-proposal.md` and the
note at `SysExDef.h:99` in the firmware repo. 20 is not handled there at all
any more.

That broke the mapping bank in **both** directions, and only one direction was
visible:

- **Receive** - every reply on 21 hit the unknown-param branch and was discarded
  (`Unknown GENERAL param 21 - ignored`). 32 slots x ~6 fields per dump, so a few
  hundred console lines per reconnect, and the editor never read mapping state.
- **Send** - the worse half, and silent. `sendMappingParam()` wrote to parameter
  20, which the firmware ignores, while `_storeMappingData()` still updated the
  local model - so the Mappings tab and the Quick CC -> ADSR panel looked like
  they worked while **nothing reached the module**. Same shape as the EEPROM
  `put()` no-op on the firmware side: a write that returns normally and does
  nothing.

Fix: `MAPPING_SINGLE_PAR = 20` becomes `MAPPING_DEFAULT_SINGLE_PAR = 21`, applied
to the `SYSEX_OBJ[0]` entry, the receive case, and the send. No protocol or
payload change - the `[slot, fieldId, value...]` shape was already correct, and
the whole 12-field `SYSEX_OBJ[MAPPING]` table was already in place. Only the
command number was wrong.

**Verified on hardware 2026-09-20.** Adding items to voices works, and the
additions survived a reboot. That covers the part that mattered: the removed
duplicate was the add-member command, and re-firing it mid-rebuild is what
corrupted the voice's other member ports in `25bd420`. The voice's other ports
kept their functions, and the result persisted - so the send is landing once and
the firmware is saving it. Expected: the `Unknown GENERAL param 21` flood
gone, mapping slots populating from the module, and mapping edits actually
landing. The send half is the one worth testing deliberately, since it has
apparently never worked and so has never been seen to work.

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
- Dropped or unparsed messages. Until 2026-09-20 every GENERAL param 21 message
  was discarded, so a whole section of each dump never landed - that one is now
  fixed (see above), which may or may not have been the cause here.
- A race between the initial default render and the arrival of the reply,
  especially with the duplicate `REQ_CONFIG` traffic described below.

Not yet investigated.

### Confirmed instance 2026-09-20: a stale cached module

After uploading the `8682521` files the page showed defaults on every reload, and
a hard refresh (Ctrl+Shift+R) fixed it. Cause: `settingsFuncs.js` gained an import
of `flushFunctBundles`, an export added to `sysexMgt.js` one commit earlier. The
browser served a cached `sysexMgt.js` from before that export existed, so the
import failed - and an ES module import failure is fatal and cascades.
`domScripts.js` and `events.js` both import from `settingsFuncs.js`, so every
event handler and the whole config-apply path died with it. The page rendered its
`dataModel.js` defaults and nothing ever replaced them.

This confirms the shape the section above only guessed at: **anything that throws
before the dump is applied leaves the defaults on screen, silently as far as the UI
is concerned.** It does not prove the earlier sightings had this cause - those
predate any import change - but it does mean "stuck on defaults" should always be
checked against the console's *first* error before being read as a firmware or
persistence fault.

Practical consequence for deploys: whenever a change adds or renames an export,
uploaded files can be mismatched against cached ones in exactly this way. Users
will not know to hard-refresh. Worth considering cache-busting query strings or
versioned filenames on the module imports.


## To investigate: menus disappear on hover, and it undermines testing

Reported 2026-09-20. Setting a port is sometimes difficult because menus vanish
on hover, so an intended change may never be sent at all.

The UI annoyance is the smaller half of this. The real cost is to **test
validity**: if you cannot be sure what you set, then "the change did not
persist" and "the change was never sent" are indistinguishable from the web
side. Every persistence test run through this editor inherits that doubt, and
the firmware currently has an open question - whether the EEPROM save area still
corrupts - that is being investigated using exactly such tests.

This is the second way the editor can manufacture a symptom that reads as a
firmware fault; the render-defaults race above is the first. Both are worth
fixing partly for their own sake and partly because they are contaminating
firmware diagnosis.

Workaround in the meantime, and the recommended shape for firmware-side soaks:
verify persistence from the module's own log rather than from the UI. Compare
the last save against the next boot's load - same slots, same byte count, across
a power cycle - which says nothing about what was clicked and everything about
whether the data survived. Written up under "A UI-independent integrity check"
in `planes/EEPROMbug-branch-status.md` in the firmware repo.

## The editor repeats commands - port-function half fixed 2026-09-20

While debugging the firmware side, a single UI interaction was measured sending
the **same port-function command seven times**, plus repeated full config
requests (10 `REQ_CONFIG` in one short session).

### Root cause of the seven-times part

Not a duplicated call site, which is where we expected to find it.
`PORTFUNCPARAMETER` (the CC/RPN/NRPN number) and `PORTMIDICHAN` are not sent as
themselves: `sendSysex()` routes all three of funct, midi channel and param into
one **`PORTFUNCTION` bundle** carrying the full triple. So every arrow click on
a CC number emits a complete port-function command.

That matters more than it sounds, because the firmware treats that bundle as a
**port teardown+rebuild** - `processPortFunction()`'s add-to-existing-voice path
calls `setupPortElement()`. This file's own `_pendingFunctPorts` comment already
described the rebuild; what was missed is that a *parameter* edit triggers one.

So arrow-clicking a CC number from 0 to 45 is not seven messages, it is seven
port rebuilds. That accounts for the reported symptoms exactly: the page stalls,
the module's activity LED sits on, and - before the firmware-side autosave
coalescing landed - each rebuild drove a complete EEPROM save-chain rewrite.

### Fix

The bundle is now coalesced per port (`_scheduleFunctBundle`, 120 ms, chosen to
sit inside `requestConfigDebounced`'s 200 ms so the bundle always lands first).
It is rebuilt from `DeviceConfig` when the timer fires rather than captured when
scheduled, so the send that goes out carries the value the user settled on -
deferring is *more* correct here, not less.

Only the rapid-fire cases are coalesced. A function change is a single discrete
click, the drum special case has ordering requirements against the `VOICE`
messages that follow it, and the bulk `sendToModule()` path requests config
immediately afterwards - all three still send synchronously. `flushFunctBundles()`
is called before save-to-slot and load-from-slot, so a pending bundle can neither
be lost from a save nor land on top of a freshly loaded config.

**Not yet verified on hardware.** Expected: one port-function command per settled
edit instead of one per click, and no stall while setting a CC number.

### The repeated `REQ_CONFIG` - two duplicates removed 2026-09-20

Every call site was traced; none are reply-driven, so there is no feedback loop.
Two were genuine duplicates:

- **Add-to-Voice modal submit** (`domScripts.js`). `_handleMainFunction()` ends by
  dispatching `change` on the main-function input, and the global handler answers
  that with `sendParameterSysex()` + `requestConfigDebounced()`. The handler then
  did an explicit `sendParameterSysex()` on the *same* input plus an immediate
  `requestConfig()` - so each submit sent the add-member command **twice** and
  requested config twice. The duplicate send is the dangerous half: firmware tears
  down and rebuilds the whole voice on that command, and re-firing it mid-rebuild
  is exactly what corrupted the voice's other member ports in the bug fixed by
  `25bd420`. That commit removed the stacked *listeners* but left this second send
  inside the handler itself.
- **LFO global graph selector** (`events.js`). `RequestConfig = false` suppresses
  the immediate request inside `requestConfig()`, but each `setLFOGraph()`
  dispatches `change`, and the debounced request it schedules fires 200 ms later -
  by which point the flag is back to true. The suppression leaked one deferred
  request and the explicit call added a second. Now debounced, so all five merge
  into one.

Also tightened: `sendToModule()` flushes pending function bundles before its
`requestConfig()`, so a bundle queued by an earlier interaction cannot land after
the request and make the reply stale.

**Left alone deliberately** - these are correct as they are:

- `initMidi.js` on auto-connect and `domScripts.js` on manual device selection,
  both via `sendIdentityRequest(requestConfig)`. Two distinct user-visible events;
  each should request once. They can both fire in one session, which is expected.
- The explicit Settings -> Request menu item. User-initiated.

**Not ours:** opening the Mappings tab calls `syncAllMappingSlots()`, which issues
**32** slot requests (`REQ_CONFIG` with a slot selector). That is deliberate - no
batch read exists for mapping slots - and belongs with the mapping branch's work,
not here. If a session shows a large `REQ_CONFIG` count, check whether the
Mappings tab was opened before assuming a duplication bug.

**Not yet verified on hardware.**
