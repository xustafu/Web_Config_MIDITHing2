// Human-readable target-parameter reference tables for the Mappings tab.
// Keyed by MAP_TGT_TYPE (PORT/MIDICH/VOICE — General is not offered in this UI, see
// the mapping implementation plan). Lets the user pick "Max Value" from a list instead
// of typing a bare numeric cfgId, unlike the firmware repo's reference test tool.
// Loaded as a classic script (see index.php), same as dataStructures.js — its consts
// are used directly by domScripts.js/sysexMgt.js/mappingsUI.js without imports.

const MAP_TARGET_PARAMS = {
  [PORT]: [
    { id: PORTMINVAL, label: "Min Value" },
    { id: PORTMAXVAL, label: "Max Value" },
    { id: PORTMIDICHAN, label: "MIDI Channel" },
    { id: PORTCLIPMINVAL, label: "Clip Min" },
    { id: PORTCLIPMAXVAL, label: "Clip Max" },
    { id: PORTDELAY, label: "Delay (ms)" },
    { id: PORTPULSETIME, label: "Pulse Time (ms)" },
    { id: PORTPERIOD, label: "Period" },
    { id: PORTCLKDIV, label: "Clock Divisor" },
    { id: PORTCLKPULSEWIDTH, label: "Clock Pulse Width" },
    { id: PORTCLKMULT, label: "Clock Multiplier" },
    { id: 16, label: "Glide Time" },  // PORTGLIDETIME — not a named const in this app yet, nothing else here uses it
    { id: 17, label: "Glide Type" },  // PORTGLIDETYPE
    { id: PORTCALMIN, label: "Calibration Min" },
    { id: PORTCALMAX, label: "Calibration Max" },
    { id: PORTGATEPULSE, label: "Gate Pulse" },
    // PORTTYPE/PORTMODE/PORTFUNCTION intentionally omitted — these change what a port
    // *is*, not a live value; mapping a CC onto them fights the web UI's own
    // function-selection state.
  ],
  [MIDICH]: [
    { id: MIDICHPRIORITY, label: "Note Priority" },
    { id: MIDICHVOICESEL, label: "Voice Selection" },
    { id: MIDICHBENDSPAN, label: "Bend Span" },
    { id: MIDICHMERGEMIDI, label: "MIDI Merge" },
  ],
  [VOICE]: [
    { id: ADSRTPredelay, label: "ADSR Pre-delay" },
    { id: ADSRLMax, label: "ADSR Max Level" },
    { id: ADSRTAttack, label: "ADSR Attack Time" },
    { id: ADSRTDecay, label: "ADSR Decay Time" },
    { id: ADSRLSustain, label: "ADSR Sustain Level" },
    { id: ADSRRSustain, label: "ADSR Sustain Ramp" },
    { id: ADSRTRelease, label: "ADSR Release Time" },
    { id: VO_MinNote, label: "Voice Min Note" },
    { id: VO_MaxNote, label: "Voice Max Note" },
    { id: LFOPhase, label: "LFO Phase" },
    { id: LFODuty, label: "LFO Duty" },
    { id: LFOPeriod, label: "LFO Period" },
    { id: LFOMaxLevel, label: "LFO Max Level" },
    { id: LFOPreDelay, label: "LFO Pre-delay" },
    { id: PORTAMENTOTime, label: "Portamento Time" },
    { id: LFOOffset, label: "LFO Offset" },
    // Curve-type/retrig-mode/boolean toggle fields (ADSRCurveType, LFOCurveTypeQ1-4,
    // ADSRRetrigMode, ADSRAffectOSC, etc.) intentionally omitted — enum/boolean
    // settings, not continuous values a MIDI knob sweep makes sense against.
  ],
};

function getMappingTargetParams(targetType) {
  return MAP_TARGET_PARAMS[targetType] || [];
}
