// Data Structures of the Midi Thing as similar as possible to the ones defined
//  at the firmware developed by Sergio Retamero
// https://github.com/xustafu/midithing2

const digOutMax = 0x7fff;

/************************************************/
/*    SYSEX PARAMETERS (VOICE, PORT, MIDI)      */
/************************************************/
const GENERAL = 0;
const PORT = 1;
const MIDICH = 2;
const VOICE = 3;
const BATCH_SYSEX = 4;


/************************************************/
/*                Box Names (VOLTS)            */
/************************************************/
const BoxNames =  ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/************************************************/
/*                Port Modes (VOLTS)            */
/************************************************/
const NOPORTMODE = 0;
const MODE10V = 1;
const MODEPN5V = 2;
//const MODENEG10V = 3;
const MODE8V = 3;
const MODE5V = 4;
const LASTPORTMODE = 5;


const VoltsNames = [
  [MODE10V, '0/10'],
  [MODEPN5V, '-5/5'],
  //[MODENEG10V, '-10/0'],
  [MODE8V, '0/8'],
  [MODE5V, '0/5']
]; 
/************************************************/
/*                Port Types                    */
/************************************************/
const NOPORTTYPE = 0;
const DIGINPUT = 1;
const DIGOUTPUT = 2;
const DACINPUT = 3;
const DACOUTPUT = 4;
const MAXDIGINPUT = 5;
const MAXDIGOUTPUT = 6;
const MAXADCINPUT = 7;
const MAXDACOUTPUT = 8;
const MAXDACOUTMON = 9;
const MAXHIGHIMP = 10;
const SERIALINPUT = 10;
const SERIALOUTPPUT = 11;
const I2CINPUT = 12;
const I2COUTPUT = 13;
const LASTPORTTYPE = 14;

const PORTTYPES = [
  NOPORTTYPE, DIGINPUT, DIGOUTPUT, DACINPUT, DACOUTPUT, 
  MAXDIGINPUT, MAXDIGOUTPUT, MAXADCINPUT, MAXDACOUTPUT, MAXDACOUTMON, 
  SERIALINPUT, SERIALOUTPPUT, I2CINPUT, I2COUTPUT, LASTPORTTYPE
];

/************************************************/
/*                  MIDI STATUS                 */
/************************************************/

const STATUS_BYTE = 0x80;
const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const POLY_KEY_PRESSURE = 0xa0;
const CONTROL_CHANGE = 0xb0;
const PROGRAM_CHANGE = 0xc0;
const CHANNEL_PRESSURE = 0xd0;
const PITCH_BEND_CHANGE = 0xe0;
const SYSTEM_COMMON = 0xf0;
const MIDI_SYSEX = 0xf0;
const TIME_CODE_QUARTER_FRAME = 0xf1;
const SONG_POSITION_PTR = 0xf2;
const SONG_SELECT = 0xf3;
const RESERVED_F4 = 0xf4;
const RESERVED_F5 = 0xf5;
const TUNE_REQUEST = 0xf6;
const SYSEX_EOX = 0xf7;
const SYSTEM_REAL_TIME = 0xf8;
const TIMING_CLOCK = 0xf8;
const RESERVED_F9 = 0xf9;
const MIDI_START = 0xfa;
const MIDI_CONTINUE = 0xfb;
const MIDI_STOP = 0xfc;
const RESERVED_FD = 0xfd;
const ACTIVE_SENSING = 0xfe;
const MIDI_SYSTEM_RESET = 0xff;
const MIDI_CHANNEL_MASK = 0x0f;
const MIDI_STATUS_MASK = 0xf0;


/************************************************/
/*                Port Functions                    */
/************************************************/

