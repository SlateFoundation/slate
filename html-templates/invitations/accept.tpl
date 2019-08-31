{extends "designs/site.tpl"}

{block "title"}Accept Invitation &mdash; {$dwoo.parent}{/block}

{block "content"}
	<h2>Accept invitation and activate your account</h2>
    <p>To accept your invitation, please activate your account by choosing a password and entering it twice below.</p>
    <p>Take note of your password somewhere safe &mdash; you'll need it to sign back into your account later.</p>

	<form method="POST">
        {if $error}
    		<p class="notify error">{$error|escape}</p>
    	{/if}

        <fieldset>
            <label class="field password-field is-required">
                <span class="field-label">Password</span>
                <input type="password" class="field-control" name="Password" required>
            </label>

            <label class="field password-field is-required">
                <span class="field-label">Password (again to confirm)</span>
                <input type="password" class="field-control" name="PasswordConfirm" required>
            </label>

            <div class="submit-area">
                <input type="submit" class="button submit" value="Activate Account" {if !$Invitation}disabled{/if}>
                {if !$Invitation}<span class="submit-text">Preview mode &mdash; activate disabled</span>{/if}
            </div>
        </fieldset>
	</form>
{/block}