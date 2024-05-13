<!-- BANNER -->
<header class="banner">
  <figure class="banner-logo">
    <svg
      class="banner-logo-gen"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 810 152"
      xml:space="preserve">
      <path
      d="M624.2 71.5h40.3V25.4H544.7v119.9h119.8v-39.2H585v-45h39.2zm-219 2.3v71.5h39.2v-34.6h40.3v34.6H525V25.4h-71.5l-48.3 48.4zm79.5 11.5h-40l40-36.4v36.4zm-438-59.9V5.8H6.4l.2 139.5h119.7V25.4H46.7zm58.8 65.7H84.7v17.3H74.4V91.1h-3.8l-25 17.8V91.1H26V80.7h19.6V62.9l25 17.8h3.8V63.4h10.4v17.3h20.7v10.4zm578.6-65.7v119.9H804V25.4H684.1zm80.7 80.7h-40.3V65.7h40.3v40.4zM239.9 85.5l25.8-25.2V25.4H145.8v35.7h71.6l-25.5 24.8 26.5 24.8h-72.6v34.6h119.9v-34.9zm153.7-24.2 35.5-34.8H286.5v34.9l24.6 25.1-24.6 25.1v34.8l49.5.3v-35.8l23.5-24.7L336 61.1z" />
    </svg>
    <svg
      class="banner-logo-mob"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 134 152"
      xml:space="preserve">
      <path
      d="M46.7 25.4V5.8H6.4l.2 139.5h119.7V25.4H46.7zm58.8 65.7H84.7v17.3H74.4V91.1h-3.8l-25 17.8V91.1H26V80.7h19.6V62.9l25 17.8h3.8V63.4h10.4v17.3h20.7v10.4z" />
    </svg>
  </figure>

  <h1 class="banner-title"><span id="title">MIDI Thing 2</span><span class="banner-subtitle"> | Editor</span></h1>

  <figure class="live-button">
    <svg
    id="live"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    xml:space="preserve">
      <path
      d="M32.1.1C14.4.1.1 14.4.1 32.1S14.4 64 32.1 64 64 49.7 64 32.1 49.7.1 32.1.1zm0 8.5c1.9 0 3.4 1.5 3.4 3.4s-1.5 3.4-3.4 3.4-3.4-1.5-3.4-3.4 1.5-3.4 3.4-3.4zM11.9 35.4c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4 3.4 1.5 3.4 3.4-1.5 3.4-3.4 3.4zm5.9-14c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4 3.4 1.5 3.4 3.4c-.1 1.9-1.6 3.4-3.4 3.4zm14.3 40c-2.5 0-5-.3-7.3-.9.4-3.7 3.5-6.5 7.3-6.5s6.9 2.8 7.3 6.5c-2.4.6-4.8.9-7.3.9zm14.3-40c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4 3.4 1.5 3.4 3.4c-.1 1.9-1.6 3.4-3.4 3.4zm5.8 14c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4 3.4 1.5 3.4 3.4c-.1 1.9-1.6 3.4-3.4 3.4z" />
    </svg>
  </figure>

  <div class="banner-device-select input-wrap" id="banner-device-selector-wrap">
    <input
    class="selector no-trigger"
    type="hidden"
    name="MIDIInputSelect"
    id="MIDIInputSelect"
    value="0" />
    <label id="MIDIInputSelectLabel" for="MIDIInputSelect" class="selector-label round">No Device!</label>
    <ul class="selector-options round hidden" id="device-selector">
    </ul>
  </div>

  <div class="banner-settings-select input-wrap" id="banner-settings-select-wrap">
    <label for="settings" class="selector-label round">Settings</label>
    <ul id="settings-ul" class="selector-options round hidden">
      <li>
        <a class="selector-item settings" href='#' id='save_to_file' data-func="save" style="text-decoration:none;">
          Save to file
        </a>
      </li>
      <li>
        <a class="selector-item settings" href='#' id='load_from_file' data-func="load" style="text-decoration:none;">
          Load from file
        </a>
        <form>
          <input type="file" id="file_load" accept="application/json/*" class="no-trigger" style="display:none">
        </form>  
      </li>
      <!--li class="selector-item settings" data-func="send">Send to module</li-->
      <li class="selector-item settings" data-func="request">Request from module</li>
      <li class="settings has-submenu">
        Load default setup
        <ul class="box-selector-suboptions round-sm hidden">
          <li class="box-suboptions-item selector-item settings" data-body="1" data-value="32" data-func="predef">Polyphony</li>  
          <li class="box-suboptions-item selector-item settings" data-body="2" data-value="33" data-func="predef">Polyphony + OSC</li>
          <li class="box-suboptions-item selector-item settings" data-body="3" data-value="34" data-func="predef">Multi-timbric</li>
          <li class="box-suboptions-item selector-item settings" data-body="4" data-value="35" data-func="predef">Multi-timbric + OSC</li>
          <li class="box-suboptions-item selector-item settings" data-body="5" data-value="36" data-func="predef">Drum Mode</li>
          <li class="box-suboptions-item selector-item settings" data-body="6" data-value="37" data-func="predef">Drum Mode MIX</li>
          <li class="box-suboptions-item selector-item settings" data-body="7" data-value="38" data-func="predef">CCs MIX</li>
          <li class="box-suboptions-item selector-item settings" data-body="8" data-value="39" data-func="predef">VCV Pitch Bend</li>
          <li class="box-suboptions-item selector-item settings" data-body="9" data-value="40" data-func="predef">Blank Preset</li>
        </ul>
      </li>
      <li class="selector-item settings" data-func="credits">Credits</li>
    </ul>
  </div>
</header>
<!-- BANNER END -->