<!-- BOX BODY CC -->
<main class="box-body hidden" id="cc-body-<?=$port_id?>">

  <!-- CC NUMBER -->
  <div class="box-num-single" id="cc-ccnum-<?=$port_id?>">
    <label class="box-num-single-label" for="cc-ccnum-input-<?=$port_id?>">CC Number</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        name="cc-ccnum-input-<?=$port_id?>"
        id="cc-ccnum-input-<?=$port_id?>"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTFUNCPARAMETER"
        data-type="number"
        data-min="0"
        data-max="127"
        data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- CC NUMBER END -->

  <!-- CLIP -->
  <div class="box-clip" id="cc-clip-<?=$port_id?>">
    <h3 class="clip-title inline">Clip</h3>
    <div class="box-num-single inline" id="cc-clip-low-<?=$port_id?>">
      <label class="box-num-single-label" for="cc-clip-low-input-<?=$port_id?>">L</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="cc-clip-low-input-<?=$port_id?>"
          id="cc-clip-low-input-<?=$port_id?>"
          data-mt-type="PORT"
          data-mt-port="<?=$i?>"
          data-mt-parameter="PORTCLIPMINVAL"
          data-type="number"
          data-min="0"
          data-max="127"
          data-digits="3" />
        <span class="arrow-up"></span>
        <span class="arrow-down"></span>
      </div>
    </div>
    <div class="box-num-single inline" id="cc-clip-high-<?=$port_id?>">
      <label class="box-num-single-label" for="cc-clip-high-input-<?=$port_id?>">H</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="cc-clip-high-input-<?=$port_id?>"
          id="cc-clip-high-input-<?=$port_id?>"
          data-mt-type="PORT"
          data-mt-port="<?=$i?>"
          data-mt-parameter="PORTCLIPMAXVAL"
          data-type="number"
          data-min="0"
          data-max="127"
          data-digits="3" />
        <span class="arrow-up"></span>
        <span class="arrow-down"></span>
      </div>
    </div>
  </div>
  <!-- CLIP END -->

</main>
<!-- BOX BODY CC END -->
