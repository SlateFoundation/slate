{extends "source.tpl"}

{block title}Manage Deploy Key &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    {$dwoo.parent}
    <li class="breadcrumb-item active">{icon "lock"} Configure Deploy Key</li>
{/block}

{block "content"}
    <div class="page-header">
        <h1>{icon "lock"} Configure Deploy Key</h1>
    </div>

    {if $.get.source == generated}
        <div class="alert alert-warning" role="alert">The following keypair has been generated for you but is not yet saved to your repository.</div>
    {elseif !$deployKey}
        <div class="alert alert-info" role="alert">You currently have no key configured. All Git remote functions will proceed without providing authentication credentials.</div>
    {/if}

    <form method="POST">
        <p>
            A deploy key is used to authenticate remote Git operations over SSH. <a href="https://developer.github.com/guides/managing-deploy-keys/#deploy-keys">See this guide for
            adding a deploy key to a GitHub repository</a>
        </p>

        <div class="form-group">
            <label for="inputPublicKey">Public Key</label>
            <textarea name="publicKey" class="form-control" id="inputPublicKey" rows="7" placeholder="ssh-rsa &hellip;">{tif $deployKey ? $deployKey->getPublicKey()|escape}</textarea>
        </div>

        <div class="form-group">
            <label for="inputPrivateKey" class="control-label">Private Key</label>
            <textarea name="privateKey" class="form-control" id="inputPrivateKey" rows="30" placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;&hellip;&#10;-----END RSA PRIVATE KEY-----">{tif $deployKey ? $deployKey->getPrivateKey()|escape}</textarea>
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary">Set Deploy Key</button>
            <a href="?source=generated" class="btn btn-secondary">Generate New Keypair</a>
        </div>
    </form>
{/block}