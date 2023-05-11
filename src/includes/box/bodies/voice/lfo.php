<!-- BOX BODY NEW VOICE LFO -->
<main class="box-body multiple-box hidden box-lfo-<?=$port_id?>" id="lfo-body-<?= $port_id ?>" data-sendtype="lfo-<?= $port_id?>">

  <!-- LFO VOICE -->
  <div class="body-selector-parent input-wrap" id="lfo-voice-<?= $port_id ?>">
    <h3 class="box-body-select-title inline">Voice</h3>
    <label for="lfo-voice-input-<?= $port_id ?>" class="round-sm inline voice-tag"><?= $port_id ?></label>
  </div>
  <!-- LFO VOICE END -->

  <!-- LFO FRE/CLOCK COMMUTER -->
  <div class="box-radio" id="lfo-com-<?= $port_id ?>">
    <form class="input-radio-wrap lfo-radio"> <!-- radio buttons have to be inside a form for the default check to show -->
      <input type="radio" id="lfo-com-freq-<?= $port_id ?>" class="box-radio lfo-radio-freq" name="lfo-com-radio" data-mt-type="VOICE" data-mt-port="<?= $i ?>" data-mt-parameter="LFOUseMIDIClock" value="0" checked="checked">
      <input type="radio" id="lfo-com-clock-<?= $port_id ?>" class="box-radio lfo-radio-clock" name="lfo-com-radio" data-mt-type="VOICE" data-mt-port="<?= $i ?>" data-mt-parameter="LFOUseMIDIClock" value="1">
    </form>
  </div>
  <!-- LFO FRE/CLOCK COMMUTER END -->

  <!-- LFO FREQ -->
  <div class="box-num-single" id="lfo-freq-<?= $port_id ?>">
    <div class="input-number-wrap round-sm">
      <label class="box-num-single-label" for="lfo-freq-input-<?= $port_id ?>">Freq. Hz</label>
      <input 
        class="box-num-input round-sm" 
        type="text" 
        value="10000" 
        data-mt-type="VOICE" 
        data-mt-port="<?= $i ?>" 
        data-mt-parameter="LFOPeriod" 
        name="lfo-freq-input-<?= $port_id ?>" 
        id="lfo-freq-input-<?= $port_id ?>" 
        data-type="number" 
        data-min="1" 
        data-max="100" 
        data-digits="3" 
      />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- LFO FREQ END -->

  <!-- LFO CLOCK RES -->
  <div class="box-selector-parent input-wrap" id="lfo-clock-divider-<?= $port_id ?>" data-disabled="true">
    <h3 class="box-body-select-title inline">Res</h3>
    <input 
      type="hidden" 
      class="selector" 
      name="lfo-clock-divider-input-<?= $port_id ?>" 
      id="lfo-clock-divider-input-<?= $port_id ?>" 
      data-mt-type="VOICE" 
      data-mt-port="<?= $i ?>" 
      data-mt-parameter="LFOMIDIClkDiv" 
      value="24" 
      disabled="true" />
    <label for="lfo-clock-divider-input-<?= $port_id ?>" class="box-selector-label round-sm inline">quart</label>
    <ul class="selector-options hidden round-sm">
      <li class="box-selector-item" data-value="1">qn/24</li>
      <li class="box-selector-item" data-value="3">32th</li>
      <li class="box-selector-item" data-value="6">16th</li>
      <li class="box-selector-item" data-value="12">8th</li>
      <li class="box-selector-item" data-value="24">quart</li>
      <li class="box-selector-item" data-value="48">half</li>
      <li class="box-selector-item" data-value="96">whole</li>
      <li class="box-selector-item" data-value="192">double</li>
      <li class="box-selector-item" data-value="384">long</li>
    </ul>
  </div>
  <!-- LFO CLOCK RES END -->

  <!-- LFO CLOCK MULT -->
  <div class="box-num-single" id="lfo-clock-multiplier-<?= $port_id ?>" data-disabled="true">
    <label for="lfo-clock-multiplier-input-<?= $port_id ?>" class="box-num-single-label">Mult &nbsp; x</label> <!-- inline -->
    <div class="input-number-wrap round-sm">
      <input 
        type="text" 
        class="box-num-input round-sm" 
        name="lfo-clock-multiplier-input-<?= $port_id ?>" 
        id="lfo-clock-multiplier-input-<?= $port_id ?>" 
        data-mt-type="VOICE" 
        data-mt-port="<?= $i ?>" 
        data-mt-parameter="LFOMIDIClkMult" 
        value="1" 
        data-type="number" 
        data-min="1" 
        data-max="50" 
        data-digits="2" 
        disabled="true"/>
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- LFO CLOCK MULT END -->

  <!-- LFO SHAPE BUTTON -->
  <button type="button" class="reveal for-button round-l" data-css="shape" 
          data-show="lfo-shape-<?= $port_id ?>" data-hide="lfo-body-<?= $port_id ?>">
    <span class="arrow-for"></span>Shape
  </button>
  <!-- LFO SHAPE BUTTON END -->

  <!-- LFO OPTIONS BUTTON -->
  <button type="button" class="reveal for-button round-l" data-css="options" 
          data-show="lfo-options-<?= $port_id ?>" data-hide="lfo-body-<?= $port_id ?>">
    <span class="arrow-for"></span>Options
  </button>
  <!-- LFO OPTIONS BUTTON END -->

</main>
<!-- BOX BODY NEW VOICE LFO END-->