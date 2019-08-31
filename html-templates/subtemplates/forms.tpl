{template validationErrors errors itemsOnly=no}
    {if count($errors) > 0}
        {if !$itemsOnly}
            <div class="error notify">
                <ul class="validation-errors">
        {/if}

                {foreach $errors error}
                    {if is_array($error)}
                        {validationErrors $error itemsOnly=yes}
                    {else}
                        <li>{$error}</li>
                    {/if}
                {/foreach}

        {if !$itemsOnly}
                </ul>
            </div>
        {/if}
    {/if}
{/template}

{template labeledField html type=text label='' error='' hint='' required=false class=null}
    <label class="field {$type}-field {if $error}has-error{/if} {if $required}is-required{/if} {$class}">
        {if $label}<span class="field-label">{$label}</span>{/if}

        {$html}

        {if $error}<p class="error-text">{$error}</p>{/if}
        {if $hint}<p class="hint">{$hint}</p>{/if}
    </label>
{/template}

{template field inputName label='' error='' type=text placeholder='' hint='' required=false autofocus=false attribs='' default=null class=null fieldClass=null}
    {capture assign=html}
        <input type="{$type}"
            class="field-control {$class}"
            name="{$inputName|escape}"
            {if $placeholder}placeholder="{$placeholder|escape}"{/if}
            {if $autofocus}autofocus{/if}
            {if $required}required aria-required="true"{/if}
            {$attribs}
            value="{refill field=$inputName default=$default}">
    {/capture}

    {labeledField html=$html type=$type label=$label error=$error hint=$hint required=$required class=$fieldClass}
{/template}

{template checkbox inputName value label='' error='' hint='' attribs='' default=null class=null unsetValue=null}
    {capture assign=html}
        <input type="checkbox"
            class="field-control {$class}"
            name="{$inputName|escape}"
            value="{$value|escape}"
            {$attribs}
            {refill field=$inputName default=$default checked=$value}>
    {/capture}

    {if $unsetValue !== null}
        <input type="hidden" name="{$inputName|escape}" value="{$unsetValue|escape}">
    {/if}

    {labeledField html=$html type=checkbox label=$label error=$error hint=$hint required=$required}
{/template}

{template textarea inputName label='' error='' placeholder='' hint='' required=false attribs='' default=null class=null fieldClass=null}
    {capture assign=html}
        <textarea
            class="field-control {$class}"
            name="{$inputName|escape}"
            {if $placeholder}placeholder="{$placeholder|escape}"{/if}
            {if $required}required aria-required="true"{/if}
            {$attribs}
        >{refill field=$inputName default=$default}</textarea>
    {/capture}

    {labeledField html=$html type=textarea label=$label error=$error hint=$hint required=$required class=$fieldClass}
{/template}

{template loginField}{field inputName=_LOGIN[username] label=Username required=true attribs='autofocus autocapitalize="none" autocorrect="off" spellcheck="false"' hint='You can also log in with your email address.'}{/template}
{template passwordField}{field inputName=_LOGIN[password] label=Password hint='<a href="/register/recover">Forgot?</a>' required=true refill=false type=password}{/template}

{template selectField inputName label='' options=null useKeyAsValue=yes default=null error='' hint='' required=false attribs='' class=null fieldClass=null blankOption='Select' blankValue=''}
    {capture assign=html}
        <select
            class="field-control {$class}"
            name="{$inputName}"
            {if $required}required aria-required="true"{/if}
            {$attribs}
        >
            {if $blankOption}
                <option value="{$blankValue|escape}">{$blankOption|escape}</option>
            {/if}

            {foreach key=value item=text from=$options}
                {$value = tif($useKeyAsValue, $value, $text)}
                {$text = tif(is_a($text, 'ActiveRecord'), $text->getTitle(), $text)}
                <option {refill field=$inputName default=$default selected=$value} value="{$value|escape}">{$text|escape}</option>
            {/foreach}
        </select>
    {/capture}

    {labeledField html=$html type='select' label=$label error=$error hint=$hint required=$required class=$fieldClass}
{/template}