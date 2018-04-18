<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_swap',
    function () {
        return \Sequry\Passdora\Status::swap();
    },
    array(),
    'Permission::checkAdminUser'
);
