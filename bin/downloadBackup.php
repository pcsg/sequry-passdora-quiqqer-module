<?php
/**
 * @author PCSG (Jan Wennrich)
 */

// Import QUIQQER Bootstrap
define('QUIQQER_SYSTEM', true);
$packagesDir = str_replace('sequry/passdora/bin', '', dirname(__FILE__));
require_once $packagesDir . '/header.php';


$backup = filter_var($_GET['backup'], FILTER_SANITIZE_STRING);

if (!QUI::getUserBySession()->isSU()) {
    echo "You need to be SU to download this file.";
    exit;
}

try {
    \Sequry\Passdora\Backup::send($backup);
} catch (\QUI\Exception $exception) {
    echo "Something went wrong. Maybe the requested file doesn't exist.";
    exit;
}


exit;
