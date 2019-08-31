{$data = $Submission->Data}
{capture assign=subject}
    {if $data.Subject}
        {$data.Subject}
    {elseif $data.Name}
        {Site::getConfig('primary_hostname')} contact form submission from {$data.Name}
    {else}
        {Site::getConfig('primary_hostname')} contact form submission
    {/if}
{/capture}
<html>
    <body>
        <p>A contact form has been submitted from <a href="http://{$.server.HTTP_HOST}{$.server.REQUEST_URI}">http://{$.server.HTTP_HOST}{$.server.REQUEST_URI}</a>:</p>
        
        <table border="0">
        {foreach from=$data item=value key=field}
            <tr>
        		<th scope="row" valign="top" align="right">{$field|escape}</th>
        		{if is_callable($formatters[$field])}
        			<td><?php echo $this->scope['formatters'][$this->scope['field']]($this->scope['value']); ?></td>
        		{elseif is_array($value)}
        			<td>{', '|join:$value|escape}</td>
        		{else}
        			<td>{$value|escape|nl2br}</td>
        		{/if}
        	</tr>
        {/foreach}
        </table>

    </body>
</html>