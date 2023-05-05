<!-- BOX BODY NEW VOICE GATE -->
<main class="box-body hidden" id="gate-body-<?=$port_id?>">

  <!-- GATE VOICE -->
  <div class="body-selector-parent input-wrap" id="gate-voice-<?=$port_id?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label for="gate-voice-input-<?=$port_id?>" class="box-selector-label round-sm inline"><?=$port_id?></label>
  </div>
  <!-- GATE VOICE END -->

  <!-- GATE DELAY -->
  <div class="box-num-single" id="gate-delay-<?=$port_id?>">
    <label class="box-num-single-label block" for="gate-delay-input-<?=$port_id?>">Delay</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTDELAY"
        name="gate-delay-input-<?=$port_id?>"
        id="gate-delay-input-<?=$port_id?>"
        data-type="number"
        data-min="0"
        data-max="99999"
        data-digits="5" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- GATE DELAY END -->

  <!-- GATE RETRIG -->
  <div class="toggle-wrap" id="gate-retrig-<?=$port_id?>">
    <h3 class="box-body-select-title block">Retrig</h3>
    <label for="gate-retrig-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="VOICERetrigger"
      name="gate-retrig-input-<?=$port_id?>" 
      id="gate-retrig-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- GATE RETRIG END -->

  <!-- GATE PULSE -->
  <div class="toggle-wrap" id="gate-pulse-<?=$port_id?>">
    <h3 class="box-body-select-title block">Pulse</h3>
    <label for="gate-pulse-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="PORT"
      data-mt-port="<?=$i?>"
      data-mt-parameter="PORTGATEPULSE"
      name="gate-pulse-input-<?=$port_id?>" 
      id="gate-pulse-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- GATE PULSE END -->
</main>
<!-- BOX BODY NEW VOICE GATE END-->
