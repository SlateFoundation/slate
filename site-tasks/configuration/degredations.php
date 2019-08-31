<?php

return [
    'title' => 'Manage Degredations',
    'description' => 'Enable or disable degredation flags that can be used to reduce the functionality of sites live while under failure or high load',
    'icon' => 'power-off',
    'handler' => function () {
        $config = Site::getConfig();
        $degredations = !empty($config['degredations']) ? $config['degredations'] : [];
        $changes = [];

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {

            // parse degredation changes from request input
            if (!empty($_POST['degredations']) && is_array($_POST['degredations'])) {
                foreach ($_POST['degredations'] AS $key => $value) {
                    if ($key && is_string($key)) {
                        $changes[$key] = $value == 'on';
                    }
                }
            }

            if (!empty($_POST['enable'])) {
                foreach (is_array($_POST['enable']) ? $_POST['enable'] : [$_POST['enable']] AS $key) {
                    if ($key && is_string($key)) {
                        $changes[$key] = true;
                    }
                }
            }

            if (!empty($_POST['disable'])) {
                foreach (is_array($_POST['disable']) ? $_POST['disable'] : [$_POST['disable']] AS $key) {
                    if ($key && is_string($key)) {
                        $changes[$key] = false;
                    }
                }
            }


            // apply degredations
            if (count($changes)) {
                foreach ($changes AS $key => $value) {
                    if (isset($degredations[$key]) && $degredations[$key] == $value) {
                        unset($changes[$key]);
                        continue;
                    }

                    $degredations[$key] = $value;
                }

                $config['degredations'] = $degredations;

                // update cached site config
                Cache::rawStore(Site::$rootPath, $config);
            }
        }
        
        return static::respond('degredations', [
            'degredations' => $degredations,
            'changes' => $changes
        ]);
    }
];