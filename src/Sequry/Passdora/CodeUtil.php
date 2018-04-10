<?php

namespace Sequry\Passdora;

class CodeUtil
{
    public static function generate()
    {
        return rand(10000, 99999);
    }

    public static function isValid($code)
    {
        return (SessionUtil::getCode() == $code);
    }

    public static function showOnDisplay($code)
    {
        $script = CMS_DIR . "passdora_scripts/init_system.py";
        exec("python3 {$script} show_code {$code}");
    }
}