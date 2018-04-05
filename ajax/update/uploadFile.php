<?php

/**
 * Moves an uploaded update-file to the update directory
 *
 * @param \QUI\QDOM $File
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_update_uploadFile',
    function ($File) {
        return \Sequry\Passdora\Update::moveToDirectory($File);
    },
    array('File'),
    'Permission::checkAdminUser'
);