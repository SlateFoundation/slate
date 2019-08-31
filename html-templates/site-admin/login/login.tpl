{extends "design.tpl"}

{block "nav"}{/block}

{block "content"}
    <div class="login-logo text-center">
        <img src="/img/emergence/logo-captioned.png" width="200">
    </div>
    <form method="POST" class="form-signin">
        {if $authException}
            <div class="notify error alert alert-danger">
                <strong>Sorry!</strong> {$authException->getMessage()}
            </div>
        {elseif $error}
            <div class="notify error alert alert-danger">
                <strong>Sorry!</strong> {$error}
            </div>
        {/if}
        <h2 class="form-signin-heading text-center">Developer Tools</h2>
        <label for="username" class="sr-only">Username / Email address</label>
        <input type="text" name="_LOGIN[username]" id="username" class="form-control" placeholder="Username / Email Address" required autofocus>
        <label for="password" class="sr-only">Password</label>
        <input type="password" name="_LOGIN[password]" id="password" class="form-control" placeholder="Password" required>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>
{/block}