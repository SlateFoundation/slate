{extends "source.tpl"}

{block title}Initialize Repository &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    {$dwoo.parent}
    <li class="breadcrumb-item active">{icon "play-circle"} Initialize Repository</li>
{/block}

{block "content"}
    <div class="page-header">
        <h1>Initialize Repository</h1>
    </div>

    <form method="POST">
        <div class="form-group">
            <label for="inputRemoteUrl">Remote URL</label>
            <input class="form-control" id="inputRemoteUrl" type="text" value="{$source->getRemoteUrl()|escape}" readonly>
        </div>

        <div class="form-group">
            <label for="inputRemoteBranch">Remote Branch</label>
            <input class="form-control" id="inputRemoteBranch" type="text" value="{$source->getUpstreamBranch()|escape}" readonly>
        </div>

        {if $deployKey}
            <fieldset>
                <legend>SSH Deploy Key</legend>

                <p>
                    Before continuing, add the below generated public key to your git server or paste your own public+private
                    key pair. <a href="https://developer.github.com/guides/managing-deploy-keys/#deploy-keys">See this guide for
                    adding a deploy key to a GitHub repository</a>
                </p>

                <div class="form-group">
                    <label for="inputPrivateKey" class="control-label">Private Key</label>
                    <textarea name="privateKey" class="form-control" id="inputPrivateKey" rows="30" placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;&hellip;&#10;-----END RSA PRIVATE KEY-----">{$deployKey->getPrivateKey()|escape}</textarea>
                </div>

                <div class="form-group">
                    <label for="inputPublicKey">Public Key</label>
                    <textarea name="publicKey" class="form-control" id="inputPublicKey" rows="7" placeholder="ssh-rsa &hellip;">{$deployKey->getPublicKey()|escape}</textarea>
                </div>
            </fieldset>
        {/if}

        <div class="form-group">
            <button type="submit" class="btn btn-primary">{icon "play-circle"} Initialize Repository</button>
        </div>
    </form>
{/block}