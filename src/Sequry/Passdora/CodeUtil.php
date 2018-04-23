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
        $script = VAR_DIR . "package/sequry/passdora/scripts/show_code.py";
        exec("python3 {$script} {$code}");
    }
}