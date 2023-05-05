<!-- BOX BODY CONTINUE TRIGGER -->
<main class="box-body hidden" id="cont-trig-body-<?=$port_id?>">
      <!-- PARAM -->
    <div class="box-num-single" id="cont-trig-<?=$port_id?>">
      <label class="box-num-single-label" for="cont-trig-input-<?=$port_id?>">Pulse ms</label>
      <div class="input-number-wrap round-sm">
        <input
          class="box-num-input round-sm"
          type="text"
          value="10"
          name="cont-trig-input-<?=$port_id?>"
          id="cont-trig-input-<?=$port_id?>"
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
    <!-- PARAM END -->
</main>
<!-- BOX BODY CONTINUE TRIGGER END -->
