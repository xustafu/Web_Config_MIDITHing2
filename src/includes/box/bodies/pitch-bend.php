<!-- BOX BODY PITCH BEND -->
<main class="box-body hidden" id="pitch-bend-body-<?=$port_id?>">

  <!-- SEMITONES -->
  <div class="box-num-single" id="pitch-bend-semit-<?=$port_id?>">
    <label class="box-num-single-label" for="pitch-bend-semit-input-<?=$port_id?>">Semitones +/-</label>
    <div class="input-number-wrap round-sm">
      <input
        class="box-num-input round-sm"
        type="text"
        value="0"
        data-mt-type="MIDICH"
        data-mt-port="<?=$i?>"
        data-mt-parameter="MIDICHBENDSPAN"
        name="pitch-bend-semit-input-<?=$port_id?>"
        id="pitch-bend-semit-input-<?=$port_id?>"
        data-type="number"
        data-min="1"
        data-max="60"
        data-digits="2" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- SEMITONES END -->

</main>
<!-- BOX BODY PITCH BEND END -->
