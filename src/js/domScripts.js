import { q, qA, contributors } from './globals.js';
import { getParent } from './helpers.js';
import { setAvailableColors, changePortsColors } from './colorHandling.js';
import { newNonVoiceFunction, newVoiceFunction, addFunctionToVoice } from './voiceHandling.js';
import { sendParameterSysex } from './backend/sysexMgt.js';
import { selectMIDIinput } from './backend/initMidi.js';
import { drawAllADSR } from './backend/adsr.js';
import { saveToFile, loadFromFile, sendToModule, requestConfig, credits } from './settingsFuncs.js';

// export const genListener = new AbortController();

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
  if (li.innerHTML == 'MIDIThing2') {
    selectMIDIinput(WebMidi.inputs[li.dataset.value]);
    requestConfig();
  } else {
    // not Midi Thing. Show an error
    showModal('error', 'The device selected is not a Midi Thing device');
  }

  // Change the body classes to show diff. layouts
  /*const main = q('.main');
  const main_class = li.innerHTML === 'MIDI Thingy' ? 'main mt' : 'main mt2';
  main.classList.value = main_class;*/
  // Hide <ul> after click
  li.parentElement.classList.toggle('hidden', true);
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
export function expandSubmenu(el) {
  // Parameters to set the position of the submenus
  const elRect = el.getBoundingClientRect();
  const elTop = elRect.top;
  const elHeight = elRect.height;
  //const elX = elRect.left;
  const viewPortHeight = window.innerHeight;
  //const viewportWidth = window.innerWidth;
  const is_lfo_quad = el.classList.contains('lfo-quad-sel');
  const quad = is_lfo_quad ? el.dataset.quad : '';
  let submenu, submenuHeight, submenuLeft;

  if (el.classList.value.includes('selector-label') && !el.classList.value.includes('disabled')) {
    el.classList.toggle('active');

    if (is_lfo_quad) {
      submenu = q(`#${el.parentElement.id} > ul[class*="selector-lfo-quad-${quad}"]`);
    } else {
      submenu = q(`#${el.parentElement.id} > ul[class*="selector-options"]`);
    }
    submenu.style.top = 0; // resetting top
    submenu.classList.toggle('hidden');
    submenuHeight = submenu.getBoundingClientRect().height;
    submenuLeft = submenu.getBoundingClientRect().left;

    if (submenuHeight + elTop > viewPortHeight) {
      submenu.style.top = `-${submenuHeight + 2}px`;
    } else if (q(`#${el.parentElement.id} > h3.block`)) {
      submenu.style.top = `${2 * elHeight - 6}px`;
    } else {
      submenu.style.top = `${elHeight + 2}px`;
    }
  } else if (el.classList.contains('color-selector')) {
    const box_id = 'box-' + BoxNames[Number(el.dataset.port)];
    if (q(`#${box_id} .port-color-drop-arrow`).classList.contains('hidden')) return;
    submenu = q(`#${box_id} .box-port-color-selector-options`);
    submenu.style.top = 0;
    submenu.classList.toggle('hidden');
    submenuHeight = submenu.getBoundingClientRect().height;

    if (submenuHeight + elTop > viewPortHeight) {
      submenu.style.top = `-${submenuHeight}px`;
    } else {
      submenu.style.top = `${elHeight + 2}px`;
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
    // Reveal the appropriate suboptions menu
    el.children[0].classList.toggle('hidden');
    el.children[0].style.top = '-1px';
    // const submenuHeight = el.children[0].getBoundingClientRect().height;
    // if (elTop + submenuHeight > viewPortHeight) {
    //   el.children[0].style.top = `-${submenuHeight - 30}px`;
    // }
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
  const port_id = BoxNames[port_num];
  const box_id = 'box-' + port_id;
  changePortsColors(port_num, 'RESET');
  _handleMainFunc(li, box_id, is_automatic);

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
 * Hides <ul>s on blur and deactivates all labels
 */
export function hideList() {
  qA('ul[class*="options"').forEach(optionList => {
    optionList.classList.toggle('hidden', true);
  });
  qA(`label[class*="selector-label"]`).forEach(label => label.classList.remove('active'));
}

/**
 * Deals with arrows functionality
 * @param {HTMLElement} arrow The HTML element that received the event
 * @param {Boolean} is_from_arrows > if the change came from arrows,
 *                                or from editing directly the number
 * @returns
 */
export function arrowsFunc(arrow, is_from_arrows = true) {
  const is_arr_up = arrow.classList.contains('arrow-up'); // if it isn't, it's arrow-down
  const parent = arrow.parentElement; // the input wrapper

  const getInput = () => {
    for (let el of parent.children) {
      if (el.matches('input')) return el;
    }
  };

  var input = getInput(arrow); // the actual input field

  let curr_input_val = Number(input.value); // current value

  // Don't allow values beyond the data-max or data-min
  // if it's not from arrows, it's already checked at minMax function
  if (is_from_arrows) {
    const max = Number(input.getAttribute('data-max'));
    const min = Number(input.getAttribute('data-min'));
    if ((is_arr_up && curr_input_val >= max) || (!is_arr_up && curr_input_val <= min)) return;
  }

  // If it's edited directly, get current input
  // If it's from arrows, increase or decrease
  const new_input_val = is_from_arrows
    ? is_arr_up
      ? curr_input_val + 1
      : curr_input_val - 1
    : curr_input_val;

  input.setAttribute('value', new_input_val);
  input.value = new_input_val;

  if (input.classList.value.includes('nrpn')) {
    // special treatment of NRPN
    // calculate MSB and LSB, and change input to main PARAM one
    // the other inputs are not to be sent to module
    input = _calculate_msb_lsb_nrpn_values(input);
  }

  // trigger the input change to send the sysex. It doesnt work automagically.
  sendParameterSysex(input);
  if (input.classList.value.includes('redraw_adsr')) {
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
  const max = Number(input.getAttribute('data-max'));
  const min = Number(input.getAttribute('data-min'));
  var value = Number(input.value);
  if (value > max) {
    value = max;
    showModal('error', 'The max value cannot go over ' + max);
    input.value = max;
  } else if (value < min) {
    value = min;
    showModal('error', 'The min value cannot be less than ' + min);
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
 * Otherwise, 0/10, -5/5, -10/0, 0/8, 0/5
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
    for (let a = 1; a < 6; a++) {
      const li = document.createElement('li');
      li.classList.add('box-selector-item');
      li.setAttribute('data-value', a);
      switch (a) {
        case 1:
          li.innerHTML = '0/10';
          frag.appendChild(li);
          break;
        case 4:
          li.innerHTML = '0/8';
          frag.appendChild(li);
          break;
        case 5:
          li.innerHTML = '0/5';
          frag.appendChild(li);
          break;
      }
    }
    label.innerHTML = '0/5';
  } else {
    for (let a = 1; a < 6; a++) {
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
          li.innerHTML = '-10/0';
          break;
        case 4:
          li.innerHTML = '0/8';
          break;
        case 5:
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
  if (!(gate && [2, 3].includes(port.volts))) {
    q('#volts-' + port.id).setAttribute('value', port.volts);
    q("label[for='volts-" + port.id + "']").innerHTML = VoltsNames[port.volts-1][1];
  }
}

/**
 * Shows the modal with a given body
 * @param {String} type The type of modal ('error', 'credits')
 * @param {String} error The error string
 */
export function showModal(type, msg) {
  // reset any previous modal content
  q(`#modal-body`).innerHTML = '';
  // get title depending on type
  const type_to_title = {
    warning: 'WARNING:',
    error: 'Sorry, there is an error',
    add_to_voice: 'Please select the voice to add the function to:'
  };
  // Create a fragment to hold all the content for the modal
  const frag = document.createDocumentFragment();
  let h1 = document.createElement('h1');
  let p = document.createElement('p');
  h1.classList = 'modal-heading';
  p.classList = 'modal-par';

  switch (type) {
    case 'credits':
      for (let a = 0; a < contributors.length; a++) {
        h1.innerHTML = contributors[a].name;
        p.innerHTML = contributors[a].content;
        frag.appendChild(h1).appendChild(p);
      }
      break;

    case 'error':
    case 'warning':
      h1.innerHTML = type_to_title[type];
      p.innerHTML = msg;
      frag.appendChild(h1).appendChild(p);
      break;

    case 'add_to_voice':
      h1.innerHTML = type_to_title[type];
      frag.appendChild(h1);
      const voice_select_div = q("#add2voice_voice_selector");
      const voice_select = q('#add2voice_voice_selector > select');
      if (voice_select != null) voice_select_div.removeChild(voice_select);

      const select = document.createElement('select');
      select.setAttribute('id', 'select-voice');
      DeviceConfig.voices_port_used.forEach(voice => {
        const option = document.createElement('option');
        option.setAttribute('value', voice);
        option.innerHTML = BoxNames[voice];
        select.appendChild(option);
      });

      const button = document.getElementById('add2voice_submit');
      voice_select_div.insertBefore(select, button);
      voice_select_div.classList.toggle("hidden", false);

      button.addEventListener('click', e => {
        if (DeviceConfig.voices_port_used == 1) {
          return DeviceConfig.voices_port_used[0];
        } else {
          const port_num = button.dataset.port;
          const port_id = BoxNames[Number(port_num)];
          const funct = button.dataset.funct;
          DeviceConfig.ports[Number(port_num)].voice = Number(q('#select-voice').value);
          const li = q(
            '#func-selector-wrap-box-' + port_id + ' li.add_to_voice[data-body="' + funct + '"]'
          );
          q('#modal-wrap').classList.toggle('hidden', true);
          TriggerInputChange = true;
          addFunctionToVoice(port_num, li, true);
          const input = q('#main-func-box-' + port_id);
          input.dispatchEvent(new Event('change'));
        }
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
 * Handles the main function changes
 * @param {HTMLElement} li The li that got clicked
 * @param {String} box_id The ID of the box
 * @param {Boolean} is_automatic is selected mamually or from sysex
 */
export function _handleMainFunc(li, box_id, is_automatic) {
  const bodyStr = `${li.getAttribute('data-body')}`;
  const port_num = getLiPortNumber(li);

  // Hide/unhide the corresponding body types
  _revealBody(li, port_num, is_automatic);

  // Change the volts list
  const is_gate = bodyStr.includes('gate');
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
}

/**
 * Things to do as soon as the DOM is loaded
 */
export function domInit() {
  // Populate the colours
  setAvailableColors();
  _setLabelWidths();
}

/**
 * Toggles the checkbox attribute of the companion input
 */
export function checkBox(box) {
  var input = q(`#${box.id} input`);
  input.classList.toggle('checked');
  input.checked = !input.checked;
}

//TODO: Yago Check whether it can be done with width: max-content
/**
 * Sets the min-width in all labels based on the content of its longest child
 */
function _setLabelWidths() {
  qA(`.box-body .selector-options:not(.voice-selector)`).forEach(list => {
    const children = Array.from(list.children); // an HTMLCollection is not really an array

    // Find the longest innerText in all children
    let longestChild = children.reduce((a, b) => {
      return a.innerText.trim().length > b.innerText.trim().length ? a : b;
    });

    const parent = getParent(list, true, 'input-wrap');
    q(`#${parent.id} .box-selector-label`).style.minWidth = `${longestChild.innerText.length}rem`;
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
export function setLFOGraph(elem, is_global) {
  const port_num = elem.dataset.port;
  const port_id = BoxNames[port_num];
  const graph_num = Number(elem.dataset.value);
  const graph_name = LFOCurvesPNG[graph_num];
  const quad_num = is_global ? -1 : elem.dataset.quad;
  if (is_global) {
    for (var i = 1; i <= 4; i++) {
      var img = q('#lfo-graph-q' + i + '-' + port_num);
      img.setAttribute('src', './assets/png/' + graph_name + '_q' + i + '.png');
      q('#lfo-quad' + i + '-img-' + port_id).setAttribute(
        'src',
        './assets/png/' + graph_name + '.png'
      );
    }
    q('#lfo-global-img-' + port_id).setAttribute('src', './assets/png/' + graph_name + '.png');
  } else {
    var img = q('#lfo-graph-q' + quad_num + '-' + port_num);
    img.setAttribute('src', './assets/png/' + graph_name + '_q' + quad_num + '.png');
    q('#lfo-quad' + quad_num + '-img-' + port_id).setAttribute(
      'src',
      './assets/png/' + graph_name + '.png'
    );
  }

  // Hide <ul> after click if global.
  //if (is_global)
  //  elem.parentElement.classList.toggle("hidden", true);

  //trigger "change" event of 4 quadranst or one
  const input_wrap = getParent(elem, true, 'input-wrap');
  if (is_global) {
    for (var i = 1; i <= 4; i++) {
      const input = q('#lfo-quad-input-q' + i + '-' + port_id);
      input.setAttribute('value', graph_num);
      input.dispatchEvent(new Event('change'));
    }
  } else {
    const input = q(`#${input_wrap.id} > input`);
    input.setAttribute('value', graph_num);
    input.dispatchEvent(new Event('change'));
  }
}
