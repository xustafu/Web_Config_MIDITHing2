<!-- BOX BODY CHANNEL PRESSURE -->
<main class="box-body hidden" id="ch-press-body-<?=$port_id?>">

  <!-- CLIP -->
  <div class="box-clip" id="ch-press-clip-<?=$port_id?>">
    <h3 class="clip-title inline">Clip</h3>
    <div class="box-num-single inline" id="ch-press-clip-low-<?=$port_id?>">
      <label class="box-num-single-label" for="ch-press-clip-low-input-<?=$port_id?>">L</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="ch-press-clip-low-input-<?=$port_id?>"
          id="ch-press-clip-low-input-<?=$port_id?>"
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
    <div class="box-num-single inline" id="ch-press-clip-high-<?=$port_id?>">
      <label class="box-num-single-label" for="ch-press-clip-high-input-<?=$port_id?>">H</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="ch-press-clip-high-input-<?=$port_id?>"
          id="ch-press-clip-high-input-<?=$port_id?>"
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
<!-- BOX BODY CHANNEL PRESSURE END -->
