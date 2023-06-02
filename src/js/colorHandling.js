import { q, qA, colors } from './globals.js';
import { rgbToHex, getParent } from './helpers.js';
import { showModal } from './domScripts.js';

/**
 * Changes the colour of the port name background
 * and the border colour of all related ports
 * It also updates the dropdown colours for all the boxes
 *
 * @param {String} boxId The ID of the box
 * @param {String} color The hex color to implement or an empty string
 * @param {Boolean} dark Whether to make the font dark
 * @param {Boolean} def Whether to give a colour by default
 * @param {Boolean} reset Whether to reset the colour instead
 * @param {Boolean} add2 Whether the triggering element is an add to voice func
 */
export function changePortsColors(port, type) {
  const boxId = "box-"+BoxNames[port];
  const portName = q(`#${boxId} .box-header-title`);

  // Grab the current background colour for the port
  const currCol = portName.style.backgroundColor;

  // reset all styles first
  portName.style.backgroundColor = 'inherit';
  portName.style.borderColor = 'none';

  switch (type) {
    case "RESET": 
      portName.style.borderColor = 'var(--border)';
      portName.style.color = '#fff';
      portName.color = '#fff';
      if (currCol && currCol !== 'inherit' && currCol !== 'transparent') resetColorObj(currCol);
      setAvailableColors();
      return;
    case "NEWVOICE":
      // Go through the global array of colours
      // and as soon as there is one that isn't used, use it
      for (let a = 0; a < colors.length; a++) {
        if (!colors[a].used) {
          portName.style.backgroundColor = colors[a].hex;
          portName.style.borderColor = colors[a].hex;
          portName.style.color = colors[a].darkfont ? '#000' : '#fff';

          // Mark the colour as used
          colors[a].used = true;
          colors[a].voice = DeviceConfig.ports[port].voice;
          colors[a].port = boxId.substring(3);
          setAvailableColors();
          break;
        }
      }
      break;
    case "ADD2VOICE":
      // Find the color associated to that voice
      for (let a = 0; a < colors.length; a++) {
        if (colors[a].voice == DeviceConfig.ports[port].voice) {
          portName.style.backgroundColor = "transparent";
          portName.style.borderColor = colors[a].hex;
          portName.style.color = "#fff";
        }
      }
      break;
    default:
      showModal('error', "Error: change color type not recognized");
      break;
    }
}

/**
 * Goes through the colours array and
 * adds only the available ones on all boxes
 */
export function setAvailableColors() {
  const addFrag = ul => {
    // create the fragment that will be populated
    const fragment = document.createDocumentFragment();

    // go through the colours
    colors.forEach( color => { 
      // ignore the colours that are in use
      if (!color.used) {
        // create the <li> and set all its attributes
        const li = document.createElement('li');
        li.classList = color.darkfont
          ? 'box-port-color selector-item dark-font'
          : 'box-port-color selector-item';
        li.setAttribute('data-color', color.hex);
        li.addEventListener("click", (e) => _changeManualColor(e.target));

        // append the <li> to the fragment
        fragment.appendChild(li);
      }
    });
    ul.appendChild(fragment);
  };

  // Go through all the boxes
  const boxes = qA(`section.box`);
  boxes.forEach(box => {
    // grab the <ul> colour selector
    const ul = q(`#${box.id} .box-port-color-selector-options`);

    // empty the ul of whatever there was inside
    while (ul.firstChild) {
      ul.removeChild(ul.lastChild);
    }
    // ul.innerHTML = null;

    // append the fragment
    addFrag(ul);
  });
}

function _changeManualColor(li) {
  var colorSel = getParent(li, true, "box-header-title");
  const port = Number(colorSel.dataset.port);
  const voice = DeviceConfig.ports[port].voice;
  const liColor = li.getAttribute("data-color");
  const dark = li.classList.contains("dark-font");

  colors.forEach((color, i) => {
    if (color.voice == voice){ 
      color.used = false;
      color.port = "";
      color.voice = -1;
    }
    if (color.hex == liColor) {
      color.used = true;
      color.port = "-" + BoxNames[port];
      color.voice = voice;
    }
  });

  setAvailableColors();

  colorSel.style.backgroundColor = liColor;
  colorSel.style.borderColor = liColor;
  colorSel.style.color = dark ? "#000" : "#fff";

  // propagate colour changes across the DOM for
  // ports that are adding to this voice
  DeviceConfig.ports.forEach( port => {
    if (port.isVoiceFunction && port.isAddToVoice && port.voice == voice) {
      colorSel = q("#color-selector-" + port.id);
      colorSel.style.backgroundColor = "transparent";
      colorSel.style.borderColor = liColor;
      colorSel.style.color = "#fff";
    }
  });
}


/**
 * Goes through the Colors object to reset the one that just changed
 * @param {String} currCol RGB representation of the current portname colour
 */
export function resetColorObj(currCol) {
  // Turn the currCol to hex
  const currHex = rgbToHex(currCol).toUpperCase();

  for (let a = 0; a < colors.length; a++) {
    const nextCol = colors[a];
    if (currHex === nextCol.hex) {
      colors[a].port = '';
      colors[a].used = false;
      colors[a].voice = -1;
      break;
    }
  }
}
