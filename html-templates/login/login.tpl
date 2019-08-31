{extends "designs/site.tpl"}

{block "content"}
    <h2>Log in to {Slate::$schoolName}</h2>
    {if $authException}
        <div class="notify error">
            <strong>Sorry!</strong> {$authException->getMessage()}
        </div>
    {elseif $error}
        <div class="notify error">
            <strong>Sorry!</strong> {$error}
        </div>
    {/if}

    <form method="POST" class="login-form">
        {foreach item=value key=name from=$postVars}
            {if is_array($value)}
                {foreach item=subvalue key=subkey from=$value}
                <input type="hidden" name="{$name|escape}[{$subkey|escape}]" value="{$subvalue|escape}">
            {else}
                <input type="hidden" name="{$name|escape}" value="{$value|escape}">
            {/if}
        {/foreach}

        <input type="hidden" name="_LOGIN[returnMethod]" value="{refill field=_LOGIN.returnMethod default=$.server.REQUEST_METHOD}">
        <input type="hidden" name="_LOGIN[return]" value="{refill field=_LOGIN.return default=$.server.REQUEST_URI}">

        <fieldset class="shrink">
            {loginField}
            {passwordField}

            <div class="submit-area">
                <input type="submit" class="button submit" value="Log In">
                {if RegistrationRequestHandler::$enableRegistration}
                    <span class="submit-text">or <a href="/register{tif $.request.return || $.server.SCRIPT_NAME != '/login' ? cat('?return=', escape(default($.request.return, $.server.REQUEST_URI), url))}">Register</a></span>
                {/if}
            </div>
        </fieldset>
    </form>
{/block}