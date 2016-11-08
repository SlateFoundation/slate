{extends "designs/site.tpl"}

{block "title"}Account Activated &mdash; {$dwoo.parent}{/block}

{block "content"}
    <h2>Account activated</h2>
    <p>Your account has been successfully activated and you are now logged in!</p>
    <p>Your username is <strong>{$.User->Username}</strong></p>
    <p>Take note of your username and password somewhere safe &mdash; you'll need them to sign back into your account later.</p>
<a href="/dashboard" class="button primary">Proceed to My Dashboard</a>
{/block}