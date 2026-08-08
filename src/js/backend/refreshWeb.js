/********************************************/
/*       SET DEFAULT CONFIGURATION TO WEB   */
/********************************************/

import { q, qA } from "../globals.js";
import { selectFunction } from "../domScripts.js";
import { drawAllADSR } from "./adsr.js";


export function setDefaultConfig(num, forced=false) {
  //if it's the same default config as last time, don't do anything
  if (DefaultConfig != num || forced) {
    _setDefaultConfig(num);
    _setInitialFunctions();
    DefaultConfig = num;
  }
}

function _setDefaultConfig(num) {
  num = (num-32 >= 0) ? num-32 : num;
  var config = DEFAULT_CONFIGS[num];
  var voice_ids = [];
  DeviceConfig.voices_assigned = ['V12','V11','V10','V9','V8','V7','V6','V5','V4','V3','V2','V1'];
  config.forEach((item, i) => {
    var port = new PortConfig(
      item[0], //PORT_NUM
      item[2], //TYPE
      item[3], //VOLTS
      item[4], //FUNCTION
      item[5], //MIN
      item[6], //MAX
      item[7], //MIDI CHANNEL
      item[8] //FUNCT. PARAMETER
    );
    if (port.isVoiceFunction) {
      var param = Number(port.param);
      port.voice = param;
      if (voice_ids[param] != null) {
        port.isAddToVoice = true;
        port.voice_rep = voice_ids[param];
      } else {
        port.isNewVoice = true;
        voice_ids[param] = DeviceConfig.voices_assigned.pop();
        port.voice_rep = voice_ids[param];
        DeviceConfig.voices_port[param].vo_min_note = port.min;
        DeviceConfig.voices_port[param].vo_max_note = port.max;
      }
    }
    DeviceConfig.ports[i] = port;
  });
}

function _setInitialFunctions() {
  DeviceConfig.ports.forEach((port) => {
    _selectWebFunction(port);
  });
}


// Firmware never sends MIDIDRUMTRIG — a drum voice is reported as MIDIVOICEGATE with
// its note range collapsed to a single note (vo_min_note == vo_max_note), same as the OLED.
function _resolveFunctName(port) {
  var funct_name = FirmwareFunctions2Web[port.funct];
  if (funct_name == "gate") {
    var voice_port = DeviceConfig.voices_port[port.voice];
    if (voice_port.vo_min_note == voice_port.vo_max_note)
      funct_name = "drum";
  }
  return funct_name;
}

function _selectWebFunction(port) {
  // this function is a wrapper for Yago's domScripts.js function "selectFunction"
  // which clicks a li to select a function, without triggering the input.change behaviour
  var funct_name = _resolveFunctName(port);
  var isVoiceFunction = port.funct >= 1 && port.funct <= 7;
  var voice_str = isVoiceFunction ? (port.isNewVoice ? ".new_voice" : ".add_to_voice") : "";
  var li = q("#func-selector-wrap-box-" + port.id + " li" + voice_str + '[data-body="' + funct_name + '"]');
  TriggerInputChange = false;
  selectFunction(li, true);
  TriggerInputChange = true;
}

/********************************************/
/*       REFRESH WEB FROM DATA MODEL        */
/********************************************/

export function refreshWeb() {
  //first we regenerate the voices used
  _initVoicesUsed();
  //we save the voices numbered by order in each port
  DeviceConfig.voices_port_used.forEach((port_num, index) => {
    //Ex: voice number 2 (DeviceConfig.voices[2]) is saved
    //    at port 8 where the second voice is (DeviceConfing.voices_port[8])
    DeviceConfig.voices[index].midi_ch = DeviceConfig.ports[port_num].midi_ch; //first we save the midi_ch of the voice for ADSR global/local config
    DeviceConfig.voices_port[port_num] = DeviceConfig.voices[index];
    setPort(DeviceConfig.ports[port_num]);
  });
  //in these ports there are no main voices
  DeviceConfig.voices_port_free.forEach((port_num) => {
    setPort(DeviceConfig.ports[port_num]);
  });
  refreshGlobalSettings();
}

