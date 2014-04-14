{template field name label='' error='' type=text placeholder='' hint='' required=false autofocus=false}
	<label class="field {$type}-field {if $error}has-error{/if} {if $required}is-required{/if}">
		{if $label}<span class="field-label">{$label}</span>{/if}

		{if $type==textarea}
			<textarea
		{else}
			<input type="{$type}"
		{/if}
				class="field-control"
				name="{$name}"
				{if $placeholder}placeholder="{$placeholder}"{/if}
				{if $autofocus}autofocus{/if}
				{if $required}required{/if}
		{if $type==textarea}
			>{refill field=$name}</textarea>
		{else}
			value="{refill field=$name}">
		{/if}
		
		{if $error}<span class="error-text">{$error}</span>{/if}
		{if $hint}<p class="hint">{$hint}</p>{/if}
	</label>
{/template}

{template labeledField name html type=text label='' error='' hint='' required=false}
	<label class="field {$type}-field {if $error}has-error{/if} {if $required}is-required{/if}">
		{if $label}<span class="field-label">{$label}</span>{/if}

		{$html}
		
		{if $error}<span class="error-text">{$error}</span>{/if}
		{if $hint}<p class="hint">{$hint}</p>{/if}
	</label>
{/template}

{template field name label='' error='' type=text placeholder='' hint='' required=false attribs='' refill=yes}
	{capture assign=html}
		<input type="{$type}"
			class="field-control"
			name="{$name}"
			{if $placeholder}placeholder="{$placeholder}"{/if}
			{if $required}required{/if}
			{$attribs}
			{if $refill}value="{refill field=$name}"{/if} >
	{/capture}
	
	{labeledField name=$name html=$html type=$type label=$label error=$error hint=$hint required=$required}
{/template}

{template textarea name label='' error='' placeholder='' hint='' required=false attribs=''}
	{capture assign=html}
		<textarea
			class="field-control"
			name="{$name}"
			{if $placeholder}placeholder="{$placeholder}"{/if}
			{if $required}required{/if}
			{$attribs}
		>{refill field=$name}</textarea>
	{/capture}
	
	{labeledField name=$name html=$html type=textarea label=$label error=$error hint=$hint required=$required}
{/template}