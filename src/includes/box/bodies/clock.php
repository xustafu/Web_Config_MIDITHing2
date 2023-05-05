<!-- BOX BODY CLOCK -->
<main class="box-body hidden" id="clock-body-<?=$port_id?>">

  <!-- RES -->
  <div class="box-selector-parent input-wrap" id="clock-divider-<?=$port_id?>">
    <h3 class="box-body-select-title inline">Res</h3>
    <input
      type="hidden"
      class="selector"
      name="clock-divider-input-<?=$port_id?>"
      id="clock-divider-input-<?=$port_id?>"
      data-mt-type="PORT"
      data-mt-port="<?=$i?>"
      data-mt-parameter="PORTCLKDIV"
      value="24"
      disabled="true" />
    <label for="clock-divider-input-<?=$port_id?>" class="box-selector-label round-sm inline">quart</label>
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
  <!-- RES END -->

  <!-- MULT -->
  <div class="box-num-single" id="clock-multiplier-<?=$port_id?>">
    <label for="clock-multiplier-input-<?=$port_id?>" class="box-num-single-label">Mult</label> <!-- inline -->
    <div class="input-number-wrap round-sm">
      x
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
  <!-- MULT END -->

  <!-- CLOCK STOP -->
  <div class="toggle-wrap" id="clock-stop-<?=$port_id?>">
    <h3 class="box-body-select-title">Start/Stop</h3>
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
<!-- BOX BODY CLOCK END -->