export function refreshGlobalSettings() {
  // Routing dots: device_options indices 0-7 → data-device 0-7 (SER, USB_DEV, HOST1-4, TRS_OUT, TRS_IN)
  DeviceConfig.device_options.forEach((mask, device) => {
    for (let bit = 0; bit < 5; bit++) {
      const dot = q(`.routing-dot[data-device="${device}"][data-bit="${bit}"]`);
      if (!dot) continue;
      const active = !!(mask & (1 << bit));
      dot.classList.toggle('active',   active);
      dot.classList.toggle('inactive', !active);
    }
  });

  // BPM input
  const bpmInput = q('#global-clock-bpm');
  if (bpmInput && DeviceConfig.global_clock_period > 0)
    bpmInput.value = (60000000 / DeviceConfig.global_clock_period).toFixed(2);

  const isExternal = DeviceConfig.global_use_midi_clock;
  const radio = q(isExternal ? '#global-clock-external' : '#global-clock-internal');
  if (radio) radio.checked = true;
  if (bpmInput) bpmInput.disabled = isExternal;
}

// Shows the device's echoed result for a save/load-to-slot request.
// kind: 'save' | 'load'. free: memory blocks left (EEPROMManager::countSlotsFree(),
// same figure shown on the device's own screen during Save/Load).
export function showSlotResult(kind, ok, free) {
  const el = q(kind === 'save' ? '#global-save-slot-status' : '#global-load-slot-status');
  if (!el) return;
  const text = kind === 'save'
    ? (ok ? `Saved — ${free} blocks free` : `Save failed — slot full? (${free} blocks free)`)
    : (ok ? `Loaded — ${free} blocks free` : `Load failed — slot empty? (${free} blocks free)`);
  el.textContent = text;
  el.classList.toggle('ok', ok);
  el.classList.toggle('fail', !ok);
}

// Rebuilds the Load-slot dropdown from the device's slot status bitmask
// (genComReqSlotStatus reply): bit i (0-9) = 1 if firmware slot i holds data.
// The dropdown is 1-based (Slot 1-10) to match the rest of the save/load UI.
export function showSlotStatus(usedMask) {
  const select = q('#global-load-slot');
  if (!select) return;
  const prevValue = select.value;
  select.innerHTML = '';
  let any = false;
  for (let i = 0; i < 10; i++) {
    if (usedMask & (1 << i)) {
      any = true;
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = 'Slot ' + (i + 1);
      select.appendChild(opt);
    }
  }
  if (!any) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '— none saved —';
    select.appendChild(opt);
  } else if ([...select.options].some(o => o.value === prevValue)) {
    select.value = prevValue; // keep selection across a refresh if it's still valid
  }
}

function _initVoicesUsed() {
  DeviceConfig.voices_port_used = [];
  DeviceConfig.voices_port_free = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var i = 0;
  DeviceConfig.ports
    .map((x) => x.voice)
    .forEach((v) => {
      const index = DeviceConfig.voices_port_free.indexOf(v);
      if (index >= 0) {
        DeviceConfig.voices_port_used.push(v);
        DeviceConfig.voices_port_free.splice(index, 1);
        DeviceConfig.voices[i].midi_ch = DeviceConfig.ports[v].midi_ch;
        i += 1;
      }
    });
}

export function setPort(port) {
  //set header params (volts, midi channel)
  _setHeaderParams(port);
  _selectWebFunction(port);
  //set bodies of each type of function
  _setBodyParams(port);
}


function _setHeaderParams(port) {
  //set midi channels
  q("#midi-ch-" + port.id).setAttribute("value", port.midi_ch);
  q("#midi-ch-" + port.id).value = port.midi_ch;
  //set volts
  q("#volts-" + port.id).setAttribute("value", port.volts);
  q("label[for='volts-" + port.id + "']").innerHTML = VoltsNames[port.volts - 1][1];
}

