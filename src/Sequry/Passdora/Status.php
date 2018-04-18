<?php

namespace Sequry\Passdora;

/**
 * Class providing functions to get system information.
 *
 * Inspired by: https://github.com/shevabam/ezservermonitor-web
 *
 * @author PCSG (Jan Wennrich)
 *
 * @package Sequry\Passdora
 */
class Status
{
    /**
     * Returns the number of CPU cores
     *
     * @return int
     */
    public static function getNumberCpuCores()
    {
        if (!($num_cores = shell_exec('/bin/grep -c ^processor /proc/cpuinfo'))) {
            if (!($num_cores = trim(shell_exec('/usr/bin/nproc')))) {
                $num_cores = 1;
            }
        }

        if ((int)$num_cores <= 0) {
            $num_cores = 1;
        }

        return (int)$num_cores;
    }


    /**
     * Returns human size
     *
     * @param  float $filesize File size
     * @param  int $precision Number of decimals
     * @return string            Human size
     */
    public static function getHumanSize($filesize, $precision = 2)
    {
        $units = array('', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y');

        foreach ($units as $idUnit => $unit) {
            if ($filesize > 1024) {
                $filesize /= 1024;
            } else {
                break;
            }
        }

        return round($filesize, $precision) . ' ' . $units[$idUnit] . 'B';
    }


    /**
     * Returns a command that exists in the system among $cmds
     *
     * @param  array $cmds List of commands
     * @param  string $args List of arguments (optional)
     * @param  bool $returnWithArgs If true, returns command with the arguments
     * @return string                   Command
     */
    public static function whichCommand($cmds, $args = '', $returnWithArgs = true)
    {
        $return = '';

        foreach ($cmds as $cmd) {
            if (trim(shell_exec($cmd . $args)) != '') {
                $return = $cmd;

                if ($returnWithArgs) {
                    $return .= $args;
                }

                break;
            }
        }

        return $return;
    }


    /**
     * Returns information about the CPU
     *
     * @return array
     */
    public static function cpu()
    {
        // Number of cores
        $num_cores = self::getNumberCpuCores();


        // CPU info
        $model     = 'N.A';
        $frequency = 'N.A';
        $cache     = 'N.A';
        $bogomips  = 'N.A';
        $temp      = 'N.A';

        if ($cpuinfo = shell_exec('cat /proc/cpuinfo')) {
            $processors = preg_split('/\s?\n\s?\n/', trim($cpuinfo));

            foreach ($processors as $processor) {
                $details = preg_split('/\n/', $processor, -1, PREG_SPLIT_NO_EMPTY);

                foreach ($details as $detail) {
                    list($key, $value) = preg_split('/\s*:\s*/', trim($detail));

                    switch (strtolower($key)) {
                        case 'model name':
                        case 'cpu model':
                        case 'cpu':
                        case 'processor':
                            $model = $value;
                            break;

                        case 'cpu mhz':
                        case 'clock':
                            $frequency = $value . ' MHz';
                            break;

                        case 'cache size':
                        case 'l2 cache':
                            $cache = $value;
                            break;

                        case 'bogomips':
                            $bogomips = $value;
                            break;
                    }
                }
            }
        }

        if ($frequency == 'N.A') {
            if ($f = shell_exec('cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq')) {
                $f         = $f / 1000;
                $frequency = $f . ' MHz';
            }
        }


        if (exec('/usr/bin/sensors | grep -E "^(CPU Temp|Core 0)" | cut -d \'+\' -f2 | cut -d \'.\' -f1', $t)) {
            if (isset($t[0])) {
                $temp = $t[0] . ' °C';
            }
        } else {
            if (exec('cat /sys/class/thermal/thermal_zone0/temp', $t)) {
                $temp = round($t[0] / 1000) . ' °C';
            }
        }

        return array(
            'model'     => $model,
            'num_cores' => $num_cores,
            'frequency' => $frequency,
            'cache'     => $cache,
            'bogomips'  => $bogomips,
            'temp'      => $temp,
        );
    }


    /**
     * Returns information about the disks
     *
     * @return array
     */
    public static function disk()
    {
        $datas = array();

        if (!(exec('/bin/df -T | awk -v c=`/bin/df -T | grep -bo "Type" | awk -F: \'{print $2}\'` \'{print substr($0,c);}\' | tail -n +2 | awk \'{print $1","$2","$3","$4","$5","$6","$7}\'',
            $df))) {
            $datas[] = array(
                'total'        => 'N.A',
                'used'         => 'N.A',
                'free'         => 'N.A',
                'percent_used' => 0,
                'mount'        => 'N.A',
                'filesystem'   => 'N.A',
            );
        } else {
            $mounted_points = array();
            $key            = 0;

            foreach ($df as $mounted) {
                list($filesystem, $type, $total, $used, $free, $percent, $mount) = explode(',', $mounted);

                if (strpos($type, 'tmpfs') !== false) {
                    continue;
                }

                if (!in_array($mount, $mounted_points)) {
                    $mounted_points[] = trim($mount);

                    $datas[$key] = array(
                        'total'        => self::getHumanSize($total * 1024),
                        'used'         => self::getHumanSize($used * 1024),
                        'free'         => self::getHumanSize($free * 1024),
                        'percent_used' => trim($percent, '%'),
                        'mount'        => $mount,
                    );

                    $datas[$key]['filesystem'] = $filesystem;
                }

                $key++;
            }

        }


        return $datas;
    }


    /**
     * Returns last login of the (system) users
     *
     * @return array
     */
    public static function lastLogin()
    {
        $datas = array();

        if (!(exec('/usr/bin/lastlog --time 365 | /usr/bin/awk -F\' \' \'{ print $1";"$5, $4, $8, $6}\'',
            $users))) {
            $datas[] = array(
                'user' => 'N.A',
                'date' => 'N.A',
            );
        } else {
            $max = 5;

            for ($i = 1; $i < count($users) && $i <= $max; $i++) {
                list($user, $date) = explode(';', $users[$i]);

                $datas[] = array(
                    'user' => $user,
                    'date' => $date,
                );
            }
        }

        return $datas;
    }


    /**
     * Returns the average system load for the last 1, 5 and 15 minutes
     *
     * @return array
     */
    public static function loadAverage()
    {
        if (!($load_tmp = shell_exec('cat /proc/loadavg | awk \'{print $1","$2","$3}\''))) {
            $load = array(0, 0, 0);
        } else {
            // Number of cores
            $cores = self::getNumberCpuCores();

            $load_exp = explode(',', $load_tmp);

            $load = array_map(
                function ($value, $cores) {
                    $value = intval($value);
                    $cores = intval($cores);

                    $v = $value * 100 / $cores;
                    if ($v > 100) {
                        $v = 100;
                    }

                    return $v;
                },
                $load_exp,
                array_fill(0, 3, $cores)
            );
        }


        $datas = $load;

        return $datas;
    }


    /**
     * Returns information about the memory usage
     *
     * @return array
     */
    public static function memory()
    {
        $free = 0;

        if (shell_exec('cat /proc/meminfo')) {
            $free    = shell_exec('grep MemFree /proc/meminfo | awk \'{print $2}\'');
            $buffers = shell_exec('grep Buffers /proc/meminfo | awk \'{print $2}\'');
            $cached  = shell_exec('grep Cached /proc/meminfo | awk \'{print $2}\'');

            $free = (int)$free + (int)$buffers + (int)$cached;
        }

        // Total
        if (!($total = intval(shell_exec('grep MemTotal /proc/meminfo | awk \'{print $2}\'')))) {
            $total = 0;
        }

        // Used
        $used = $total - $free;

        // Percent used
        $percent_used = 0;
        if ($total > 0) {
            $percent_used = 100 - (round($free / $total * 100));
        }


        $datas = array(
            'used'         => self::getHumanSize($used * 1024),
            'free'         => self::getHumanSize($free * 1024),
            'total'        => self::getHumanSize($total * 1024),
            'percent_used' => $percent_used,
        );

        return $datas;
    }


    /**
     * Returns information about network interface usage
     *
     * @return array
     */
    public static function networkUsage()
    {
        $datas   = array();
        $network = array();

        // Possible commands for ifconfig and ip
        $commands = array(
            'ifconfig' => array('ifconfig', '/sbin/ifconfig', '/usr/bin/ifconfig', '/usr/sbin/ifconfig'),
            'ip'       => array('ip', '/bin/ip', '/sbin/ip', '/usr/bin/ip', '/usr/sbin/ip'),
        );

        /**
         * Returns command line to retrieve interfaces
         *
         * @param $commands
         * @return null|string
         */
        function getInterfacesCommand($commands)
        {
            $ifconfig = Status::whichCommand($commands['ifconfig'],
                ' | awk -F \'[/  |: ]\' \'{print $1}\' | sed -e \'/^$/d\'');

            if (!empty($ifconfig)) {
                return $ifconfig;
            } else {
                $ip_cmd = Status::whichCommand($commands['ip'], ' -V', false);

                if (!empty($ip_cmd)) {
                    return $ip_cmd . ' -oneline link show | awk \'{print $2}\' | sed "s/://"';
                } else {
                    return null;
                }
            }
        }

        /**
         * Returns command line to retrieve IP address from interface name
         *
         * @param $commands
         * @param $interface
         * @return null|string
         */
        function getIpCommand($commands, $interface)
        {
            $ifconfig = Status::whichCommand($commands['ifconfig'],
                ' ' . $interface . ' | awk \'/inet / {print $2}\' | cut -d \':\' -f2');

            if (!empty($ifconfig)) {
                return $ifconfig;
            } else {
                $ip_cmd = Status::whichCommand($commands['ip'], ' -V', false);

                if (!empty($ip_cmd)) {
                    return 'for family in inet inet6; do ' .
                        $ip_cmd . ' -oneline -family $family addr show ' . $interface . ' | grep -v fe80 | awk \'{print $4}\' | sed "s/\/.*//"; ' .
                        'done';
                } else {
                    return null;
                }
            }
        }


        $getInterfaces_cmd = getInterfacesCommand($commands);

        if (is_null($getInterfaces_cmd) || !(exec($getInterfaces_cmd, $getInterfaces))) {
            $datas[] = array('interface' => 'N.A', 'ip' => 'N.A');
        } else {
            foreach ($getInterfaces as $name) {
                $ip = null;

                $getIp_cmd = getIpCommand($commands, $name);

                if (is_null($getIp_cmd) || !(exec($getIp_cmd, $ip))) {
                    $network[] = array(
                        'name' => $name,
                        'ip'   => 'N.A',
                    );
                } else {
                    if (!isset($ip[0])) {
                        $ip[0] = '';
                    }

                    $network[] = array(
                        'name' => $name,
                        'ip'   => $ip[0],
                    );
                }
            }

            foreach ($network as $interface) {
                // Get transmit and receive datas by interface
                exec('cat /sys/class/net/' . $interface['name'] . '/statistics/tx_bytes', $getBandwidth_tx);
                exec('cat /sys/class/net/' . $interface['name'] . '/statistics/rx_bytes', $getBandwidth_rx);

                $datas[] = array(
                    'interface' => $interface['name'],
                    'ip'        => $interface['ip'],
                    'transmit'  => self::getHumanSize($getBandwidth_tx[0]),
                    'receive'   => self::getHumanSize($getBandwidth_rx[0]),
                );

                unset($getBandwidth_tx, $getBandwidth_rx);
            }
        }


        return $datas;
    }


    /**
     * Returns information about some services.
     * Services include: Web Server, Email Server, FTP Server, Database Server, SSH
     *
     * @return array
     */
    public static function services()
    {
        $datas = array();

        $available_protocols = array('tcp', 'udp');

        $show_port = true;

        $services = [
            [
                "name"     => "Web Server",
                "host"     => "localhost",
                "port"     => 80,
                "protocol" => "tcp"
            ],
            [
                "name"     => "Email Server (incoming)",
                "host"     => "localhost",
                "port"     => 993,
                "protocol" => "tcp"
            ],
            [
                "name"     => "Email Server (outgoing)",
                "host"     => "localhost",
                "port"     => 587,
                "protocol" => "tcp"
            ],
            [
                "name"     => "FTP Server",
                "host"     => "localhost",
                "port"     => 21,
                "protocol" => "tcp"
            ],
            [
                "name"     => "Database Server",
                "host"     => "localhost",
                "port"     => 3306,
                "protocol" => "tcp"
            ],
            [
                "name"     => "SSH",
                "host"     => "localhost",
                "port"     => 22,
                "protocol" => "tcp"
            ]
        ];

        foreach ($services as $service) {
            $host     = $service['host'];
            $port     = $service['port'];
            $name     = $service['name'];
            $protocol = isset($service['protocol']) && in_array($service['protocol'],
                $available_protocols) ? $service['protocol'] : 'tcp';

            if (self::scanPort($host, $port, $protocol)) {
                $status = 1;
            } else {
                $status = 0;
            }

            $datas[] = array(
                'port'   => $show_port === true ? $port : '',
                'name'   => $name,
                'status' => $status,
            );
        }


        return $datas;
    }


    /**
     * Checks if a port is open (TCP or UPD)
     *
     * @param  string $host Host to check
     * @param  int $port Port number
     * @param  string $protocol tcp or udp
     * @param  integer $timeout Timeout
     * @return bool                 True if the port is open else false
     */
    public static function scanPort($host, $port, $protocol = 'tcp', $timeout = 3)
    {
        if ($protocol == 'tcp') {
            $handle = @fsockopen($host, $port, $errno, $errstr, $timeout);

            if ($handle) {
                return true;
            } else {
                return false;
            }
        } elseif ($protocol == 'udp') {
            $handle = @fsockopen('udp://' . $host, $port, $errno, $errstr, $timeout);

            socket_set_timeout($handle, $timeout);

            $write = fwrite($handle, 'x00');

            $startTime = time();

            $header = fread($handle, 1);

            $endTime = time();

            $timeDiff = $endTime - $startTime;

            fclose($handle);

            if ($timeDiff >= $timeout) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }


    /**
     * Returns information about system swap
     *
     * @return array
     */
    public static function swap()
    {
        // Free
        if (!($free = intval(shell_exec('grep SwapFree /proc/meminfo | awk \'{print $2}\'')))) {
            $free = 0;
        }

        // Total
        if (!($total = intval(shell_exec('grep SwapTotal /proc/meminfo | awk \'{print $2}\'')))) {
            $total = 0;
        }

        // Used
        $used = $total - $free;

        // Percent used
        $percent_used = 0;
        if ($total > 0) {
            $percent_used = 100 - (round($free / $total * 100));
        }


        $datas = array(
            'used'         => self::getHumanSize($used * 1024),
            'free'         => self::getHumanSize($free * 1024),
            'total'        => self::getHumanSize($total * 1024),
            'percent_used' => $percent_used,
        );

        return $datas;
    }


    /**
     * Returns information about the system
     *
     * @return array
     */
    public static function system()
    {
        // Hostname
        $hostname = php_uname('n');

        // OS
        if (!($os = shell_exec('/usr/bin/lsb_release -ds | cut -d= -f2 | tr -d \'"\''))) {
            if (!($os = shell_exec('cat /etc/system-release | cut -d= -f2 | tr -d \'"\''))) {
                if (!($os = shell_exec('find /etc/*-release -type f -exec cat {} \; | grep PRETTY_NAME | tail -n 1 | cut -d= -f2 | tr -d \'"\''))) {
                    $os = 'N.A';
                }
            }
        }
        $os = trim($os, '"');
        $os = str_replace("\n", '', $os);

        // Kernel
        if (!($kernel = shell_exec('/bin/uname -r'))) {
            $kernel = 'N.A';
        }

        // Uptime
        if (!($totalSeconds = intval(shell_exec('/usr/bin/cut -d. -f1 /proc/uptime')))) {
            $uptime = 'N.A';
        } else {
            $uptime = self::getHumanTime($totalSeconds);
        }

        // Last boot
        if (!($upt_tmp = shell_exec('cat /proc/uptime'))) {
            $last_boot = 'N.A';
        } else {
            $upt       = explode(' ', $upt_tmp);
            $last_boot = date('Y-m-d H:i:s', time() - intval($upt[0]));
        }

        // Current users
        if (!($current_users = shell_exec('who -u | awk \'{ print $1 }\' | wc -l'))) {
            $current_users = 'N.A';
        }

        // Server datetime
        if (!($server_date = shell_exec('/bin/date'))) {
            $server_date = date('Y-m-d H:i:s');
        }


        $datas = array(
            'hostname'      => $hostname,
            'os'            => $os,
            'kernel'        => $kernel,
            'uptime'        => $uptime,
            'last_boot'     => $last_boot,
            'current_users' => $current_users,
            'server_date'   => $server_date,
        );

        return $datas;
    }


    /**
     * Seconds to human readable text
     * Eg: for 36545627 seconds => 1 year, 57 days, 23 hours and 33 minutes
     *
     * @return string Text
     */
    public static function getHumanTime($seconds)
    {
        $units = array(
            'year'   => 365 * 86400,
            'day'    => 86400,
            'hour'   => 3600,
            'minute' => 60,
            // 'second' => 1,
        );

        $parts = array();

        foreach ($units as $name => $divisor) {
            $div = floor($seconds / $divisor);

            if ($div == 0) {
                continue;
            } else {
                if ($div == 1) {
                    $parts[] = $div . ' ' . $name;
                } else {
                    $parts[] = $div . ' ' . $name . 's';
                }
            }
            $seconds %= $divisor;
        }

        $last = array_pop($parts);

        if (empty($parts)) {
            return $last;
        } else {
            return join(', ', $parts) . ' and ' . $last;
        }
    }
}