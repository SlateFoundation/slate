<?php

namespace Emergence\Connectors;


trait LaunchableTrait
{
    public static $launchers = [];

    public function getLaunchers()
    {
        $launchers = [];

        foreach ($this->Mappings AS $Mapping) {
            if (empty(static::$launchers[$Mapping->Connector])) {
                continue;
            }

            $launcherClass = static::$launchers[$Mapping->Connector];

            if ($url = $launcherClass::getLaunchUrl($Mapping)) {
                $launchers[] = [
                    'title' => 'Launch ' . $launcherClass::getTitle(),
                    'url' => $url
                ];
            }
        }

        return $launchers;
    }
}