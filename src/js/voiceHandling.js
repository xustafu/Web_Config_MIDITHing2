import { q, qA, colors } from "./globals.js";
import { changePortsColors } from "./colorHandling.js";
import { showModal } from "./domScripts.js";
import { calculateVoiceId } from "./helpers.js";

// RANGE SLIDER https://www.youtube.com/watch?v=gcYLEkxRw6c

/**
 * Create a New Voice with the function selected
 * @param {String} "port_num" > number of port we are in
 * @param {String} box_id > the id of the box (A1, C2..)
 * @param {HTMLElement} "li" > The element that receives the click
 */
export function newVoiceFunction(port_num, box_id) {
  const port = DeviceConfig.ports[port_num];
  port.voice = Number(port_num);
  port.voice_rep = calculateVoiceId(port.voice);
  port.param = Number(port_num);
  port.isNewVoice = true;
  port.isAddToVoice = false;
  port.id = box_id.substring(4);
  DeviceConfig.ports[port_num] = port;
  // reveal the port name drop-down arrow
  q(`#${box_id} .port-color-drop-arrow`).classList.toggle("hidden", false);

  // Go through the colours object to see if the port
  // already has a colour assigned. If it doesn't, assign it
  let isAssigned = false;
  for (let a = 0; a < colors.length; a++) {
    if (colors[a].port === port.id) {
      isAssigned = true;
      break;
    }
  }
  if (!isAssigned) changePortsColors(port_num, "NEWVOICE");

  // add this voice to voices_port_used
  const index = DeviceConfig.voices_port_used.indexOf(port.port_num-1);
  if (index < 0) {
    DeviceConfig.voices_port_used.push(port.port_num-1);
    DeviceConfig.voices_port_used.sort();
    DeviceConfig.voices_port_free.splice(
      DeviceConfig.voices_port_free.indexOf(port.port_num-1)
    );
  }
}

/**
 * Adds the function selected to the voice selected
 * @param {String} "port_num" > number of port we are in
 * @param {HTMLElement} "li" > The element that receives the click
 * @param {Boolean} is_automatic > is selected maually or from sysex
 */
export function addFunctionToVoice(port_num, li, is_automatic, voice) {
  const box_id = "box-" + BoxNames[port_num];

  //get the voice if automatic
  if (is_automatic) {
    voice = DeviceConfig.ports[port_num].voice;
  } else {
    //if manual selection (click), if no voices used, return error
    if (DeviceConfig.voices_port_used.length == 0) {
      showModal(
        "warning",
        "There is no voice available to add a function to. A new voice will be created instead."
      );
      newVoiceFunction(port_num, 'box-'+BoxNames[port_num])
      return;
    }
    //if we select manually "add to voice", and there is only one, we select that
    else if (DeviceConfig.voices_port_used.length == 1) {
      voice = DeviceConfig.voices_port_used[0];
    }
  }
  const port = DeviceConfig.ports[port_num];

  // reveal the port name drop-down arrow
  q(`#${box_id} .port-color-drop-arrow`).classList.toggle("hidden", false);

  port.voice = voice;
  port.voice_rep = calculateVoiceId(voice);
  port.param = voice;
  if (voice != -1)
    port.midi_ch = DeviceConfig.voices_port[voice].midi_ch;

  if (_check_there_is_some_voice_rep(port))
  {
    port.isNewVoice = false;
    port.isAddToVoice = true;
  }

  DeviceConfig.ports[port_num] = port;

  const port_name = "-" + BoxNames[voice];

  _changeVoice(box_id, li, port_name);

  changePortsColors(port_num, "ADD2VOICE");
}

function _check_there_is_some_voice_rep(port){
  var there_is = false
  DeviceConfig.ports.forEach((p) => {
    there_is = (p.voice == port.voice && !(p.port_num == port.port_num) && p.isNewVoice)
    if (there_is) return there_is;
  });
  return there_is;
}

/**
 * Create a new Function (non-voice)
 * @param {String} port_num > the number of port we are in (Ej:2)
 * @param {Boolean} is_automatic is selected mamually or from sysex
 */
export function newNonVoiceFunction(port_num, box_id) {
  const port = DeviceConfig.ports[port_num];

  port.isNewVoice = false;
  port.isAddToVoice = false;
  port.isVoiceFunction = false;
  // Hide the dropdown arrow
  q(`#${box_id} .port-color-drop-arrow`).classList.toggle("hidden", true);
  // Reset the colour of the port name background
  changePortsColors(port_num, "RESET");

  // hide this voice from voice selectors if it was a voice before
  const index = DeviceConfig.voices_port_used.indexOf(port.port_num - 1);
  if (index > -1) {
    DeviceConfig.voices_port_used.splice(index, 1);
    DeviceConfig.voices_port_free.push(port.port_num - 1);
    DeviceConfig.voices_port_free.sort();
  }
}

/**
 * Changes the voice as soon as a sub_function of Add to Voice
 * is selected
 * @param {String} box_id The box ID
 * @param {HTMLElement} li The li that got clicked
 * @param {String} port The port to change into
 * @param {Boolean} voice Whether <li> clicked is from the voices dropdown
 */
function _changeVoice(box_id, li, port) {
  // throw and error if there isn't a port defined
  if (!port) {
    throw new Error(
      `There are no voices yet. Set up a voice and then you'll be able to add to it`
    );
  }

  const box = box_id.substring(4); // i.e. 'A1'
  const sub_func = li.innerHTML.toLowerCase();

  // TODO
  // Go through the body's voices <li>s until you find
  // the one that matches the port and change the
  // input value and the <li>, then trigger a new change event
  // on the input
  const voice_lis = qA(`#${sub_func}-voice${box} li.box-selector-item`);
  const input = q(`#${sub_func}-voice-input${box}`);
  const label = q(`#${sub_func}-voice${box} label`);
  for (let a = 0; a < voice_lis.length; a++) {
    const li = voice_lis[a];
    if (li.innerHTML === port) {
      input.value = li.getAttribute("data-value");
      label.innerHTML = port;
      break;
    }
  }
}



