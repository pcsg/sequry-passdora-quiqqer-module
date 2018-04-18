<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_memory',
    function () {
        return \Sequry\Passdora\Status::memory();
    },
    array(),
    'Permission::checkAdminUser'
);
