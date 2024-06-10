import { q, qA } from './globals.js';
import { getParent } from './helpers.js';
import { setAvailableColors, changePortsColors } from './colorHandling.js';
import { newNonVoiceFunction, newVoiceFunction, addFunctionToVoice } from './voiceHandling.js';
import { sendParameterSysex } from './backend/sysexMgt.js';
import { selectMIDIinput } from './backend/initMidi.js';
import { drawAllADSR } from './backend/adsr.js';
import {
  saveToFile,
  loadFromFile,
  sendToModule,
  requestConfig,
  credits,
  setPreDefSetup
} from './settingsFuncs.js';

/**
 * Settings functions selector
 * @param {HTMLElement} <li> the settings function selector clicked
 */
export function selectSettings(li) {
  const func = li.getAttribute('data-func');
  switch (func) {
    case 'save':
      saveToFile();
      break;
    case 'load':
      loadFromFile();
      break;
    case 'send':
      sendToModule();
      break;
    case 'request':
      requestConfig();
      break;
    case 'predef':
      setPreDefSetup(li.dataset.value);
      break;
    case 'credits':
    default:
      credits();
      break;
  }
  // Hide <ul> after click
  q('#settings-ul').classList.toggle('hidden', true);
}

/**
 * Device selector
 * @param {HTMLElement} <li> the device selector clicked
 */
export function selectDevice(li) {
  if (!li.innerHTML.includes('MIDIThing')) {
    // not Midi Thing. Show a warning
    showModal(
      "warning",
      "This website is designed to work with the MIDI Thing 2 \
       device connected. If no such device is found, the data shown on the website may be erroneous."
    );
  } 
  selectMIDIinput(WebMidi.inputs[li.dataset.value]);
  requestConfig();
  // Show the correct Main Area
  activateMidiThingie(li.innerHTML);

  // Hide <ul> after click
  li.parentElement.classList.toggle('hidden', true);
}

/**
 * Activate Midi Thingie if exist
 * @param {string} name - the name of the device
 */
export function activateMidiThingie(name = 'MIDIThingie') {
  const main = q('#main');
  const viewPortWidth = window.innerWidth;

  if (name.includes('MIDIThingie')) {
    const mt2Wrap = q('.mt2-main-wrap');

    // wrap the main content in div to allow for horizontal scrolling on defined sizes
    if (viewPortWidth > 821 && viewPortWidth < 1532) {
      main.classList = 'main mt2';

      // change the name of the MIDI Input field and return if wrapper already exists
      if (mt2Wrap) return (q('#MIDIInputSelectLabel').innerHTML = name);

      q('body').removeChild(main);
      const mainWrap = document.createElement('div');
      mainWrap.classList = 'mt2-main-wrap';
      mainWrap.appendChild(main);
      q('header.banner').insertAdjacentElement('afterend', mainWrap);

      // remove the mt2 wrapper when moving away from those sizes
    } else if (mt2Wrap) {
      main.classList = viewPortWidth <= 821 ? 'main mt' : 'main mt2';
      const parent = mt2Wrap.parentElement;
      parent.removeChild(mt2Wrap);
      q('header.banner').insertAdjacentElement('afterend', main);
    }
  }

  q('#MIDIInputSelectLabel').innerHTML = name;
}

/**
 * Parameter selector
 * @param {HTMLElement} <li> the parameter selector clicked
 */
export function selectParameter(li) {
  const input_wrap = getParent(li, true, 'input-wrap');
  const input = q(`#${input_wrap.id} > input`);

  // Change the value and label for the input field
  input.value = li.getAttribute('data-value');
  q(`#${input_wrap.id} .box-selector-label`).innerHTML = li.innerHTML;

  // Hide <ul> after click
  li.parentElement.classList.toggle('hidden', true);

  // trigger the "change" event
  input.dispatchEvent(new Event('change'));
}

/**
 * Deals with the expansion of menus
 * @param {HTMLElement} el The element that receives the click
 */
