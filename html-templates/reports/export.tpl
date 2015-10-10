{extends 'designs/print.tpl'}

{block 'body'}

    <h1 class="doc-title">{$data[0]['StudentFullName']}</h1>

    {$lastRecordType = false}
    {foreach item=Record from=$data}

        {if $lastRecordType != $Record.Class}
            {if $lastRecord}</section>{/if}
            <section class="doc-group">
                <h2 class="group-title">
                    {if $Record.Class == 'Slate\\Progress\\Note'}Progress Note
                    {*elseif $Record.Class == 'Slate\\Progress\\Narratives\\Report'}Narrative Report
                    {elseif $Record.Class == 'Slate\\Progress\\Interims\\Report'}Interim Report
                    {elseif $Record.Class == 'Standards'}Standards*}
                    {/if}
                </h2>
        {/if}

        {if $Record.Class == 'Slate\\Progress\\Note'}
            {progressnote $Record}
        {*
            {elseif $Record.Class == 'Slate\\Progress\\Narratives\\Report'}
                {narrative $Record}
            {elseif $Record.Class == 'Slate\\Progress\\Interims\\Report'}
                {interim $Record}
            {elseif $Record.Class == 'Standards'}
                {standards $Record}
        *}
        {/if}

        {$lastRecordType = $Record.Class}

        {*<details><summary>Dump</summary>{print_r($data)}</details>*}
    {/foreach}

    {if $lastRecordType}</section>{/if}

{/block}