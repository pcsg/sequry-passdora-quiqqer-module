<?php

namespace Sequry\Passdora;

use QUI\Config;
use QUI\Utils\System\File;

/**
 * Class Backup
 *
 * @author PCSG (Jan Wennrich)
 *
 * @package Sequry\Passdora
 */
class Backup
{
    /**
     * Absolute path to the directory where backups are stored
     */
    const DIRECTORY = VAR_DIR . "package/sequry/passdora/backups/";


    /**
     * Returns an array of all backup-filenames.
     *
     * @return array
     */
    public static function getBackups()
    {
        $files = File::readDir(self::DIRECTORY, true, true);

        $filesFormatted = array();
        foreach ($files as $timestamp => $file) {
            array_push($filesFormatted, array(
                'timestamp'      => $timestamp,
                'filename'       => $file,
                'date_formatted' => strftime('%F %T', $timestamp)
            ));
        }

        return $filesFormatted;
    }


    /**
     * Checks if a given backup-file exists.
     *
     * @param string $backup - The backup-filename (including file-extension)
     * @return bool
     */
    public static function exists($backup)
    {
        return is_file(self::DIRECTORY . $backup);
    }


    /**
     * Sends the requested backup file with download headers to the user.
     *
     * @param string $backup - The backup-filename (including file-extension)
     *
     * @throws \QUI\Exception
     */
    public static function send($backup)
    {
        $path = realpath(self::DIRECTORY . $backup);
        File::send($path);
    }
}