export function expandMenu(el) {
  // Parameters to set the position of the menus
  const elRect = el.getBoundingClientRect();
  const elTop = elRect.top;
  const elHeight = elRect.height;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const is_lfo_quad = el.classList.contains('lfo-quad-sel');
  const quad = is_lfo_quad ? el.dataset.quad : '';
  let menu, menuHeight, menuLeft, menuWidth;

  if (el.classList.value.includes('selector-label') && !el.classList.value.includes('disabled')) {
    el.classList.toggle('active');

    if (is_lfo_quad) {
      menu = q(`#${el.parentElement.id} > ul[class*="selector-lfo-quad-${quad}"]`);
    } else {
      menu = q(`#${el.parentElement.id} > ul[class*="selector-options"]`);
    }
    menu.style.top = 0; // resetting top
    menu.classList.toggle('hidden');
    menuHeight = menu.getBoundingClientRect().height;
    menuWidth = menu.getBoundingClientRect().width;
    menuLeft = menu.getBoundingClientRect().left;

    // deals with height
    if (menuHeight + elTop > viewportHeight) {
      menu.style.top = `-${menuHeight + 2}px`;
    } else if (q(`#${el.parentElement.id} > h3.block`)) {
      if (viewportWidth < 668) {
        menu.style.top = `${2 * elHeight - 3}px`;
      } else {
        menu.style.top = `${2 * elHeight - 6}px`;
      }
    } else {
      menu.style.top = `${elHeight + 2}px`;
    }

    // deals with width
    if (menuWidth + menuLeft > viewportWidth) {
      menu.style.left = viewportWidth - (menuWidth + menuLeft) + 'px';
    }
  } else if (el.classList.contains('color-selector')) {
    const box_id = 'box-' + BoxNames[Number(el.dataset.port)];
    if (q(`#${box_id} .port-color-drop-arrow`).classList.contains('hidden')) return;
    menu = q(`#${box_id} .box-port-color-selector-options`);
    menu.style.top = 0;
    menu.classList.toggle('hidden');
    menuHeight = menu.getBoundingClientRect().height;

    if (menuHeight + elTop > viewportHeight) {
      menu.style.top = `-${menuHeight}px`;
    } else {
      menu.style.top = `${elHeight - 1}px`;
    }
  } else if (
    el.classList.value.includes('has-submenu') &&
    el.children &&
    el.children[0].classList.value.includes('suboptions')
  ) {
    // Reset all other suboptions to hidden
    qA(`.box-selector-suboptions`).forEach(ul => {
      ul.classList.toggle('hidden', true);
    });
    const suboptions = el.children[0];
    // Reveal the appropriate suboptions menu
    suboptions.classList.toggle('hidden');
    suboptions.style.top = el.classList.contains('settings') ? '0' : '-1px';
    if (suboptions.getBoundingClientRect().left > viewportWidth) {
      suboptions.style.left = `-${suboptions.getBoundingClientRect().width}px`;
    }
  }
}

/**
 * Select a function from menu
 * @param {HTMLElement} <li> the parameter selector clicked
 * @param {Boolean} "is_automatic" if this function is called
 *                  manually from user click, or programatically
 */
export function selectFunction(li, is_automatic = false) {
  const port_num = Number(getLiPortNumber(li));
  if (!is_automatic && li.classList.contains('add_to_voice') && DeviceConfig.voices_port_used.length > 1) {
    q("#add2voice_submit").setAttribute("data-port", port_num);
    q("#add2voice_submit").setAttribute("data-funct", li.dataset.body);
    showModal("add_to_voice", "");
    TriggerInputChange = false;
    return;
  }
  _handleMainFunction(li, is_automatic)
}

function _handleMainFunction(li, is_automatic, voice=-1) {
  const port_num = Number(getLiPortNumber(li));
  const port_id = BoxNames[port_num];
  const box_id = 'box-' + port_id;
  const bodyStr = `${li.getAttribute("data-body")}`;

  changePortsColors(port_num, "RESET");

  // Change the volts list
  const is_gate = bodyStr.includes("gate") || bodyStr.includes("drum");
  changeVolts(port_num, is_gate);

  //new voice function
  if (li.classList.contains("new_voice")) {
    newVoiceFunction(port_num, box_id, li);
  }
  //add function to voice
  else if (li.classList.contains("add_to_voice")) {
    addFunctionToVoice(port_num, li, is_automatic, voice);
  }
  //new non-voice function
  else {
    newNonVoiceFunction(port_num, box_id);
  }

  // Hide/unhide the corresponding body types
  _revealBody(li, port_num, is_automatic);

  //set function
  const funct = Number(li.getAttribute('data-value'));
  DeviceConfig.ports[port_num].funct = funct;

  //set default values
  if (!is_automatic) {
    const def_funct = DEF_FUNCT_VALUES[funct];
    DeviceConfig.ports[port_num].volts = def_funct.volts;
    DeviceConfig.ports[port_num].min = def_funct.min;
    DeviceConfig.ports[port_num].clip_min = def_funct.min;
    DeviceConfig.ports[port_num].max = def_funct.max;
    DeviceConfig.ports[port_num].clip_max = def_funct.max;
    if (funct == 0 || funct > 7) {
      DeviceConfig.ports[port_num].param = def_funct.param;
    }
  }

  // Change the value for the input field and trigger the "change" event
  const input = q('#main-func-box-' + port_id);
  input.setAttribute('value', funct);
  input.dispatchEvent(new Event('change'));

  q('#func-selector-wrap-box-' + port_id + ' .box-selector-label').innerHTML = li.innerHTML;
  // Hide <ul> after click
  li.parentElement.classList.toggle('hidden', true);
}

