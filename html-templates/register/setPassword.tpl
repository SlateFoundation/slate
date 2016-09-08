{extends "designs/site.tpl"}

{block "title"}Set Password &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h1 class="header-title title-1">Create Your Password</h1>
    </header>

    <p class="page-info">Your current password was generated to help you start using {Site::getConfig(primary_hostname)}.</p>

    <p>Create your own password to use for logging in going forward.</p>

    {if $error}
        <div class="notify error">{$error|escape}</div>
    {/if}

    <form method="POST" class="generic single">
        <input type="hidden" name="returnUrl" value="{refill field=returnUrl default=$returnUrl}">

        <fieldset class="shrink">
            {field inputName=password type=password label='New Password' required=true attribs='autofocus'}
            {field inputName=passwordConfirm type=password label='Confirm' required=true hint='Type the same password twice to confirm it'}

            <div class="submit-area">
                <input type="submit" class="button submit" value="Set Password">
                <span class="submit-text">or <a href="{$returnUrl|escape|default:'/dashboard'}">skip for now</a></span>
            </div>
        </fieldset>
    </form>
{/block}