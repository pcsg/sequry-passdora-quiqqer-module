<?php

use \Sequry\Passdora\Update;

/**
 * Verify and extract an update-file
 *
 * @param boolean $trustUnknownSources
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