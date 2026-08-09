import { q, qA, LiveSend } from './globals.js';
import {
  expandMenu,
  arrowsFunc,
  minMax,
  domInit,
  checkBox,
  selectSettings,
  selectFunction,
  setLabelWidths,
  selectParameter,
  setLFOGraph,
  dynModal,
  activateMidiThingy,
  switchView
} from './domScripts.js';
import { sendParameterSysex, sendGeneralSysex, sendSysex, bpmToPeriod, sendMidiStart, sendMidiStop } from './backend/sysexMgt.js';
import { requestConfig, requestConfigDebounced, handleFiles } from './settingsFuncs.js';
import { drawAllADSR } from './backend/adsr.js';

/**
 * Paint the list of available colours under the port name
 */
document.addEventListener('DOMContentLoaded', domInit());
window.addEventListener('resize', () => {
  setLabelWidths();
  const activeADSRWrappers = qA('section[id^=adsr-conf][class^=conf-window]:not(.hidden)');
  activeADSRWrappers.forEach(wrapper =>
    drawAllADSR(document.querySelector(`${wrapper.id} .adsr-container`))
  );
  activateMidiThingy(q('#MIDIInputSelectLabel').innerHTML);
});

/**
 * hide everything on click outside inactive elements
 */
q(`body`).addEventListener('click', e => {
  const nodeType = e.target.nodeName;
  if (!['UL', 'LABEL', 'LI', 'H3', 'IMG', 'H1', 'SPAN'].includes(nodeType)) {
    // Go through all dropdown <ul>s and hide them (#view-switcher is a persistent
    // nav, not a dropdown, so it's excluded)
    qA(`ul`).forEach(ul => { if (!ul.closest('#view-switcher')) ul.classList.toggle('hidden', true); });
    qA(`label.box-selector-label`).forEach(label => label.classList.remove('active'));
    window.removeEventListener('scroll', dynModal);
  }
});

/**
 * Expand selector menus on click on any selector and selectors with
 * submenus
 * NOTE: the parameter for the expand function is the actual
 * element that originated the click to prevent bubbling errors.
 */
[
  qA('label[class*=selector-label]'),
  qA('.color-selector'),
  qA('[for^=lfo-global-input] img'),
  qA('li.has-submenu')
].forEach(item => {
  item.forEach(selector => {
    selector.addEventListener('click', () => {
      expandMenu(selector);
    });
  });
});

// /**
//  * Menu with submenu > on hover
//  */
qA('li.has-submenu').forEach(li => {
  li.addEventListener("mouseover", (e) => {
    expandMenu(e.target);
  });
  li.addEventListener("mouseleave", (e) => {
    _hideList(e.target.children[0]);
  });
});

qA('ul').forEach(ul => {
  if (ul.closest('#view-switcher')) return; // persistent nav, not a dropdown
  ul.addEventListener("mouseleave", (e) => {
    _hideList(e.target);
  });
})

qA(".select-box, .box-selector-parent, .body-selector-parent").forEach((box) => {
  box.addEventListener("mouseleave", (e) => {
    e.target.querySelectorAll('ul').forEach((el) => {
      _hideList(el);
    });
  });
});

function _hideList(element) {
  let reEnter = false;
  element.addEventListener("mouseenter", () => {
    reEnter = true;
  });
  setTimeout(() => {
    if (!reEnter) {
        element.classList.toggle("hidden", true);
        qA(`label[class*="selector-label"]`).forEach((label) =>
          label.classList.remove("active")
        )      
    }
  }, 100);
}

/****************************************************/
/*              LI CLICK FUNCTIONALITY
/****************************************************/

/**
 * Settings > functions > on click
 */
qA('.selector-item.settings').forEach(li => {
  li.addEventListener('click', e => {
    selectSettings(li);
  });
});

/**
 * A function menu option > on click
 */
qA('li.menu-option').forEach(li => {
  li.addEventListener('click', e => {
    selectFunction(e.target);
  });
});

/**
 * View switcher (Ports / Global settings) > on click
 */
qA('#view-switcher .view-switcher-item').forEach(li => {
  li.addEventListener('click', () => switchView(li.dataset.func));
});

