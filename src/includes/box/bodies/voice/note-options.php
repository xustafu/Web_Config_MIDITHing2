<!-- BOX BODY VOICE NOTE OPTIONS -->
<main class="box-body multiple-box hidden box-note-<?=$port_id?>" id="note-options-body-<?= $port_id ?>" data-sendtype="note-<?= $port_id?>">

  <!-- NOTE MIDI RANGES -->
  <div class="box-num-mult input-wrap" id="note-midi-ranges-<?= $port_id ?>">
    <label class="box-num-mult-label block">MIDI Range</label>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm" type="text" value="0" data-mt-type="PORT" data-mt-port="<?= $i ?>" data-mt-parameter="PORTCLIPMINVAL" id="note-midi-range1-<?= $port_id ?>" name="note-midi-range1-<?= $port_id ?>" data-type="number" data-min="0" data-max="127" data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm" type="text" value="120" data-mt-type="PORT" data-mt-port="<?= $i ?>" data-mt-parameter="PORTCLIPMAXVAL" id="note-midi-range2-<?= $port_id ?>" name="note-midi-range2-<?= $port_id ?>" data-type="number" data-min="0" data-max="127" data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- NOTE MIDI RANGES END -->

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

  <!-- NOTE OPTIONS BACK BUTTON -->
  <button type="button" class="back-button round-l reveal" data-show="note-body-<?= $port_id ?>" data-hide="note-options-body-<?= $port_id ?>">
    <span class="arrow-back"></span>Back</button>
  <!-- NOTE OPTIONS BACK BUTTON END -->



  <!-- NOTE PRIORITY -->
  <div class="body-selector-parent input-wrap" id="note-priority-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Priority</h3>
    <input type="hidden" class="selector" data-mt-type="MIDICH" data-mt-port="<?= $i ?>" data-mt-parameter="MIDICHPRIORITY" name="note-priority-input-<?= $port_id ?>" id="note-priority-input-<?= $port_id ?>" value="0" />
    <label for="note-priority-input-<?= $port_id ?>" class="box-selector-label round-sm block">No Steal</label>
    <ul class="selector-options hidden round-sm">
      <li class="box-selector-item" data-value="0">No Steal</li>
      <li class="box-selector-item" data-value="1">First</li>
      <li class="box-selector-item" data-value="2">Last</li>
      <li class="box-selector-item" data-value="3">Low</li>
      <li class="box-selector-item" data-value="4">High</li>
    </ul>
  </div>
  <!-- NOTE PRIORITY END -->

</main>
<!-- BOX BODY VOICE NOTE OPTIONS END-->