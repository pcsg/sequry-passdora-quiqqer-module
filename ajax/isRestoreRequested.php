<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_isRestoreRequested',
    function () {
        return \Sequry\Passdora\Restore::isRequested();
    },
    array(),
    'Permission::checkAdminUser'
);
