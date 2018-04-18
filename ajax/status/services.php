<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_services',
    function () {
        return \Sequry\Passdora\Status::services();
    },
    array(),
    'Permission::checkAdminUser'
);
