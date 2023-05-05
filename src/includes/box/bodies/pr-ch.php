<!-- BOX BODY PROGRAM CHANGE -->
<main class="box-body hidden" id="pr-ch-body-<?=$port_id?>">

  <!-- CLIP -->
  <div class="box-clip" id="pr-ch-clip-<?=$port_id?>">
    <h3 class="clip-title inline">Clip</h3>
    <div class="box-num-single inline" id="pr-ch-clip-low-<?=$port_id?>">
      <label class="box-num-single-label" for="pr-ch-clip-low-input-<?=$port_id?>">L</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="0"
          name="pr-ch-clip-low-input-<?=$port_id?>"
          id="pr-ch-clip-low-input-<?=$port_id?>"
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
    <div class="box-num-single inline" id="pr-ch-clip-high-<?=$port_id?>">
      <label class="box-num-single-label" for="pr-ch-clip-high-input-<?=$port_id?>">H</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="127"
          name="pr-ch-clip-high-input-<?=$port_id?>"
          id="pr-ch-clip-high-input-<?=$port_id?>"
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
<!-- BOX BODY PROGRAM CHANGE END -->
