<?php
// The build id the server has right now. An open editor page compares it with the id
// it was loaded with, and offers a reload when they differ (see index.php).
require __DIR__ . '/includes/build.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
echo json_encode(['build' => mt_build_id()]);
