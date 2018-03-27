<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_abortRestore',
    function () {
        return \Sequry\Passdora\Restore::abort();
    },
    array(),
    'Permission::checkAdminUser'
);
