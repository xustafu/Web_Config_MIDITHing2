<!-- BOX BODY NEW VOICE ADSR -->
<main class="box-body hidden" id="adsr-body-<?= $port_id ?>">
  
  <!-- ADSR VOICE -->
  <div class="body-selector-parent input-wrap" id="adsr-voice-<?= $port_id ?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label for="adsr-voice-input-<?= $port_id ?>" class="box-selector-label round-sm inline"><?= $port_id ?></label>
  </div>
  <!-- ADSR VOICE END -->

  <!-- ADSR VEL-ADSR -->
  <div class="toggle-wrap" id="adsr-vel-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Vel-ADSR</h3>
    <label for="adsr-vel-input-<?= $port_id ?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="VelAffectADSR"
      name="adsr-vel-input-<?= $port_id ?>" 
      id="adsr-vel-input-<?= $port_id ?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- ADSR VEL-ADSR END -->

  <!-- ADSR ADSR-OSC -->
  <div class="toggle-wrap" id="adsr-osc-<?= $port_id ?>">
    <h3 class="box-body-select-title block">ADSR-Osc</h3>
    <label for="adsr-osc-input-<?= $port_id ?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="ADSRAffectOSC"
      name="adsr-osc-input-<?= $port_id ?>" 
      id="adsr-osc-input-<?= $port_id ?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- ADSR ADSR-OSC END -->

  <!-- ADSR RETRIGGER -->
  <div class="body-selector-parent input-wrap" id="adsr-retrig-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Retrig.</h3>
    <input 
      type="hidden" 
      class="selector" 
      data-mt-type="VOICE" 
      data-mt-port="<?= $i ?>" 
      data-mt-parameter="ADSRRetrigMode" 
      name="adsr-retrig-input<?= $port_id ?>" 
      id="adsr-retrig-input-<?= $port_id ?>" 
      value="0" 
    />
    <label for="adsr-retrig-input-<?= $port_id ?>" class="box-selector-label round-sm block">Retriger</label>
    <ul class="selector-options hidden round-sm">
      <li class="box-selector-item" data-value="0">Retrigger</li>
      <li class="box-selector-item" data-value="1">No Retrigger</li>
      <li class="box-selector-item" data-value="2">Continue</li>
    </ul>
  </div>
  <!-- ADSR RETRIGGER END -->

  <!-- ADSR CONF BUTTON -->
  <button type="button" class="reveal for-button round-l draw_adsr" data-css="conf" data-port=<?= $port_id ?>
          data-show="adsr-conf-<?= $port_id ?>" data-hide="adsr-body-<?= $port_id ?>">
    <span class="arrow-for"></span>Conf.
  </button>
  <!-- ADSR CONF BUTTON END -->

</main>
<!-- BOX BODY NEW VOICE ADSR END-->