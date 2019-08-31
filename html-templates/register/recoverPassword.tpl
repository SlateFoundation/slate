{extends "designs/site.tpl"}

{block "title"}Reset Password &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
    	<h1 class="header-title title-1">Reset Your Password</h1>
	</header>

	<p class="page-info">Enter the username or email address associated with your account below, and you will receive an email with instructions to reset your password.</p>

	{if $error}
		<div class="notify error">{$error|escape}</div>
	{/if}
	
	<form method="POST" id="recover-form" class="generic single">
		<fieldset class="shrink">
		    {field inputName='username' label='Email or Username' required=true attribs='autofocus'}
            <div class="submit-area">
                <button type="submit" class="submit">Reset Password</button>
            </div>
		</fieldset>
	</form>
{/block}