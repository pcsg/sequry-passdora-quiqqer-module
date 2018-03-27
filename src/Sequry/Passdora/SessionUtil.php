<?php

namespace Sequry\Passdora;

use QUI\Session;

class SessionUtil
{
    const INDEX_CODE = "passdora_code";

    public static function getCode(Session $Session = null)
    {
        if (is_null($Session)) {
            $Session = \QUI::getSession();
        }

        return $Session->get(self::INDEX_CODE);
    }


    public static function setCode($code, Session $Session = null)
    {
        if (is_null($Session)) {
            $Session = \QUI::getSession();
        }

        $Session->set(self::INDEX_CODE, $code);
    }


    public static function resetCode(Session $Session = null)
    {
        if (is_null($Session)) {
            $Session = \QUI::getSession();
        }

        $Session->del(self::INDEX_CODE);
    }
}