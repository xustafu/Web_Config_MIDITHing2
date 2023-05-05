import { q, qA, LiveSend } from './globals.js';
import {
  expandSubmenu,
  hideList,
  arrowsFunc,
  minMax,
  domInit,
  checkBox,
  selectSettings,
  selectFunction,
  selectDevice,
  selectParameter,
  setLFOGraph
} from './domScripts.js';
import { sendParameterSysex } from './backend/sysexMgt.js';
import { requestConfig, handleFiles } from './settingsFuncs.js';
import { drawAllADSR } from './backend/adsr.js';

/**
 * Paint the list of available colours under the port name
 */
window.addEventListener('DOMContentLoaded', domInit());

/**
 * hide everything on click outside inactive elements
 */
q(`body`).addEventListener('click', e => {
  const nodeType = e.target.nodeName;
  if (
    nodeType !== 'UL' &&
    nodeType !== 'LABEL' &&
    nodeType !== 'LI' &&
    nodeType !== 'H3' &&
    nodeType !== 'IMG' &&
    nodeType !== 'H1' &&
    nodeType !== 'SPAN'
  ) {
    // Go through all <ul>s and hide them
    qA(`ul`).forEach(ul => ul.classList.toggle('hidden', true));
  }
});

/**
 * LiveSend button
 * Change the value of LiveSend and the icon colour on click
 
q('#live').addEventListener('click', e => {
  LiveSend = !LiveSend;
  e.target.parentElement.style.fill = LiveSend ? '#06b900' : '#ff0000';
});*/

/**
 * Expand selector menus on click on any selector label
 * NOTE: the parameter for the expand function is the actual
 * element that originated the click to prevent bubbling errors.
 */
[
  qA('label[class*="selector-label"]'),
  qA('.color-selector'),
  //qA('.port-color-drop-arrow'),
  qA('[for^=lfo-global-input] img')
].forEach(item => {
  item.forEach(selector => {
    selector.addEventListener('click', () => {
      expandSubmenu(selector);
    });
  });
});

/****************************************************/
/*              LI CLICK FUNCTIONALITY
/****************************************************/

/**
 * Menu with submenu > on click
 */
qA('li.has-submenu').forEach(li => {
  li.addEventListener('click', e => {
    expandSubmenu(e.target);
  });
});

/**
 * Settings > functions > on click
 */
qA('.selector-item.settings').forEach(li => {
  li.addEventListener('click', e => {
    selectSettings(li);
  });
});

/**
 * Device selector > on click
 */
/*qA('li.device-selector').forEach(li => {
  li.addEventListener('click', e => {
    selectDevice(e.target);
  });
}); ==> THIS IS DONE PROGRAMATICALLY AT initMidi.js > _initDeviceSelect()*/

/**
 * A function menu option > on click
 */
qA('li.menu-option').forEach(li => {
  li.addEventListener('click', e => {
    selectFunction(e.target);
  });
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
  li.addEventListener("click", (e) => {
    selectParameter(e.target);
  });
});

/**
 * LFO > graph quad selector
 */
qA("li.lfo-quad-graph-sel").forEach((li) => {
  li.addEventListener("click", (e) => {
    setLFOGraph(e.target, false);
  });
});

/**
 * LFO > global graph selector
 */
qA('li.lfo-global-graph-sel').forEach(li => {
  li.addEventListener("click", (e) => {
    setLFOGraph(e.target, true);
  });
});


/****************************************************/
/*            END OF LI CLICK FUNCTIONALITY
/****************************************************/


/**
 * Hide <ul>s on blur
 */
[qA('ul[class*="selector-options"]'), qA('ul[class*="selector-suboptions"]')].forEach(list => {
  list.forEach(ul => {
    ul.addEventListener('mouseleave', () => hideList());
    ul.removeEventListener('mouseleave', () => hideList()); // cleaning up to save memory
  });
});

/**
 * Numeric input arrows functionality
 */
qA('.input-number-wrap span').forEach(arrowButton => {
  arrowButton.addEventListener('click', e => {
    arrowsFunc(e.target);
  });
});

/**
 * Numeric inputs onchange
 */
qA('input[class*=num]').forEach(input => {
  input.addEventListener('change', e => {
    minMax(input);
    arrowsFunc(e.target, false);
  });
});

/**
 * Clicking on the outside of the modal hides it
 */
q('#modal-wrap').addEventListener('click', e => {
  if (e.target.classList.contains('modal-wrap')) e.target.classList.toggle('hidden', true);
});

/**
 * Reveal options/shape/graph/conf window event
 */
qA('button.reveal').forEach(button => {
  button.addEventListener('click', e => {
    q("#" + button.dataset.hide).classList.toggle("hidden", true);
    q("#" + button.dataset.show).classList.toggle("hidden", false);
  });
  //draw ADSR in canvas
  if (button.classList.contains("draw_adsr")) {
    
  }
});

/**
 * Toggle checkbox state
 */
qA('.toggle-wrap').forEach(toggle => {
  toggle.addEventListener('click', () => {
    checkBox(toggle);
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
  handleFiles(e.target.files);
});


/****************************************************/
/****************************************************/
/*    MAIN PIECE OF CODE THAT SENDS INFO TO MODULE
/****************************************************/
/****************************************************/

//if anything changes in the web, send sysex to module with new info
qA('input:not(.no-trigger)').forEach(input => {
  input.addEventListener('change', e => {
    if (TriggerInputChange) {
      sendParameterSysex(e.target);
      //refreshWeb();
      requestConfig();
    }
  });
});



