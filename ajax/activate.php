<?php

QUI::$Ajax->registerFunction(
    'package_sequry_passdora_ajax_activate',
    function () {

        $returnCode = 4;
        $text = "Invalid authentication code given.";

        if (\Sequry\Passdora\CodeUtil::isValid(\Sequry\Passdora\SessionUtil::getCode())) {
            $script = CMS_DIR.'passdora_scripts/init_system.py';
            exec("python3 {$script} init", $text, $returnCode);

            if ($returnCode == 0) {
                \Sequry\Passdora\Activation::activate();
            }
        }

        return array(
            'returnCode' => $returnCode,
            'text'     => $text
        );
    }
);
