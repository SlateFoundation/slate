{extends app/ext.tpl}

{block meta}
    {$title = "Manage Slate"}
    {$dwoo.parent}
{/block}

{block css-loader}
    {include includes/site.css.tpl}
{/block}

{block body}
    {include includes/site.user-tools.tpl}
{/block}

{block css-app}
    {cssmin fonts/lato.css}
    {cssmin fonts/font-awesome.css}
    {$dwoo.parent}
{/block}

{block js-app}
    {$dwoo.parent}
    {if $.User->hasAccountLevel(Developer) && $.get.slateHost}
        <script>
            Ext.onReady(function() {
                SlateAdmin.API.setHostname({$.get.slateHost|json_encode});
            });
        </script>
    {/if}

    {include includes/site.analytics.tpl}
{/block}