<?php

namespace Sequry\Passdora;

class PasswordUtil
{
    const FILE_PASSWORDS = ETC_DIR . 'passdora_passwords.ini.php';

    const FILE_RESTORE_KEY = ETC_DIR . 'passdora_restore_key.ini.php';

    public static function getAllPasswords()
    {
        return parse_ini_file(self::FILE_PASSWORDS);
    }


    public static function getRestoreKey()
    {
        return parse_ini_file(self::FILE_RESTORE_KEY)['restore_key'];
    }
}