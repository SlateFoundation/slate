{extends "design.tpl"}

{block title}{$source->getId()} &mdash; {$dwoo.parent}{/block}

{block nav}
    {$activeSection = 'sources'}
    {$dwoo.parent}
{/block}

{block breadcrumbs}
    <li class="breadcrumb-item"><a href="/site-admin/sources">Sources</a></li>
    <li class="breadcrumb-item active"><a href="/site-admin/sources/{$source->getId()}">{$source->getId()}</a></li>
{/block}

{block css}
    {$dwoo.parent}
    <style>
        .worktree-status {
            font-family: monospace;
        }
        .worktree-file label {
            display: block;
            margin: 0;
        }
        .worktree-file.added {
            background-color: #dbffdb;
        }
        .worktree-file.modified {
            background-color: #fff3b2;
        }
        .worktree-file.deleted {
            background-color: #ffdddd;
        }
        .worktree-file.untracked {
            background-color: #dddddd;
        }
        .worktree-file:hover {
            background-image: linear-gradient(to bottom, rgba(255, 255, 255, .5), rgba(255, 255, 255, .4));
            outline: 1px solid rgba(0, 0, 0, .1);
        }
    </style>
{/block}

{block "js-bottom"}
    {$dwoo.parent}
    {jsmin "site-admin/source.js"}
{/block}

