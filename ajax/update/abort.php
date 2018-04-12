<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_update_abort',
    function () {
        return \Sequry\Passdora\Update::abort();
    },
    array(),
    'Permission::checkAdminUser'
);