/**
 * Select header volts > on click
 */
qA('li.volts-sel').forEach(li => {
  li.addEventListener('click', e => {
    selectParameter(e.target);
  });
});

/**
 * LI parameters inside a body
 */
qA('.box-body li').forEach(li => {
  li.addEventListener('click', e => {
    selectParameter(e.target);
  });
});

/**
 * LFO > graph quad selector
 */
qA('li.lfo-quad-graph-sel').forEach(li => {
  li.addEventListener('click', e => {
    setLFOGraph(e.target, e.target.dataset.quad, false);
  });
});

/**
 * LFO > global graph selector
 */
qA('li.lfo-global-graph-sel').forEach(li => {
  li.addEventListener('click', e => {
    RequestConfig = false;
    setLFOGraph(e.target, 1, true);
    setLFOGraph(e.target, 2, true);
    setLFOGraph(e.target, 3, true);
    setLFOGraph(e.target, 4, true);
    RequestConfig = true;
    requestConfig();
  });
});

/**
 * LFO > freq/res clock
 */
qA('.lfo-radio').forEach(input => {
  input.addEventListener('change', e => {
    var use_midi_clock = e.target.classList.contains('lfo-radio-clock');
    var port_id = BoxNames[Number(e.target.dataset.mtPort)];
    q('#lfo-freq-' + port_id).dataset.disabled = use_midi_clock;
    q('#lfo-freq-input-' + port_id).disabled = use_midi_clock;
    q('#lfo-clock-divider-' + port_id).dataset.disabled = !use_midi_clock;
    q('#lfo-clock-divider-input-' + port_id).disabled = !use_midi_clock;
    q('#lfo-clock-multiplier-' + port_id).dataset.disabled = !use_midi_clock;
    q('#lfo-clock-multiplier-input-' + port_id).disabled = !use_midi_clock;
    q('#lfo-com-clock-' + port_id).checked = use_midi_clock;
    q('#lfo-com-freq-' + port_id).checked = !use_midi_clock;
  });
});

/**
 * CLOCK > bpm/divider clock
 */
qA('.clock-radio').forEach(input => {
  input.addEventListener('change', e => {
    var use_midi_clock = e.target.classList.contains('clock-radio');
    var port_id = BoxNames[Number(e.target.dataset.mtPort)];
    q('#clock-bpm-' + port_id).dataset.disabled = use_midi_clock;
    q('#clock-bpm-input-' + port_id).disabled = use_midi_clock;
    q('#clock-divider-' + port_id).dataset.disabled = !use_midi_clock;
    q('#clock-divider-input-' + port_id).disabled = !use_midi_clock;
    q("#clock-multiplier-" + port_id).dataset.disabled = !use_midi_clock;
    q("#clock-multiplier-input-" + port_id).disabled = !use_midi_clock;
    q('#clock-com-bpm-' + port_id).checked = use_midi_clock;
    q('#clock-com-divider-' + port_id).checked = !use_midi_clock;
  });
});

/****************************************************/
/*            END OF LI CLICK FUNCTIONALITY
/****************************************************/


/**
 * Numeric input arrows functionality
 */
qA('.input-number-wrap span:not(.drum-arrow)').forEach(arrowButton => {
  arrowButton.addEventListener('click', e => {
    arrowsFunc(e.target);
  });
});

qA(".drum-arrow").forEach((arrowButton) => {
  arrowButton.addEventListener("click", (e) => {
    var is_float = e.target.classList.contains("is-float");
    processDrumNoteArrows(e, true, is_float);
  });
});

const processDrumNoteArrows = debounce((e) => arrowsFunc(e.target))

