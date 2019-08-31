{if $.get.jsdebug || !Site::resolvePath('site-root/js/pages/common.js')}
    <?php
        // get framework version from workspace config
        $cacheKey = 'pages-framework-version';
        if (!$this->scope['frameworkVersion'] = Cache::fetch($cacheKey)) {
            $workspaceConfig = Sencha::loadProperties(Site::resolvePath('sencha-workspace/pages/.sencha/workspace/sencha.cfg')->RealPath);
            Cache::store($cacheKey, $this->scope['frameworkVersion'] = $workspaceConfig['pages.framework.version']);
        }
    ?>

    <script src="{Sencha::getVersionedFrameworkPath('ext', 'build/ext-all-debug.js', $frameworkVersion)}"></script>
    {sencha_bootstrap
        frameworkVersion=$frameworkVersion
        classPaths=array('sencha-workspace/pages/src')
        packageRequirers=array('sencha-workspace/pages/src/Common.js')
    }
{else}
    <script src="{versioned_url 'js/pages/common.js'}"></script>
{/if}

<script>
    Ext.scopeCss = true;
    Ext.USE_NATIVE_JSON = true;
    Ext.require('Site.Common');
</script>