{extends "webapps/sencha.tpl"}

{block css-head}
    {$dwoo.parent}

    {include "includes/site.css.tpl"}

	<script>
	    window.Ext = window.Ext || { };
	    Ext.scopeCss = true;
	</script>
{/block}

{block body}
    {include "includes/site.user-tools.tpl" fluid=true}
{/block}