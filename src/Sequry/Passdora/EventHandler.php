<?php

namespace Sequry\Passdora;

use QUI;

/**
 * Passdora Event Handling
 *
 * @author www.pcsg.de (Jan Wennrich)
 */
class EventHandler
{
    public static function onRequest(QUI\Rewrite $Rewrite, $url)
    {
        if (!Activation::isActivated()) {
            Activation::handleRequest();
            exit;
        }
    }
}