function debounce(func, timeout = 200){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Numeric inputs onchange
 */
qA('input[class*=num]').forEach(input => {
  input.addEventListener('change', e => {
    minMax(input);
    var is_float = e.target.classList.contains('is-float')
    arrowsFunc(e.target, false, is_float);
  });
});

/**
 * Clicking on the outside of the modal or on cancel button hides it
 */
q('#modal-wrap').addEventListener('click', e => {
  if (e.target.classList.contains('modal-wrap')) {
    e.target.classList.toggle('hidden', true);
    window.removeEventListener('scroll', dynModal, true);
  }
});
q("#add2voice_cancel").addEventListener("click", e => {
  q('#modal-wrap').classList.toggle("hidden", true);
  window.removeEventListener("scroll", dynModal, true);
});

/**
 * Reveal options/shape/graph/conf window event
 */
qA('button.reveal').forEach(button => {
  button.addEventListener('click', e => {
    q('#' + button.dataset.hide).classList.toggle('hidden', true);
    q('#' + button.dataset.show).classList.toggle('hidden', false);
  });
  //draw ADSR in canvas
  if (button.classList.contains('draw_adsr')) {
  }
});

/**
 * Toggle checkbox state
 */
qA('.toggle-wrap').forEach(box => {
  box.addEventListener('click', () => {
    var input = q(`#${box.id} input`);
    checkBox(input);
    if (TriggerInputChange) {
      sendParameterSysex(input);
      requestConfigDebounced();
    }
  });
});

/**
 * Draw ADSR - button "CONF"
 */
qA('.draw_adsr').forEach(button => {
  button.addEventListener('click', () => {
    const port_id = button.dataset.port;
    drawAllADSR(port_id);
  });
});

/**
 * Draw ADSR - parameters
 */
qA('.redraw_adsr').forEach(input => {
  input.addEventListener('change', () => {
    const port_num = input.dataset.mtPort;
    const port_id = BoxNames[port_num];
    drawAllADSR(port_id);
  });
});

/**
 * Settings - loading files
 */
q('#file_load').addEventListener('change', e => {
  if (e.target.files && e.target.files[0]) {
    handleFiles(e.target.files);
  }
  e.target.value=''; //reset value of input to trigger change if same file is selected
});

/**
 * Global clock BPM — keep display at 2 decimal places and send SysEx on change.
 * CLOCK_PERIOD (param 13): period_us = 60_000_000 / bpm
 */
const _bpmInput = q('#global-clock-bpm');
if (_bpmInput) _bpmInput.addEventListener('blur', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    e.target.value = v.toFixed(2);
    sendGeneralSysex(CLOCK_PERIOD, bpmToPeriod(v));
  }
});

const _clockBtn = q('#global-clock-startstop');
let _clockRunning = false;

function _setClockPlaying(running) {
  _clockRunning = running;
  if (!_clockBtn) return;
  if (running) {
    _clockBtn.textContent = '■ Stop';
    _clockBtn.classList.replace('gs-clock-start', 'gs-clock-stop');
  } else {
    _clockBtn.textContent = '▶ Start';
    _clockBtn.classList.replace('gs-clock-stop', 'gs-clock-start');
  }
}

/**
 * Global clock mode — Internal (0) / External (1).
 * On internal: configure MIDICLOCK ports (PORTUseMIDIClock=0, PORTSTStCLOCK=1),
 * send 0xFA to arm startFreeClock(), and auto-start play button.
 * On external: set PORTSTStCLOCK=1 so ports respond to incoming MIDI Start.
 */
qA('input[name="global-clock-mode"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const isExternal = e.target.id === 'global-clock-external';
    if (_bpmInput) _bpmInput.disabled = isExternal;
    sendGeneralSysex(USE_MIDI_CLOCK, isExternal ? 1 : 0);
    DeviceConfig.ports.forEach((port, i) => {
      if (port.funct === MIDICLOCK) {
        if (!isExternal) {
          sendSysex("PORT", i, "PORTUseMIDIClock", 0);
          const bpmRadio = q("#clock-com-bpm-" + port.id);
          if (bpmRadio) bpmRadio.checked = true;
        }
        sendSysex("PORT", i, "PORTSTStCLOCK", 1);
        const stSpToggle = q("#clock-stop-input-" + port.id);
        if (stSpToggle) stSpToggle.checked = true;
      }
    });
    if (!isExternal) {
      sendMidiStart();
      _setClockPlaying(true);
    }
  });
});

