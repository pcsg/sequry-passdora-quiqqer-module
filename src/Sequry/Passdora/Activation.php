<?php

namespace Sequry\Passdora;

use QUI;

class Activation
{
    const DIR_TEMPLATES = __DIR__ . "/../../../templates/";

    const TEMPLATE_INFO = self::DIR_TEMPLATES . "info.tpl";
    const TEMPLATE_INVALID_CODE = self::DIR_TEMPLATES . "invalid_code.tpl";
    const TEMPLATE_LOGIN = self::DIR_TEMPLATES . "login.tpl";
    const TEMPLATE_WIREFRAME = self::DIR_TEMPLATES . "wireframe.tpl";
    const TEMPLATE_SETUP = self::DIR_TEMPLATES . "setup.tpl";
    const TEMPLATE_LICENSE = self::DIR_TEMPLATES . "license.tpl";

    const CONFIG_IS_ACTIVATED = "is_activated";

    public static function isActivated()
    {
        $Package = QUI::getPackage('sequry/passdora');
        $Config  = $Package->getConfig();

        return $Config->getValue('general', 'is_activated') == 1;
    }


    public static function handleRequest()
    {
        $Response = QUI::getGlobalResponse();
        $Request  = QUI::getRequest();

        $path = $Request->getPathInfo();

        switch ($path) {
            case "/reset":
                self::handleReset();
                $content = self::handleDefault();
                break;
            case "/":
                $content = self::handleDefault();
                break;
            case "/info":
                $content = self::handleInfo();
                break;
            case "/setup":
                $content = self::handleSetup();
                break;
            case "/license":
                $content = self::handleLicense();
                break;
            case "/activate":
                echo json_encode(self::handleActivate());
                exit;
            default:
                $content = self::handleDefault();
                break;
        }

        $TemplateEngine = QUI::getTemplateManager()->getEngine();
        $TemplateEngine->assign('content', $content);

        $Response->setContent($TemplateEngine->fetch(self::TEMPLATE_WIREFRAME));
        $Response->send();
    }

    public static function handleDefault()
    {
        $code = CodeUtil::generate();

        CodeUtil::showOnDisplay($code);
        SessionUtil::setCode($code);

        return QUI::getTemplateManager()->getEngine()->fetch(self::TEMPLATE_LOGIN);
    }


    public static function handleInfo()
    {
        $TemplateEngine = QUI::getTemplateManager()->getEngine();

        if (!CodeUtil::isValid(QUI::getRequest()->get('code'))) {
            return $TemplateEngine->fetch(self::TEMPLATE_INVALID_CODE);
        }

        $TemplateEngine->assign('passwords', PasswordUtil::getAllPasswords());
        $TemplateEngine->assign('restore_key', PasswordUtil::getRestoreKey());

        return $TemplateEngine->fetch(self::TEMPLATE_INFO);
    }


    public static function handleReset()
    {
        SessionUtil::resetCode();
    }


    public static function handleActivate()
    {
        $returnCode = 4;
        $text       = "Invalid authentication code given.";

        if (CodeUtil::isValid(SessionUtil::getCode())) {
            $script = VAR_DIR . 'package/sequry/passdora/scripts/init_system.py';
            exec("python3 {$script}", $text, $returnCode);

            if ($returnCode == 0) {
                $Settings = json_decode(urldecode($_REQUEST['settings']), true);

                $Config = QUI::getPackage('sequry/passdora')->getConfig();
                $Config->setSection('setup', $Settings);
                $Config->set('setup', 'is_requested', 1);
                $Config->save();

                Activation::activate();
            }
        }

        return array(
            'returnCode' => $returnCode,
            'text'       => $text
        );
    }


    public static function handleSetup()
    {
        $TemplateEngine = QUI::getTemplateManager()->getEngine();

        if (!CodeUtil::isValid(QUI::getRequest()->get('code'))) {
            return $TemplateEngine->fetch(self::TEMPLATE_INVALID_CODE);
        }

//        $TemplateEngine->assign('passwords', PasswordUtil::getAllPasswords());
//        $TemplateEngine->assign('restore_key', PasswordUtil::getRestoreKey());

        return $TemplateEngine->fetch(self::TEMPLATE_SETUP);
    }


    public static function handleLicense()
    {
        $TemplateEngine = QUI::getTemplateManager()->getEngine();

        if (!CodeUtil::isValid(QUI::getRequest()->get('code'))) {
            return $TemplateEngine->fetch(self::TEMPLATE_INVALID_CODE);
        }

//        $TemplateEngine->assign('passwords', PasswordUtil::getAllPasswords());
//        $TemplateEngine->assign('restore_key', PasswordUtil::getRestoreKey());

        return $TemplateEngine->fetch(self::TEMPLATE_LICENSE);
    }


    public static function activate()
    {
        // Delete password file
        unlink(ETC_DIR . 'passdora_passwords.ini.php');

        // Set activated in config
        $Config = QUI::getPackage('sequry/passdora')->getConfig();
        $Config->set('general', self::CONFIG_IS_ACTIVATED, 1);
        $Config->save();
    }
}