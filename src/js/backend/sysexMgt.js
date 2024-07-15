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

  //console logging
  if (sysex_start == 0xf0 && edu == 0x7d && sysex_end == 0xf7) {
    if (LogRcvdSysex) console.log("SYSEX RECEIVED:");
    var b=[];
    msg.data.forEach((x) => {
      b.push(x.toString(16).padStart(2,'0'));
    });
    if (LogRcvdSysex) console.log(b.toString().replaceAll(",", " ").toUpperCase());
  } else {
    if (LogRcvdSysex) console.log("Not MIDI Thing Sysex");
    return;
  }
  //if we receive 53 (hex 35) it's a batch sysex with all ports information in one message
  var type = (type_and_num == 53) ? BATCH_SYSEX : _extractType(type_and_num);
  var num = _extractNumber(type_and_num);

  enc_data = new Uint8Array(enc_data);
  var dec_data = new Uint8Array(enc_data.length);
  length = _decodeSysEx(enc_data, dec_data); // Decode 7 bit SysEx info from message
  dec_data = dec_data.slice(0, length);
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
    _processPortFunctionSysex(number, data, false);
  else if (type > 4)
    showModal('error', "Error: type of Sysex command not recognized, must be GENERAL, PORT, MIDI CH. or VOICE");
  else if (type == BATCH_SYSEX) {
    _processBatchSysex(param, data);
    _fixVoices();
  }
  else
    _processParamSysex(type, number, param, data);
}

function _processGeneralSysex(param, data) {
  var command = SYSEX_OBJ[0][param].index;
  switch (command) {
    case 0: //"SET_DEF_CONFIG":
      if (LogRcvdSysex) console.log("Set predef num." + data[0]);
      if (LogRcvdSysex) console.log(" ");
      setDefaultConfig(data[0]);
      break;
    case 1: //"REQ_CONFIG":
      if (LogRcvdSysex) console.log("Request Config " + data[0]);
      if (LogRcvdSysex) console.log(" ");
      break;
    case 2: //"SAVE_CONFIG_TO_SLOT":
      if (LogRcvdSysex) console.log("Save Config to Slot " + data[0]);
      if (LogRcvdSysex) console.log(" ");
      break;
    case 3: //"LOAD_CONFIG_FROM_SLOT":
      if (LogRcvdSysex) console.log("Load Config from Slot " + data[0]);
      if (LogRcvdSysex) console.log(" ");
      break;
    case 4: //"SET_LEARN_MODE":
      if (LogRcvdSysex) console.log("Set Learn Mode " + data[0]);
      if (LogRcvdSysex) console.log(" ");
      break;
    case 5: //"MIDI_MERGE":
      if (LogRcvdSysex) console.log("Midi Merge " + data[0]);
      if (LogRcvdSysex) console.log(" ");
      break;
    default: //ERROR
      showModal("error","Error: type of GENERAL Sysex command not recognized, examples: SET_DEF_CONFIG, SAVE_CONFIG_TO_SLOT");
      break;
  }
}

function _processPortFunctionSysex(port_num, data, is_batch) {
  //function number
  const funct = data[0];
  var port = DeviceConfig.ports[port_num];
  port.funct = funct;
  //midi channel
  port.midi_ch = (data[1] == "0") ? 1 : data[1];
  var value = 0;
  if (is_batch) {
    value = parseInt(data[2]) + parseInt(data[3])*16;
    value += parseInt(data[3])*16*3 + parseInt(data[4])*16*3;
  } else {
    //decode param data
    var buf = data.slice(2).buffer;
    var view = new DataView(buf);
    value = view.getUint32(0, true);
  }
  port.param = value;
  //voice values
  var isVoiceFunction = (data[0] >= 1 && data[0] <= 7);
  port.isVoiceFunction = isVoiceFunction;
  port.isNewVoice = (isVoiceFunction && port.port_num-1 == port.param);
  port.isAddToVoice = isVoiceFunction && port.port_num-1 != port.param;
  port.voice = (isVoiceFunction ? port.param : 100);
  port.voice_rep = calculateVoiceId(port.voice);
  //console log
  var funct_name = FirmwareFunctions2Web[funct];
  if (LogRcvdSysex && port.isVoiceFunction) console.log("Set port function "+funct_name.toUpperCase()+" at port "+port.port_num+" and voice "+port.voice_rep);
  if (LogRcvdSysex && !port.isVoiceFunction) console.log("Set port function "+funct_name.toUpperCase()+" at port "+port.port_num+" and param "+port.param);
  if (LogRcvdSysex) console.log(" ");
  //set default values
  var def_funct = DEF_FUNCT_VALUES[funct];
  port.volts = def_funct.volts;
  port.min = def_funct.min;
  port.clip_min = def_funct.min;
  port.max = def_funct.max;
  port.clip_max = def_funct.max;
  //save port object
  DeviceConfig.ports[port_num] = port;
  if (funct_name == "gate"){
    DeviceConfig.voices_port[port.port_num - 1].vo_min_note = 0;
    DeviceConfig.voices_port[port.port_num - 1].vo_max_note = 120;
  }
  return;
}

