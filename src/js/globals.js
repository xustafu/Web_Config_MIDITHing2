import { ADSR } from "./backend/adsr.js";

export const q = selector => document.querySelector(selector);
export const qA = selector => document.querySelectorAll(selector);

export let LiveSend = false;

//to trigger event "change" of input or not
self.TriggerInputChange = true;

//to check if last sysex has been received, and refresh web from datamodel
self.PrevSysexRcvd = new Date();
self.LastSysexRcvd = new Date();

//to store default pre-def config, if it's the same, don't refresh web
self.DefaultConfig = -1;

//for ADSR graph
self.envADSR = new ADSR();

// Empty array of voices on document load
export const voices = [];

// Complete array of colours on document load
export const colors = [
  {
    id: 1,
    hex: "#FF0090",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 2,
    hex: "#FF0000",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 3,
    hex: "#FF8000",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 4,
    hex: "#EEFF00",
    darkfont: true,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 5,
    hex: "#7FFF00",
    darkfont: true,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 6,
    hex: "#25A200",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 7,
    hex: "#00DCFF",
    darkfont: true,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 8,
    hex: "#005DFF",
    darkfont: false,
    used: false,
    port: "",
  },
  {
    id: 9,
    hex: "#0011A7",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 10,
    hex: "#690088",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 11,
    hex: "#D700FF",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
  {
    id: 12,
    hex: "#FF8ACC",
    darkfont: false,
    used: false,
    port: "",
    voice: -1,
  },
];

// credits
export const contributors = [
  {
    name: 'Lorem ipsum dolor',
    content:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic molestias quod ratione eius. Maiores porro aliquam, unde voluptates dolorem architecto odio.'
  },
  {
    name: 'Pepito palotes',
    content:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic molestias quod ratione eius. Maiores porro aliquam, unde voluptates dolorem architecto odio.'
  },
  {
    name: 'Lorena Loren',
    content:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic molestias quod ratione eius. Maiores porro aliquam, unde voluptates dolorem architecto odio.'
  }
];
