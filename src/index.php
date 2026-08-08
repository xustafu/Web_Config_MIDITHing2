<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title id="head-title">Web MIDI Thing 2</title>
  <link rel="stylesheet" href="./styles/app.css" />
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>

  <?php include './includes/banner.php'?>
  <?php include './includes/main.php' ?>
  <?php include './includes/modal.php'?>

  <!-- LIBRARIES AND SCRIPTS -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
  <script type="text/javascript" src="./js/vendor/webmidi.js"></script>
  <script type="text/javascript" src="./js/vendor/flotr.js"></script>
  <script type="text/javascript" src="./js/backend/dataStructures.js"></script>
  <script type="text/javascript" src="./js/backend/mappingTargets.js"></script>
  <script type="text/javascript" src="./js/backend/dataModel.js"></script>
  <script type="module" src="./js/backend/initMidi.js"></script>
  <script type="module" src="./js/settingsFuncs.js"></script>
  <script type="module" src="./js/events.js"></script>
  <script type="module" src="./js/backend/adsr.js"></script>
  <script type="module" src="./js/mappingsUI.js"></script>
</body>
</html>
