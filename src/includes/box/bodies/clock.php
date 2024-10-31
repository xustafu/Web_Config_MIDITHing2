<!-- BOX BODY NEW VOICE CLOCK -->
<main class="box-body multiple-box hidden box-clock-<?=$port_id?>" id="clock-body-<?= $port_id ?>" data-sendtype="clock-<?= $port_id?>">

  <!-- CLOCK BPM/DIVIDER COMMUTER -->
  <div class="box-radio" id="clock-com-<?= $port_id ?>">
    <form class="input-radio-wrap clock-radio"> <!-- radio buttons have to be inside a form for the default check to show -->
      <input type="radio" id="clock-com-bpm-<?= $port_id ?>" class="box-radio clock-radio-bpm" name="clock-com-radio" data-mt-type="PORT" data-mt-port="<?= $i ?>" data-mt-parameter="PORTUseMIDIClock" value="0">
      <input type="radio" id="clock-com-divider-<?= $port_id ?>" class="box-radio clock-radio-clock" name="clock-com-radio" data-mt-type="PORT" data-mt-port="<?= $i ?>" data-mt-parameter="PORTUseMIDIClock" value="1" checked="checked">
    </form>
  </div>
  <!-- CLOCK BPM/DIVIDER COMMUTER END -->

  <!-- CLOCK BPM -->
  <div class="box-num-single" id="clock-bpm-<?= $port_id ?>" data-disabled="true">
    <div class="input-number-wrap round-sm">
      <label class="box-num-single-label" for="clock-bpm-input-<?= $port_id ?>">BPM</label>
      <input 
        class="box-num-input round-sm is-float" 
        type="text" 
        value="60.0" 
        data-mt-type="PORT" 
        data-mt-port="<?= $i ?>" 
        data-mt-parameter="PORTPERIOD" 
        name="clock-bpm-input-<?= $port_id ?>" 
        id="clock-bpm-input-<?= $port_id ?>" 
        data-type="number" 
        data-min="1.0" 
        data-max="99.9" 
        data-digits="4" 
      />
      <span class="arrow-up float-arrow"></span>
      <span class="arrow-down float-arrow"></span>
    </div>
  </div>
  <!-- CLOCK BPM END -->

  <!-- CLOCK RES -->
  <div class="box-selector-parent input-wrap" id="clock-divider-<?= $port_id ?>">
    <h3 class="box-body-select-title inline">Res</h3>
    <input 
      type="hidden" 
      class="selector" 
      name="clock-divider-input-<?= $port_id ?>" 
      id="clock-divider-input-<?= $port_id ?>" 
      data-mt-type="PORT" 
      data-mt-port="<?= $i ?>" 
      data-mt-parameter="PORTCLKDIV" 
      value="24" 
      disabled="true" />
    <label for="clock-divider-input-<?= $port_id ?>" class="box-selector-label round-sm inline">quart</label>
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
  <!-- CLOCK RES END -->

  <!-- CLOCK MULT -->
  <div class="box-num-single" id="clock-multiplier-<?= $port_id ?>">
    <label for="clock-multiplier-input-<?= $port_id ?>"
      class="box-num-single-label">Mult&nbsp;x</label> <!-- inline -->
    <div class="input-number-wrap round-sm">
      <input
        type="text"
        class="box-num-input round-sm"
        name="clock-multiplier-input-<?=$port_id?>"
        id="clock-multiplier-input-<?=$port_id?>"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTCLKMULT"
        value="1"
        data-type="number"
        data-min="1"
        data-max="50"
        data-digits="2" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- CLOCK CLOCK MULT END -->

  <!-- CLOCK STOP -->
  <div class="toggle-wrap" id="clock-stop-<?=$port_id?>">
    <h3 class="box-body-select-title">St/Sp</h3>
    <label for="clock-stop-input-<?=$port_id?>" class="toggle round-l"></label>
    <input 
      type="checkbox" 
      data-mt-type="PORT"
      data-mt-port="<?=$i?>"
      data-mt-parameter="PORTSTStCLOCK"
      name="clock-stop-input-<?=$port_id?>" 
      id="clock-stop-input-<?=$port_id?>" 
    />
    <div class="slider-wrap"><span class="slider round-l"></span></div>
  </div>
  <!-- CLOCK STOP END -->  

</main>
<!-- BOX BODY NEW VOICE CLOCK END-->