function _setBodyParams(port) {
  const midi_ch = DeviceConfig.midi_channels[port.midi_ch-1];
  const funct_name = _resolveFunctName(port);
  let voice = (port.voice >= 0 && port.voice <= 12) ? DeviceConfig.voices_port[port.voice] : new VoiceConfig();
  const is_global_adsr = (((funct_name == "velocity") || (funct_name == "adsr")) && !voice.use_local_config_adsr);
  if (is_global_adsr)
    voice = DeviceConfig.voices_midi_ch[voice.midi_ch-1];
  voice.voice = port.voice;
  switch (funct_name) {
    case "note":
      _setNoteParams(port, voice, midi_ch);
      break;
    case "velocity":
      _setVelocityParams(port, voice);
      if (!is_global_adsr)
        for (let [i, v] of DeviceConfig.ports.map((x) => x.voice).entries()) {
          var p = DeviceConfig.ports[i]
          if (p.voice == voice.voice){
            _setADSRParams(p, voice);
          } 
        }
      break;
    case "adsr":
      _setADSRParams(port, voice);
      if (!is_global_adsr)
        for (let [i, v] of DeviceConfig.ports.map((x) => x.voice).entries()) {
          var p = DeviceConfig.ports[i];
          if (p.voice == voice.voice) {
            _setVelocityParams(p, voice);
          }
        }
      break;
    case "gate":
      _setGateParams(port, voice);
      break;
    case "drum":
      _setDrumParams(port, voice);
      break;
    case "osc":
      _setOscParams(port, voice, midi_ch);
      break;
    case "lfo":
      _setLFOParams(port, voice);
      break;
    case "cc":
      _setCCParams(port);
      break;
    case "rpn":
      _setRPNParams(port);
      break;
    case "nrpn":
      _setNRPNParams(port);
      break;
    case "pr-ch":
      _setPrChParams(port);
      break;
    case "pitch-bend":
      break;
    case "key-press":
      //TO DO: _setKeyPressParams(port);
      break;
    case "ch-press":
      _setChPressParams(port);
      break;
    case "st-sp":
    case "cont-stop":
    case "st-latch":
    case "sp-latch":
    case "cont-latch":
      break;
    case "st-trig":
    case "sp-trig":
    case "cont-trig":
      _setStSpLatchParams(port);
      break;
    case "clock":
      _setClockParams(port);
      break;
    case "no-func":
    default:
      break;
  }
}

/********************************************/
/*              SET BODY PARAMS             */
/********************************************/

/********************************************/
/*              VOICE FUNCTIONS             */
/********************************************/

function _setParamValue(id, value){
  q("#"+id).setAttribute("value",value);
  q("#"+id).value = value;
}

function _setNoteParams(port, voice, midi_ch) {
  //set voice tag
  q("#label-note-voice-" + port.id).innerHTML = port.voice_rep;
  //set bend numeric input (MIDI)
  q("#note-bend-input-" + port.id).setAttribute("value", midi_ch.bend_span);
  //set glide mode (VOICE)
  _setParamValue("note-glide-mode-input-" + port.id, voice.portamento_type);
  q("label[for='note-glide-mode-input-" + port.id + "']").innerHTML = GlideModes[voice.portamento_type]
  //set glide time (VOICE)
  var value = Number(voice.portamento_time)/10;
  _setParamValue("note-glide-time-input-" + port.id, value);
  //set midi range (VOICE)
  _setParamValue("note-midi-range1-" + port.id,port.min);
  _setParamValue("note-midi-range2-" + port.id, port.clip_max);
  //set calibration (VOICE)
  _setParamValue("note-cal-min-" + port.id, port.cal_min);
  _setParamValue("note-cal-max-" + port.id, port.cal_max);
  // set assign selector (MIDI)
  _setParamValue("note-input-assign-" + port.id, midi_ch.voice_sel);
  q("label[for='note-input-assign-" + port.id + "']").innerHTML = AssignNames[midi_ch.voice_sel];
  //set priority (MIDI)
  _setParamValue("note-priority-input-" + port.id, midi_ch.priority);
  q("label[for='note-priority-input-" + port.id + "']").innerHTML = PriorityNames[midi_ch.priority];
}