/**
 * Clock start/stop button — sends MIDI Start (0xFA) or Stop (0xFC).
 */
if (_clockBtn) {
  _clockBtn.addEventListener('click', () => {
    const nowRunning = !_clockRunning;
    _setClockPlaying(nowRunning);
    if (nowRunning) sendMidiStart();
    else sendMidiStop();
  });
}

/**
 * MIDI routing matrix dots — toggle active/inactive and send device options SysEx.
 * data-device: 0=SER(param 6), 1=USB_DEV(param 7), 2-5=HOST1-4(params 8-11)
 * data-bit:    0=IN, 1=OUT, 2=THRU, 3=CLK, 4=SYX  (bits of union MidiOption)
 */
qA('.routing-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    dot.classList.toggle('active');
    dot.classList.toggle('inactive');
    const device = Number(dot.dataset.device);
    let mask = 0;
    qA(`.routing-dot[data-device="${device}"]`).forEach(d => {
      if (d.classList.contains('active')) mask |= (1 << Number(d.dataset.bit));
    });
    // USB Device (device=1): always keep SYX bit set — disabling it would
    // cut off SysEx communication with this web editor over USB.
    if (device === 1) mask |= (1 << 4);
    sendGeneralSysex(SER_DEV_OPTIONS + device, mask);
  });
});

/**
 * Save/Load to slot — result and free memory blocks come back async via the
 * device's echo, handled in sysexMgt.js (_processGeneralSysex, case 2/3).
 * UI is 1-based (Slot 1-9) since that's what users expect; firmware slots are
 * 0-based (0-8), so we subtract 1 right before sending. Firmware slot 9 (the
 * 10th) is reserved for autosave and never offered here.
 */
// Out-of-range values are rejected, not auto-corrected — the click handlers
// below just refuse to send and leave the "Slot must be 1–9" message up
// until the user fixes the input themselves.
const _saveSlotBtn = q('#global-save-slot-btn');
if (_saveSlotBtn) {
  _saveSlotBtn.addEventListener('click', () => {
    const input = q('#global-save-slot');
    const status = q('#global-save-slot-status');
    const raw = Number(input.value);
    if (!Number.isInteger(raw) || raw < 1 || raw > 9) {
      status.textContent = 'Slot must be 1–9';
      status.className = 'gs-slot-status fail';
      return;
    }
    status.textContent = 'Saving…';
    status.className = 'gs-slot-status';
    sendGeneralSysex(SAVE_CONFIG_TO_SLOT, raw - 1);
  });
}
// Load slot is a dropdown populated from the device's actual slot status
// (sysexMgt.js case 18 → refreshWeb.js showSlotStatus), not a free-typed number,
// so there's no out-of-range case here — only "nothing to pick".
const _loadSlotBtn = q('#global-load-slot-btn');
if (_loadSlotBtn) {
  _loadSlotBtn.addEventListener('click', () => {
    const select = q('#global-load-slot');
    const status = q('#global-load-slot-status');
    const raw = Number(select.value);
    if (!select.value || !Number.isInteger(raw) || raw < 1 || raw > 9) {
      status.textContent = 'No saved slots to load';
      status.className = 'gs-slot-status fail';
      return;
    }
    status.textContent = 'Loading…';
    status.className = 'gs-slot-status';
    sendGeneralSysex(LOAD_CONFIG_FROM_SLOT, raw - 1);
  });
}
const _loadSlotRefreshBtn = q('#global-load-slot-refresh');
if (_loadSlotRefreshBtn) {
  _loadSlotRefreshBtn.addEventListener('click', () => sendGeneralSysex(REQ_SLOT_STATUS, 0));
}


/****************************************************/
/****************************************************/
/*    MAIN PIECE OF CODE THAT SENDS INFO TO MODULE
/****************************************************/
/****************************************************/

//if anything changes in the web, send sysex to module with new info, except toggle-wraps which do it separatedly
qA('input:not([type=checkbox]):not(.no-trigger)').forEach(input => {
  input.addEventListener('change', e => {
    if (TriggerInputChange) {
      sendParameterSysex(e.target);
      requestConfigDebounced();
    }
  });
});
