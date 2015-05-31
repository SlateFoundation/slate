{extends "designs/site.tpl"}

{block "title"}Register &mdash; {$dwoo.parent}{/block}

{block "content"}
    {$User = $data}
    {$errors = $User->validationErrors}

    <h2>Create online account for {Slate::$schoolName}</h2>

    <form method="POST" class="register-form">
        {if $errors}
            <div class="notify error">
                <strong>Please double-check the fields highlighted below.</strong>
            </div>
        {/if}

        <fieldset class="shrink">
            <div class="inline-fields">
                {* field name label='' error='' type=text placeholder='' hint='' required=false autofocus=false *}
                {field inputName=FirstName label='First Name' error=$errors.FirstName required=true autofocus=true}
                {field LastName 'Last Name' $errors.LastName text '' '' true}
            </div>

                {field Email 'Email Address' $errors.PrimaryEmail.address email '' '' true}

                {field Username Username $errors.Username username '' '' true}

            <div class="inline-fields">
                {field Password Password $errors.Password password '' '' true}
                {field PasswordConfirm '(Confirm)' $errors.PasswordConfirm password '' '' true}
            </div>

            <div class="submit-area">
                <input type="submit" class="button submit" value="Create Account">
                <span class="submit-text">or <a href="/login{tif $.request.return ? cat('?return=', escape($.request.return, url))}">Log In</a></span>
            </div>
        </fieldset>
    </form>
{/block}