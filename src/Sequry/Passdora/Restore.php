<?php

namespace Sequry\Passdora;

use QUI;
use QUI\Utils\System\File;

/**
 * Class Restore
 * Handles files for the restore process
 *
 * @package Sequry\Passdora
 *
 * @author PCSG (Jan Wennrich)
 */
class Restore
{
    /**
     * The name that uploaded restore files get assigned (should be encrypted)
     */
    const FILE_ENCRYPTED = "restore.tgz.gpg";

    /**
     * The name that decrypted restore files get assigned
     */
    const FILE_DECRYPTED = "restore.tgz";


    /**
     * Returns the absolute path to the directory where the restore-files are stored.
     * If the directory doesn't exist yet it is created.
     *
     * @return string
     *
     */
    public static function getDirectory()
    {
        try {
            $path = QUI::getPackage('sequry/passdora')->getVarDir() . 'restore/';
        } catch (QUI\Exception $exception) {
            return false;
        }

        File::mkdir($path);

        return $path;
    }


    /**
     * Moves a file to the restore directory and renames it accordingly.
     * Returns true on success, otherwise throws an exception.
     *
     * @param \QUI\QDOM $File
     *
     * @return boolean
     *
     * @throws QUI\Exception
     */
    public static function moveToDirectory($File)
    {
        $filePath = $File->getAttribute('filepath');

        $target = self::getDirectory() . self::FILE_ENCRYPTED;

        if (!file_exists($filePath)) {
            return false;
        }

        if (file_exists($target)) {
            File::unlink($target);
        }

        return File::move($filePath, $target);
    }


    /**
     * Decrypts the file in the restore directory using the given restore key
     * Returns true on success, false otherwise
     *
     * @param $restoreKey
     *
     * @return boolean
     */
    public static function decryptFile($restoreKey)
    {
        $restoreKey    = QUI\Utils\Security\Orthos::clearShellArg($restoreKey);
        $fileEncrypted = self::getDirectory() . self::FILE_ENCRYPTED;
        $fileDecrypted = self::getDirectory() . self::FILE_DECRYPTED;

        // Decrypt the file
        exec(
            "gpg --batch --passphrase $restoreKey -o $fileDecrypted $fileEncrypted",
            $output,
            $returnCode
        );

        return $returnCode == 0;
    }


    /**
     * Cleans up the restore directory (removes all files in it)
     *
     * @throws QUI\Exception
     */
    public static function cleanupDirectory()
    {
        self::removeDirectory();

        // Creates the directory again;
        self::getDirectory();
    }


    /**
     * Removes the restore directory entirely
     *
     * @throws QUI\Exception
     */
    public static function removeDirectory()
    {
        File::unlink(self::getDirectory());
    }


    /**
     * Sets the is_requested config value to true
     *
     * @throws QUI\Exception
     */
    public static function setRequested()
    {
        $Config = QUI::getPackage('sequry/passdora')->getConfig();
        $Config->set('restore', 'is_requested', 1);
        $Config->save();
    }


    /**
     * Returns if a restore is currently requested
     *
     * @return bool
     */
    public static function isRequested()
    {
        try {
            $Config = QUI::getPackage('sequry/passdora')->getConfig();

            return $Config->get('restore', 'is_requested') == 1;
        } catch (QUI\Exception $exception) {
        }

        return false;
    }


    /**
     * Aborts the restore process.
     * (Sets the isRequested config value to zero and cleans up the files).
     *
     * @return bool
     */
    public static function abort()
    {
        try {
            $Config = QUI::getPackage('sequry/passdora')->getConfig();
            $Config->set('restore', 'is_requested', 0);
            $Config->save();

            self::cleanupDirectory();
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            return false;
        }

        return true;
    }
}