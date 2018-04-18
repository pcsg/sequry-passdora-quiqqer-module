<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_system',
    function () {
        return \Sequry\Passdora\Status::system();
    },
    array(),
    'Permission::checkAdminUser'
);
