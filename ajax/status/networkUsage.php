<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_status_networkUsage',
    function () {
        return \Sequry\Passdora\Status::networkUsage();
    },
    array(),
    'Permission::checkAdminUser'
);
