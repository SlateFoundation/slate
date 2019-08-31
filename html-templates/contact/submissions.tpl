{extends designs/site.tpl}

{block "title"}Contact Submissions &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Contact Us Submissions</h2>
	</header>

    <table border="1">
        <thead>
            <tr>
                <th>Date</th>
                <th>From</th>
                <th>Data</th>
                <th>Sub-form</th>
            </tr>
        </thead>

        {capture assign=defaultSubject}{Site::getConfig(primary_hostname)} contact form submission{/capture}

        <tbody>
        {foreach item=Submission from=$data}
            <tr>
                <td nowrap>{$Submission->Created|date_format}</td>
                <td>
                    {if $Submission->Data.Email}<a href="mailto:{$Submission->Data.Email|escape}?subject=Re:%20{$Submission->Data.Subject|default:$defaultSubject|escape:url}">{/if}
                        {$Submission->Data.Name|escape}

                        {if $Submission->Data.Email}
                            &lt;{$Submission->Data.Email|escape}&gt;
                        {/if}

                    {if $Submission->Data.Email}</a>{/if}
                </td>
                <td>
                    <dl>
                    {foreach from=$Submission->Data item=value key=field}
                        {if $field != "Name" && $field != "Email"}
                        	<dt>{$field|escape}</dt>
                    		{if is_callable($formatters[$field])}
                    			<dd><?php echo $this->scope['formatters'][$this->scope['field']]($this->scope['value']); ?></dd>
                    		{elseif is_array($value)}
                    			<dd>{', '|join:$value|escape}</dd>
                    		{else}
                    			<dd>{$value|escape|nl2br}</dd>
                    		{/if}
                        {/if}
                    {/foreach}
                    </dl>
                </td>
                <td>{$Submission->Subform}</td>
            </tr>
        {/foreach}
        </tbody>
    </table>
{/block}