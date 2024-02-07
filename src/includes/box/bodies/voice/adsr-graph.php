<!-- ADSR CONFIGURATION BOX -->
<section id="adsr-conf-<?= $port_id ?>" class="conf-window-wrap multiple-box hidden box-adsr-<?=$port_id?>" data-sendtype="adsr-<?= $port_id?>">
  
  <!-- ADSR GRAPH -->
  <!-- TAKEN FROM https://witch.rebeltech.org -->
  <div class="adsr-conf-graph">
    <div id="adsr-container-<?= $port_id ?>" class="adsr-container" style="width: 235px; height: 75px;">
      <canvas class="flotr-canvas" width="235" height="100" style="position: absolute; left: 0px; top: 25px; width: 235px; height: 75px;"></canvas>
      <canvas class="flotr-overlay" width="235" height="100" style="position: absolute; left: 0px; top: 25px; width: 235px; height: 75px;"></canvas>
      <div style="position: absolute; top: -10000px;">
        <div style="font-size:smaller;" class="flotr-grid-label flotr-dummy-div">100</div>
      </div>
      <div style="position: absolute; top: -10000px;">
        <div style="font-size:smaller;" class="flotr-grid-label flotr-dummy-div">0.00</div>
      </div>      
      <div class="flotr-titles">
        <div class="flotr-axis-title"></div>
      </div>
    </div>
  </div>
  <!-- ADSR GRAPH END -->

  <!-- ADSR BODY -->
  <section id="adsr-conf-body-<?= $port_id ?>" class="box-body ignore-send box-options">

    <div class="adsr-conf-body-params">
      <!-- PREDELAY -->
      <div class="box-num-single" id="adsr-predelay-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-predelay-input-<?= $port_id ?>">P</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm redraw_adsr"
            type="text"
            value="0"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRTPredelay"
            name="adsr-predelay-input-<?= $port_id ?>"
            id="adsr-predelay-input-<?= $port_id ?>"
            data-type="number"
            data-min="1"
            data-max="9999"
            data-digits="4"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- PREDELAY END -->
      
      <!-- ATTACK -->
      <div class="box-num-single" id="adsr-attack-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-attack-input-<?= $port_id ?>">A</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm adsr-attack redraw_adsr"
            type="text"
            value="100"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRTAttack"
            name="adsr-attack-input-<?= $port_id ?>"
            id="adsr-attack-input-<?= $port_id ?>"
            data-type="number"
            data-min="1"
            data-max="9900"
            data-digits="4"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- ATTACK END -->
      <!-- DECAY -->
      <div class="box-num-single" id="adsr-decay-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-decay-input-<?= $port_id ?>">D</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm adsr-decay redraw_adsr"
            type="text"
            value="100"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRTDecay"
            name="adsr-decay-input-<?= $port_id ?>"
            id="adsr-decay-input-<?= $port_id ?>"
            data-type="number"
            data-min="1"
            data-max="9900"
            data-digits="4"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- DECAY END -->
      <!-- SUSTAIN -->
      <div class="box-num-single" id="adsr-sustain-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-sustain-input-<?= $port_id ?>">S</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm adsr-sustain redraw_adsr"
            type="text"
            value="80"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRLSustain"
            name="adsr-sustain-input-<?= $port_id ?>"
            id="adsr-sustain-input-<?= $port_id ?>"
            data-type="number"
            data-min="0"
            data-max="100"
            data-digits="3"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- SUSTAIN END -->
      <!-- RELEASE -->
      <div class="box-num-single" id="adsr-release-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-release-input-<?= $port_id ?>">R</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm adsr-release redraw_adsr"
            type="text"
            value="200"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRTRelease"
            name="adsr-release-input-<?= $port_id ?>"
            id="adsr-release-input-<?= $port_id ?>"
            data-type="number"
            data-min="1"
            data-max="9900"
            data-digits="4"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- RELEASE END -->
      
      <!-- MAX LEVEL -->
      <div class="box-num-single" id="adsr-maxlevel-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-maxlevel-input-<?= $port_id ?>">L</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm redraw_adsr"
            type="text"
            value="100"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="ADSRLMax"
            name="adsr-maxlevel-input-<?= $port_id ?>"
            id="adsr-maxlevel-input-<?= $port_id ?>"
            data-type="number"
            data-min="0"
            data-max="100"
            data-digits="3"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- MAX LEVEL END -->
    </div>

    <div class="adsr-conf-body-globals">
      <!-- NOTE -->
      <div class="box-num-single" id="adsr-conf-note-<?= $port_id ?>">
        <label class="box-num-single-label block round-sm" for="adsr-conf-note-input-<?= $port_id ?>">Note</label>
        <div class="input-number-wrap">
          <input
            class="box-num-input round-sm"
            type="text"
            value="0"
            data-mt-type="VOICE"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="VO_MinNote"
            name="adsr-conf-note-input-<?= $port_id ?>"
            id="adsr-conf-note-input-<?= $port_id ?>"
            data-type="number"
            data-min="0"
            data-max="127"
            data-digits="3"
          />
          <span class="arrow-up"></span>
          <span class="arrow-down"></span>
        </div>
      </div>
      <!-- NOTE END -->
      <!-- ADSR GLOBAL -->
      <div class="body-selector-parent input-wrap" id="adsr-global-<?= $port_id ?>">
        <input
          type="hidden"
          class="selector"
          data-mt-type="VOICE"
          data-mt-port="<?= $i ?>"
          data-mt-parameter="UseLocalConfigADSR"
          name="adsr-global-input-<?= $port_id ?>"
          id="adsr-global-input-<?= $port_id ?>"
          value="0" />
        <label for="adsr-global-input-<?= $port_id ?>" class="box-selector-label round-sm block">Global</label>
        <ul class="selector-options hidden round-sm">
          <li class="box-selector-item" data-value="0">Global</li>
          <li class="box-selector-item" data-value="1">Local</li>
        </ul>
      </div>
      <!-- ADSR GLOBAL END -->
      <!-- ADSR LINEAL -->
      <div class="body-selector-parent input-wrap" id="adsr-lineal-<?= $port_id ?>">
        <input
          type="hidden"
          class="selector redraw_adsr"
          data-mt-type="VOICE"
          data-mt-port="<?= $i ?>"
          data-mt-parameter="ADSRCurveType"
          name="adsr-lineal-input-<?= $port_id ?>"
          id="adsr-lineal-input-<?= $port_id ?>"
          value="1" />
        <label for="adsr-lineal-input-<?= $port_id ?>" class="box-selector-label round-sm block">Exp.</label>
        <ul class="selector-options hidden round-sm">
          <li class="box-selector-item" data-value="0">Lineal</li>
          <li class="box-selector-item" data-value="1">Exp.</li>
          <li class="box-selector-item" data-value="2">Slow</li>
        </ul>
      </div>
      <!-- ADSR LINEAL END -->
      <!-- ADSR CONF BACK BUTTON -->
      <button
        type="button"
        class="back-button round-l reveal"
        data-show="adsr-body-<?= $port_id ?>"
        data-hide="adsr-conf-<?= $port_id ?>"
      >
      <span class="arrow-back"></span>Back</button>
      <!-- ADSR CONF BACK BUTTON END -->
    </div>

  </section>
  <!-- ADSR BODY END -->

</section>
<!-- ADSR CONFIGURATION BOX END -->