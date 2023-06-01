<!-- BOX BODY NEW VOICE NOTE -->
<main class="box-body multiple-box hidden box-note-<?=$port_id?>" id="note-body-<?= $port_id ?>" data-sendtype="note-<?= $port_id?>">

  <!-- NOTE BEND -->
  <div class="box-num-single" id="note-bend-<?= $port_id ?>">
    <label class="box-num-single-label block" for="note-bend-input-<?= $port_id ?>">Bend</label>
    <div class="input-number-wrap">
      <input class="box-num-input round-sm" type="text" value="0" data-mt-type="MIDICH" data-mt-port="<?= $i ?>" data-mt-parameter="MIDICHBENDSPAN" name="note-bend-input-<?= $port_id ?>" id="note-bend-input-<?= $port_id ?>" data-type="number" data-min="0" data-max="127" data-digits="3" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- NOTE BEND END -->

  <!-- NOTE GLIDE MODE -->
  <div class="body-selector-parent input-wrap" id="note-glide-mode-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Glide Mode</h3>
    <input type="hidden" class="selector" data-mt-type="VOICE" data-mt-port="<?= $i ?>" data-mt-parameter="PORTAMENTOType" name="note-glide-mode-input<?= $port_id ?>" id="note-glide-mode-input-<?= $port_id ?>" value="0" />
    <label for="note-glide-mode-input-<?= $port_id ?>" class="box-selector-label round-sm block">Lineal</label>
    <ul class="selector-options hidden round-sm">
      <li class="box-selector-item" data-value="0">Lineal</li>
      <li class="box-selector-item" data-value="1">Fast</li>
      <li class="box-selector-item" data-value="2">Slow</li>
    </ul>
  </div>
  <!-- NOTE GLIDE MODE END -->

  <!-- NOTE GLIDE TIME -->
  <div class="box-num-single" id="note-glide-time-<?= $port_id ?>">
    <label class="box-num-single-label block" for="note-glide-time-<?= $port_id ?>">Glide Time ms</label>
    <div class="input-number-wrap round-sm">
      <input class="box-num-input round-sm" type="text" value="1000" data-mt-type="VOICE" data-mt-port="<?= $i ?>" data-mt-parameter="PORTAMENTOTime" name="note-glide-time-input-<?= $port_id ?>" id="note-glide-time-input-<?= $port_id ?>" data-type="number" data-min="1" data-max="9999" data-digits="4" />
      <span class="arrow-up"></span>
      <span class="arrow-down"></span>
    </div>
  </div>
  <!-- NOTE GLIDE TIME -->

  <!-- NOTE VOICE -->
  <div class="body-selector-parent input-wrap" id="note-voice-<?= $port_id ?>">
    <h3 class="box-body-select-title block">Voice</h3>
    <label id="label-note-voice-<?=$port_id?>" class="voice-tag round-sm block"><?= $port_id ?></label>
  </div>
  <!-- NOTE VOICE END -->


  <!-- NOTE OPTIONS BUTTON -->
  <button type="button" class="reveal for-button round-l" data-css="options" data-show="note-options-body-<?= $port_id ?>" data-hide="note-body-<?= $port_id ?>">
    <span class="arrow-for"></span>Options</button>
  <!-- NOTE OPTIONS BUTTON END -->


</main>
<!-- BOX BODY NEW VOICE NOTE END-->