function _setVelocityParams(port, voice) {
  //set voice tag
  q("#label-velocity-voice-" + port.id).innerHTML = port.voice_rep;
  //set ADSR toggle
  q("#velocity-vel-input-"+port.id).checked = voice.vel_affect_adsr;
}

function _setDrumParams(port, voice) {
  //set voice tag
  q("#label-drum-voice-" + port.id).innerHTML = port.voice_rep;
  //set drum note numeric selector
  _setParamValue("drum-note-input-" + port.id, voice.vo_min_note);
  //set delay numeric selector
  _setParamValue("drum-delay-input-" + port.id, port.delay);
  //set retrig toggle
  q("#drum-retrig-input-" + port.id).checked = voice.voice_retrigger;
  //set pulse toggle
  q("#drum-pulse-input-" + port.id).checked = port.gate_pulse;
}

function _setGateParams(port, voice) {
  //set voice tag
  q("#label-gate-voice-" + port.id).innerHTML = port.voice_rep;
  //set delay numeric selector
  _setParamValue("gate-delay-input-" + port.id, port.delay);
  //set retrig toggle
  q("#gate-retrig-input-" + port.id).checked = voice.voice_retrigger;
  //set pulse toggle
  q("#gate-pulse-input-" + port.id).checked = port.gate_pulse;
}

function _setOscParams(port, voice, midi_ch) {
  //set voice tag
  q("#label-osc-voice-" + port.id).innerHTML = port.voice_rep;
  //set semitones
  _setParamValue("osc-semit-input-" + port.id, midi_ch.bend_span);
  //set stop toggle
  q("#osc-stop-input-" + port.id).checked = !voice.note_off_osc;
  //set lfo-osc toggle
  q("#osc-lfosc-input-" + port.id).checked = voice.lfo_affect_osc;
  //set adsr-osc toggle
  q("#osc-adsrosc-input-" + port.id).checked = voice.adsr_affect_osc;
}

/*********************************************************/
/*                          ADSR                         */
/*********************************************************/
function _setADSRParams(port, voice) {
  //set voice tag
  q("#label-adsr-voice-" + port.id).innerHTML = port.voice_rep;
  //set vel-adsr toggle
  q("#adsr-vel-input-" + port.id).checked = voice.vel_affect_adsr;
  //set adsr-osc toggle
  q("#adsr-osc-input-" + port.id).checked = voice.adsr_affect_osc;
  //set adsr-retrigg selector
  var retrig = Number(voice.adsr_retrig_mode);
  _setParamValue("adsr-retrig-input-" + port.id, retrig);
  q("label[for='adsr-retrig-input-" + port.id + "']").innerHTML = ADSRRetrigNames[retrig];

  /******************  GRAPH  ****************/
  //set predelay
  var value = Math.round(Number(voice.adsr_tpredelay) / 10);
  _setParamValue("adsr-predelay-input-" + port.id, value);
  //set attack
  value = Math.round(Number(voice.adsr_tattack) / 10);
  _setParamValue("adsr-attack-input-" + port.id, value);
  //set decay
  value = Math.round(Number(voice.adsr_tdecay) / 10);
  _setParamValue("adsr-decay-input-" + port.id, value);
  //set sustain
  _setParamValue("adsr-sustain-input-" + port.id, voice.adsr_lsustain);
  //set release
  value = Math.round(Number(voice.adsr_trelease) / 10);
  _setParamValue("adsr-release-input-" + port.id, value);
  //set max level
  _setParamValue("adsr-maxlevel-input-" + port.id, voice.adsr_lmax);
  //set global selector
  var global = Number(voice.use_local_config_adsr);
  _setParamValue("adsr-global-input-" + port.id, global);
  q("label[for='adsr-global-input-" + port.id + "']").innerHTML = ADSRGlobalNames[global];
  //set lineal selector
  _setParamValue("adsr-lineal-input-" + port.id, voice.adsr_curve_type);
  q("label[for='adsr-lineal-input-" + port.id + "']").innerHTML = ADSRCurveTypes[Number(voice.adsr_curve_type)];
  
  //redraw graph if container visible (restriction from adsr library)
  if (!q("#adsr-conf-"+port.id).classList.contains('hidden'))
    drawAllADSR(port.id);
}

