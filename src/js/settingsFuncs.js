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
      //console.log(reader.readyState);
      //console.log(reader.result);
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
  // send all web to module
  qA("input.header-input").forEach((input) => {
    sendParameterSysex(input);
  });
  var bodies = qA(".box-body:not(.hidden):not(.multiple-box):not(.ignore-send)");
  //var inputs = qA("input:not(.no-trigger):not(.header-input");
  bodies.forEach((body) => {
    body.qA("input").forEach((input) => {
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
    console.log("requesting from module");
  }
}

export function setPreDefSetup(num) {
  // set predef config
  num = Number(num);
  sendSysex("GENERAL", 0, "SET_DEF_CONFIG", num);
  setDefaultConfig(num, true);
  refreshWeb();
  console.log("setting default config");
}

export function credits() {
  // Reveal the modal with the credits
  showModal('credits');
}