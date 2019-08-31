<?php

namespace Emergence\Dwoo;

class PluginLoader implements \Dwoo_ILoader
{
    public static $searchPaths = array(
        ''
        ,'personal/'
        ,'thirdparty/'
        ,'builtin/'
        ,'builtin/blocks/'
        ,'builtin/filters/'
        ,'builtin/functions/'
        ,'builtin/processors/'
    );

    public function loadPlugin($pluginName, $forceRehash = true)
    {
        if ($pluginName == 'array') {
            $pluginName = 'helper.array';
        }

        foreach (static::$searchPaths as $path) {
            if ($pluginNode = \Site::resolvePath("dwoo-plugins/$path$pluginName.php")) {
                break;
            }
        }

        if ($pluginNode && file_exists($pluginNode->RealPath)) {
            require($pluginNode->RealPath);
        } else {
            throw new \Dwoo_Exception('Plugin "'.$pluginName.'" can not be found in the Emergence VFS.');
        }
    }
}