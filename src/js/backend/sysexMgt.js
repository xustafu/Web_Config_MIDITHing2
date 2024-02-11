import { refreshWeb, setDefaultConfig} from "./refreshWeb.js";
import { MIDIoutput } from "./initMidi.js";
import { showModal } from "../domScripts.js";
import { calculateVoiceId } from "../helpers.js";

/************************************************/
/*              RECEIVE SYSEX                   */
/************************************************/
/************************************************/
/*              RECEIVE SYSEX                   */
/************************************************/
/************************************************/
/*              RECEIVE SYSEX                   */
/************************************************/
/************************************************/
/*              RECEIVE SYSEX                   */
/************************************************/


export function onSysexReceive(msg) {
  if (msg.data.Length < 5) {
    console.log("Not MIDI Thing Sysex");
    return;
  }

  var sysex_start = msg.data[0];
  var edu = msg.data[1]; // educational purpose
  //var device = msg.data[2]; // Device = SINGLESYSEX + THING_mode;
  var type_and_num = msg.data[3]; //< Port, MIDI Channel, Voice (3 bits) and number (5 bits)
  var parameter = msg.data[4]; // < Parameter Number
  var length = msg.data[5];
  var enc_data = msg.data.slice(6, 6 + length); ///< Data
  var sysex_end = msg.data[msg.data.length - 1]; ///< End of SysEx

  console.log(msg);
  console.log(msg.data);

  if (sysex_start == 0xf0 && edu == 0x7d && sysex_end == 0xf7)
    console.log("MIDI Thing SysEx Rcv");
  else {
    console.log("Not MIDI Thing Sysex");
    return;
  }
  var type = _extractType(type_and_num);
  var num = _extractNumber(type_and_num);

  // if (ntype == VCMCSysExtype.DUMPCHANNEL) {
  enc_data = new Uint8Array(enc_data);
  console.log(" Data: " + enc_data);
  var dec_data = new Uint8Array(enc_data.length);
  length = _decodeSysEx(enc_data, dec_data); // Decode 7 bit SysEx info from message
  dec_data = dec_data.slice(0, length);
  console.log(" Decoded Length: " + length + " Data: " + dec_data);
  _processSysex(type, num, parameter, dec_data);
  
  //global constant to check last sysex received and refresh web
  LastSysexRcvd = new Date();
}

function _extractType(type_and_number) {
  // type is first 3 bits of type_and_number (8 bits)
  return (type_and_number & 0xe0) >> 5;
}

function _extractNumber(type_and_number) {
  // number is last 5 bits of type_and_number (8 bits)
  return ((type_and_number & 0x1f) << 3) >> 3;
}

function _processSysex(type, number, param, data) {
  if (type == GENERAL)
    _processGeneralSysex(param, data);
  else if (type == PORT && param == PORTFUNCTION) 
    _processPortFunctionSysex(number, data);
  else if (type > 3)
    showModal('error', "Error: type of Sysex command not recognized, must be GENERAL, PORT, MIDI CH. or VOICE");
  else
    _processParamSysex(type, number, param, data);
}

function _processGeneralSysex(param, data) {
  var command = SYSEX_OBJ[0][param].index;
  switch (command) {
    case 0: //"SET_DEF_CONFIG":
      setDefaultConfig(data[0]);
      break;
    case 1: //"REQ_CONFIG":
      break;
    case 2: //"SAVE_CONFIG_TO_SLOT":
      break;
    case 3: //"LOAD_CONFIG_FROM_SLOT":
      break;
    case 4: //"SET_LEARN_MODE":
      break;
    default: //ERROR
      showModal("error","Error: type of GENERAL Sysex command not recognized, examples: SET_DEF_CONFIG, SAVE_CONFIG_TO_SLOT");
      break;
  }
}

function _processPortFunctionSysex(port_num, data) {
  //function number
  const funct = data[0];
  var port = DeviceConfig.ports[port_num];
  port.funct = funct;
  //midi channel
  port.midi_ch = (data[1] == "0") ? 1 : data[1];
  //decode param data
  var buf = data.slice(2).buffer;
  var view = new DataView(buf);
  var value = view.getUint32(0, true);
  port.param = value;
  //voice values
  var isVoiceFunction = (data[0] >= 1 && data[0] <= 7);
  port.isVoiceFunction = isVoiceFunction;
  port.isNewVoice = (isVoiceFunction && port.port_num-1 == port.param);
  port.isAddToVoice = isVoiceFunction && port.port_num-1 != port.param;
  port.voice = (isVoiceFunction ? port.param : 100);
  port.voice_rep = calculateVoiceId(port.voice);
  //set default values
  var def_funct = DEF_FUNCT_VALUES[funct];
  port.volts = def_funct.volts;
  port.min = def_funct.min;
  port.clip_min = def_funct.min;
  port.max = def_funct.max;
  port.clip_max = def_funct.max;
  //save port object
  DeviceConfig.ports[port_num] = port;
  return;
}

