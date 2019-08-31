{extends "design.tpl"}

{block "content"}
    <form method="POST" class="card">
        <h1 class="card-header bg-warning text-white">Confirmation required</h1>

        <div class="card-body">
            {$question|escape|default:"Are you sure you want to continue?"|markdown}
        </div>

        <div class="card-footer">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-secondary" onclick="javascript:history.go(-1);">No</button>
                <button type="submit" class="btn btn-primary">Yes</button>
            </div>
        </div>
    </form>
{/block}