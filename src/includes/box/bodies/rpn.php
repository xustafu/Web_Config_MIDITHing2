<!-- BOX BODY RPN -->
<main class="box-body hidden" id="rpn-body-<?=$port_id?>">

  <!-- PARAM -->
  <div class="box-num-single" id="rpn-param-<?=$port_id?>">
    <label class="box-num-single-label" for="rpn-param-input-<?=$port_id?>">Param</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        name="rpn-param-input-<?=$port_id?>"
        id="rpn-param-input-<?=$port_id?>"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTFUNCPARAMETER"
        data-type="number"
        data-min="0"
        data-max="16383"
        data-digits="5" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- PARAM END -->

  <!-- CLIP -->
  <div class="box-clip" id="rpn-clip-<?=$port_id?>">
    <h3 class="clip-title inline">Clip</h3>
    <div class="box-num-single inline" id="rpn-clip-low-<?=$port_id?>">
      <label class="box-num-single-label" for="rpn-clip-low-input-<?=$port_id?>">L</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="rpn-clip-low-input-<?=$port_id?>"
          id="rpn-clip-low-input-<?=$port_id?>"
          data-mt-type="PORT"
          data-mt-port="<?=$i?>"
          data-mt-parameter="PORTCLIPMINVAL"
          data-type="number"
          data-min="0"
          data-max="16383"
          data-digits="5" />
        <span class="arrow-up"></span>
        <span class="arrow-down"></span>
      </div>
    </div>
    <div class="box-num-single inline" id="rpn-clip-high-<?=$port_id?>">
      <label class="box-num-single-label" for="rpn-clip-high-input-<?=$port_id?>">H</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="rpn-clip-high-input-<?=$port_id?>"
          id="rpn-clip-high-input-<?=$port_id?>"
          data-mt-type="PORT"
          data-mt-port="<?=$i?>"
          data-mt-parameter="PORTCLIPMAXVAL"
          data-type="number"
          data-min="0"
          data-max="16383"
          data-digits="5" />
        <span class="arrow-up"></span>
        <span class="arrow-down"></span>
      </div>
    </div>
  </div>
  <!-- CLIP END -->

</main>
<!-- BOX BODY RPN END -->