function _processBatchSysex(num_ports, array) {
  const ports = [];
  for (let i = 0; i < array.length; i++) {
    const last = ports[ports.length - 1];
    if (!last || last.length === 6) {
      ports.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  ports.forEach((port, i) => {
    _processPortFunctionSysex(i, port, true);
  });
  //refreshWeb();
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
      if (attr == "min" && DeviceConfig.ports[number].funct == MIDIVOICEGATE)
         DeviceConfig.ports[number].clip_max = value;
      //console log 
      if (LogRcvdSysex) console.log("Set PORT PARAM at port "+(number+1)+", "+attr+"="+value);
      break;
    case MIDICH:
      DeviceConfig.midi_channels[number - 1][attr] = value;
      //console log 
      if (LogRcvdSysex) console.log("Set MIDICH PARAM at midi ch."+(number)+", "+attr+"="+value);
      break;
    case VOICE:
      DeviceConfig.voices[number][attr] = value;
      //console log 
      if (LogRcvdSysex) console.log("Set VOICE PARAM at voice "+number+", "+attr+"="+value);
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
  //console log
  if (LogRcvdSysex) console.log("Set MIDICH PARAM at midi ch."+midi_ch+", "+attr+"="+value);
}

function _fixVoices(){
  DeviceConfig.ports.forEach((port, i) => {
    port.voice_rep = calculateVoiceId(port.voice);
    DeviceConfig.ports[i] = port;
  });
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
  const is_adsr_funct = [MIDIVOICEADSR, MIDIVOICEVEL].includes(DeviceConfig.ports[port_num].funct);
  const is_global_adsr = is_adsr_funct && !DeviceConfig.voices[number].use_local_config_adsr;
  const adsr_params = [
    "ADSRTPredelay", "ADSRLMax", "ADSRTAttack", "ADSRTDecay", "ADSRLSustain", "ADSRRSustain",
    "ADSRTRelease", "ADSRAffectOSC", "ADSRCurveType", "ADSRRetrigMode", "VelAffectADSR"];
  const is_global_adsr_param = adsr_params.includes(parameter) && is_global_adsr;
  if (type == "VOICE" && is_global_adsr_param) {
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
  if (LogSentSysex) console.log("SYSEX SENT: ");
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
  var send_drum_funct = (type == PORT && param == PORTFUNCTION && value == MIDIDRUMTRIG);
  var is_port_midich = (type == PORT && param == PORTMIDICHAN);
  var is_port_funct = (type == PORT && param == PORTFUNCTION);
  var is_port_param = (type == PORT && param == PORTFUNCPARAMETER);
  if (is_global_adsr && type == VOICE && number >= 18)
    number = number - 18
  var port = DeviceConfig.ports[number];
  var param = port.param;
  if (port.isAddToVoice || is_port_midich) {
    for (var i = 0; i < DeviceConfig.ports.length; i++) {
      let p = DeviceConfig.ports[i];
      if (p.voice == param && i != port.port_num - 1) {
        param = p.port_num - 1;
        break;
      }
    }
  } 

  /*if (is_port_funct) {
    dec_data = new Uint8Array(72);
    enc_data = new Uint8Array(83);
    DeviceConfig.ports.forEach((port, i) => {
      dec_data[6*i] = port.funct;
      dec_data[6*i+1] = port.midi_ch;
      var funct_arr = _createParamArray(port.param);
      dec_data.set(funct_arr, 6*i+2);
    });
  }
  else*/ 
  if (is_port_param || is_port_funct || is_port_midich) {
    // function special case
    dec_data = new Uint8Array(6);
    dec_data[0] = port.funct;
    dec_data[1] = port.midi_ch;
    var funct_arr = _createParamArray(param);
    dec_data.set(funct_arr, 2);
    index = PORTFUNCTION;
  } else {
    var buf = dec_data.buffer;
    var view = new DataView(buf, 0);
    eval("view.set" + data_type + "(0," + value + ",true)");
    dec_data = dec_data.slice(0, length);
  }

  var enc_length = _encodeSysEx(dec_data, enc_data); // Decode 7 bit SysEx info from message
  enc_data = enc_data.slice(0, enc_length);

  var send_arr = new Uint8Array(enc_data.length + 4);

  send_arr[0] = 25; // Device = SINGLESYSEX + THING_mode;      ///< MT2 Single message(0x10) + module ID (7 para el MidiThing) == 23 (16+7)
  send_arr[1] = /*(is_port_funct) ? 53 : */type_and_num; // typeAndNumber=0;                        ///< Port, MIDI Channel, Voice (3 bits) and number (5 bits)
  send_arr[2] = /*(is_port_funct) ? 12 : */index; // Parameter;                              ///< Parameter Number
  send_arr[3] = enc_length; // Length;                                 ///< Parameter Length (56 Max)
  send_arr.set(enc_data, 4); // pData[SysExpacketDataLength + 1] = {0}; ///< Data

  MIDIoutput.sendSysex(0x7d, Array.from(send_arr));
  
  //console log
  var b=[];
  Array.from(send_arr).forEach((x) => {
    b.push(x.toString(16).padStart(2, "0"));
  });
  var console_text = "F0 7D "+b.toString().replaceAll(",", " ").toUpperCase();
  if (LogSentSysex) console.log(console_text+" F7");
  if (LogSentSysex) console.log(" ");

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

function _createParamArray(param)
{
  var funct_arr = new ArrayBuffer(4);
  new ArrayBuffer(4);
  var funct_view = new DataView(funct_arr);
  funct_view.setUint32(0, param, true);
  funct_arr = new Uint8Array(funct_arr);
  return funct_arr;
}

function _storeWebData(type, number, attr, value, is_global_adsr){
  if (is_global_adsr && type == VOICE){
    //special case of voice parameters of global ADSR 
    DeviceConfig.voices_midi_ch[number - 18][attr] = value;
    if (LogSentSysex) console.log("Set GLOBAL MIDICH PARAM at midi ch."+(number-17)+", "+attr+"="+value);
  } else {
    switch (type) {
      case PORT:
        if (attr == "funct"){
          // reset default values
          _resetValues(number);
          if (value == MIDIDRUMTRIG){
            // special case of DRUM function. clip_min and clip_max get 0-120
            DeviceConfig.voices_port[number].vo_min_note = 60;
            DeviceConfig.voices_port[number].vo_max_note = 60;
          }
          if (LogSentSysex) console.log("Set FUNCT "+FirmwareFunctions2Web[value]+" at port "+(number+1));
        }else {
          DeviceConfig.ports[number][attr] = value;
          if (LogSentSysex) console.log("Set PORT PARAM at port"+(number+1)+", "+attr+"="+value);
        }
        break;
      case VOICE:
        var port_num = DeviceConfig.voices_port_used[number];
        DeviceConfig.voices_port[port_num][attr] = value;
        DeviceConfig.voices[number][attr] = value;
        if (LogSentSysex) console.log("Set VOICE PARAM at voice "+number+", "+attr+"="+value);
        break;
      case MIDICH:
        DeviceConfig.midi_channels[number-1][attr] = value;
        if (LogSentSysex) console.log("Set MIDICH PARAM at midi ch."+(number)+", "+attr+"="+value);
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