/**
 * Handles the main function changes
 * @param {HTMLElement} li The li that got clicked
 * @param {String} box_id The ID of the box
 * @param {Boolean} is_automatic is selected mamually or from sysex
 */
export function _handleMainFunc(li, box_id, is_automatic) {
  const bodyStr = `${li.getAttribute('data-body')}`;
  const port_num = getLiPortNumber(li);

  // Change the volts list
  const is_gate = bodyStr.includes('gate') || bodyStr.includes('drum');
  changeVolts(port_num, is_gate);

  //new voice function
  if (li.classList.contains('new_voice')) {
    newVoiceFunction(port_num, box_id, li);
  }
  //add function to voice
  else if (li.classList.contains('add_to_voice')) {
    addFunctionToVoice(port_num, li, is_automatic);
  }
  //new non-voice function
  else {
    newNonVoiceFunction(port_num, box_id);
  }

  // Hide/unhide the corresponding body types
  _revealBody(li, port_num, is_automatic);
}

/**
 * Hides <ul>s on blur and deactivates all labels
 * @param {HTMLElement} element The element that was being hovered
 */
export function hideList(element) {
  let reEnter = false;
  element.addEventListener('mouseenter', () => {
    reEnter = true;
  });
  setTimeout(() => {
    if (!reEnter) {
      qA('ul[class*="options"').forEach(optionList => {
        optionList.classList.toggle('hidden', true);
      });
      qA(`label[class*="selector-label"]`).forEach(label => label.classList.remove('active'));
    }
  }, 1000);
}

/**
 * Deals with arrows functionality
 * @param {HTMLElement} arrow The HTML element that received the event
 * @param {Boolean} is_from_arrows > if the change came from arrows,
 *                                or from editing directly the number
 * @returns
 */
export function arrowsFunc(arrow, is_from_arrows = true) {
  const is_arr_up = arrow.classList.contains("arrow-up"); // if it isn't, it's arrow-down
  const parent = arrow.parentElement; // the input wrapper

  const getInput = () => {
    for (let el of parent.children) {
      if (el.matches("input")) return el;
    }
  };

  var input = getInput(arrow); // the actual input field

  let curr_input_val = Number(input.value); // current value

  //for Note Midi Ranges check min and max
  if (input.classList.contains("midi-range")) {
    const subs = input.id.slice(-3);
    const range = input.id.substring(10,16);
    const max = Number(q('#note-midi-range2'+subs).value);
    const min = Number(q("#note-midi-range1" + subs).value);
    if ((max-min) >= 120 && (((range == "range1") && !is_arr_up) || ((range == "range2") && is_arr_up))) return;
  }

  // Don't allow values beyond the data-max or data-min
  // if it's not from arrows, it's already checked at minMax function
  if (is_from_arrows) {
    const max = Number(input.getAttribute("data-max"));
    const min = Number(input.getAttribute("data-min"));
    if (
      (is_arr_up && curr_input_val >= max) ||
      (!is_arr_up && curr_input_val <= min)
    )
      return;
  }

  // If it's edited directly, get current input
  // If it's from arrows, increase or decrease
  const new_input_val = is_from_arrows
    ? is_arr_up
      ? curr_input_val + 1
      : curr_input_val - 1
    : curr_input_val;

  input.setAttribute("value", new_input_val);
  input.value = new_input_val;

  if (input.classList.value.includes("nrpn")) {
    // special treatment of NRPN
    // calculate MSB and LSB, and change input to main PARAM one
    // the other inputs are not to be sent to module
    input = _calculate_msb_lsb_nrpn_values(input);
  }

  // trigger the input change to send the sysex. It doesnt work automagically.
  sendParameterSysex(input);

  if (input.classList.value.includes("redraw_adsr")) {
    const port_num = input.dataset.mtPort;
    const port_id = BoxNames[port_num];
    drawAllADSR(port_id);
  }
  requestConfig();
}

