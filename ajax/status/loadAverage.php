<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_loadAverage',
    function () {
        return \Sequry\Passdora\Status::loadAverage();
    },
    array(),
    'Permission::checkAdminUser'
);