const MIDINOFUNCTION = 0;
const MIDIVOICENOTE = 1; // Note value in VOICE. First Voice function
const MIDIVOICEVEL = 2;
const MIDIVOICEGATE = 3;
const MIDIVOICEADSR = 4;
const MIDIVOICEOSC = 5;
const MIDIVOICELFO = 6; // Last Voice function
const MIDIDRUMTRIG = 7; // Individual Note value as trigger
const MIDIMODECC = 8; // All CC values
const MIDIMODERPN = 9; // RPN: Specific CC combination as per MIDI specs
const MIDIMODENRPN = 10; // NRPN: Specific CC combination as per MIDI specs
const MIDIPRGCHANGE = 11; // First message stored in MIDIChannel::_msgSub
const MIDIPITCHBEND = 12;
const MIDIKEYPRESS = 13;
const MIDICHPRESS = 14; // Last message stored in MIDIChannel::_msgSub
const MIDISTARTSTOP = 15;
const MIDICONTSTOP = 16;
const MIDISTARTLATCH = 17;
const MIDISTARTTRIG = 18;
const MIDISTOPLATCH = 19;
const MIDISTOPTRIG = 20;
const MIDICONTLATCH = 21;
const MIDICONTTRIG = 22;
const MIDICLOCK = 23;
const FUNCDIGOSC = 24;
const GENADCINPUT = 25; // Generic functions for analog input
const GENDIGINPUT = 26; // Generic functions for digital input
const MIDIOTHERFUNC = 27;

DEF_FUNCT_VALUES = {
  [MIDINOFUNCTION] : { volts: MODE10V, min: 0, max: 127, midich: 1, param: 0},
  [MIDIVOICENOTE]: { volts: MODE10V,  min: 0, max: 120, midich: 1, param: 0},
  [MIDIVOICEVEL]: { volts: MODE10V,   min: 0, max: 120, midich: 1, param: 0},
  [MIDIVOICEGATE]: { volts: MODE10V,  min: 0, max: 120, midich: 1, param: 0},
  [MIDIVOICEADSR]: { volts: MODE10V,  min: 0, max: 120, midich: 1, param: 0},
  [MIDIVOICEOSC]: { volts: MODE10V,   min: 0, max: 120, midich: 1, param: 0},
  [MIDIVOICELFO]: { volts: MODEPN5V,  min: 0, max: 120, midich: 1, param: 0},
  [MIDIDRUMTRIG]: { volts: MODE10V,   min: 0, max: 120, midich: 1, param: 0},
  [MIDIMODECC]: { volts: MODE10V,     min: 0, max: 127, midich: 1, param: 0},
  [MIDIMODERPN]: { volts: MODE10V,    min: 0, max: 16383, midich: 1, param: 0},
  [MIDIMODENRPN]: { volts: MODE10V,   min: 0, max: 16383, midich: 1, param: 0},
  [MIDIPRGCHANGE]: { volts: MODE10V,  min: 0, max: 127, midich: 1, param: PROGRAM_CHANGE},
  [MIDIPITCHBEND]: { volts: MODEPN5V,  min: 0, max: 16383, midich: 1, param: PITCH_BEND_CHANGE},
  [MIDIKEYPRESS]: { volts: MODE10V,   min: 0, max: 127, midich: 1, param: POLY_KEY_PRESSURE},
  [MIDICHPRESS]: { volts: MODE10V,    min: 0, max: 127, midich: 1, param: CHANNEL_PRESSURE},
  [MIDISTARTSTOP]: { volts: MODE10V,  min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDICONTSTOP]: { volts: MODE10V,   min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDISTARTLATCH]: { volts: MODE10V, min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDISTARTTRIG]: { volts: MODE10V,  min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDISTOPLATCH]: { volts: MODE10V,  min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDISTOPTRIG]: { volts: MODE10V,   min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDICONTLATCH]: { volts:MODE10V,  min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDICONTTRIG]: { volts:MODE10V,   min: 0, max: digOutMax, midich: 1, param: 0},
  [MIDICLOCK]: { volts: MODE10V,      min: 0, max: digOutMax, midich: 1, param: 24}
}

/************************************************/
/*              PORT PARAMETERS                 /*
/************************************************/

