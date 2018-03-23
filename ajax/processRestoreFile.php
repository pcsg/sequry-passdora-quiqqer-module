<?php

use Sequry\Passdora\Restore;

/**
 * Extract a backup file
 *
 * @param string $restoreKey
 *
 */
QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_processRestoreFile',
    function ($restoreKey) {

        if (!Restore::decryptFile($restoreKey)) {
            return array(
                "error"   => true,
                "message" => QUI::getLocale()->get('sequry/passdora', 'error.restore.decrypt')
            );
        }

        Restore::setRequested();

        return array(
            "error"   => false,
            "message" => ""
        );
    },
    array('restoreKey'),
    'Permission::checkAdminUser'
);