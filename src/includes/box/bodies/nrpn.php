<!-- BOX BODY NRPN -->
<main class="box-body hidden" id="nrpn-body-<?=$port_id?>">

  <!-- PARAM -->
  <div class="box-num-single" id="nrpn-param-<?=$port_id?>">
    <label class="box-num-single-label block" for="nrpn-param-input-<?=$port_id?>">Param</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm nrpn-param"
        type="text"
        value="0"
        name="nrpn-param-input-<?=$port_id?>"
        id="nrpn-param-input-<?=$port_id?>"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTFUNCPARAMETER"
        data-mt-nrpn = "main"
        data-type="number"
        data-min="0"
        data-max="16383"
        data-digits="5" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- PARAM END -->

  <!-- MSB -->
  <div class="box-num-single" id="nrpn-msb-<?=$port_id?>">
    <label class="box-num-single-label block" for="nrpn-msb-input-<?=$port_id?>">MSB</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm nrpn-msb"
        type="text"
        value="0"
        name="nrpn-msb-input-<?=$port_id?>"
        id="nrpn-msb-input-<?=$port_id?>"
        data-mt-port = "<?=$i?>"
        data-mt-nrpn = "msb"
        data-type="number"
        data-min="0"
        data-max="127"
        data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- MSB END -->

  <!-- LSB -->
  <div class="box-num-single" id="nrpn-lsb-<?=$port_id?>">
    <label class="box-num-single-label block" for="nrpn-lsb-input-<?=$port_id?>">LSB</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm nrpn-lsb"
        type="text"
        value="0"
        name="nrpn-lsb-input-<?=$port_id?>"
        id="nrpn-lsb-input-<?=$port_id?>"
        data-mt-port = "<?=$i?>"
        data-mt-nrpn = "lsb"
        data-type="number"
        data-min="0"
        data-max="127"
        data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- LSB END -->
  <div class="nrpn-border"></div>

  <!-- CLIP -->
  <div class="box-clip" id="nrpn-clip-<?=$port_id?>">
    <h3 class="clip-title inline">Clip</h3>
    <div class="box-num-single inline" id="nrpn-clip-low-<?=$port_id?>">
      <label class="box-num-single-label" for="nrpn-clip-low-input-<?=$port_id?>">L</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="nrpn-clip-low-input-<?=$port_id?>"
          id="nrpn-clip-low-input-<?=$port_id?>"
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
    <div class="box-num-single inline" id="nrpn-clip-high-<?=$port_id?>">
      <label class="box-num-single-label" for="nrpn-clip-high-input-<?=$port_id?>">H</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          data-mt-type="PORT"
          data-mt-port="<?=$i?>"
          data-mt-parameter="PORTCLIPMAXVAL"
          name="nrpn-clip-high-input-<?=$port_id?>"
          id="nrpn-clip-high-input-<?=$port_id?>"
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
<!-- BOX BODY NRPN END -->
