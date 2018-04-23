<?php

/**
 * Return all calendars as an Array.
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_backup_delete',
    function ($backups) {
        $backups = json_decode($backups);
        foreach ($backups as $key => $backup) {
            $backup = filter_var($backup, FILTER_SANITIZE_STRING);
            \Sequry\Passdora\Backup::delete($backup);
        }
    },
    array('backups'),
    'Permission::checkAdminUser'
);
