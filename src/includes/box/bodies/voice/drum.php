<!-- BOX BODY NEW VOICE DRUM -->
<main class="box-body hidden" id="drum-body-<?=$port_id?>">
  
  <!-- DRUM VOICE -->
  <div class="body-selector-parent input-wrap" id="drum-voice-<?=$port_id?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label id="label-drum-voice-<?=$port_id?>" class="round-sm inline voice-tag"><?=$port_id?></label>
  </div>
  <!-- DRUM VOICE END -->

  <!-- DRUM NOTE -->
  <div class="box-num-single" id="drum-note-<?=$port_id?>">
    <label class="box-num-single-label" for="drum-note-input-<?=$port_id?>">Drum Note</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        data-mt-type="VOICE"
        data-mt-port="<?=$i?>"
        data-mt-parameter="VO_MinNote"
        name="drum-note-input-<?=$port_id?>"
        id="drum-note-input-<?=$port_id?>"
        data-type="number"
        data-min="0"
        data-max="127"
        data-digits="3" />
      <span class="arrow-up drum-arrow"></span>
      <span class="arrow-down drum-arrow"></span>
    </div>
  </div>
  <!-- DRUM NOTE END -->

  <!-- DRUM DELAY -->
  <div class="box-num-single" id="drum-delay-<?=$port_id?>">
    <label class="box-num-single-label" for="drum-delay-input-<?=$port_id?>">Delay</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTDELAY"
        name="drum-delay-input-<?=$port_id?>"
        id="drum-delay-input-<?=$port_id?>"
        data-type="number"
        data-min="0"
        data-max="99999"
        data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- DRUM DELAY END -->

  <!-- DRUM RETRIG -->
  <div class="toggle-wrap" id="drum-retrig-<?=$port_id?>">
    <h3 class="box-body-select-title block">Retrig</h3>
    <label for="drum-retrig-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="VOICERetrigger"
      name="drum-retrig-input-<?=$port_id?>" 
      id="drum-retrig-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- DRUM RETRIG END -->

  <!-- DRUM PULSE -->
  <div class="toggle-wrap" id="drum-pulse-<?=$port_id?>">
    <h3 class="box-body-select-title block">Pulse</h3>
    <label for="drum-pulse-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="PORT"
      data-mt-port="<?=$i?>"
      data-mt-parameter="PORTGATEPULSE"
      name="drum-pulse-input-<?=$port_id?>" 
      id="drum-pulse-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- DRUM PULSE END -->

</main>
<!-- BOX BODY NEW VOICE DRUM END-->



  