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

    <form method="POST" class="generic single" id="slate-set-password-form">
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

    {if RemoteSystems\GoogleApps::$domain}
        <script src="https://ssl.gstatic.com/accounts/chrome/users-1.0.js"></script>
        <script>
            google.principal.initialize(function() {
                var passwordForm = document.getElementById('slate-set-password-form'),
                    token = Math.random(),
                    addedPassword;

                passwordForm.addEventListener('submit', function(ev) {
                    var password = passwordForm.password.value;

                    // skip add call if form invalid or entered password has already been sent
                    if (!password || password != passwordForm.passwordConfirm.value || password == addedPassword) {
                        return;
                    }

                    ev.preventDefault();
                    addedPassword = password;

                    google.principal.add({
                        token: token,
                        user: {cat($.User->Username, '@', RemoteSystems\GoogleApps::$domain)|json_encode},
                        passwordBytes: password,
                        keyType: 'KEY_TYPE_PASSWORD_PLAIN'
                    }, function() {
                        google.principal.complete({
                            token: token
                        }, function() {
                            passwordForm.submit();
                        });
                    });
                })
            });
        </script>
    {/if}
{/block}