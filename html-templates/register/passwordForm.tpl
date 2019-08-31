{extends "designs/site.tpl"}

{block "title"}Create New Password &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h1 class="header-title title-1">Create New Password</h1>
    </header>

	{if $error}
		<p class="error lead">{$error|escape}</p>
	{/if}

    <form method="POST">
        <fieldset class="shrink">
            {field inputName=Password label=Password required=true attribs=autofocus type=password}
            {field inputName=PasswordConfirm label='<span>Re-type</span> Password' required=true attribs=autofocus type=password}

            <div class="submit-area">
                <input type="submit" class="button submit" value="Set Password">
            </div>
        </fieldset>
    </form>
{/block}