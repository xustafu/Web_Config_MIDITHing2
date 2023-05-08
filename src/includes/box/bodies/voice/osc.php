<!-- BOX BODY NEW VOICE OSCILLATOR -->
<main class="box-body hidden" id="osc-body-<?=$port_id?>">
  
  <!-- OSCILLATOR VOICE -->
  <div class="body-selector-parent input-wrap" id="osc-voice-<?=$port_id?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label for="osc-voice-input-<?=$port_id?>" class="round-sm inline voice-tag"><?=$port_id?></label>
  </div>
  <!-- OSCILLATOR VOICE END -->

  <!-- OSCILLATOR OSC STOP -->
  <div class="toggle-wrap" id="osc-stop-<?=$port_id?>">
    <h3 class="box-body-select-title block">Stop</h3>
    <label for="osc-stop-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="NoteOffOsc"
      name="osc-stop-input-<?=$port_id?>" 
      id="osc-stop-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- OSCILLATOR OSC STOP END -->

  <!-- OSCILLATOR OSC LFO-OSC -->
  <div class="toggle-wrap" id="osc-lfosc-<?=$port_id?>">
    <h3 class="box-body-select-title block">LFO-OSC</h3>
    <label for="osc-lfosc-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="LFOAffectOSC"
      name="osc-lfosc-input-<?=$port_id?>" 
      id="osc-lfosc-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- OSCILLATOR OSC LFO-OSC END -->

  <!-- OSCILLATOR ADSR-OSC -->
  <div class="toggle-wrap" id="osc-adsrosc-<?=$port_id?>">
    <h3 class="box-body-select-title block">ADSR-OSC</h3>
    <label for="osc-adsrosc-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="ADSRAffectOSC"
      name="osc-adsrosc-input-<?=$port_id?>" 
      id="osc-adsrosc-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- OSCILLATOR ADSR-OSC END -->

</main>
<!-- BOX BODY NEW VOICE OSCILLATOR END-->



  