function _calculate_msb_lsb_nrpn_values(input) {
  const type = input.dataset.mtNrpn;
  const port_num = input.dataset.mtPort;
  const port_id = BoxNames[port_num];
  var value = Number(input.value);
  var main = 0;
  var msb = 0;
  var lsb = 0;
  switch (type) {
    case 'main': // calculate MSB and LSB
      msb = (value >> 7) & 0x07f;
      lsb = value & 0x07f;
      q('#nrpn-msb-input-' + port_id).setAttribute('value', msb);
      q('#nrpn-msb-input-' + port_id).value = msb;
      q('#nrpn-lsb-input-' + port_id).setAttribute('value', lsb);
      q('#nrpn-lsb-input-' + port_id).value = lsb;
      break;
    case 'msb': // calculate main from MSB
      input = q('#nrpn-param-input-' + port_id);
      main = Number(input.value);
      lsb = main & 0x07f;
      var main_minus_lsb = value << 7;
      main = main_minus_lsb + lsb;
      input.setAttribute('value', main);
      input.value = main;
      break;
    case 'lsb': // calculate main from LSB
      input = q('#nrpn-param-input-' + port_id);
      main = Number(input.value);
      main = main & 0x3f80; //7 more significative bits
      main = main + value;
      input.setAttribute('value', main);
      input.value = main;
    default:
      break;
  }
  return input;
}

/**
 * Makes sure numeric input fields don't go over their
 * limits when user inputs them manually
 * @param {HTMLElement} input The input field
 */
export function minMax(input) {
  const max = Number(input.getAttribute("data-max"));
  const min = Number(input.getAttribute("data-min"));
  let max_range = 0;
  let min_range = 0;
  var value = Number(input.value);

  //for Note Midi Ranges check min and max
  if (input.classList.contains("midi-range")) {
    const subs = input.id.slice(-3);
    const range = input.id.substring(10,16);
    if (range == "range1") {
      max_range = Number(q("#note-midi-range2" + subs).value);
      min_range = value;
    }
    else if (range == "range2") {
      max_range = value;
      min_range = Number(q("#note-midi-range1" + subs).value);
    }
    if (max_range - min_range > 120) {
      showModal(
        "error",
        "The MIDI range difference cannot be greater than 120"
      );
      input.value = (range == "range1") ? 7 : 120;
      return;
    }
  }
  if (value > max) {
    value = max;
    showModal("error", "The max value cannot go over " + max);
    input.value = max;
  } else if (value < min) {
    value = min;
    showModal("error", "The min value cannot be less than " + min);
    input.value = min;
  }
}

/**
 * Runs checks and reveals the appropriate body type
 * @param {HTMLElement} li The element that triggers the function
 * @param {String} box_id The ID of the box we are working with
 */
function _revealBody(li, port_num, is_automatic) {
  const port_id = BoxNames[port_num];
  const data_body = li.getAttribute('data-body');
  const body_name = data_body + port_id; // i.e. "A1"
  const mult_bodies = ['note', 'adsr', 'lfo'];

  // Go through all body types to check which one to reveal
  // and which ones to hide
  qA(`#box-${port_id} main.box-body`).forEach(body_type => {
    const id = body_type.getAttribute('id').replace('-body-', '');
    var no_change = false;
    if (is_automatic && mult_bodies.includes(data_body)) {
      // check if it's in a subbody (options, shape, conf, et)
      // and keep in that screen if so
      if (data_body == 'note') {
        no_change = !q('#note-options-body-' + port_id).classList.contains('hidden');
      } else if (data_body == 'adsr') {
        no_change = !q('#adsr-conf-' + port_id).classList.contains('hidden');
      } else if (data_body == 'lfo') {
        no_change = !q('#lfo-shape-' + port_id).classList.contains('hidden');
        no_change = no_change || !q('#lfo-options-' + port_id).classList.contains('hidden');
      }
      if (no_change) return;
    }
    if (id !== body_name) {
      // If the data attribute of the body type doesn't match
      // the main <li> innerHTML, make sure it is 'hidden'
      if (!body_type.classList.contains('hidden')) body_type.classList.toggle('hidden', true);
    } else {
      if (body_type.classList.contains('hidden')) body_type.classList.toggle('hidden', false);
    }
  });
}

