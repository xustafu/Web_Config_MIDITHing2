<!-- SHAPE CONF BOX -->
<section id="lfo-shape-<?=$port_id?>" class="conf-window-wrap multiple-box hidden box-lfo-<?=$port_id?>" data-sendtype="lfo-<?= $port_id?>">
  
  <!-- SHAPES AREA -->
  <section class="wave-shapes-wrap">
    <figure data-quad="q1">
      <img id="lfo-graph-q1-<?=$i?>" src="./assets/png/round_q1.png">
    </figure>
    <figure data-quad="q2">
      <img id="lfo-graph-q2-<?=$i?>" src="./assets/png/round_q2.png">
    </figure>
    <figure data-quad="q3">
      <img id="lfo-graph-q3-<?=$i?>" src="./assets/png/sin_q3.png">
    </figure>
    <figure data-quad="q4">
      <img id="lfo-graph-q4-<?=$i?>" src="./assets/png/sin_q4.png">
    </figure>
  </section>
  <!-- SHAPES AREA END -->

  <!-- SHAPES SELECTORS -->
  <section class="shapes-selectors-wrap">
    <?php
      $def_values = [2,2,3,3];
      $lfo_curves_png = ["tri", "round", "sin", "sq", "saw_up", "saw_down", "saw_rand"];
      for ($a=1; $a <= 4; $a++) { 
    ?>
    <div class="body-selector-parent input-wrap" id="lfo-quad-q<?=$a?>-<?=$port_id?>">
      <input
        type="hidden"
        class="selector"
        data-mt-type="VOICE" 
        data-mt-port="<?=$i?>" 
        data-mt-parameter="LFOCurveTypeQ<?=$a?>" 
        name="lfo-quad-input-q<?=$a?>-<?=$port_id?>"
        id="lfo-quad-input-q<?=$a?>-<?=$port_id?>"
        value="<?=$def_values[$a-1]?>" />
      <label for="lfo-quad-input-q<?=$a?>-<?=$port_id?>" class="box-selector-label round-sm block lfo-quad-sel" data-quad="<?=$a?>">
        <img src="./assets/png/<?=$lfo_curves_png[$def_values[$a-1]-1]?>.png" id="lfo-quad<?=$a?>-img-<?=$port_id?>" alt="saw rand wave">
      </label>
      <ul class="selector-options hidden round-sm selector-lfo-quad-<?=$a?>">
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="1" data-port="<?=$i?>">
          <img src="./assets/png/tri.png" data-quad="<?=$a?>" data-value="1" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="2" data-port="<?=$i?>">
          <img src="./assets/png/round.png" data-quad="<?=$a?>" data-value="2" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="3" data-port="<?=$i?>">
          <img src="./assets/png/sin.png" data-quad="<?=$a?>" data-value="3" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="4" data-port="<?=$i?>">
          <img src="./assets/png/sq.png" data-quad="<?=$a?>" data-value="4" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="5" data-port="<?=$i?>">
          <img src="./assets/png/saw_up.png" data-quad="<?=$a?>" data-value="5" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="6" data-port="<?=$i?>">
          <img src="./assets/png/saw_down.png" data-quad="<?=$a?>" data-value="6" data-port="<?=$i?>">
        </li>
        <li class="box-selector-item lfo-quad-graph-sel" data-quad="<?=$a?>" data-value="7" data-port="<?=$i?>">
          <img src="./assets/png/saw_rand.png" data-quad="<?=$a?>" data-value="7" data-port="<?=$i?>">
        </li>
      </ul>
    </div>
    <?php } ?>    
  </section>
  <!-- SHAPES SELECTORS END -->

  <!-- GLOBAL SETTINGS -->
  <section class="shapes-globals">

    <!-- GLOBAL SHAPE SELECTOR -->
    <div class="body-selector-parent input-wrap" id="lfo-global-<?=$port_id?>">
      <h3 class="box-body-select-title inline">Global</h3>
      <input
        type="hidden"
        class="selector ignore-send"
        name="lfo-global-input-<?=$port_id?>"
        id="lfo-global-input-<?=$port_id?>"
        value="0" />
      <label for="lfo-global-input-<?=$port_id?>" class="box-selector-label round-sm inline">
        <img src="./assets/png/round.png" alt="saw rand wave" id="lfo-global-img-<?=$port_id?>">
      </label>
      <ul class="selector-options hidden round-sm">
        <li class="box-selector-item lfo-global-graph-sel" data-value="1" data-port="<?=$i?>">
          <img src="./assets/png/tri.png" data-value="1" data-port="<?=$i?>" alt="triangular wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="2" data-port="<?=$i?>">
          <img src="./assets/png/round.png" data-value="2" data-port="<?=$i?>" alt="round sinusoidal wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="3" data-port="<?=$i?>">
          <img src="./assets/png/sin.png" data-value="3" data-port="<?=$i?>" alt="sinusoidal wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="4" data-port="<?=$i?>">
          <img src="./assets/png/sq.png" data-value="4" data-port="<?=$i?>" alt="square wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="5" data-port="<?=$i?>">
          <img src="./assets/png/saw_up.png" data-value="5" data-port="<?=$i?>" alt="ramp up wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="6" data-port="<?=$i?>">
          <img src="./assets/png/saw_down.png" data-value="6" data-port="<?=$i?>" alt="ramp down wave">
        </li>
        <li class="box-selector-item lfo-global-graph-sel" data-value="7" data-port="<?=$i?>">
          <img src="./assets/png/saw_rand.png" data-value="7" data-port="<?=$i?>" alt="saw rand wave">
        </li>
      </ul>
    </div>
    <!-- GLOBAL SHAPE SELECTOR END -->

    <!-- ATTENUATE -->
    <div class="box-num-single" id="lfo-attenuate-<?=$port_id?>">
      <label class="box-num-single-label inline" for="lfo-attenuate-input-<?=$port_id?>">Attenuate</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          data-mt-type="VOICE" 
          data-mt-port="<?=$i?>" 
          data-mt-parameter="LFOMaxLevel" 
          name="lfo-attenuate-input-<?=$port_id?>"
          id="lfo-attenuate-input-<?=$port_id?>"
          data-type="number"
          data-min="1"
          data-max="999"
          data-digits="3" />
        <span class="arrow-up"></span>
        <span class="arrow-down"></span>
      </div>
    </div>
    <!-- ATTENUATE END -->

  </section>
  <!-- GLOBAL SETTINGS END -->

  <section class="shapes-globals">
    <!-- BACK BUTTON -->
    <button 
      type="button" 
      class="back-button round-l reveal"
      data-show="lfo-body-<?=$port_id?>"
      data-hide="lfo-shape-<?=$port_id?>"
    >
    <span class="arrow-back"></span>Back</button>
    <!-- BACK BUTTON END -->

    <!-- OFFSET -->
      <div class="box-num-single" id="lfo-offset-<?=$port_id?>">
        <label class="box-num-single-label inline" for="lfo-offset-input-<?=$port_id?>">Offset</label>
        <div class="input-number-wrap round-sm">
          <input
            class="box-num-input round-sm"
            type="text"
            value="50"
            data-mt-type="VOICE" 
            data-mt-port="<?=$i?>" 
            data-mt-parameter="LFOOffset" 
            name="lfo-offset-input-<?=$port_id?>"
            id="lfo-offset-input-<?=$port_id?>"
            data-type="number"
            data-min="0"
            data-max="100"
            data-digits="3" />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- ATTENUATE END -->
  </section>
  
</section> 
<!-- SHAPE CONF BOX END -->