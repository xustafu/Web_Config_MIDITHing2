<!-- MAPPINGS VIEW -->
<!-- Maps an incoming MIDI message onto a Port/Voice/MIDI Channel config parameter.
     Slot numbers and the target Type/Number split are intentionally not shown to the
     user — see mappingsUI.js. -->
<div class="map-wrap">

  <div class="map-card map-card-list">
    <h2 class="map-title">Mappings <span id="map-count" class="map-count"></span></h2>
    <div id="map-list"></div>
    <button id="map-add-btn" class="map-add-btn">+ Add mapping</button>
    <span id="map-list-status" class="map-status"></span>
  </div>

  <div id="map-editor" class="map-card map-card-editor hidden">
    <h2 class="map-title">Edit Mapping</h2>
    <label class="map-enabled-row">
      <input type="checkbox" id="map-enabled" class="no-trigger" data-map-field="MAP_ENABLED" /> Enabled
    </label>

    <fieldset class="map-fieldset">
      <legend>When this happens…</legend>
      <div class="map-row">
        <label for="map-src-type">Message</label>
        <select id="map-src-type" class="no-trigger" data-map-field="MAP_SRC_MSGTYPE"></select>
      </div>
      <div class="map-row">
        <label for="map-src-channel">Channel (0 = any)</label>
        <input type="number" id="map-src-channel" class="no-trigger" data-map-field="MAP_SRC_CHANNEL" min="0" max="16" />
      </div>
      <div class="map-row">
        <label for="map-src-number">Number (CC#/Note#)</label>
        <input type="number" id="map-src-number" class="no-trigger" data-map-field="MAP_SRC_NUMBER" min="0" max="127" />
      </div>
      <div class="map-row">
        <label for="map-src-min">Input Range</label>
        <input type="number" id="map-src-min" class="no-trigger map-range-input" data-map-field="MAP_SRC_MIN" min="0" max="16383" />
        <input type="number" id="map-src-max" class="no-trigger map-range-input" data-map-field="MAP_SRC_MAX" min="0" max="16383" />
      </div>
      <div class="map-row">
        <label for="map-curve">Response Curve</label>
        <select id="map-curve" class="no-trigger" data-map-field="MAP_CURVE_TYPE"></select>
      </div>
    </fieldset>

    <fieldset class="map-fieldset">
      <legend>…do this</legend>
      <div class="map-row">
        <label for="map-target">Target</label>
        <select id="map-target" class="no-trigger"></select>
        <!-- One combined picker (Ports/Voices/MIDI Channels), built by mappingsUI.js
             from live device state — replaces separate target-type/number controls. -->
      </div>
      <div class="map-row">
        <label for="map-tgt-param">Parameter</label>
        <select id="map-tgt-param" class="no-trigger" data-map-field="MAP_TGT_PARAM"></select>
      </div>
      <div class="map-row">
        <label for="map-out-min">Output Range</label>
        <input type="number" id="map-out-min" class="no-trigger map-range-input" data-map-field="MAP_OUT_MIN" />
        <input type="number" id="map-out-max" class="no-trigger map-range-input" data-map-field="MAP_OUT_MAX" />
      </div>
    </fieldset>

    <div class="map-editor-actions">
      <button id="map-delete-btn" class="map-delete-btn">Delete this mapping</button>
      <button id="map-done-btn" class="map-done-btn">Done</button>
    </div>
  </div>

</div>
