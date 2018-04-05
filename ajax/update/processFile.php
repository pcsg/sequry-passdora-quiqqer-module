<?php

use \Sequry\Passdora\Update;

/**
 * Verify and extract an update-file.
 * If the $trustUnknownSources param is set to true the validity of the file's signature isn't checked
 *
 * @param boolean $trustUnknownSources - check if the file's signature is valid
 *
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_update_processFile',
    function ($trustUnknownSources) {

        $trustUnknownSources = ($trustUnknownSources == 1);

        if (!$trustUnknownSources && !Update::verifyFile()) {
            return array(
                "error"   => true,
                "message" => QUI::getLocale()->get('sequry/passdora', 'error.update.verify')
            );
        }

        if (!Update::decryptFile()) {
            return array(
                "error"   => true,
                "message" => QUI::getLocale()->get('sequry/passdora', 'error.update.decrypt')
            );
        }

        Update::setRequested();

        return array(
            "error"   => false,
            "message" => ""
        );
    },
    array('trustUnknownSources'),
    'Permission::checkAdminUser'
);