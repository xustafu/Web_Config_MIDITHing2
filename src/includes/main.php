<!-- MAIN AREA -->
<main class="main mt" id="main">

  <!-- EXP SELECTOR (only for MIDI Thingy)
  <section id="exp-selector" class="hidden">
    <nav>
      <ul>
        <li data-selected>MIDI Thingy</li>
        <li>Exp. 1</li>
        <li>Exp. 2</li>
      </ul>
    </nav>
  </section>
  <!-- EXP SELECTOR END -->

  <!-- BOXES START -->
  <!--HUGO: atributo data-midithing-type de inputs: los valores que se pasan al módulo por sysex pueden ser
  de tres tipos: PORT / VOICE / MIDI. Necesitamos saber cual para construir el correspondiente sysex -->
  <?php
  $boxnames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  for ($i = 0; $i < sizeof($boxnames); $i++) {

    $port_id = $boxnames[$i];
    ?>

    <!-- Box -->
    <section id="box-<?= $port_id ?>"
        class="box">

        <!-- BOX HEADER -->
        <header class="box-header">
          <h1 class="box-header-title round color-selector has-submenu"
            data-port="<?= $i; ?>"
            id="color-selector-<?= $port_id ?>">
          <?= $port_id ?>
          <ul class="box-port-color-selector-options hidden"></ul>
          <span class="port-color-drop-arrow hidden"
            data-port="<?= $i; ?>"></span>
          </h1>
          <div class="box-header-field-v input-wrap select-box"
            id="volts-wrap-<?= $port_id ?>">
            <h2 class="box-header-subtitle">Volts</h2>
            <input class="selector header-input"
              type="hidden"
              data-mt-type="PORT"
              data-mt-port="<?= $i ?>"
              data-mt-parameter="PORTMODE"
              name="volts-<?= $port_id ?>"
              id="volts-<?= $port_id ?>"
              value="0" />
            <label for="volts-<?= $port_id ?>"
              class="box-selector-label round-sm">0/10</label>
            <ul class="volts-select-list box-selector-options hidden"
              data-port="<?= $i ?>">
              <li class="box-selector-item volts-sel"
                data-value="1">0/10</li>
              <li class="box-selector-item volts-sel"
                data-value="2">-5/5</li>
              <!--li class="box-selector-item volts-sel"
                data-value="3">-10/0</li-->
              <li class="box-selector-item volts-sel"
                data-value="3">0/8</li>
              <li class="box-selector-item volts-sel"
                data-value="4">0/5</li>
            </ul>
          </div>
          <div class="box-header-field-mc">
            <div class="input-number-wrap round-sm">
              <h2 class="box-header-subtitle">Midi Ch</h2>
              <input class="box-num-field-input round-sm header-input midich-sel"
                type="text"
                id="midi-ch-<?= $port_id ?>"
                name="midi-ch-<?= $port_id ?>"
                data-mt-type="PORT"
                data-mt-port="<?= $i ?>"
                data-mt-parameter="PORTMIDICHAN"
                data-type="number"
                data-min="1"
                data-max="16"
                value="1" />
              <span class="arrow-up"></span>
              <span class="arrow-down"></span>
            </div>
          </div>
          <!--button class="box-learn-button round">Learn</button-->
        </header>
        <!-- BOX HEADER END -->

        <!-- MAIN FUNCTION SELECTOR -->
        <section class="box-func-select input-wrap select-box"
          id="func-selector-wrap-box-<?= $port_id ?>">
          <input type="hidden"
            class="selector header-input funct-input"
            name="main-func-box-<?= $port_id ?>"
            id="main-func-box-<?= $port_id ?>"
            data-mt-type="PORT"
            data-mt-port="<?= $i ?>"
            data-mt-parameter="PORTFUNCTION"
            value="0" />
          <label for="main-func-box-<?= $port_id ?>"
            class="box-selector-label round-sm">NO FUNCTION</label>
          <ul class="box-func-select-list selector-options round-sm hidden"
            data-mt-port="<?= $i ?>">
            <li class="box-selector-item has-submenu">
              New Voice
              <ul class="box-selector-suboptions round-sm hidden">
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="note"
                  data-value="1">Note</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="gate"
                  data-value="3">Gate</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="adsr"
                  data-value="4">ADSR</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="velocity"
                  data-value="2">Velocity</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="drum"
                  data-value="7">Drum</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="osc"
                  data-value="5">Oscillator</li>
                <li class="box-suboptions-item menu-option new_voice"
                  data-body="lfo"
                  data-value="6">LFO</li>
              </ul>
            </li>
            <li class="box-selector-item has-submenu">
              Add to Voice
              <ul class="box-selector-suboptions hidden">
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="note"
                  data-value="1">Note</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="gate"
                  data-value="3">Gate</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="adsr"
                  data-value="4">ADSR</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="velocity"
                  data-value="2">Velocity</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="drum"
                  data-value="7">Drum</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="osc"
                  data-value="5">Oscillator</li>
                <li class="box-suboptions-item menu-option add_to_voice"
                  data-body="lfo"
                  data-value="6">LFO</li>
              </ul>
            </li>
            <li class="box-selector-item menu-option"
              data-body="cc"
              data-value="8">CC</li>
            <li class="box-selector-item menu-option"
              data-body="clock"
              data-value="23">Clock</li>
            <li class="box-selector-item has-submenu">
              ST/SP
              <ul class="box-selector-suboptions hidden">
                <li class="box-suboptions-item menu-option"
                  data-body="st-sp"
                  data-value="15">Start/Stop</li>
                <li class="box-suboptions-item menu-option"
                  data-body="cont-stop"
                  data-value="16">Continue/Stop</li>
                <li class="box-suboptions-item menu-option"
                  data-body="st-latch"
                  data-value="17">Start Latch</li>
                <li class="box-suboptions-item menu-option"
                  data-body="st-trig"
                  data-value="18">Start Trigger</li>
                <li class="box-suboptions-item menu-option"
                  data-body="sp-latch"
                  data-value="19">Stop Latch</li>
                <li class="box-suboptions-item menu-option"
                  data-body="sp-trig"
                  data-value="20">Stop Trigger</li>
                <li class="box-suboptions-item menu-option"
                  data-body="cont-latch"
                  data-value="21">Continue Latch</li>
                <li class="box-suboptions-item menu-option"
                  data-body="cont-trig"
                  data-value="22">Continue Trigger</li>
              </ul>
            </li>
            <li class="box-selector-item menu-option"
              data-body="pitch-bend"
              data-value="12">Pitch Bend</li>
            <li class="box-selector-item menu-option"
              data-body="rpn"
              data-value="9">RPN</li>
            <li class="box-selector-item menu-option"
              data-body="nrpn"
              data-value="10">NRPN</li>
            <li class="box-selector-item menu-option"
              data-body="ch-press"
              data-value="14">Channel Pressure</li>
            <li class="box-selector-item menu-option"
              data-body="pr-ch"
              data-value="11">Program Change</li>
            <li class="box-selector-item menu-option"
              data-body="no-func"
              data-value="0">NO FUNCTION</li>
          </ul>
        </section>
        <!-- MAIN FUNCTION SELECTOR END-->

        <!-- BODY TYPES -->
        <!-- NOTA: los elementos con clases x-x-mult tienen múltiples inputs asociados -->
        <section class="body-types-wrap">

          <!-- VOICE BODIES -->
          <!-- Si se selecciona una función que ya existe en esa voz, esa función se borra del puerto,
          poniéndola en No function y pasa a este puerto -->
        <?php include('./includes/box/bodies/voice/note.php') ?>
        <?php include('./includes/box/bodies/voice/note-options.php') ?>
        <?php include('./includes/box/bodies/voice/gate.php') ?>
        <?php include('./includes/box/bodies/voice/adsr.php') ?>
        <?php include('./includes/box/bodies/voice/adsr-graph.php') ?>
        <?php include('./includes/box/bodies/voice/velocity.php') ?>
        <?php include('./includes/box/bodies/voice/drum.php') ?>
        <?php include('./includes/box/bodies/voice/osc.php') ?>
        <?php include('./includes/box/bodies/voice/lfo.php') ?>
        <?php include('./includes/box/bodies/voice/lfo-options.php') ?>
        <?php include('./includes/box/bodies/voice/lfo-shape.php') ?>
        <!-- VOICE BODIES END -->

        <!-- START/STOP BODIES -->
        <?php include('./includes/box/bodies/stsp/cont-latch.php') ?>
        <?php include('./includes/box/bodies/stsp/cont-stop.php') ?>
        <?php include('./includes/box/bodies/stsp/cont-trigger.php') ?>
        <?php include('./includes/box/bodies/stsp/sp-latch.php') ?>
        <?php include('./includes/box/bodies/stsp/sp-trigger.php') ?>
        <?php include('./includes/box/bodies/stsp/st-latch.php') ?>
        <?php include('./includes/box/bodies/stsp/st-sp.php') ?>
        <?php include('./includes/box/bodies/stsp/st-trigger.php') ?>
        <!-- START/STOP BODIES END -->

        <?php include('./includes/box/bodies/cc.php') ?>
        <?php include('./includes/box/bodies/clock.php') ?>
        <?php include('./includes/box/bodies/pitch-bend.php') ?>
        <?php include('./includes/box/bodies/rpn.php') ?>
        <?php include('./includes/box/bodies/nrpn.php') ?>
        <?php include('./includes/box/bodies/ch-press.php') ?>
        <?php include('./includes/box/bodies/pr-ch.php') ?>

      </section>
      <!-- BODY TYPES END -->

      <!-- CONF WINDOWS -->
      <?php include('./includes/lfo-shape.php') ?>
      <?php include('./includes/adsr-graph.php') ?>
      <!-- CONF WINDOWS END -->

    </section>
    <!-- Box End -->

  <?php } ?>

  <!-- BOXES END -->
</main>
<!-- MAIN AREA END -->