{block "content"}
    {load_templates "templates.tpl"}
    {$status = $source->getStatus()}

    <div class="page-header">
        <div class="btn-toolbar float-right">
            <div class="btn-group">
                {if !$source->isInitialized()}
                    <a href="/site-admin/sources/{$source->getId()}/initialize" class='btn btn-primary'>
                        {icon "play-circle"}
                        Initialize Repository
                    </a>
                {/if}
            </div>
        </div>

        <h1>{$source->getId()}</h1>
    </div>


    {template fileStatus file group source}
        {strip}
            {$status = tif($group == staged ? $file.indexStatus : $file.workTreeStatus)}
            <li class="worktree-file {tif $file.staged ? staged} {tif $file.unstaged ? unstaged} {tif $file.tracked ? tracked : untracked} {tif $file.ignored ? ignored} {tif $status == 'A' ? added} {tif $status == 'M' || $status == 'R' || $status == 'C' ? modified} {tif $status == 'D' ? deleted}">
                <a class="float-right" href="/site-admin/sources/{$source->getId()}/diff/{$group}/{$file.currentPath|escape}">diff</a>
                <label>
                    <input type="checkbox" name="paths[]" value="{$file.path|escape}">
                    &nbsp;
                    <span class="status">{$status|default:'&nbsp;'}</span>
                    &emsp;
                    <span class="path">{$file.path|escape}</span>
                    {if $file.renamedPath}
                        &emsp;&rarr;&emsp;
                        <span class="renamed-path">{$file.renamedPath|escape}</span>
                    {/if}
                </label>
            </li>
        {/strip}
    {/template}

    {if $source->isInitialized()}
        {$upstreamDiff = $source->getUpstreamDiff()}
        <div class="card mb-3">
            <div class="card-header {tif $upstreamDiff.error ? 'bg-danger text-white'}">
                <small class="float-right">{$source->getWorkingBranch()|escape}&harr;{$source->getUpstreamBranch()|escape}</small>
                Branch Status
            </div>

            {if $upstreamDiff.error}
                <pre class="card-body" role="alert">{$upstreamDiff.error|escape}</pre>
            {else}
                <table class="table card-body">
                    <thead>
                        <tr>
                            <th width="50%">
                                <form method="POST" action="/site-admin/sources/{$source->getId()}/push" onsubmit="return confirm('Are you sure?')">
                                    {$upstreamDiff.ahead|number_format} commit{tif $upstreamDiff != 1 ? s} ahead
                                    {if $upstreamDiff.ahead && !$upstreamDiff.behind}
                                        <button type="submit" class="btn btn-secondary btn-sm">Push</button>
                                    {/if}
                                </form>
                            </th>
                            <th width="50%">
                                <form method="POST" action="/site-admin/sources/{$source->getId()}/pull" onsubmit="return confirm('Are you sure?')">
                                    {$upstreamDiff.behind|number_format} commit{tif $upstreamDiff != 1 ? s} behind
                                    {if $upstreamDiff.behind && !$upstreamDiff.ahead}
                                        <button type="submit" class="btn btn-secondary btn-sm">Pull (fast fwd)</button>
                                    {/if}
                                </form>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {foreach item=commit from=$upstreamDiff.commits}
                            <tr>
                                {if $commit.position == behind}
                                    <td width="50%"></td>
                                {/if}
                                <td width="50%">
                                    <small class="badge badge-pill badge-{tif $commit.position == ahead ? success : info}">{$commit.hash|substr:0:8}</small> {$commit.subject|escape}
                                    <div class="small">
                                        by <a href="mailto:{$commit.authorEmail|escape}">{$commit.authorName|escape}</a>
                                        on {$commit.timestamp|date_format:"%b %e, %Y %l:%M%P"}
                                    </div>
                                </td>
                                {if $commit.position == ahead}
                                    <td width="50%"></td>
                                {/if}
                            </tr>
                        {/foreach}
                    </tbody>
                </table>
            {/if}
        </div>

        {$workTreeStatus = $source->getWorkTreeStatus(array(groupByStatus=yes))}

        <div class="card mb-3">
            <div class="card-header">
                <div class="btn-group btn-group-sm float-right">
                    <a class="btn btn-secondary" href="/site-admin/sources/{$source->getId()}/diff/staged">Diff</a>
                </div>
                Staged Commit
            </div>

            <div class="card-body">
                {if !$workTreeStatus.staged}
                    <div class="alert alert-info" role="alert">Stage some changes from the git working tree below to start building a commit</div>
                {else}
                    <form class="checkbox" method="POST" action="/site-admin/sources/{$source->getId()|escape}/unstage">
                        <ul class="list-unstyled worktree-status worktree-staged">
                            {foreach item=file from=$workTreeStatus.staged}
                                {fileStatus $file group=staged source=$source}
                            {/foreach}
                        </ul>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                {icon "minus"} Untage Selected
                            </button>
                            <button type="button" class="btn btn-secondary worktree-select-all">
                                {icon "check-square"} Select All
                            </button>
                            <button type="button" class="btn btn-secondary worktree-select-none">
                                {icon "square"} Select None
                            </button>
                        </div>
                    </form>

                    <hr>

                    <form method="POST" action="/site-admin/sources/{$source->getId()|escape}/commit">
                        <div class="form-group row">
                            <label for="inputCommitAuthor" class="col-sm-2 control-label">Author</label>
                            <div class="col-sm-10">
                                <input class="form-control" id="inputCommitAuthor" name="author" value="{$.User->FullName|escape} <{$.User->Email|escape}>">
                            </div>
                        </div>

                        {$draftCommitMessage = explode("\n\n", $source->getDraftCommitMessage(), 2)}
                        <div class="form-group row">
                            <label for="inputCommitSubject" class="col-sm-2 control-label">Subject</label>
                            <div class="col-sm-10">
                                <input class="form-control" id="inputCommitSubject" name="subject" placeholder="Update &hellip;" value="{$draftCommitMessage[0]|escape}">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="inputCommitExtended" class="col-sm-2 control-label">Extended Description</label>
                            <div class="col-sm-10">
                                <textarea class="form-control" rows="3" id="inputCommitExtended" name="extended" placeholder="Add an optional extended description&hellip;">{$draftCommitMessage[1]|escape}</textarea>
                            </div>
                        </div>

                        <div class="form-group row">
                            <div class="col-sm-offset-2 col-sm-10">
                                <button type="submit" class="btn btn-primary">Commit</button>
                                <button type="submit" class="btn btn-secondary" name="action" value="save-draft">Save Message Draft</button>
                            </div>
                        </div>
                    </form>
                {/if}
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-header">
                <div class="btn-group btn-group-sm float-right">
                    <a class="btn btn-secondary" href="/site-admin/sources/{$source->getId()}/diff/unstaged">Diff</a>
                    <a class="btn btn-secondary" href="/site-admin/sources/{$source->getId()}/clean">Clean</a>
                    <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sync</button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/site-admin/sources/{$source->getId()}/sync-from-vfs">Update <strong>git working tree</strong> <div class="small">from emergence VFS</div></a></li>
                        <li><a class="dropdown-item" href="/site-admin/sources/{$source->getId()}/sync-to-vfs">Update <strong>emergence VFS</strong> <div class="small">from git working tree</div></a></li>
                    </ul>
                </div>
                Git Working Tree
            </div>

            <div class="card-body checkbox">
                {if $workTreeStatus.unstaged}
                    <form method="POST" action="/site-admin/sources/{$source->getId()|escape}/stage">
                        <h3>Unstaged</h3>
                        <ul class="list-unstyled worktree-status worktree-unstaged">
                            {foreach item=file from=$workTreeStatus.unstaged}
                                {fileStatus $file group=unstaged source=$source}
                            {/foreach}
                        </ul>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                {icon "plus"} Stage Selected
                            </button>
                            <button type="button" class="btn btn-secondary worktree-select-all">
                                {icon "check-square"} Select All
                            </button>
                            <button type="button" class="btn btn-secondary worktree-select-none">
                                {icon "square"} Select None
                            </button>
                        </div>
                    </form>
                {else}
                    <div class="alert alert-success"><strong>The working tree is clean.</strong> If you've made changes in the emergence VFS, <a href="/site-admin/sources/{$source->getId()}/sync-from-vfs">update the git working tree from emergence VFS</a>.</div>
                {/if}
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-header">
                <div class="btn-group btn-group-sm float-right">
                    <a class="btn btn-secondary" href="/site-admin/sources/{$source->getId()}/erase">Erase from VFS</a>
                </div>
                VFS Mappings
            </div>

            <table class="table table-striped card-body">
                <thead>
                    <tr>
                        <th>Repository Path</th>
                        <th>Site Path</th>
                    </tr>
                </thead>
                <tbody>
                    {foreach item=tree from=$source->getTrees()}
                        <tr>
                            <td>{$tree.gitPath|escape}</td>
                            <td>{$tree.vfsPath|escape}</td>
                        </tr>
                    {/foreach}
                </tbody>
            </table>
        </div>
    {/if}

    <div class="card mb-3">
        <div class="card-header">
            {if $source->isInitialized()}
                <small class="float-right"><a href="{$source->getCloneUrl()|escape}">{$source->getCloneUrl()|escape}</a></small>
            {/if}
            Repository Configuration
        </div>

        <dl class="card-body row">
            <dt class="col-2 text-right">status</dt>
            <dd class="col-10"><span class="badge badge-pill badge-{sourceStatusCls $status}">{$status}</span></dd>

            {if $source->isInitialized()}
                <dt class="col-2 text-right">clone url</dt>
                <dd class="col-10"><a href="{$source->getCloneUrl()|escape}">{$source->getCloneUrl()|escape}</a></dd>
            {/if}

            <dt class="col-2 text-right">commit</dt>
            <dd class="col-10">{$source->getCommitDescription()|escape}</dd>

            <dt class="col-2 text-right">working branch</dt>
            {$workingBranch = $source->getWorkingBranch()}
            <dd class="col-10">
                {if $status == 'clean'}
                    <form method="POST" action="/site-admin/sources/{$source->getId()|escape}/checkout">
                        <select name="ref">
                            {if !$workingBranch}
                                <option value="" selected>(detached HEAD)</option>
                            {/if}
                            {foreach item=refs key=group from=$source->getGroupedRefs()}
                                <optgroup label="{$group|escape}">
                                    {foreach item=ref from=$refs}
                                        <option value="{$group|escape}/{$ref|escape}" {if $group == 'heads' && $ref == $workingBranch}selected{/if}>{$ref|escape}</option>
                                    {/foreach}
                                </optgroup>
                            {/foreach}
                        </select>
                        <button type="submit" class="btn btn-secondary btn-sm">
                            {icon "play"} Checkout
                        </button>
                    </form>
                {else}
                    {$workingBranch|escape} (clean working tree to switch)
                {/if}
            </dd>

            <dt class="col-2 text-right">upstream branch</dt>
            <dd class="col-10">{$source->getUpstreamBranch()|escape}</dd>

            <dt class="col-2 text-right">remote</dt>
            <dd class="col-10">{$source->getRemoteUrl()|escape}</dd>

            {if $source->getRemoteProtocol() == 'ssh'}
                <dt class="col-2 text-right">ssh deploy key</dt>
                <dd class="col-10">
                    {$deployKey = $source->getDeployKey()}
                    {if $deployKey}
                        Fingerprint: {$deployKey->getFingerprint()}
                    {else}
                        <em>None configured</em>
                    {/if}
                    <a class="btn btn-secondary btn-sm" href="/site-admin/sources/{$source->getId()}/deploy-key">
                        {icon "lock"} Manage Deploy Key
                    </a>
                </dd>
            {/if}
        </dl>
    </div>
{/block}