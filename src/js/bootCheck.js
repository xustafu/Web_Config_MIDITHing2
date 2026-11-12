// Loaded last by index.php. It imports every entry module; if any module in the graph
// fails to load or link (a 404, or a stale cached copy missing an export another
// module now imports), this module fails too and the flag below is never set. The
// check in index.php then shows the "editor did not load correctly" popup.
//
// Imports of modules index.php already loaded are not loaded again.
import './backend/initMidi.js';
import './settingsFuncs.js';
import './events.js';
import './backend/adsr.js';
import './mappingsUI.js';

window.__mtBooted = true;