// commented part: from firmware (Sergio)
const NOPORTPAR=0;
const PORTTYPE=1; //, "TYPE", u8T, NOPORTTYPE, NOPORTTYPE, LASTPORTTYPE},
const PORTMODE=2; //, "MODE", u8T, MODE10V, MODE10V, MODEPN5V},
const PORTFUNCTION=3; //, "FUNCTION", u8T, MIDINOFUNCTION, MIDINOFUNCTION, MIDIOTHERFUNC},
const PORTMINVAL=4; //, "MIN", i16T, 0, 0, 127},
const PORTMAXVAL=5; //, "MAX", i16T, 127, 0, 127},
const PORTMIDICHAN=6; //, "MIDI CH.", u8T, 1, 1, 16},
const PORTFUNCPARAMETER=7; //, "PARAMETER", i32T, 0, 0, 127},
const PORTCLIPMINVAL=8; //, "CLIPMIN", i16T, 0, 0, 127},
const PORTCLIPMAXVAL=9; //, "CLIPMAX", i16T, 127, 0, 127},
const PORTDELAY=10; //, "DELAY", u32T, 0, 0, 1000},          // 1 second max
const PORTPULSETIME=11; //, "PULSE", u32T, 10, 1, 500},      // Pulse Width in ms: 10 msec default, 5 secs max
const PORTPERIOD=12; //, "PERIOD", u32T, 1136, 40, 1000000}, // 440 Hz default, 2Hz max frequency
const PORTCLKDIV=13; //, "CLK DIVISOR", u16T, 24, 1, 48},     // MIDI Clock Divider (how many msgs per pulse)
const PORTCLKPULSEWIDTH=14; //, "CLK WIDTH", u8T, 10, 1, 99}, // MIDI Clock Pulse Width in ms
const PORTCLKMULT=15; //, "CLK MULTI", u8T, 1, 1, 50},        // MIDI Clock Multi (how many msgs per pulse)
const PORTSTStCLOCK=100; //, "Start/Stop Clock", boolT, 1, 0, 1},
const PORTUseMIDIClock=101; //, "Use MIDI Clock", boolT, 1, 0, 1},
const PORTGATEPULSE=102; //, "Gate Pulse", boolT, 0, 0, 1}

/************************************************/
/*              VOICE PARAMETERS                */
/************************************************/

const NOVOICEPAR=0;
const ADSRTPredelay=1; // "T.Predelay", u32T, 0, 0, MAXTIMEADSR},
const ADSRLMax=2; // "Max Level", u8T, 100, 1, 100}, // u32T, 10000, 0, MAXTIMEADSR}, //
const ADSRTAttack=3; // "T.Attack", u32T, 1000, 1, MAXTIMEADSR},
const ADSRTDecay=4; // "T.Decay", u32T, 1000, 1, MAXTIMEADSR},
const ADSRLSustain=5; // "Sustain Level", u8T, 80, 1, 100}, // u32T, 10000, 0, MAXTIMEADSR}, //
const ADSRRSustain=6; // i16T, 100, -500, 500},  // u32T, 10000, 0, MAXTIMEADSR},  //
const ADSRTRelease=7; // "T.Release", u32T, 2000, 1, MAXTIMEADSR},
const ADSRCurveType=8; // "ADSR Curve", u8T, ADSR_EXP_CURVE, ADSR_LIN_CURVE, ADSR_LAST_CURVE - 1},
const VO_MinNote=9; // "Voice min Note", u8T, 0, 1, 127},
const VO_MaxNote=10; // "Voice MAX Note", u8T, 120, 1, 127},
const LFOCurveTypeQ1=11; // "LFO Curve Q1", u8T, LFO_EXP_CURVE, LFO_TRI_CURVE, LFO_LAST_CURVE - 1},
const LFOCurveTypeQ2=12; // "LFO Curve Q2", u8T, LFO_EXP_CURVE, LFO_TRI_CURVE, LFO_LAST_CURVE - 1},
const LFOCurveTypeQ3=13; // "LFO Curve Q3", u8T, LFO_SINE_CURVE, LFO_TRI_CURVE, LFO_LAST_CURVE - 1},
const LFOCurveTypeQ4=14; // "LFO Curve Q4", u8T, LFO_SINE_CURVE, LFO_TRI_CURVE, LFO_LAST_CURVE - 1},
const LFOPhase=15; // "LFO Phase", u8T, 0, 0, 71},                     // LFO Phase in 5 degrees step (72 steps)
const LFODuty=16; // "LFO Duty", u8T, 50, 1, 99},                      // LFO duty cycle in percent (0-99)
const LFOPeriod=17; // "LFO Period", u32T, 10000lu, 100, MAXLFOPeriod}, // Period 1000 to 0.1 Hz
const LFOMIDIClkDiv = 18; //"LFO Clk Div", u8T, 24, 1, 30},             // Period 1000 to 0.1 Hz
const LFOMaxLevel=19; // "LFO Max evel", u8T, 20, 1, 100},            // Max LFO level
const LFOPreDelay=20; // "T.Predelay", u32T, 0, 0, 10000},      // LFO Pre delay
const PORTAMENTOTime=21; // "Portamento Time", u32T, 1000lu, 1, MAXPORTAMENTOTIME}, 
const PORTAMENTOType=22; // "Portamento Type", u8T, PORTA_LIN_CURVE, PORTA_LIN_CURVE, PORTA_LAST_CURVE-1}, 
const ADSRRetrigMode=23; // "ADSR Retrigger Mode", u8T, 0, 0, 2},
const LFOMIDIClkMult=24; // "LFO Clk Mult", u8T, 1, 1, 30},             // Period 1000 to 0.1 Hz
const LFOOffset=25;      // "LFO Offset", u8T, 50, 0, 100},            // Offset LFO level
const ADSRAffectOSC=100; // "ADSR in OSC", boolT, 1, 0, 1},
const VelAffectADSR=101; // "Vel.Impact", boolT, 1, 0, 1},
const UseLocalConfigADSR=102; // "ADSR local config", boolT, 0, 0, 1},
const VOICERetrigger=103; // "Retrigger Gate", boolT, 1, 0, 1},
const NoteOffOsc=104; // "Retrigger Gate", boolT, 0, 0, 1},
const LFOAffectOSC=105; // "LFO in OSC", boolT, 0, 0, 1},
const LFOUseMIDIClock=106; // "LFO use MIDI Clock", boolT, 0, 0, 1},
const LFOSingleCycle=107; // "LFO single Cycle", boolT, 0, 0, 1});

