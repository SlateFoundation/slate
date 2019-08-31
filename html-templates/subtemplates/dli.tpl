{template dli label value url=null default='&mdash;'}
    <div class="dli">
        <dt>{$label}</dt>
        <dd>{if $url}<a href="{$url|escape}">{/if}{default $value $default}{if $url}</a>{/if}</dd>
    </div>
{/template}