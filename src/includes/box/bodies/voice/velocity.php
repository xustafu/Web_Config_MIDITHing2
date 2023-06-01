<!-- BOX BODY NEW VOICE VELOCITY -->
<main class="box-body hidden" id="velocity-body-<?=$port_id?>">
  
  <!-- VELOCITY VOICE -->
  <div class="body-selector-parent input-wrap" id="velocity-voice-<?=$port_id?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label class="round-sm inline voice-tag"><?=$port_id?></label>
  </div>
  <!-- VELOCITY VOICE END -->

  <!-- VELOCITY VEL-ADSR -->
  <div class="toggle-wrap" id="velocity-vel-<?=$port_id?>">
    <h3 class="box-body-select-title block">Vel-ADSR</h3>
    <label for="velocity-vel-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="VOICE"
      data-mt-port="<?=$i?>"
      data-mt-parameter="VelAffectADSR"
      name="velocity-vel-input-<?=$port_id?>" 
      id="velocity-vel-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- VELOCITY VEL-ADSR END -->

</main>
<!-- BOX BODY NEW VOICE VELOCITY END-->