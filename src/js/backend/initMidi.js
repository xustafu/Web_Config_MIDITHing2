import { q } from "../globals.js";
import { onSysexReceive, sendIdentityRequest } from "./sysexMgt.js";
import { requestConfig } from "../settingsFuncs.js";
import { refreshWeb } from "./refreshWeb.js";
import { selectDevice, activateMidiThingy } from "../domScripts.js";

// the MIDI input/output
export let MIDIinput = null,
  MIDIoutput = null;

WebMidi.enable(function (err) {
  if (err) {
    console.log(err);
    console.log("WebMidi could not be enabled.");
  }

  // Viewing available inputs and outputs
  console.log("MIDI INPUTS:", WebMidi.inputs.map(i => i.name + " [" + i.connection + "]"));
  console.log("MIDI OUTPUTS:", WebMidi.outputs.map(o => o.name + " [" + o.connection + "]"));

  _initDeviceSelect();
  if (MIDIinput == null) selectMIDIinput(WebMidi.inputs[0]);
  if (MIDIoutput == null) MIDIoutput = WebMidi.outputs[0];
  // Retrieve an input by name, id or index
  //input = WebMidi.getInputByName("My Awesome Keyboard");
  // OR...
  // input = WebMidi.getInputById("1809568182");
}, true);

//initialize data model
for (var i = 0; i < 16; i++) {
  if (i < 12) {
    DeviceConfig.ports[i] = new PortConfig(i+1,0,1);
    DeviceConfig.voices_port[i] = new VoiceConfig();
    DeviceConfig.voices[i] = new VoiceConfig();
  }
  DeviceConfig.voices_midi_ch[i] = new VoiceConfig();
  DeviceConfig.midi_channels[i] = new MidiChannelConfig(i + 1);
}
DeviceConfig.voices_port_used = [];
DeviceConfig.voices_port_free = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];


//set function to be executed every 300 miliseconds
setInterval(_checkLastSysexRcvd, 300);
function _checkLastSysexRcvd() {
  if (LastSysexRcvd > PrevSysexRcvd) {
    PrevSysexRcvd = LastSysexRcvd;
    refreshWeb();
  }
}

/**
 * Busca el output cuyo nombre coincide mejor con el nombre del input seleccionado.
 * Se busca primero por igualdad exacta, luego por coincidencia parcial del primer
 * segmento del nombre (antes del primer espacio).
 * Esto evita el desacoplamiento input/output que ocurría cuando Windows cachea el
 * nombre antiguo del dispositivo o cuando TinyUSB genera nombres ligeramente
 * distintos para input y output (p.ej. "MidiThingy1" vs "MidiThingy1 MIDI 1").
 * @param {string} inputName - nombre del input seleccionado
 * @returns {Output|null} el output correspondiente, o null si no se encuentra
 */
function _findMatchingOutput(inputName) {
  // 1. Coincidencia exacta
  let out = WebMidi.outputs.find(o => o.name === inputName);
  if (out) return out;
  // 2. El nombre del output contiene el primer segmento del nombre del input
  const baseName = inputName.split(' ')[0];
  out = WebMidi.outputs.find(o => o.name.includes(baseName));
  if (out) return out;
  // 3. Fallback: el output contiene las mismas palabras clave de detección
  out = WebMidi.outputs.find(o => o.name.includes("MIDIThing") || o.name.includes("MidiThingy"));
  return out || null;
}

/**
 * Actualiza MIDIoutput para que apunte al output que corresponde al input dado.
 * Exportada para que selectDevice (domScripts.js) pueda actualizar el output
 * cuando el usuario selecciona manualmente un dispositivo.
 * @param {string} inputName - nombre del input seleccionado
 */
export function selectMIDIoutput(inputName) {
  const out = _findMatchingOutput(inputName);
  if (out) {
    MIDIoutput = out;
    console.log("MIDI output set to:", out.name);
  } else {
    MIDIoutput = WebMidi.outputs[0] || null;
    console.warn("No matching MIDI output found for:", inputName, "— using first available");
  }
}

function _initDeviceSelect() {
  var ul = q("#device-selector");
  var dFrag = document.createDocumentFragment();
  var found = false;
  var index = 0;
  var sel_index = 0;

  // BUG: Windows cachea los nombres de dispositivos USB MIDI. Al renombrar el
  // firmware (p.ej. "MidiThingyRP" → "MidiThingy1"), el OS mantiene la entrada
  // antigua en la lista junto a la nueva. Ambas contienen "MidiThingy", pero el
  // código encontraba primero la antigua (índice 0, desconectada) y la usaba,
  // ignorando el dispositivo real (índice 1, connection='open').
  // FIX: entre todos los candidatos por nombre, preferir el que tiene
  // connection === 'open' (dispositivo físicamente conectado).

  // Encontrar el mejor input candidato: primero 'open', luego cualquiera
  const _isMidiThing = (name) => name.includes("MIDIThing") || name.includes("MidiThingy");
  const candidates = WebMidi.inputs.filter(e => _isMidiThing(e.name));
  const bestInput = candidates.find(e => e.connection === 'open') || candidates[0];

  WebMidi.inputs.forEach((element) => {
    let li = document.createElement("li");
    li.setAttribute("class", "selector-item");
    li.setAttribute("class", "device-selector");
    li.setAttribute("data-value", index);
    li.innerText = element.name;
    dFrag.appendChild(li);
    if (!found && element === bestInput) {
      found = true;
      selectMIDIinput(element);
      selectMIDIoutput(element.name); // vincula el output al input detectado
      activateMidiThingy(element.name);
      sel_index = index;
      q("label[for='MIDIInputSelect']").innerHTML = element.name;
      q("#MIDIInputSelect").setAttribute("value", sel_index);
    }
    index++;
  });
  if (!found) {
    let element = WebMidi.inputs[0];
    selectMIDIinput(element);
    if (element) selectMIDIoutput(element.name);
    q("label[for='MIDIInputSelect']").innerHTML = element != null ? element.name : "No Device!";
    q("#MIDIInputSelect").setAttribute("value", 0);
  }

  // Reattach click event listener to all <li>s
  for (let li of dFrag.children) {
    li.addEventListener("click", (e) => selectDevice(e.target));
  }
  ul.appendChild(dFrag);

  // Request config to module on connection.
  // Identity request first: corrects _targetDevNum/_moduleBase from the firmware's
  // actual usbDevNumber (OS name caching can give the wrong value).
  if (found) {
    q(".live-button svg").style.fill = "#06b900";
  } else {
    q(".live-button svg").style.fill = "#ff0000";
  }
  sendIdentityRequest(requestConfig);
  // Fallback: if no identity reply arrives in 500 ms, request config anyway.
  setTimeout(requestConfig, 500);
}

export function selectMIDIinput(inp) {
  if (inp == null) return;
  if (MIDIinput != null) MIDIinput.removeListener();
  MIDIinput = inp;
  MIDIinput.addListener("sysex", "all", onSysexReceive);
}