const GlideModes = ["Lineal", "Fast", "Slow"];
const ADSRGlobalNames = ["Global", "Local"];
const ADSRCurveTypes = ["Lineal", "Exp.", "Slow"];
const MIDIClockNames = {
  1: "qn/24", 3: "32th", 6: "16th", 12:"8th", 24: "quart",
  48: "half", 96: "whole", 192: "double", 384: "long"
};
const LFOCurvesPNG = {
  1: "tri",
  2: "round",
  3: "sin",
  4: "sq",
  5: "saw_up",
  6: "saw_down",
  7: "saw_rand",
};

const ADSRRetrigNames = {
  0: "Continue",
  1: "No Retrigger",
  2: "Retrigger"
}


/************************************************/
/*              MIDI CHANNEL PARAMETERS         */
/************************************************/

/* DEFINITION OF MIDI VALUES AT FIRMWARE (SERGIO) */

const MIDICHPRIORITY=17; // , "PRIORITY", u8T, PR_LASTNOTE, PR_NOSTEALING, PR_HIGHNOTE}, // Note priority algorithm
const MIDICHVOICESEL=18; // , "VOICE SEL", u8T, VS_LOW, VS_LOW, VS_ROUNDROBIN}, // Voice selection algorithm
const MIDICHBENDSPAN=19; // , "BEND SPAN", u8T, 2, 0, 48}, // Pitch Bend affects voices in the channel +/- number of semitones
const MIDICHMERGEMIDI=20; // , "MIDI MERGE", u8T, 1, 0, 1}

const AssignNames = ["Low", "Round Robin"];
const PriorityNames = ["No Steal", "First", "Last", "Low", "High"];


/************************************************/
/*            SYSEX GENERAL COMMANDS            */
/************************************************/
const SET_DEF_CONFIG = 0;
const REQ_CONFIG = 1;
const SAVE_CONFIG_TO_SLOT = 2;
const LOAD_CONFIG_FROM_SLOT = 3;
const SET_LEARN_MODE = 4;
const MIDI_MERGE = 5;




/************************************************/
/*          DEFAULT CONFIGS                     */
/************************************************/
const POLYPHONY = 0;
//const POLYPHONY_OSC = 1;
const MULTI_TIMBRIC = 1;
//const MULTI_TIMBRIC_OSC = 3;
const DRUM_MODE = 2;
const VCV_PITCH_BEND = 3;
const DRUM_MODE_MIX = 4;
const CCS_MIX = 5;
const BLANK_PRESET = 6;