/*********************************************************/
/*                          LFO                         */
/*********************************************************/

function _setLFOParams(port, voice) {
  //set voice tag
  q("#label-lfo-voice-" + port.id).innerHTML = port.voice_rep;
  //set lfo freq
  var value = Math.round(10000 / Number(voice.lfo_period));
  _setParamValue("lfo-freq-input-" + port.id, value);
  //set lfo clock divider
  _setParamValue("lfo-clock-divider-input-" + port.id, voice.lfo_midi_clk_div);
  q("label[for='lfo-clock-divider-input-" + port.id + "']").innerHTML = MIDIClockNames[voice.lfo_midi_clk_div];
  //set lfo clock multiplier
  _setParamValue("lfo-clock-multiplier-input-" + port.id, voice.lfo_midi_clk_mult);
  //set freq-clock toggle
  var use_midi_clock = (voice.lfo_use_midi_clock == 1);
  q("#lfo-freq-" + port.id).dataset.disabled = use_midi_clock;
  q("#lfo-freq-input-" + port.id).disabled = use_midi_clock;
  q("#lfo-clock-divider-" + port.id).dataset.disabled = !use_midi_clock;
  q("#lfo-clock-divider-input-" + port.id).disabled = !use_midi_clock;
  q("#lfo-clock-multiplier-" + port.id).dataset.disabled = !use_midi_clock;
  q("#lfo-clock-multiplier-input-" + port.id).disabled = !use_midi_clock;
  q("#lfo-com-clock-" + port.id).checked = use_midi_clock;
  q("#lfo-com-freq-" + port.id).checked = !use_midi_clock;

  /******************  OPTIONS  ****************/
  //set pre-delay
  value = Math.round(Number(voice.lfo_pre_delay) / 10);
  _setParamValue("lfo-options-predelay-input-" + port.id, value);
  //set single shot toggle
  q("#lfo-options-singleshot-input-" + port.id).checked = voice.lfo_single_cycle;
  //set lfo-osc toggle
  q("#lfo-options-lfo-osc-input-" + port.id).checked = voice.lfo_affect_osc;
  //set lfo-stop toggle
  q("#lfo-stop-input-" + port.id).checked = voice.lfo_stop;

  /******************  GRAPH  ****************/
  //set attenuate
  _setParamValue("lfo-attenuate-input-" + port.id, voice.lfo_max_level);
  //set offset
  _setParamValue("lfo-offset-input-" + port.id, voice.lfo_offset);
  //quad graphs
  const q1 = voice.lfo_curve_type_q1;
  const q2 = voice.lfo_curve_type_q2;
  const q3 = voice.lfo_curve_type_q3;
  const q4 = voice.lfo_curve_type_q4;
  const port_num = Number(port.port_num)-1;
  q("#lfo-graph-q1-"+port_num).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q1] + "_q1.png");
  q("#lfo-quad1-img-"+port.id).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q1] + ".png");
  q("#lfo-graph-q2-"+port_num).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q2] + "_q2.png");
  q("#lfo-quad2-img-"+port.id).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q2] + ".png");
  q("#lfo-graph-q3-"+port_num).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q3] + "_q3.png");
  q("#lfo-quad3-img-"+port.id).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q3] + ".png");
  q("#lfo-graph-q4-"+port_num).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q4] + "_q4.png");
  q("#lfo-quad4-img-"+port.id).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q4] + ".png");
  //global graph
  if (q1 == q2 && q2 == q3 && q3 == q4) {
    q("#lfo-global-img-"+port.id).setAttribute("src", "./assets/png/" + LFOCurvesPNG[q1] + ".png");
  }
  else {
    q("#lfo-global-img-"+port.id).setAttribute("src", "./assets/png/round.png");
  }
}

