<?php

namespace Jarvus\Sencha;

use Site;

class App
{
    protected $name;
    protected $config;

    protected $framework;
    protected $cmd;

    protected $antConfig;
    protected $appAntConfig;
    protected $workspaceAntConfig;

    protected $allRequiredPackages;
    protected $classPaths;

    // factories
    public static function get($name)
    {
        $appPath = "sencha-workspace/$name";
        $appJsonNode = Site::resolvePath("$appPath/app.json");

        if (!$appJsonNode) {
            return null;
        }

        $appJson = @file_get_contents($appJsonNode->RealPath);

        if (!$appJson) {
            throw new \Exception("Could read app.json for $appPath");
        }

        $appConfig = @json_decode(Util::cleanJson($appJson), true);

        if (!$appConfig || empty($appConfig['name'])) {
            throw new \Exception("Could not parse app.json for $appPath");
        }

        return new static($name, $appConfig);
    }


    // magic methods and property getters
    public function __construct($name, $config)
    {
        $this->name = $name;
        $this->config = $config;
    }

    public function __toString()
    {
        return $this->name;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getConfig($key = null)
    {
        return $key ? $this->config[$key] : $this->config;
    }


    // member methods
    public function getFramework()
    {
        if (!$this->framework) {
            $frameworkName = $this->getAntConfig('app.framework');
            $frameworkVersion = $this->getAntConfig('app.framework.version');

            if (!$frameworkVersion) {
                $frameworkVersion = $this->getAntConfig("workspace.frameworks.{$frameworkName}.version");
            }

            if (!$frameworkVersion) {
                throw new \Exception('Could not determine framework version');
            }

            $this->framework = Framework::get($frameworkName, $frameworkVersion);
        }

        return $this->framework;
    }

    public function getCmd()
    {
        if ($this->cmd === null) {
            $cmdVersion = $this->getAntConfig('app.cmd.version') ?: $this->getAntConfig('workspace.cmd.version');
            $this->cmd = $cmdVersion ? Cmd::get($cmdVersion) : null;
        }

        return $this->cmd;
    }

    /**
     * Gets aggregate ant config of workspace/sencha.cfg + app/sencha.cfg + app.json
     */
    public function getAntConfig($key = null)
    {
        if (!$this->antConfig) {
            // TODO: maybe execute an ant task to get these? cache until any .cfg or .properties files change in app or workspace?

            // start with workspace ant config (already in dotted-key tree format)
            $this->antConfig = $this->getWorkspaceAntConfig();

            // append nested array data from workspace.json config on top of dotted-key tree
            \Emergence\Util\Data::collapseTreeToDottedKeys($this->getWorkspaceConfig(), $this->antConfig, 'workspace');

            // start with app ant config (already in dotted-key tree format)
            $this->antConfig = array_merge($this->antConfig, $this->getAppAntConfig());

            // append nested array data from app.json config on top of dotted-key tree
            \Emergence\Util\Data::collapseTreeToDottedKeys($this->config, $this->antConfig, 'app');

            // apply local build config if present
            if ($localConfigNode = Site::resolvePath("sencha-workspace/$this/local.properties")) {
                $this->antConfig = array_merge($this->antConfig, Util::loadAntProperties($localConfigNode->RealPath));
            }
            // TODO: cache this with an event handler to clear?
        }

        return $key ? $this->antConfig[$key] : $this->antConfig;
    }

    /**
     * Gets dotted-key values from app/sencha.cfg
     */
    public function getAppAntConfig($key = null)
    {
        if (!$this->appAntConfig) {
            $appPath = "sencha-workspace/$this";
            $antConfigNode = Site::resolvePath("$appPath/.sencha/app/sencha.cfg");

            if ($antConfigNode) {
                $this->appAntConfig = Util::loadAntProperties($antConfigNode->RealPath);
            } else {
                $this->appAntConfig = [];
            }
        }

        return $key ? $this->appAntConfig[$key] : $this->appAntConfig;
    }

    /**
     * Gets dotted-key values from workspace/sencha.cfg
     */
    public function getWorkspaceAntConfig($key = null)
    {
        if (!$this->workspaceAntConfig) {
            $antConfigPath = 'sencha-workspace/.sencha/workspace/sencha.cfg';
            $antConfigNode = Site::resolvePath($antConfigPath);

            $this->workspaceAntConfig = $antConfigNode ? Util::loadAntProperties($antConfigNode->RealPath) : [];
        }

        return $key ? $this->workspaceAntConfig[$key] : $this->workspaceAntConfig;
    }

    /**
     * Gets nested object from workspacejson
     */
    public function getWorkspaceConfig($key = null)
    {
        if (!$this->workspaceConfig) {
            $configPath = 'sencha-workspace/workspace.json';
            $configNode = Site::resolvePath($configPath);

            $this->workspaceConfig = $configNode ? @json_decode(Util::cleanJson(file_get_contents($configNode->RealPath)), true) : [];
        }

        return $key ? $this->workspaceConfig[$key] : $this->workspaceConfig;
    }

    public function getRequiredPackageNames()
    {
        $packages = $this->getConfig('requires') ?: [];

        if (($themePackage = $this->getAntConfig('app.theme')) && !in_array($themePackage, $packages)) {
            $packages[] = $themePackage;
        }

        return $packages;
    }

    public function getAllRequiredPackages()
    {
        if (!$this->allRequiredPackages) {
            $this->allRequiredPackages = Package::aggregatePackageDependencies($this->getRequiredPackageNames(), $this->getFramework());
        }

        return $this->allRequiredPackages;
    }

    public function getClassPaths()
    {
        if (!$this->classPaths) {
            $this->classPaths = array_unique(array_filter(array_merge(
                explode(',', $this->getAntConfig('app.classpath')),
                explode(',', $this->getAntConfig('workspace.classpath'))
            )));
        }

        return $this->classPaths;
    }
}