const DEFAULT_CONFIGS = {
  // Initial configuration of Midi Thing as stated in the firmware
  [POLYPHONY]: [
    [1, "Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 0],
    [2, "Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 1, 0],
    [3, "Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 1, 0],
    [4, "Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 3],
    [5, "Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 1, 3],
    [6, "Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 1, 3],
    [7, "Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 6],
    [8, "Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 1, 6],
    [9, "Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 1, 6],
    [10, "Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 9],
    [11, "Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 1, 9],
    [12, "Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 1, 9]/*,
    [13, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20, "Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  /*[POLYPHONY_OSC]: [
    [1,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 0],
    [2,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 1, 0],
    [3,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 1, 0],
    [4,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 3],
    [5,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 1, 3],
    [6,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 1, 3],
    [7,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 6],
    [8,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 1, 6],
    [9,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 1, 6],
    [10,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 9],
    [11,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 1, 9],
    [12,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 1, 9]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]
  ],*/
  [MULTI_TIMBRIC]: [
    [1,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 0],
    [2,"Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 1, 0],
    [3,"Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 1, 0],
    [4,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 2, 3],
    [5,"Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 2, 3],
    [6,"Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 2, 3],
    [7,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 3, 6],
    [8,"Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 3, 6],
    [9,"Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 3, 6],
    [10,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 4, 9],
    [11,"Voice Gate", MAXDACOUTPUT, MODE10V, MIDIVOICEGATE, 0, 120, 4, 9],
    [12,"Voice Vel ", MAXDACOUTPUT, MODE10V, MIDIVOICEVEL, 0, 127, 4, 9]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  /*[MULTI_TIMBRIC_OSC]: [
    [1,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 1, 0],
    [2,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 1, 0],
    [3,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 1, 0],
    [4,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 2, 3],
    [5,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 2, 3],
    [6,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 2, 3],
    [7,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 3, 6],
    [8,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 3, 6],
    [9,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 3, 6],
    [10,"Voice Note", MAXDACOUTPUT, MODE10V, MIDIVOICENOTE, 0, 120, 4, 9],
    [11,"Voice Osc ", MAXDIGOUTPUT, MODE10V, MIDIVOICEOSC, 0, 120, 4, 9],
    [12,"Voice ADSR", MAXDACOUTPUT, MODE10V, MIDIVOICEADSR, 0, 120, 4, 9]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]
  ],*/
  [DRUM_MODE]: [
    [1,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 35, 35, 10, 0],
    [2,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 38, 38, 10, 1],
    [3,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 39, 39, 10, 2],
    [4,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 41, 41, 10, 3],
    [5,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 42, 42, 10, 4],
    [6,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 43, 43, 10, 5],
    [7,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 44, 44, 10, 6],
    [8,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 45, 45, 10, 7],
    [9,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 46, 46, 10, 8],
    [10,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 47, 47, 10, 9],
    [11,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 48, 48, 10, 10],
    [12,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 49, 49, 10, 11]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  [DRUM_MODE_MIX]: [
    [1,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 35, 35, 10, 0],
    [2,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 38, 38, 10, 1],
    [3,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 39, 39, 10, 2],
    [4,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 41, 41, 10, 3],
    [5,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 42, 42, 10, 4],
    [6,"Voice Drum", MAXDACOUTPUT, MODE10V, MIDIDRUMTRIG, 43, 43, 10, 5],
    [7,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 10, 14],
    [8,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 10, 15],
    [9,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 10, 16],
    [10,"Clock 1", MAXDIGOUTPUT, MODE10V, MIDICLOCK, 0, digOutMax, 1, 24],
    [11,"Clock 2", MAXDIGOUTPUT, MODE10V, MIDICLOCK, 0, digOutMax, 1, 12],
    [12,"Start/Stop", MAXDIGOUTPUT, MODE10V, MIDISTARTSTOP, 0, digOutMax, 1, 0]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  [CCS_MIX]: [
    [1,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 14],
    [2,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 15],
    [3,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 16],
    [4,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 17],
    [5,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 18],
    [6,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 19],
    [7,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 20],
    [8,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 21],
    [9,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 22],
    [10,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 23],
    [11,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 24],
    [12,"CC", MAXDACOUTPUT, MODE10V, MIDIMODECC, 0, 127, 1, 25]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  [VCV_PITCH_BEND]: [
    [1,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 1, PITCH_BEND_CHANGE],
    [2,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 2, PITCH_BEND_CHANGE],
    [3,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 3, PITCH_BEND_CHANGE],
    [4,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 4, PITCH_BEND_CHANGE],
    [5,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 5, PITCH_BEND_CHANGE],
    [6,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 6, PITCH_BEND_CHANGE],
    [7,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 7, PITCH_BEND_CHANGE],
    [8,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 8, PITCH_BEND_CHANGE],
    [9,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 9, PITCH_BEND_CHANGE],
    [10,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 10, PITCH_BEND_CHANGE],
    [11,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 11, PITCH_BEND_CHANGE],
    [12,"Pitch Bend", MAXDACOUTPUT, MODEPN5V, MIDIPITCHBEND, 0, 16383, 12, PITCH_BEND_CHANGE]/*,
    [13,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [14,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [15,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [16,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [17,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [18,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [19,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [20,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ],
  [BLANK_PRESET]: [
    [1,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [2,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [3,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [4,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [5,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [6,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [7,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [8,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [9,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [10,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [11,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0],
    [12,"No Function",     MAXHIGHIMP,   MODE10V, MIDINOFUNCTION, 0, 127, 1, 0]/*,
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 12],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 13],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 14],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 15],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 16],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 17],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 18],
    [1,"Voice Gate", MAXDIGOUTPUT, MODE5V, GENDIGOUTPUT, 0, 120, 1, 19]*/
  ]
};

/************************************************/
/*             SYSEX OBJECT                     */
/************************************************/

const SYSEX_OBJ = {
  [GENERAL]: {
    [SET_DEF_CONFIG]: { index: 0, type: "Uint16", length: 2 },
    [REQ_CONFIG]: { index: 1, type: "Uint16", length: 2 },
    [SAVE_CONFIG_TO_SLOT]: { index: 2, type: "Uint16", length: 2 },
    [LOAD_CONFIG_FROM_SLOT]: { index: 3, type: "Uint16", length: 2 },
    [SET_LEARN_MODE]: { index: 4, type: "Uint16", length: 2 },
    [MIDI_MERGE]: { index: 5, type: "Uint16", length: 2 },
  },
  [PORT]: {
    [PORTTYPE]: { index: 1, type: "Uint8", length: 1, attr: "type" },
    [PORTMODE]: { index: 2, type: "Uint8", length: 1, attr: "volts" },
    [PORTFUNCTION]: { index: 3, type: "Uint16", length: 6, attr: "funct" },
    [PORTMINVAL]: { index: 4, type: "Int16", length: 2, attr: "min" },
    [PORTMAXVAL]: { index: 5, type: "Int16", length: 2, attr: "max" },
    [PORTMIDICHAN]: { index: 6, type: "Uint8", length: 1, attr: "midi_ch" },
    [PORTFUNCPARAMETER]: { index: 7, type: "Int32", length: 4, attr: "param" },
    [PORTCLIPMINVAL]: { index: 8, type: "Int16", length: 2, attr: "clip_min" },
    [PORTCLIPMAXVAL]: { index: 9, type: "Int16", length: 2, attr: "clip_max" },
    [PORTDELAY]: { index: 10, type: "Uint32", length: 4, attr: "delay" },
    [PORTPULSETIME]: { index: 11, type: "Uint32", length: 4, attr: "pulse_time" },
    [PORTPERIOD]: { index: 12, type: "Uint32", length: 4, attr: "period" },
    [PORTCLKDIV]: { index: 13, type: "Uint16", length: 2, attr: "clk_div" },
    [PORTCLKPULSEWIDTH]: { index: 14, type: "Uint8", length: 1, attr: "clk_pulse_width" },
    [PORTCLKMULT]: { index: 15, type: "Uint8", length: 1, attr: "clk_mult" },
    [PORTSTStCLOCK]: { index: 100, type: "Uint8", length: 1, attr: "start_stop_clock" },
    [PORTUseMIDIClock]: { index: 101, type: "Uint8", length: 1, attr: "use_midi_clock" },
    [PORTGATEPULSE]: { index: 102, type: "Uint8", length: 1, attr: "gate_pulse" },
  },
  [MIDICH]: {
    [MIDICHPRIORITY]: { index: 17, type: "Uint8", length: 1, attr: "priority" },
    [MIDICHVOICESEL]: { index: 18, type: "Uint8", length: 1, attr: "voice_sel" },
    [MIDICHBENDSPAN]: { index: 19, type: "Uint8", length: 1, attr: "bend_span" },
    [MIDICHMERGEMIDI]: { index: 20, type: "Uint8", length: 1, attr: "merge_midi" },
  },
  [VOICE]: {
    [ADSRTPredelay]: { index: 1, type: "Uint32 ", length: 4, attr: "adsr_tpredelay" },
    [ADSRLMax]: { index: 2, type: "Uint8", length: 1, attr: "adsr_lmax"  },
    [ADSRTAttack]: { index: 3, type: "Uint32", length: 4, attr: "adsr_tattack" },
    [ADSRTDecay]: { index: 4, type: "Uint32", length: 4, attr: "adsr_tdecay" },
    [ADSRLSustain]: { index: 5, type: "Uint8", length: 1, attr: "adsr_lsustain" },
    [ADSRRSustain]: { index: 6, type: "Int16", length: 2, attr: "adsr_rsustain" },
    [ADSRTRelease]: { index: 7, type: "Uint32", length: 4, attr: "adsr_trelease" },
    [ADSRCurveType]: { index: 8, type: "Uint8", length: 1, attr: "adsr_curve_type" },
    [VO_MinNote]: { index: 9, type: "Uint8", length: 1, attr: "vo_min_note" },
    [VO_MaxNote]: { index: 10, type: "Uint8", length: 1, attr: "vo_max_note" },
    [LFOCurveTypeQ1]: { index: 11, type: "Uint8", length: 1, attr: "lfo_curve_type_q1" },
    [LFOCurveTypeQ2]: { index: 12, type: "Uint8", length: 1, attr: "lfo_curve_type_q2" },
    [LFOCurveTypeQ3]: { index: 13, type: "Uint8", length: 1, attr: "lfo_curve_type_q3" },
    [LFOCurveTypeQ4]: { index: 14, type: "Uint8", length: 1, attr: "lfo_curve_type_q4" },
    [LFOPhase]: { index: 15, type: "Uint8", length: 1, attr: "lfo_phase" },
    [LFODuty]: { index: 16, type: "Uint8", length: 1, attr: "lfo_duty" },
    [LFOPeriod]: { index: 17, type: "Uint32", length: 4, attr: "lfo_period" },
    [LFOMIDIClkDiv]: { index: 18, type: "Uint8", length: 1, attr: "lfo_midi_clk_div" },
    [LFOMaxLevel]: { index: 19, type: "Uint8", length: 1, attr: "lfo_max_level" },
    [LFOPreDelay]: { index: 20, type: "Uint32", length: 4, attr: "lfo_pre_delay" },
    [PORTAMENTOTime]: { index: 21, type: "Uint32", length: 4, attr: "portamento_time" },
    [PORTAMENTOType]: { index: 22, type: "Uint8", length: 1, attr: "portamento_type" },
    [ADSRRetrigMode]: { index: 23, type: "Uint8", length: 1, attr: "adsr_retrig_mode"},
    [LFOMIDIClkMult]: { index: 24, type: "Uint8", length: 1, attr: "lfo_midi_clk_mult" },
    [LFOOffset]:     {index: 25, type: "Uint8", length: 1, attr:"lfo_offset" },
    [ADSRAffectOSC]: { index: 100, type: "Uint8", length: 1, attr: "adsr_affect_osc" },
    [VelAffectADSR]: { index: 101, type: "Uint8", length: 1, attr: "vel_affect_adsr" },
    [UseLocalConfigADSR]: { index: 102, type: "Uint8", length: 1, attr: "use_local_config_adsr" },
    [VOICERetrigger]: { index: 103, type: "Uint8", length: 1, attr: "voice_retrigger" },
    [NoteOffOsc]: { index: 104, type: "Uint8", length: 1, attr: "note_off_osc" },
    [LFOAffectOSC]: { index: 105, type: "Uint8", length: 1, attr: "lfo_affect_osc" },
    [LFOUseMIDIClock]: { index: 106, type: "Uint8", length: 1, attr: "lfo_use_midi_clock" },
    [LFOSingleCycle]: { index: 107, type: "Uint8", length: 1, attr: "lfo_single_cycle" },
  },
};