/**
 * Changes the list of volts values
 * If GATE, then the VOLTS list has to be 0/5, 0/8 and 0/10
 * Otherwise, 0/10, -5/5, 0/8, 0/5
 * @param {String} port_num > the number of port we are in (Ej:2)
 * @param {Boolean} gate Whether we are in a gate function
 */
function changeVolts(port_num, gate) {
  const port_id = BoxNames[Number(port_num)];
  const voltsWrapChildren = q(`#volts-wrap-${port_id}`).children;

  let ul, label;
  for (let child of voltsWrapChildren) {
    if (child.tagName == 'UL') {
      ul = child;
      break;
    } else if (child.tagName == 'LABEL') {
      label = child;
    }
  }

  // Empty the ul children
  while (ul.firstChild) {
    ul.removeChild(ul.lastChild);
  }

  // Create a document fragment with the new <li>s
  let frag = document.createDocumentFragment();
  if (gate) {
    for (let a = 1; a < 5; a++) {
      const li = document.createElement('li');
      li.classList.add('box-selector-item');
      li.setAttribute('data-value', a);
      switch (a) {
        case 1:
          li.innerHTML = '0/10';
          frag.appendChild(li);
          break;
        case 3:
          li.innerHTML = '0/8';
          frag.appendChild(li);
          break;
        case 4:
          li.innerHTML = '0/5';
          frag.appendChild(li);
          break;
      }
    }
    label.innerHTML = '0/10';
  } else {
    for (let a = 1; a < 5; a++) {
      const li = document.createElement('li');
      li.classList.add('box-selector-item');
      li.setAttribute('data-value', a);
      switch (a) {
        case 1:
          li.innerHTML = '0/10';
          break;
        case 2:
          li.innerHTML = '-5/5';
          break;
        case 3:
          li.innerHTML = '0/8';
          break;
        case 4:
          li.innerHTML = '0/5';
      }
      frag.appendChild(li);
    }
    label.innerHTML = '0/10';
  }

  // Reattach click event listener to all <li>s
  for (let li of frag.children) {
    li.addEventListener('click', e => selectParameter(e.target));
  }

  // Insert doc fragment into the volts options list
  ul.appendChild(frag);

  //Set value stored
  const port = DeviceConfig.ports[port_num];
  if (!gate  || port.volts != 2) {
    q('#volts-' + port.id).setAttribute('value', port.volts);
    q("label[for='volts-" + port.id + "']").innerHTML = VoltsNames[port.volts - 1][1];
  }
}

/**
 * Shows the modal with a given body
 * @param {String} type The type of modal ('error', 'credits')
 * @param {String} error The error string
 */
