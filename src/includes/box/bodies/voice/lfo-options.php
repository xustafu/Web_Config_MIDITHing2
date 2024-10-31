<!-- BOX BODY NEW VOICE LFO -->
<main class="box-body multiple-box hidden box-lfo-<?=$port_id?>" id="lfo-options-<?=$port_id?>" data-sendtype="lfo-<?= $port_id?>">
  
  <!-- LFO PREDELAY -->
  <div class="box-num-single" id="lfo-options-predelay-<?=$port_id?>">
    <label class="box-num-single-label block" for="lfo-options-predelay-input-<?=$port_id?>">Pre-Delay ms</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        data-mt-type="VOICE" 
        data-mt-port="<?=$i?>" 
        data-mt-parameter="LFOPreDelay" 
        name="lfo-options-predelay-input-<?=$port_id?>"
        id="lfo-options-predelay-input-<?=$port_id?>"
        data-type="number"
        data-min="0"
        data-max="999"
        data-digits="3"
        />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- LFO PREDELAY END -->

  <!-- LFO SINGLE SHOT TOGGLE -->
  <div class="toggle-wrap" id="lfo-options-singleshot-<?=$port_id?>">
    <h3 class="box-body-select-title block">Single Shot</h3>
    <label for="lfo-options-singleshot-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE" 
      data-mt-port="<?=$i?>" 
      data-mt-parameter="LFOSingleCycle" 
      name="lfo-options-singleshot-input-<?=$port_id?>" 
      id="lfo-options-singleshot-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- LFO SINGLE SHOT TOGGLE END -->

  <!-- LFO LFO-OSC TOGGLE -->
  <div class="toggle-wrap" id="lfo-options-lfo-osc-<?=$port_id?>">
    <h3 class="box-body-select-title block">LFO-OSC</h3>
    <label for="lfo-options-lfo-osc-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE" 
      data-mt-port="<?=$i?>" 
      data-mt-parameter="LFOAffectOSC" 
      name="lfo-options-lfo-osc-input-<?=$port_id?>" 
      id="lfo-options-lfo-osc-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- LFO LFO-OSC TOGGLE END -->

  <!-- LFO CONF BACK BUTTON -->
  <button 
    type="button" 
    class="back-button round-l reveal"
    data-show="lfo-body-<?=$port_id?>"
    data-hide="lfo-options-<?=$port_id?>"
  >
  <span class="arrow-back"></span>Back</button>
  <!-- LFO CONF BACK BUTTON END -->

  <!-- LFO STOP -->
  <div class="toggle-wrap" id="lfo-stop-<?=$port_id?>">
    <h3 class="box-body-select-title">Stop</h3>
    <label for="lfo-stop-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="LFOUseNoteOff"
      name="lfo-stop-input-<?=$port_id?>" 
      id="lfo-stop-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- CLOCK STOP END -->  
</main>
<!-- BOX BODY NEW VOICE LFO END-->