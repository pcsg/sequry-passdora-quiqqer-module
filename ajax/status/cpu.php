<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_cpu',
    function () {
        return \Sequry\Passdora\Status::cpu();
    },
    array(),
    'Permission::checkAdminUser'
);
