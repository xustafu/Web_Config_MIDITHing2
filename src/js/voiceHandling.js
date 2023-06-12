import { q, qA, colors } from "./globals.js";
import { changePortsColors } from "./colorHandling.js";
import { showModal } from "./domScripts.js";

// RANGE SLIDER https://www.youtube.com/watch?v=gcYLEkxRw6c

/**
 * Create a New Voice with the function selected
 * @param {String} "port_num" > number of port we are in
 * @param {String} box_id > the id of the box (A1, C2..)
 * @param {HTMLElement} "li" > The element that receives the click
 */
export function newVoiceFunction(port_num, box_id, li) {
  const port = DeviceConfig.ports[port_num];
  port.voice = Number(port_num);
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
  //_reorganizeVoiceSelectors();
}

/**
 * Adds the function selected to the voice selected
 * @param {String} "port_num" > number of port we are in
 * @param {HTMLElement} "li" > The element that receives the click
 * @param {Boolean} is_automatic > is selected mamually or from sysex
 */
export function addFunctionToVoice(port_num, li, is_automatic) {
  port_num = Number(port_num);
  const box_id = "box-" + BoxNames[port_num];
  var voice = -1;
  //get the voice depending on manual or automatic
  if (is_automatic) {
    // if the call comes from sysex or modal voice selection
    voice = DeviceConfig.ports[port_num].voice;
  } else {
    //if manual selection (click), if no voices used, return error
    if (DeviceConfig.voices_port_used.length == 0) {
      showModal(
        "warning",
        "There is no voice available to add a function to. Please create a voice first."
      );
      return;
    }
    //if we select manually "add to voice", and there is only one, we select that
    else if (DeviceConfig.voices_port_used.length == 1) {
      voice = DeviceConfig.voices_port_used[0];
    }
    //if there is more than one voice, select it with modal
    else {
      q("#add2voice_submit").setAttribute("data-port", port_num);
      q("#add2voice_submit").setAttribute("data-funct", li.dataset.body);
      showModal("add_to_voice", "");
      TriggerInputChange = false;
    }
  }
  const port = DeviceConfig.ports[port_num];
  /* if it was previously a voice creator, reorganize voices
  //if (port.isNewVoice) _reorganizeVoices(port); */

  port.isNewVoice = false;
  port.isAddToVoice = true;
  // Hide the port name drop-down arrow
  q(`#${box_id} .port-color-drop-arrow`).classList.toggle("hidden", true);

  port.voice = voice;
  port.param = voice;
  DeviceConfig.ports[port_num] = port;

  const port_name = "-" + BoxNames[voice];

  changePortsColors(port_num, "ADD2VOICE");
  _changeVoice(box_id, li, port_name);

  // hide this voice from voice selectors if it was a voice before
  /*const index = DeviceConfig.voices_port_used.indexOf(port.port_num - 1);
  if (index > -1) {
    DeviceConfig.voices_port_used.splice(index, 1);
    DeviceConfig.voices_port_free.push(port.port_num - 1);
    DeviceConfig.voices_port_free.sort();
  }
  _reorganizeVoiceSelectors();*/
}

/**
 * Create a new Function (non-voice)
 * @param {String} port_num > the number of port we are in (Ej:2)
 * @param {Boolean} is_automatic is selected mamually or from sysex
 */
export function newNonVoiceFunction(port_num, box_id) {
  const port = DeviceConfig.ports[port_num];
  // if it was previously a voice creator, reorganize voices
  //if (port.isNewVoice) _reorganizeVoices(port);

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
  //_reorganizeVoiceSelectors();
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

/*function _reorganizeVoices(port) {
  //a voice has been destroyed. We must find a new representant
  //TO DO for offline functionality
}*/

/*function _reorganizeVoiceSelectors() {
  if (DeviceConfig.voices_port_used.length > 0) {
    let frag = document.createDocumentFragment();
    DeviceConfig.voices_port_used.forEach(voice => {
      const li = document.createElement('li');
      li.classList.add('box-selector-item');
      li.classList.add('voice-selector-item');
      li.setAttribute('data-value', voice);
      li.innerHTML = BoxNames[voice];
      li.addEventListener('click', e => {
        alert('hola');
        li.parentElement.classList.toggle('hidden', true);
      });
      frag.appendChild(li);
    });
    qA('.voice-selector').forEach(ul => {
      ul.innerHTML = '';
      ul.appendChild(frag.cloneNode(true));
    });
  }
}*/