function _processParamSysex(type, number, param, data) {
  //if type == 2 && number > 16 it's a voice param at midi channel (number-16)
  if ((type == MIDICH) && (number > 16)) {
    _processMIDIparam(number, param, data); 
    return;
  }
  const buf = data.buffer;
  const view = new DataView(buf, 0);
  const value = eval("view.get"+SYSEX_OBJ[type][param].type+"(0, true)");
  const attr = SYSEX_OBJ[type][param].attr;
  switch (type) {
    case PORT:
      DeviceConfig.ports[number][attr] = value;
      if (attr == "clip_min" && DeviceConfig.ports[number].funct == MIDIVOICEGATE)
         DeviceConfig.ports[number].clip_max = value;
      break;
    case MIDICH:
      DeviceConfig.midi_channels[number - 1][attr] = value;
      break;
    case VOICE:
      DeviceConfig.voices[number][attr] = value;
      break;
    default: 
      showModal('error', "Error: type of Sysex command not recognized, must be GENERAL, PORT, MIDI CH. or VOICE");
      break;
  }
}

function _processMIDIparam(number, param, data) {
  //special case: if we receive a sysex MIDI with number > 16, then
  // its a voice param used in all voices at the same midi channel (number-16)
  const midi_ch = Number(number)-17;
  const buf = data.buffer;
  const view = new DataView(buf, 0);
  const value = eval("view.get"+SYSEX_OBJ[VOICE][param].type+"(0, true)");
  const attr = SYSEX_OBJ[VOICE][param].attr;
  DeviceConfig.voices_midi_ch[midi_ch-1][attr] = value;
}

/*! \brief Decode System Exclusive messages.
 SysEx messages are encoded to guarantee transmission of data bytes higher than
 127 without breaking the MIDI protocol. Use this static method to reassemble
 your received message.
 \param inSysEx The SysEx data received from MIDI in.
 \param outData    The output buffer where to store the decrypted message.
 \param inLength The lenght of the input buffer.
 \return The lenght of the output buffer.
 @see encodeSysEx @see getSysExArrayLength
 Code inspired from Ruin & Wesen's SysEx encoder/decoder - http://ruinwesen.com
 */
function _decodeSysEx(inSysEx, outData) {
  var inLength = inSysEx.length;
  var count = 0;
  var msbStorage = 0;
  var byteIndex = 0;

  for (var i = 0; i < inLength; ++i) {
    if (i % 8 == 0) {
      msbStorage = inSysEx[i];
      byteIndex = 6;
    } else {
      var body = inSysEx[i];
      var msb = ((msbStorage >> byteIndex--) & 1) << 7;
      outData[count++] = msb | body;
    }
  }
  return count;
}


/************************************************/
/*                SEND SYSEX                    */
/************************************************/
/************************************************/
/*                SEND SYSEX                    */
/************************************************/
/************************************************/
/*                SEND SYSEX                    */
/************************************************/
/************************************************/
/*                SEND SYSEX                    */
/************************************************/

export function sendParameterSysex(element) {
  var type = element.dataset.mtType;
  var parameter = element.dataset.mtParameter;
  var port_num = Number(element.dataset.mtPort);
  var value = element.value;
  var number = _extractNum(type, port_num);
  if (element.type == "checkbox") {
    element.checked ? (value = 1) : (value = 0);
    //"NoteOffOsc is sent reversed. Checked sends false, not checked sends true"
    if (parameter == "NoteOffOsc") element.checked ? (value = 0) : (value = 1);
  }
  const is_adsr_funct = DeviceConfig.ports[port_num].funct == MIDIVOICEADSR;
  const is_global_adsr = is_adsr_funct && !DeviceConfig.voices[number].use_local_config_adsr;
  const adsr_params = [
    "ADSRTPredelay", "ADSRLMax", "ADSRTAttack", "ADSRTDecay", "ADSRLSustain", "ADSRRSustain",
    "ADSRTRelease", "ADSRAffectOSC", "ADSRCurveType", "ADSRRetrigMode", "VelAffectADSR"];
  const is_global_adsr_param = adsr_params.includes(parameter) && is_global_adsr;
  if (is_adsr_funct && type == "VOICE" && is_global_adsr_param) {
    var midich = Number(DeviceConfig.ports[port_num].midi_ch);
    sendSysex(type, midich + 17, parameter, value, is_global_adsr_param);
    refreshWeb();
    return;
  }
  sendSysex(type, number, parameter, value, is_global_adsr_param);
  var is_drum_funct = (DeviceConfig.ports[port_num].funct == MIDIDRUMTRIG);
  if (type == "VOICE" && parameter == "VO_MinNote" && (is_drum_funct || is_adsr_funct)) {
    //if drum function and we send clip_min, send also clip_max with same value
    sendSysex("VOICE", number, "VO_MaxNote", value);
  }
}

