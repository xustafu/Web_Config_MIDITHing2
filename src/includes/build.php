<?php
/**
 * Build id and cache-busting for the editor's own JS/CSS.
 *
 * Why: browsers can keep serving an old .js/.css after an upload while index.php is
 * new. With ES modules that is fatal - one stale module missing a new export breaks
 * every module that imports it (see STATUS_AND_FIRMWARE_COMPAT.md, "a stale cached
 * module"). .htaccess asks browsers to revalidate, but only on Apache with mod_headers.
 *
 * What this does:
 *  - mt_build_id(): a short hash of every .js/.css file under src/. It changes
 *    whenever any of those files changes, with nothing to bump by hand.
 *  - Every asset URL gets "?v=<build id>", so a new upload means new URLs, and the
 *    browser cannot reuse an old copy.
 *  - Modules imported from other modules ("./globals.js") cannot carry a query string
 *    in their source, so an import map maps each module URL to its versioned URL.
 *  - build.php returns the same id, so an open page can tell that the server now
 *    has a newer version than the one it loaded (see the check in index.php).
 */

define('MT_ROOT', dirname(__DIR__));

/** Every .js/.css file under src/, as paths relative to src/ with forward slashes, sorted. */
function mt_asset_files() {
  static $files = null;
  if ($files !== null) return $files;
  $files = [];
  foreach (['js', 'styles'] as $dir) {
    $it = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator(MT_ROOT . '/' . $dir, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($it as $f) {
      if (!$f->isFile() || !preg_match('/\.(js|css)$/', $f->getFilename())) continue;
      $rel = substr($f->getPathname(), strlen(MT_ROOT) + 1);
      $files[] = str_replace('\\', '/', $rel);
    }
  }
  sort($files);
  return $files;
}

/** Short hash of every asset's path and contents. Same files = same id. */
function mt_build_id() {
  static $id = null;
  if ($id !== null) return $id;
  $h = hash_init('md5');
  foreach (mt_asset_files() as $rel) {
    hash_update($h, $rel . "\0" . md5_file(MT_ROOT . '/' . $rel) . "\n");
  }
  $id = substr(hash_final($h), 0, 12);
  return $id;
}

/**
 * Date of this build, shown in the banner: the newest modification time of any site
 * file (.js/.css/.php under src/), so it moves with every upload by itself. Depending
 * on the upload tool that is either the upload date or the date the newest file was
 * last edited. Format "12Nov26" (day, month, 2-digit year) to keep the banner short.
 */
function mt_build_time() {
  static $t = null;
  if ($t !== null) return $t;
  $t = 0;
  $it = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(MT_ROOT, FilesystemIterator::SKIP_DOTS)
  );
  foreach ($it as $f) {
    if ($f->isFile() && preg_match('/\.(js|css|php)$/', $f->getFilename())) {
      $t = max($t, $f->getMTime());
    }
  }
  return $t;
}

function mt_build_date() {
  return date('dMy', mt_build_time());
}

/** "./js/foo.js" -> "./js/foo.js?v=<build id>", HTML-escaped. */
function mt_asset($path) {
  return htmlspecialchars($path . '?v=' . mt_build_id(), ENT_QUOTES);
}

/**
 * Import map that sends every module URL to its versioned URL. Relative imports are
 * resolved to a full URL first and then looked up here, so "../globals.js" from
 * backend/initMidi.js lands on the "./js/globals.js" entry.
 *
 * Every module must be in the map. A module reached both with and without "?v=" would
 * load twice, as two separate instances with separate state.
 */
function mt_import_map() {
  $imports = [];
  foreach (mt_asset_files() as $rel) {
    if (substr($rel, -3) !== '.js') continue;
    $imports['./' . $rel] = './' . $rel . '?v=' . mt_build_id();
  }
  $json = json_encode(['imports' => $imports], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
  return '<script type="importmap">' . "\n" . $json . "\n" . '</script>';
}

/**
 * <link> tags for a stylesheet and, recursively, for everything it @imports, in the
 * order the cascade would apply them, each versioned.
 *
 * A CSS @import cannot carry a version, so an aggregator such as app.css (only
 * @import lines) is replaced by links to the files it imports. A file that has
 * @imports *and* rules of its own is linked as-is: linking it would load its imports
 * a second time, unversioned.
 */
function mt_css_links($path, $depth = 0) {
  $file = MT_ROOT . '/' . ltrim($path, './');
  $css = @file_get_contents($file);
  if ($css === false || $depth > 5) {
    return '<link rel="stylesheet" href="' . mt_asset($path) . '" />' . "\n";
  }
  $noComments = preg_replace('#/\*.*?\*/#s', '', $css);
  preg_match_all('#@import\s+(?:url\()?\s*[\'"]([^\'"]+)[\'"]\s*\)?\s*;#', $noComments, $m);
  $rest = trim(preg_replace('#@import[^;]*;#', '', $noComments));
  if (empty($m[1]) || $rest !== '') {
    return '<link rel="stylesheet" href="' . mt_asset($path) . '" />' . "\n";
  }
  $dir = dirname($path);
  $out = '';
  foreach ($m[1] as $imp) {
    $out .= mt_css_links($dir . '/' . preg_replace('#^\./#', '', $imp), $depth + 1);
  }
  return $out;
}
