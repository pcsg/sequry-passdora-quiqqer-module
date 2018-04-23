<?php

/**
 * Return all calendars as an Array.
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_backup_getBackups',
    function () {
        return \Sequry\Passdora\Backup::getBackups();
    },
    false,
    'Permission::checkAdminUser'
);
