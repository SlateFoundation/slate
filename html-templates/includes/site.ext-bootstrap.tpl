{if $.get.jsdebug || !Site::resolvePath('site-root/js/pages/common.js')}
    {* TODO: generate these based on pages workspace config *}
    <script src="{Sencha::getVersionedFrameworkPath('ext', 'build/ext-all-debug.js', '5.1.1.451')}"></script>
    {sencha_bootstrap
        frameworkVersion='5.1.1.451'
        classPaths=array('sencha-workspace/pages/src', 'ext-library/Jarvus/ext/patch', 'ext-library/Jarvus/ext/override')
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