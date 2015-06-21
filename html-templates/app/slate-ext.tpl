{extends app/ext.tpl}

{block css-loader}
    {$dwoo.parent}
    {include includes/site.css.tpl}
	<script>
	    window.Ext = window.Ext || { };
	    Ext.scopeCss = true;
	</script>
{/block}

{block body}
    {include includes/site.user-tools.tpl}
{/block}

{block js-app}
    {$dwoo.parent}
    {include includes/site.analytics.tpl}
{/block}