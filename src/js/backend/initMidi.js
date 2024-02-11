import { q } from "../globals.js";
import { onSysexReceive } from "./sysexMgt.js";
import { requestConfig } from "../settingsFuncs.js";
import { refreshWeb } from "./refreshWeb.js";
import { selectDevice, showModal, activateMidiThingie } from "../domScripts.js";

// the MIDI input/output
export let MIDIinput = null,
  MIDIoutput = null;

WebMidi.enable(function (err) {
  if (err) {
    console.log(err);
    console.log("WebMidi could not be enabled.");
  }

  // Viewing available inputs and outputs
  console.log(WebMidi.inputs);
  console.log(WebMidi.outputs);

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

function _initDeviceSelect() {
  var ul = q("#device-selector");
  var dFrag = document.createDocumentFragment();
  var found = false;
  var index = 0;
  var sel_index = 0;
  WebMidi.outputs.forEach((element) => {
    if (!found && element.name.includes("MIDIThing")) {
      MIDIoutput = element;
      found = true;
    }
  });
  if (!found) {
    MIDIoutput = WebMidi.outputs[0];
  }

  found = false;
  WebMidi.inputs.forEach((element) => {
    let li = document.createElement("li");
    li.setAttribute("class", "selector-item");
    li.setAttribute("class", "device-selector");
    li.setAttribute("data-value", index);
    li.innerText = element.name;
    dFrag.appendChild(li);
    //HUGO TO DO: connect VCMC and MIDI THING and check that dropdown works
    if (!found && (element.name.includes("MIDIThing"))) {
      selectMIDIinput(element);
      found = true;
      activateMidiThingie(element.name);
      sel_index = index;
      q("label[for='MIDIInputSelect']").innerHTML = element.name;
      q("#MIDIInputSelect").setAttribute("value", sel_index);
    }
    index++;
  });
  if (!found) {
    let element = WebMidi.inputs[0];
    selectMIDIinput(element);
    q("label[for='MIDIInputSelect']").innerHTML = element != null ? element.name : "No Device!";
    q("#MIDIInputSelect").setAttribute("value", 0);
  }
  


  // Reattach click event listener to all <li>s
  for (let li of dFrag.children) {
    li.addEventListener("click", (e) => selectDevice(e.target));
  }
  ul.appendChild(dFrag);

  // Request config to module on connection
  if (found) {
    requestConfig();
    q(".live-button svg").style.fill = "#06b900";
  } else {
    q(".live-button svg").style.fill = "#ff0000";
    showModal(
      'warning',
      'This website is designed to work with either the MIDI Thing 2 or the MIDI Thingie \
       device connected. If no such device is found, the data shown on the website may be erroneous.'
    );
  }
}

export function selectMIDIinput(inp) {
  if (inp == null) return;
  if (MIDIinput != null) MIDIinput.removeListener();
  //MIDIinput = WebMidi.inputs[inp];
  MIDIinput = inp;
  MIDIinput.addListener("sysex", "all", onSysexReceive);
  // if (inp.name.includes("MIDI")) {
  //   document.getElementById("site-title").style = "color:MediumSeaGreen;"; //",animation-duration: 4s;";
  //   if (inp.name == "Teensy MIDI") {
  //     document.getElementById("site-title").innerHTML = "MIDI Thing V2";
  //   } else {
  //     document.getElementById("site-title").innerHTML = "Unknown Device";
  //   }
  //   //if (!LiveSend) $("#Liveid").click();
  // } else {
  //   document.getElementById("MIDIThingLabel").style = "color:DarkGray;";
  // }
}
