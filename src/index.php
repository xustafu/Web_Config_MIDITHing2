<?php
require __DIR__ . '/includes/build.php';
// The page carries the asset versions, so it must never be reused without asking.
header('Cache-Control: no-cache');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title id="head-title">Web MIDI Thing 2</title>
  <?= mt_css_links('./styles/app.css') ?>
  <!-- Must come before any module script: maps every module URL to its versioned URL. -->
  <?= mt_import_map() ?>
  <script>
  /*
   * Stale-file check. A plain inline script on purpose: when a cached module is out of
   * date, the module graph fails as a whole, so this cannot depend on any module.
   *
   * 1. On load: if js/bootCheck.js never ran (some module failed to load or link),
   *    say so and offer a reload, showing the first error for bug reports.
   * 2. On load, and when the tab comes back after a while: ask build.php for the
   *    server's build id. If it differs from the one this page was built with, the
   *    editor was updated since this page loaded; offer a reload.
   */
  window.MT_BUILD = <?= json_encode(mt_build_id()) ?>;
  (function () {
    var errors = [];
    window.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t !== window && (t.src || t.href)) errors.push('Could not load ' + (t.src || t.href));
      else if (e.message) errors.push(e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ')' : ''));
    }, true);

    /*
     * Non-blocking notice pinned to the bottom of the window: no overlay, no focus
     * grab, the page stays usable underneath. It does not use the site's modal (that
     * would cover the page and could replace a modal the user has open) and is styled
     * inline, so it looks right even when the cached stylesheets are the stale ones.
     */
    function showStalePopup(title, paragraphs, detail) {
      var old = document.getElementById('mt-stale-notice');
      if (old) old.remove();
      var box = document.createElement('div');
      box.id = 'mt-stale-notice';
      box.setAttribute('role', 'status');
      box.style.cssText =
        'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;' +
        'width:min(560px,calc(100vw - 32px));box-sizing:border-box;padding:14px 16px;' +
        'background:#1e1e1e;color:#fff;border:1px solid #c00;border-radius:10px;' +
        'box-shadow:0 6px 24px rgba(0,0,0,.45);font:14px/1.4 system-ui,sans-serif;text-align:left';

      var h = document.createElement('div');
      h.style.cssText = 'font-weight:700;font-size:15px;margin:0 24px 6px 0';
      h.textContent = title;
      box.appendChild(h);
      paragraphs.forEach(function (html) {
        var p = document.createElement('div');
        p.style.cssText = 'margin:0 0 6px';
        p.innerHTML = html;
        box.appendChild(p);
      });
      if (detail) {
        var det = document.createElement('details');
        det.style.cssText = 'margin:0 0 6px;opacity:.75;font-size:12px';
        var sum = document.createElement('summary');
        sum.style.cssText = 'cursor:pointer';
        sum.textContent = 'Details for a bug report';
        var code = document.createElement('div');
        code.style.cssText = 'font-family:monospace;word-break:break-all;margin-top:4px';
        code.textContent = detail;
        det.appendChild(sum);
        det.appendChild(code);
        box.appendChild(det);
      }

      var btnCss = 'font:inherit;cursor:pointer;border-radius:6px;padding:5px 14px;margin:4px 8px 0 0;';
      var reload = document.createElement('button');
      reload.type = 'button';
      reload.className = 'no-trigger';
      reload.style.cssText = btnCss + 'background:#c00;color:#fff;border:1px solid #c00';
      reload.textContent = 'Reload now';
      reload.addEventListener('click', function () { location.reload(); });
      var later = document.createElement('button');
      later.type = 'button';
      later.className = 'no-trigger';
      later.style.cssText = btnCss + 'background:transparent;color:#fff;border:1px solid #888';
      later.textContent = 'Later';
      later.addEventListener('click', function () { box.remove(); });
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'no-trigger';
      close.setAttribute('aria-label', 'Close');
      close.style.cssText = 'position:absolute;top:6px;right:8px;background:none;border:0;color:#aaa;font-size:18px;cursor:pointer';
      close.textContent = '×';
      close.addEventListener('click', function () { box.remove(); });
      // Keep clicks inside the notice from reaching the page's "click outside closes
      // menus" handler on <body>.
      box.addEventListener('click', function (e) { e.stopPropagation(); });

      box.appendChild(reload);
      box.appendChild(later);
      box.appendChild(close);
      document.body.appendChild(box);
    }

    var warnedBuild = null, lastCheck = 0;
    function checkServerBuild() {
      if (!window.fetch) return;
      lastCheck = Date.now();
      fetch('build.php?t=' + lastCheck, { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d.build || d.build === window.MT_BUILD || d.build === warnedBuild) return;
          warnedBuild = d.build;
          showStalePopup('Your editor files need updating', [
            'A newer version of the editor is available and your browser is still using older, ' +
            'cached files. You can keep working, but please reload when convenient: an older ' +
            'copy can show or send wrong settings.',
            'Reloading does not change anything stored on your module.'
          ], 'Loaded ' + window.MT_BUILD + ', current ' + d.build);
        })
        .catch(function () { /* offline or no PHP: nothing to compare against */ });
    }

    window.addEventListener('load', function () {
      // Module scripts have all run by now; give errors a tick to be reported.
      setTimeout(function () {
        if (!window.__mtBooted) {
          showStalePopup('Your editor files need updating', [
            'Some of the editor\'s files did not load, usually because your browser kept old ' +
            'cached copies from before the last update. Parts of the editor may not work ' +
            'until you reload.',
            'If this message comes back after reloading, do a hard refresh: ' +
            '<strong>Ctrl+Shift+R</strong> (Windows / Linux) or <strong>Cmd+Shift+R</strong> (Mac).'
          ], (errors[0] || 'No error was reported') + ' - build ' + window.MT_BUILD);
          return;
        }
        checkServerBuild();
      }, 0);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && Date.now() - lastCheck > 5 * 60 * 1000) checkServerBuild();
    });
  })();
  </script>
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>

  <?php include './includes/banner.php'?>
  <?php include './includes/main.php' ?>
  <?php include './includes/modal.php'?>

  <!-- LIBRARIES AND SCRIPTS -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
  <script type="text/javascript" src="<?= mt_asset('./js/vendor/webmidi.js') ?>"></script>
  <script type="text/javascript" src="<?= mt_asset('./js/vendor/flotr.js') ?>"></script>
  <script type="text/javascript" src="<?= mt_asset('./js/backend/dataStructures.js') ?>"></script>
  <script type="text/javascript" src="<?= mt_asset('./js/backend/mappingTargets.js') ?>"></script>
  <script type="text/javascript" src="<?= mt_asset('./js/backend/dataModel.js') ?>"></script>
  <script type="module" src="<?= mt_asset('./js/backend/initMidi.js') ?>"></script>
  <script type="module" src="<?= mt_asset('./js/settingsFuncs.js') ?>"></script>
  <script type="module" src="<?= mt_asset('./js/events.js') ?>"></script>
  <script type="module" src="<?= mt_asset('./js/backend/adsr.js') ?>"></script>
  <script type="module" src="<?= mt_asset('./js/mappingsUI.js') ?>"></script>
  <!-- Last: sets window.__mtBooted only if every module above loaded (see the check in <head>). -->
  <script type="module" src="<?= mt_asset('./js/bootCheck.js') ?>"></script>
</body>
</html>
