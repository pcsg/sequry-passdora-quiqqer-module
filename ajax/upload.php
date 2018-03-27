<?php

use Sequry\Passdora\Restore;

/**
 * Moves an uploaded restore file to the restore directory
 *
 * @param \QUI\QDOM $File
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_upload',
    function ($File) {
        // Clean the directory from old restore files
        Restore::removeDirectory();

        // Move the uploaded file to the restore file directory
        return Restore::moveToDirectory($File);
    },
    array('File'),
    'Permission::checkAdminUser'
);