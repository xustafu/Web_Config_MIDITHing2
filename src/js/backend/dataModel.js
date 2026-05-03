//We will store all data from the website to be sent to the device or to a file

class PortConfig {
  constructor(port_num=0, type=0, volts=1, funct=0, min=0, max=0, midi_ch=0, param=0) {
    this.port_num = port_num;
    this.type = type;
    this.id = BoxNames[port_num-1];
    this.volts = volts;
    this.funct = funct;
    this.min = min;
    this.max = max;
    this.midi_ch = midi_ch;
    this.param = param;
    this.clip_min = 0;
    this.clip_max = 120;
    this.cal_min = 0;
    this.cal_max = 0;
    this.delay = 0;
    this.pulse_time = 10;
    this.period = 1000000;
    this.clk_div = 24;
    this.clk_pulse_width = 99;
    this.clk_mult = 1;
    this.start_stop_clock = true;
    this.use_midi_clock = true;
    this.gate_pulse = false;
    this.isVoiceFunction = this.funct >= 1 && this.funct <= 7;
    this.voice = (this.isVoiceFunction) ? this.param : 100;
    this.voice_rep = "VX"; //representation of voice, from 1 to 12 as available
    this.isNewVoice = false;
    this.isAddToVoice = false;
  }
}

class VoiceConfig {
  constructor(voice=0) {
    this.voice = voice;
    this.adsr_tpredelay = 0;
    this.adsr_lmax = 100;
    this.adsr_tattack = 1000;
    this.adsr_tdecay = 1000;
    this.adsr_lsustain = 80;
    this.adsr_rsustain = 100;
    this.adsr_trelease = 2000;
    this.adsr_curve_type = 1;
    this.vo_min_note = 0;
    this.vo_max_note = 120;
    this.lfo_curve_type_q1 = 2;
    this.lfo_curve_type_q2 = 2;
    this.lfo_curve_type_q3 = 3;
    this.lfo_curve_type_q4 = 3;
    this.lfo_phase = 0;
    this.lfo_duty = 50;
    this.lfo_period = 10000;
    this.lfo_midi_clk_mult = 1;
    this.lfo_midi_clk_div = 24;
    this.lfo_max_level = 20;
    this.lfo_pre_delay = 0;
    this.lfo_offset = 50;
    this.portamento_time = 0;
    this.portamento_type = 0;
    this.adsr_retrig_mode = 0;
    this.adsr_affect_osc = false;
    this.vel_affect_adsr = false;
    this.use_local_config_adsr = false;
    this.voice_retrigger = true;
    this.note_off_osc = false;
    this.lfo_affect_osc = false;
    this.lfo_use_midi_clock = false;
    this.lfo_single_cycle = false;
    this.lfo_stop = true;
    this.midi_ch = -1;
  }
}

class MidiChannelConfig {
  constructor(midi_ch = 0) {
    this.midi_ch = midi_ch;
    this.priority = 2;
    this.voice_sel = 0;
    this.bend_span = 2;
    this.merge_midi = 1;
  }
}

var DeviceConfig = {
  ports: [],
  midi_channels: [],
  voices: [],
  voices_midi_ch: [],
  voices_port: [],
  voices_port_used: [],
  voices_port_free: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  voices_assigned: ['V12','V11','V10','V9','V8','V7','V6','V5','V4','V3','V2','V1'],
  // Global clock — genComUseMIDIClock (param 12): false=internal, true=external
  global_use_midi_clock: false,
  // Global clock period in µs — genComClockPERIOD (param 13). 500000 µs = 120 BPM
  global_clock_period: 500000,
  // MIDI routing bitmasks, one per device — genCom*OPTIONS (params 6–11).
  // Index: 0=SER, 1=USB_DEV, 2=HOST1, 3=HOST2, 4=HOST3, 5=HOST4
  // Bits:  0=IN, 1=OUT, 2=THRU, 3=CLK, 4=SYX  (union MidiOption in MIDIDevice.h)
  device_options: [0, 0, 0, 0, 0, 0]
};

const FirmwareFunctions2Web = {
  [MIDINOFUNCTION]: "no-func",
  [MIDIVOICENOTE]: "note",
  [MIDIVOICEVEL]: "velocity",
  [MIDIVOICEGATE]: "gate",
  [MIDIVOICEADSR]: "adsr",
  [MIDIVOICEOSC]: "osc",
  [MIDIVOICELFO]: "lfo",
  [MIDIDRUMTRIG]: "drum",
  [MIDIMODECC]: "cc",
  [MIDIMODERPN]: "rpn",
  [MIDIMODENRPN]: "nrpn",
  [MIDIPRGCHANGE]: "pr-ch",
  [MIDIPITCHBEND]: "pitch-bend",
  [MIDIKEYPRESS]: "key-press",
  [MIDICHPRESS]: "ch-press",
  [MIDISTARTSTOP]: "st-sp",
  [MIDICONTSTOP]: "cont-stop",
  [MIDISTARTLATCH]: "st-latch",
  [MIDISTARTTRIG]: "st-trig",
  [MIDISTOPLATCH]: "sp-latch",
  [MIDISTOPTRIG]: "sp-trig",
  [MIDICONTLATCH]: "cont-latch",
  [MIDICONTTRIG]: "cont-trig",
  [MIDICLOCK]: "clock",
};
