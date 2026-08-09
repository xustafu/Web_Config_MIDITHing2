import { q, qA } from "./globals.js";
import { sendSysex, sendParameterSysex } from "./backend/sysexMgt.js";
import { showModal } from "./domScripts.js";
import { refreshWeb, setDefaultConfig } from "./backend/refreshWeb.js";

export function saveToFile() {
  const Months = ["Ene", "Feb",'Mar','Abr','May','Jun','Ago','Sep','Oct','Nov','Dic'];
  var data = JSON.stringify(DeviceConfig, undefined, 4);
  var blob = new Blob([data], { type: "text/json" });
  var d = new Date();
  var date_string = d.getFullYear()+'_'+Months[d.getMonth()]+'_'+d.getDate()
                    +'_'+d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
  var elem = q("#save_to_file");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = "MTConfig" + date_string + ".json";
  elem.dataset.downloadurl = ["text/json", elem.download, elem.href].join(":");
}

export function loadFromFile() {
  q('#file_load').click();
}

export function handleFiles(files) {
  const reader = new FileReader();
  const file = files[0];

  if (file.type == "application/json") {
    reader.onloadend = function (evt) {
      var json;

      try {
        json = JSON.parse(reader.result);
      } catch (e) {
        alert("invalid json");
        return;
      }
      if (typeof json.ports === "undefined") {
        console.log("empty object");
        return;
      }
      DeviceConfig = json;
      refreshWeb();
      sendToModule();
    };
    reader.readAsText(file);
    console.log(file.name + "/Type: " + file.type + ". " + file.size + " bytes");

    return;
  }
}

export function sendToModule() {
  //first we send all functions
  var port = new PortConfig();
  DeviceConfig.voices_port_used.forEach((num) => {
    port = DeviceConfig.ports[num]
    sendSysex("PORT", port.port_num-1, "PORTFUNCTION", port.funct,  false, true);
  })
  DeviceConfig.voices_port_free.forEach((num) => {
    port = DeviceConfig.ports[num];
    sendSysex("PORT", port.port_num - 1, "PORTFUNCTION", port.funct, false, true);
  });

  // send all web to module
  qA("input.header-input:not(.funct-input)").forEach((input) => {
    sendParameterSysex(input);
  });
  var bodies = qA(".box-body:not(.hidden):not(.multiple-box):not(.ignore-send)");
  bodies.forEach((body) => {
    body.querySelectorAll("input").forEach((input) => {
      sendParameterSysex(input);
    });
  });
  bodies = qA(".multiple-box:not(.hidden)");
  bodies.forEach((body) => {
    var send_type = body.dataset.sendtype;
    qA(".box-"+send_type+" input:not(.ignore-send)").forEach((input) => {
      sendParameterSysex(input);
    })
  });
  requestConfig();
  console.log("sending to module");
}

export function requestConfig() {
  // request all configuration from module
  if (RequestConfig) {
    sendSysex("GENERAL", 0, "REQ_CONFIG", 0);
    refreshWeb();
    if (LogSentSysex) console.log("REQUEST FROM MODULE");
    if (LogSentSysex) console.log(" ");
  }
}

let _requestConfigTimer = null;

// Debounced requestConfig() for rapid-fire UI interactions (arrow clicks, checkbox
// toggles, typed field changes): coalesces N interactions within `delay` ms into one
// REQ_CONFIG, instead of one full 12-port config request per interaction with no
// coalescing. Without this, e.g. clicking a MIDI channel's up-arrow several times
// fired a full config request per click (arrowsFunc had none at all — no delay,
// no debounce), racing with the "set channel" commands still in flight and with each
// other's replies. Symptom: the displayed value flickers to a stale/wrong value
// before correcting, and in the worst case a whole port record gets misread (e.g.
// shows "no function") if two replies' bytes land close enough to desync parsing.
export function requestConfigDebounced(delay = 200) {
  if (_requestConfigTimer) clearTimeout(_requestConfigTimer);
  _requestConfigTimer = setTimeout(() => {
    _requestConfigTimer = null;
    requestConfig();
  }, delay);
}

export function setPreDefSetup(num) {
  // set predef config
  num = Number(num);
  sendSysex("GENERAL", 0, "SET_DEF_CONFIG", num);
  setDefaultConfig(num, true);
  refreshWeb();
  if (num == 32) { // weird case: set polyphony (1)
    setDefaultConfig(num, true);
    refreshWeb();
  }
  if (LogSentSysex) console.log("SET PREDEF " + (num - 32));
  if (LogSentSysex) console.log(" ");
}

export function credits() {
  // Reveal the modal with the credits
  showModal('credits');
}