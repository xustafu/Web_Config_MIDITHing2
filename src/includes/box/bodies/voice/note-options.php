<!-- BOX BODY VOICE NOTE OPTIONS -->
<main class="box-body multiple-box hidden box-note-<?=$port_id?>" id="note-options-body-<?= $port_id ?>" data-sendtype="note-<?= $port_id?>">

  <!-- NOTE ASSIGN -->
  <div class="body-selector-parent input-wrap" id="note-assign-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Assign</h3>
    <input type="hidden" class="selector" data-mt-type="MIDICH" data-mt-port="<?= $i ?>" data-mt-parameter="MIDICHVOICESEL" name="note-input-assign-<?= $port_id ?>" id="note-input-assign-<?= $port_id ?>" value="0" />
    <label for="note-input-assign-<?= $port_id ?>" class="box-selector-label round-sm block">Low</label>
    <ul class="selector-options hidden round-sm">
      <li class="box-selector-item" data-value="0">Low</li>
      <li class="box-selector-item" data-value="1">Round Robin</li>
    </ul>
  </div>
  <!-- NOTE ASSIGN END -->

  <!-- NOTE MIDI RANGES -->
  <div class="box-num-mult input-wrap" id="note-midi-ranges-<?= $port_id ?>">
    <label class="box-num-mult-label block">MIDI Range</label>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm midi-range" 
      type="text" value="0" data-mt-type="PORT" 
      data-mt-port="<?= $i ?>" data-mt-parameter="PORTMINVAL" 
      id="note-midi-range1-<?= $port_id ?>" name="note-midi-range1-<?= $port_id ?>" 
      data-type="number" data-min="0" data-max="127" data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm midi-range" 
      type="text" value="120" data-mt-type="PORT" data-mt-port="<?= $i ?>" 
      data-mt-parameter="PORTCLIPMAXVAL" id="note-midi-range2-<?= $port_id ?>" 
      name="note-midi-range2-<?= $port_id ?>" data-type="number" data-min="0" 
      data-max="127" data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- NOTE MIDI RANGES END -->

  <!-- NOTE OPTIONS BACK BUTTON -->
  <button type="button" class="back-button round-l reveal" data-show="note-body-<?= $port_id ?>" data-hide="note-options-body-<?= $port_id ?>">
    <span class="arrow-back"></span>Back</button>
  <!-- NOTE OPTIONS BACK BUTTON END -->

  <!-- NOTE CALIBRATION -->
  <div class="box-num-mult-cal input-wrap" id="note-calibration-<?= $port_id ?>">
    <label class="box-num-mult-label block">Calibration</label>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm calibration" 
      type="text" value="0" data-mt-type="PORT" 
      data-mt-port="<?= $i ?>" data-mt-parameter="PORTCALMIN" 
      id="note-cal-min-<?= $port_id ?>" name="note-cal-min-<?= $port_id ?>" 
      data-type="number" data-min="-999" data-max="999" data-digits="4" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm calibration" 
      type="text" value="0" data-mt-type="PORT" data-mt-port="<?= $i ?>" 
      data-mt-parameter="PORTCALMAX" id="note-cal-max-<?= $port_id ?>" 
      name="note-cal-max-<?= $port_id ?>" data-type="number" data-min="-999" 
      data-max="999" data-digits="4" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- NOTE MIDI RANGES END -->

</main>
<!-- BOX BODY VOICE NOTE OPTIONS END-->