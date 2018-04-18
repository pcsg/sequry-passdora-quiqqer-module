<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_lastLogin',
    function () {
        return \Sequry\Passdora\Status::lastLogin();
    },
    array(),
    'Permission::checkAdminUser'
);
