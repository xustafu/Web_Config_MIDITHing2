<!-- GLOBAL SETTINGS VIEW -->
<!-- data-device: 0=SER_DEV_OPTIONS(6), 1=USB_DEV_OPTIONS(7), 2-5=USB_HOST1-4_OPTIONS(8-11) -->
<!-- data-bit:    0=IN, 1=OUT, 2=THRU, 3=CLK, 4=SYX  (union MidiOption in MIDIDevice.h) -->
<div class="gs-wrap">

  <!-- MIDI MATRIX CARD -->
  <div class="gs-card gs-card-matrix">
    <h2 class="gs-title">MIDI MATRIX SET-UP</h2>
    <table class="gs-matrix">
      <thead>
        <tr>
          <th class="gs-matrix-corner"></th>
          <th>IN</th>
          <th>OUT</th>
          <th>THRU</th>
          <th>CLK</th>
          <th>SYX</th>
        </tr>
      </thead>
      <tbody>
        <?php
        $gs_devices = [
          [0, 'MIDI TRS'],
          [1, 'USB Device'],
          [2, 'USB Host 1'],
          [3, 'USB Host 2'],
          [4, 'USB Host 3'],
          [5, 'USB Host 4'],
        ];
        foreach ($gs_devices as [$dev_idx, $dev_label]): ?>
        <tr>
          <td class="gs-row-label"><?= $dev_label ?></td>
          <?php for ($bit = 0; $bit < 5; $bit++): ?>
          <td><div class="routing-dot inactive" data-device="<?= $dev_idx ?>" data-bit="<?= $bit ?>"></div></td>
          <?php endfor; ?>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- MAIN CLOCK CARD -->
  <div class="gs-card gs-card-clock">
    <h2 class="gs-title">MAIN CLOCK</h2>
    <div class="gs-clock-body">
      <div class="gs-bpm-wrap">
        <input
          type="number"
          id="global-clock-bpm"
          class="gs-bpm-input no-trigger"
          value="120.00"
          min="1"
          max="300"
          step="0.01"
        />
        <span class="gs-bpm-unit">bpm</span>
      </div>
      <div class="gs-clock-radios">
        <label class="gs-radio-label">
          <input type="radio" name="global-clock-mode" id="global-clock-internal" class="no-trigger" value="0" checked>
          Internal
        </label>
        <label class="gs-radio-label">
          <input type="radio" name="global-clock-mode" id="global-clock-external" class="no-trigger" value="1">
          External
        </label>
      </div>
      <button id="global-clock-startstop" class="gs-clock-btn gs-clock-start">&#9654; Start</button>
    </div>
  </div>

</div>