function _extractNum(type, port) {
  var number = Number(port);
  switch (type) {
    case "PORT":
    default:
      //already calculated
      break;
    case "VOICE":
      var voice_port = DeviceConfig.ports[number].voice;
      // from used voices at port we get which one is the used one
      // Ex: voice number at port 8 can be voice 2. Convert voice_port to voice_num.
      number = DeviceConfig.voices_port_used.indexOf(voice_port);
      break;
    case "MIDICH":
      number = DeviceConfig.ports[number].midi_ch;
      break;
  }
  return number;
}


export function sendSysex(dtype, number, dparam, value, is_global_adsr) {
  if (MIDIoutput == null) return;
  try {
    var type = eval(dtype);
    var param = eval(dparam);
    var index = SYSEX_OBJ[type][param].index;
    var data_type = SYSEX_OBJ[type][param].type;
    var length = SYSEX_OBJ[type][param].length;
    var attr = SYSEX_OBJ[type][param].attr;
    var type_and_num = 32 * (is_global_adsr ? MIDICH : type) + Number(number);
    value = Number(value);
  } catch (error) {
    showModal('error', "Error: SYSEX_OBJ["+dtype+"] or SYSEX_OBJ["+dtype+"]["+dparam+"] not found.");
    console.error(error);
    return;
  }

  if (type == VOICE) {
    switch (param) {
      case PORTAMENTOTime:
      case LFOPreDelay:
      case ADSRTPredelay:
      case ADSRTAttack:
      case ADSRTDecay:
      case ADSRTRelease:
        value = value * 10;
        break;
      case LFOPeriod:
        value = 10000 / value;
      default:
        break;
    }
  }

  _storeWebData(type, number, attr, value, is_global_adsr);

  var dec_data = new Uint8Array(10);
  var enc_data = new Uint8Array(12);

  var send_drum_funct = false;

  if (type == PORT && [PORTFUNCTION, PORTMIDICHAN, PORTFUNCPARAMETER].includes(param)) {
    // function special case
    dec_data = new Uint8Array(6);
    dec_data[0] = DeviceConfig.ports[number].funct;
    send_drum_funct = (type == PORT) && (param == PORTFUNCTION) && (value == MIDIDRUMTRIG);
    if (send_drum_funct) dec_data[0] = MIDIVOICEGATE; // if DRUM, we send GATE instead, and vo min & max at end of code here
    dec_data[1] = DeviceConfig.ports[number].midi_ch;
    var funct_arr = new ArrayBuffer(4);
    var funct_view = new DataView(funct_arr);
    funct_view.setUint32(0, DeviceConfig.ports[number].param, true);
    funct_arr = new Uint8Array(funct_arr);
    dec_data.set(funct_arr, 2);
    index = PORTFUNCTION;
  } else {
    var buf = dec_data.buffer;
    var view = new DataView(buf, 0);
    eval("view.set" + data_type + "(0," + value + ",true)");
    dec_data = dec_data.slice(0, length);
  }
  console.log(" Decoded Send length: " + length + " Data: " + dec_data);

  var enc_length = _encodeSysEx(dec_data, enc_data); // Decode 7 bit SysEx info from message
  enc_data = enc_data.slice(0, enc_length);
  console.log(" Send size: " + enc_length + " Data: " + enc_data);

  var send_arr = new Uint8Array(enc_data.length + 4);

  send_arr[0] = 23; // Device = SINGLESYSEX + THING_mode;      ///< MT2 Single message(0x10) + module ID (7 para el MidiThing) == 23 (16+7)
  send_arr[1] = type_and_num; // typeAndNumber=0;                        ///< Port, MIDI Channel, Voice (3 bits) and number (5 bits)
  send_arr[2] = index; // Parameter;                              ///< Parameter Number
  send_arr[3] = enc_length; // Length;                                 ///< Parameter Length (56 Max)
  send_arr.set(enc_data, 4); // pData[SysExpacketDataLength + 1] = {0}; ///< Data
  console.log("SysEx length: " + send_arr.length + " Data:" + send_arr);

  MIDIoutput.sendSysex(0x7d, Array.from(send_arr));

  if (send_drum_funct) {
    // special case for using drum function
    // convert gate to drum by sending vo min note == vo max note
    const v = DeviceConfig.ports[number].voice; // from used voices at port we get which one is the used one Ex: voice number at port 8 can be voice 2. Convert voice_port to voice_num.
    index = DeviceConfig.voices_port_free.indexOf(v);
    if (index >= 0) {
      DeviceConfig.voices_port_used.push(v);
      DeviceConfig.voices_port_free.splice(index, 1);
    }
    number = DeviceConfig.voices_port_used.indexOf(v);
    sendSysex("VOICE", number, "VO_MinNote", 60);
    sendSysex("VOICE", number, "VO_MaxNote", 60);
  }
}

