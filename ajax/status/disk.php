<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_disk',
    function () {
        return \Sequry\Passdora\Status::disk();
    },
    array(),
    'Permission::checkAdminUser'
);
