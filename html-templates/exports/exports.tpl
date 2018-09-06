{extends designs/site.tpl}

{block content}
    {foreach key=scriptPath item=script from=$scripts implode="<hr>"}
        <h2>{$script.title|escape}</h2>

        {if $script.description}
            {$script.description|markdown}
        {/if}

        <form method="GET" action="/exports/{$scriptPath|escape}">
            {foreach key=key item=value from=$script.query}
                {$label = strtr(ucfirst($key), '_', ' ')}

                {if $key == 'students'}
                    {field
                        inputName=$key
                        label=$label
                        default=$value
                        placeholder='123,345'
                        hint='List of student IDs, group:grouphandle, or section:sectioncode, or all'
                    }
                {elseif is_bool($value)}
                    {checkbox
                        inputName=$key
                        value=yes
                        label=$label
                        default=$value
                        placeholder='any'
                    }
                {else}
                    {field
                        inputName=$key
                        label=$label
                        default=$value
                        placeholder='any'
                    }
                {/if}
            {/foreach}

            <button>Download</button>
        </form>
    {/foreach}
{/block}