function _storeWebData(type, number, attr, value, is_global_adsr){
  if (is_global_adsr && type == VOICE){
    //special case of voice parameters of global ADSR 
    DeviceConfig.voices_midi_ch[number - 18][attr] = value;
  } else {
    switch (type) {
      case PORT:
        if (attr == "funct"){
          // reset default values
          _resetValues(number)
          if (value == MIDIDRUMTRIG){
            // special case of DRUM function.
            // at module it's gate function, and clip_min and clip_max get 0-120
            DeviceConfig.ports[number].funct == MIDIVOICEGATE;
            DeviceConfig.voices_port[number].vo_min_note = 60;
            DeviceConfig.voices_port[number].vo_max_note = 60;
          }
        }else {
          DeviceConfig.ports[number][attr] = value;
        }
        break;
      case VOICE:
        var port_num = DeviceConfig.voices_port_used[number];
        DeviceConfig.voices_port[port_num][attr] = value;
        DeviceConfig.voices[number][attr] = value;
        break;
      case MIDICH:
        DeviceConfig.midi_channels[number-1][attr] = value;
        break;
      default:
        break;
    }
  }
}

function _resetValues(num)
{
  DeviceConfig.ports[num].clip_min = 0;
  DeviceConfig.ports[num].clip_max = 0;
  DeviceConfig.ports[num].delay = 0;
  DeviceConfig.ports[num].pulse_time = 10;
  DeviceConfig.ports[num].period = 1136;
  DeviceConfig.ports[num].clk_div = 24;
  DeviceConfig.ports[num].clk_pulse_width = 99;
  DeviceConfig.ports[num].clk_mult = 1;
  DeviceConfig.ports[num].start_stop_clock = true;
  DeviceConfig.ports[num].use_midi_clock = true;
  DeviceConfig.ports[num].gate_pulse = false;
  DeviceConfig.voices_port[num] = new VoiceConfig();
  var index = DeviceConfig.voices_port_used.indexOf(num);
  if (index >= 0) DeviceConfig.voices[index] = new VoiceConfig();
}

/*! \brief Encode System Exclusive messages.
 SysEx messages are encoded to guarantee transmission of data bytes higher than
 127 without breaking the MIDI protocol. Use this static method to convert the
 data you want to send.
 \param inData The data to encode. Uint8Array 
 \param outSysEx The output buffer where to store the encoded message. Uint8Array (size inData*8/7+1)
 \param inLength The lenght of the input buffer.
 \return The lenght of the encoded output buffer.
 @see decodeSysEx
 Code inspired from Ruin & Wesen's SysEx encoder/decoder - http://ruinwesen.com
 */
function _encodeSysEx(inData, outSysEx) {
  var inLength = inData.length;
  var outLength = 0; // Num bytes in output array.
  var count = 0; // Num 7bytes in a block.
  var outIndex = 0;
  var inIndex = 0;
  outSysEx[0] = 0;
  
  for (var i = 0; i < inLength; ++i) {
    var data = inData[i];
    var msb = data >> 7;
    var body = data & 0x7f;

    outSysEx[0 + outIndex] = outSysEx[0 + outIndex] | (msb << (6 - count));
    outSysEx[1 + count + outIndex] = body;

    if (count++ == 6) {
      outIndex += 8;
      outLength += 8;
      outSysEx[0 + outIndex] = 0;
      count = 0;
    }
  }
  return outLength + count + (count != 0 ? 1 : 0);
}