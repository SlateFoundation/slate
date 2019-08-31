{extends "designs/site.tpl"}

{block "title"}Recover Your Password &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h1 class="header-title title-1">Recover Your Password</h1>
	</header>

	<p class="lead">
        We have sent an email to the address supplied when you created your account with a
        link that will allow you to create a new password. The link will expire after
        {Token::$expirationHours} hours.
    </p>
{/block}