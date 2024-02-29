/**
 * Traverse the HTML DOM up one parent at a time
 * Returns the parent element that meets the criteria
 *
 * @param {HTMLElement} el The element that got clicked
 * @param {Boolean} isClass Whether we should check for a class
 * @param {String} string The class or ID to look for
 *
 * @returns {HTMLElement}
 */
export function getParent(el, isClass, string) {
  let checker;
  do {
    el = el.parentElement;
    checker = isClass ? el.classList.value.includes(string) : el.id && el.id.includes(string);
  } while (!checker);

  return el;
}

/**
 * Box ID getter
 * @param {HTMLElement} el The element from which we start
 * @returns {String}
 */
export function getBoxId(el) {
  let boxParent, boxId;

  // Look for a parent in a try/catch pattern
  // If you don't do it like that it will complain
  // when the li is not in a box
  try {
    boxParent = getParent(el, false, 'box') || undefined;
  } catch (e) {
    // Message to clarify what's happening? // YAGO: not really necessary
  }

  return boxParent ? boxParent.id.substring(boxParent.id.lastIndexOf('box')) : undefined;
}

/**
 * Converts an RGB colour into hex from its r,g,b numbers
 * @param {String} rgb RGB representation of a colour
 */
export function rgbToHex(rgb) {
  const compToHex = a => {
    const hex = a.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const rgbArr = rgb.split('(')[1].split(')')[0].split(',');
  rgbArr[0] = parseInt(rgbArr[0]);
  rgbArr[1] = parseInt(rgbArr[1]);
  rgbArr[2] = parseInt(rgbArr[2]);

  return '#' + compToHex(rgbArr[0]) + compToHex(rgbArr[1]) + compToHex(rgbArr[2]);
}

export function calculateVoiceId(voice) {
  let voices = Array.from(new Set(DeviceConfig.ports.map((x) => x.voice)));
  //voices.splice(voices.indexOf(100),1);
  return "V"+(voices.indexOf(voice)+1);
}