/*********************************************************/
/*           NON-VOICE FUNCTIONS                         */
/*********************************************************/

function _setCCParams(port) {
  //set CC number
  _setParamValue("cc-ccnum-input-" + port.id, port.param);
  //set CLIP low and high
  _setParamValue("cc-clip-low-input-" + port.id, port.clip_min);
  _setParamValue("cc-clip-high-input-" + port.id, port.clip_max);
}

function _setClockParams(port) {
  //set start/stop toggle
  q("#clock-stop-input-" + port.id).checked = port.start_stop_clock;
  //set clock BPM
  _setParamValue("clock-bpm-input-" + port.id, (60000000/port.period).toFixed(1));
  //set clock divider
  _setParamValue("clock-divider-input-" + port.id, port.clk_div);
  q("label[for='clock-divider-input-" + port.id + "']").innerHTML = MIDIClockNames[port.clk_div];
  var use_midi_clock = port.use_midi_clock == 1;
  q("#clock-bpm-" + port.id).dataset.disabled = use_midi_clock;
  q("#clock-bpm-input-" + port.id).disabled = use_midi_clock;
  q("#clock-divider-" + port.id).dataset.disabled = !use_midi_clock;
  q("#clock-divider-input-" + port.id).disabled = !use_midi_clock;
  q("#clock-multiplier-" + port.id).dataset.disabled = !use_midi_clock;
  q("#clock-multiplier-input-" + port.id).disabled = !use_midi_clock;
  q("#clock-com-bpm-" + port.id).checked = !use_midi_clock;
  q("#clock-com-divider-" + port.id).checked = use_midi_clock;
  //set clock multiplier
  _setParamValue("clock-multiplier-input-" + port.id, port.clk_mult);
}

function _setStSpLatchParams(port) {
  var funct_name = FirmwareFunctions2Web[port.funct];
  //set pulse ms
  _setParamValue(funct_name + "-input-" + port.id, port.pulse_time);
}

function _setRPNParams(port) {
  //set param
  _setParamValue("rpn-param-input-" + port.id, port.param);
  //set clip low and high
  _setParamValue("rpn-clip-low-input-" + port.id, port.clip_min);
  _setParamValue("rpn-clip-high-input-" + port.id, port.clip_max);
}

function _setNRPNParams(port) {
  //set param
  const value = Number(port.param);
  _setParamValue("nrpn-param-input-" + port.id, value);
  //set MSB y LSB
  const msb = (value >> 7) & 0x07F;
  const lsb = value & 0x07F;
  _setParamValue("nrpn-msb-input-" + port.id, msb);
  _setParamValue("nrpn-lsb-input-" + port.id, lsb);
  //set clip low and high
  _setParamValue("nrpn-clip-low-input-" + port.id, port.clip_min);
  _setParamValue("nrpn-clip-high-input-" + port.id, port.clip_max);
}

function _setChPressParams(port) {
  //set clip low and high
  _setParamValue("ch-press-clip-low-input-" + port.id, port.clip_min);
  _setParamValue("ch-press-clip-high-input-" + port.id, port.clip_max);
}

function _setPrChParams(port) {
  //set clip low and high
  _setParamValue("pr-ch-clip-low-input-" + port.id, port.clip_min);
  _setParamValue("pr-ch-clip-high-input-" + port.id, port.clip_max);
}

  