export function showModal(type, msg) {
  // reset screen
  q('body').dispatchEvent(new Event('click'));
  // reset any previous modal content
  q(`#modal-body`).innerHTML = '';
  // get title depending on type
  const type_to_title = {
    warning: 'Warning:',
    error: 'Sorry, there is an error',
    add_to_voice: 'Select the voice to add the function to:'
  };
  // Create a fragment to hold all the content for the modal
  const frag = document.createDocumentFragment();
  let h1 = document.createElement('h1');
  let p = document.createElement('p');
  h1.classList = 'modal-heading';
  p.classList = 'modal-par';
  const voice_select_div = q("#add2voice_voice_selector");
  voice_select_div.classList.toggle("hidden", true);

  switch (type) {
    case 'credits':
      h1.innerHTML = "Credits";
      p.innerHTML = "This web editor is designed to work with Befaco MIDI Thing 2 firmware 1.1.&nbsp;";
      p.innerHTML += "Please visit our website for further information, ";
      p.innerHTML += "and check Web configuration tool section of our User Manual: [Insert link here]<br/>";
      p.innerHTML += "<br/>Website developed by <a href='mailto:hugobraulio@gmail.com'>Hugo Vazquez</a> & Yago De la Torre";
      frag.appendChild(h1);
      frag.appendChild(p);
      break;

    case 'error':
    case 'warning':
      h1.innerHTML = type_to_title[type];
      p.innerHTML = msg;
      frag.appendChild(h1);
      frag.appendChild(p);
      break;

    case 'add_to_voice':
      const h2 = document.createElement('h2');
      h2.classList = 'modal-h2';
      h2.innerHTML = type_to_title[type];
      frag.appendChild(h2);
      const voice_select = q('#add2voice_voice_selector > select');
      if (voice_select != null) voice_select_div.removeChild(voice_select);

      const select = document.createElement('select');
      select.setAttribute('id', 'select-voice');
      select.classList = 'round-sm';
      DeviceConfig.voices_port_used.forEach(voice => {
        const option = document.createElement('option');
        option.setAttribute('value', voice);
        option.innerHTML = DeviceConfig.ports[voice].voice_rep;
        select.appendChild(option);
      });

      const button = document.getElementById('add2voice_submit');
      voice_select_div.insertBefore(select, button);
      voice_select_div.classList.toggle('hidden', false);

      button.addEventListener('click', e => {
        const port_num = button.dataset.port;
        const port_id = BoxNames[Number(port_num)];
        const funct = button.dataset.funct;
        const v = Number(q('#select-voice').value);

        DeviceConfig.ports[Number(port_num)].voice = v;
        const li = q('#func-selector-wrap-box-' + port_id + ' li.add_to_voice[data-body="' + funct + '"]');
        q('#modal-wrap').classList.toggle('hidden', true);
        TriggerInputChange = true;
        _handleMainFunction(li, false, v)
        //addFunctionToVoice(port_num, li, true, v);
        const input = q('#main-func-box-' + port_id);
        sendParameterSysex(input);
        requestConfig();
      });
  }

  q(`#modal-body`).appendChild(frag);
  q(`#modal-wrap`).classList.toggle('hidden', false);
  const scrollPos = window.scrollY;
  q(`#modal-wrap`).style.top = `${scrollPos}px`;
  window.addEventListener('scroll', dynModal, true); // using a function ref so we can remove it later
}

/**
 * Dynamically places the modal top to whatever scroll position we're in
 */
export function dynModal() {
  const scrollPos = window.scrollY;
  q(`#modal-wrap`).style.top = `${scrollPos}px`;
}

/**
 * Things to do as soon as the DOM is loaded
 */
export function domInit() {
  // Populate the colours
  setAvailableColors();
  setLabelWidths();
}

/**
 * Toggles the checkbox attribute of the companion input
 */
export function checkBox(input) {
  input.classList.toggle('checked');
  input.checked = !input.checked;
}

//TODO: Yago Check whether it can be done with width: max-content
/**
 * Sets the min-width in all labels based on the content of its longest child
 */
export function setLabelWidths() {
  qA(`.box-body .selector-options:not(.voice-selector)`).forEach(list => {
    const children = Array.from(list.children); // an HTMLCollection is not really an array

    // Find the longest innerText in all children
    let longestChild = children.reduce((a, b) => {
      return a.innerText.trim().length > b.innerText.trim().length ? a : b;
    });

    const parent = getParent(list, true, 'input-wrap');
    q(`#${parent.id} .box-selector-label`).style.width = `${
      longestChild.innerText.length * 0.85
    }em`;
  });
}

/**
 * Get the port number in which an 'li' is
 */
export function getLiPortNumber(li) {
  const parent = getParent(li, true, 'box-func-select-list');
  return parent.dataset.mtPort;
}

/*******  LFO GRAPHS  *******/
/**
 * Select LFO graph. Global or quad 1-4.
 */
export function setLFOGraph(elem, quad_num, is_global) {
  const port_num = elem.dataset.port;
  const port_id = BoxNames[port_num];
  const graph_num = Number(elem.dataset.value);
  const graph_name = LFOCurvesPNG[graph_num];
  var img = q('#lfo-graph-q' + quad_num + '-' + port_num);
  img.setAttribute('src', './assets/png/' + graph_name + '_q' + quad_num + '.png');
  q('#lfo-quad' + quad_num + '-img-' + port_id).setAttribute(
    'src',
    './assets/png/' + graph_name + '.png'
  );

  //trigger "change" event of 4 quadranst or one
  const input_wrap = getParent(elem, true, 'input-wrap');
  const input = is_global
    ? q('#lfo-quad-input-q' + quad_num + '-' + port_id)
    : q(`#${input_wrap.id} > input`);
  input.setAttribute('value', graph_num);
  input.dispatchEvent(new Event('change'));
}
