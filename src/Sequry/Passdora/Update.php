<?php

namespace Sequry\Passdora;

use QUI;
use QUI\Utils\System\File;

/**
 * Class Update
 * Handles files for the restore process
 *
 * @package Sequry\Passdora
 *
 * @author PCSG (Jan Wennrich)
 */
class Update
{
    const FILE_NAME_SIGNED = "update.tgz.gpg";

    const FILE_NAME_UNSIGNED = "update.tgz";

    /**
     * Returns the absolute path to the directory where update files are stored.
     * If the directory doesn't exist yet it is created.
     *
     * @return string
     *
     * @throws QUI\Exception
     */
    public static function getDirectory()
    {
        $path = QUI::getPackage('sequry/passdora')->getVarDir() . 'update/';
        File::mkdir($path);

        return $path;
    }


    /**
     * Moves a file to the update directory.
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
        $target   = self::getDirectory() . self::FILE_NAME_SIGNED;

        if (!file_exists($filePath)) {
            throw new QUI\Exception('File to move could not be found at: "' . $filePath . '"');
        }

        File::unlink($target);

        return File::move($filePath, $target);
    }


    /**
     * Verifies if the update-file has a valid signature
     * Returns true on success, false otherwise
     *
     * @throws QUI\Exception
     *
     * @return boolean - true on success, false otherwise
     */
    public static function verifyFile()
    {
        $file = self::getDirectory() . self::FILE_NAME_SIGNED;
        exec("gpg --verify $file", $output, $returnCode);

        return ($returnCode == 0);
    }


    /**
     * "Decrypts" the update-file by removing the signature, so it's usable again.
     * Overwrites existing files.
     * Returns true on success, false otherwise
     *
     * @param boolean $trustUnknownSources - Verify the signature of the file?
     *
     * @throws QUI\Exception
     *
     * @return bool - true on success, false otherwise
     */
    public static function decryptFile($trustUnknownSources = false)
    {
        $fileSigned   = self::getDirectory() . self::FILE_NAME_SIGNED;
        $fileUnsigned = self::getDirectory() . self::FILE_NAME_UNSIGNED;

        $cmd = "gpg ";

        if ($trustUnknownSources) {
            $cmd .= "--trust-model always ";
        }

        $cmd .= "--batch --yes --output $fileUnsigned --decrypt $fileSigned";

        exec($cmd, $output, $returnCode);

        return ($returnCode == 0);
    }


    /**
     * Cleans up the restore directory (removes all files in it)
     *
     * @throws QUI\Exception
     */
    public static function cleanupDirectory()
    {
        self::removeDirectory();

        // Creates the directory again
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
        $Config->set('update', 'is_requested', 1);
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

            return $Config->get('update', 'is_requested') == 1;
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
            $Config->set('update', 'is_requested', 0);
            $Config->save();

            self::cleanupDirectory();
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            return false;
        }

        return true;
    }
}