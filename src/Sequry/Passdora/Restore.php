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
     * The directory where uploaded restore files are stored
     */
    const DIRECTORY = CMS_DIR . "media/passdora_restore_files/";

    /**
     * The name that uploaded restore files get assigned (should be encrypted)
     */
    const FILE_ENCRYPTED = "restore.tgz.gpg";

    /**
     * The name that decrypted restore files get assigned
     */
    const FILE_DECRYPTED = "restore.tgz";


    /**
     * Creates the directory where uploaded restore files will be stored.
     * Returns true on success, false otherwise.
     *
     * @return boolean
     */
    public static function createDirectory()
    {
        // mkdir function checks if directory already exists so no need to do that here
        return File::mkdir(self::DIRECTORY);
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

        $target = self::DIRECTORY . self::FILE_ENCRYPTED;

        if (!file_exists($filePath)) {
            return false;
        }

        self::createDirectory();

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
        $fileEncrypted = self::DIRECTORY . self::FILE_ENCRYPTED;
        $fileDecrypted = self::DIRECTORY . self::FILE_DECRYPTED;

        // Decrypt the file
        exec(
            "gpg --batch --passphrase $restoreKey -o $fileDecrypted $fileEncrypted",
            $output,
            $returnCode
        );

        return $returnCode == 0;
    }


    /**
     * Unpacks the decrypted restore archive.
     * Returns true on success, otherwise false.
     *
     * @return boolean
     */
    public static function unpackFile()
    {
        $file = self::DIRECTORY.self::FILE_DECRYPTED;
        $directory = self::DIRECTORY;
        exec("tar -xvzf $file -C $directory", $output,$returnCode);

        return $returnCode == 0;
    }


    /**
     * Cleans up the restore directory (e.g. removing unnecessary files as the un- and encrypted archives)
     *
     * @throws QUI\Exception
     */
    public static function cleanupDirectory()
    {
        File::unlink(self::DIRECTORY.self::FILE_ENCRYPTED);    
        File::unlink(self::DIRECTORY.self::FILE_DECRYPTED);    
    }


    /**
     * Removes the restore directory entirely
     *
     * @throws QUI\Exception
     */
    public static function removeDirectory()
    {
        File::unlink(self::DIRECTORY);
    }


    /**
     * Sets the is_requested config value to true
     *
     * @throws QUI\Exception
     */
    public static function setRequested()
    {
        QUI::getPackage('sequry/passdora')->getConfig()->set('restore', 'is_requested', 1);
    }
}