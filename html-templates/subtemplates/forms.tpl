{*template field name label='' error='' type=text placeholder='' hint='' required=false autofocus=false default=null cls=null}
    <label class="field {$type}-field {if $error}has-error{/if} {if $required}is-required{/if}">
        {if $label}<span class="field-label">{$label}</span>{/if}

        {if $type==textarea}
            <textarea
        {else}
            <input type="{$type}"
        {/if}
                class="field-control {$cls}"
                name="{$name}"
                {if $placeholder}placeholder="{$placeholder}"{/if}
                {if $autofocus}autofocus{/if}
                {if $required}required{/if}
        {if $type==textarea}
            >{refill field=$name default=$default}</textarea>
        {else}
            value="{refill field=$name default=$default}">
        {/if}
        
        {if $error}<span class="error-text">{$error}</span>{/if}
        {if $hint}<p class="hint">{$hint}</p>{/if}
    </label>
{/template*}

{template labeledField html type=text label='' error='' hint='' required=false class=null}
    <label class="field {$type}-field {if $error}has-error{/if} {if $required}is-required{/if} {$class}">
        {if $label}<span class="field-label">{$label}</span>{/if}

        {$html}
        
        {if $error}<p class="error-text">{$error}</p>{/if}
        {if $hint}<p class="hint">{$hint}</p>{/if}
    </label>
{/template}

{template field name label='' error='' type=text placeholder='' hint='' required=false autofocus=false attribs='' default=null class=null fieldClass=null}
    {capture assign=html}
        <input type="{$type}"
            class="field-control {$class}"
            name="{$name|escape}"
            {if $placeholder}placeholder="{$placeholder|escape}"{/if}
            {if $autofocus}autofocus{/if}
            {if $required}required{/if}
            {$attribs}
            value="{refill field=$name default=$default}">
    {/capture}
    
    {labeledField html=$html type=$type label=$label error=$error hint=$hint required=$required class=$fieldClass}
{/template}

{template checkbox name value label='' error='' hint='' attribs='' default=null class=null unsetValue=null}
    {capture assign=html}
        <input type="checkbox"
            class="field-control {$class}"
            name="{$name|escape}"
            value="{$value|escape}"
            {$attribs}
            {refill field=$name default=$default checked=$value}>
    {/capture}

    {if $unsetValue !== null}
        <input type="hidden" name="{$name|escape}" value="{$unsetValue|escape}">
    {/if}
    
    {labeledField html=$html type=checkbox label=$label error=$error hint=$hint required=$required}
{/template}

{template textarea name label='' error='' placeholder='' hint='' required=false attribs='' default=null}
    {capture assign=html}
        <textarea
            class="field-control"
            name="{$name|escape}"
            {if $placeholder}placeholder="{$placeholder|escape}"{/if}
            {if $required}required{/if}
            {$attribs}
        >{refill field=$name default=$default}</textarea>
    {/capture}
    
    {labeledField html=$html type=textarea label=$label error=$error hint=$hint required=$required}
{/template}

{template loginField}{field name=_LOGIN[username] label=Username required=true attribs='autofocus autocapitalize="none" autocorrect="off"' hint='You can also log in with your email address.'}{/template}
{template passwordField}{field name=_LOGIN[password] label=Password hint='<a href="/register/recover">Forgot?</a>' required=true refill=false type=password}{/template}
