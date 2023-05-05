<!-- BOX BODY START TRIGGER -->
<main class="box-body hidden" id="st-trig-body-<?=$port_id?>">

  <!-- ST TRIGGER PULSE -->
  <div class="box-num-single" id="st-trig-pulse-<?=$port_id?>">
    <label class="box-num-single-label" for="st-trig-pulse-input-<?=$port_id?>">Pulse ms</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="10"
        name="st-trig-pulse-input-<?=$port_id?>"
        id="st-trig-pulse-input-<?=$port_id?>"
        data-mt-type="PORT"
        data-mt-port="<?=$i?>"
        data-mt-parameter="PORTPULSETIME"
        data-type="number"
        data-min="0"
        data-max="99999"
        data-digits="5" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- ST TRIGGER PULSE END -->

</main>
<!-- BOX BODY START TRIGGER END -->
