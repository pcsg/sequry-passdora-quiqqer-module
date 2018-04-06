<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_update_isRequested',
    function () {
        return \Sequry\Passdora\Update::isRequested();
    },
    array(),
    'Permission::checkAdminUser'
);
