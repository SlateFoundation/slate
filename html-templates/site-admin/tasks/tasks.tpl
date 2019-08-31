{extends "design.tpl"}

{block nav}
    {$activeSection = 'tasks'}
    {$dwoo.parent}
{/block}

{block content}
    <div class="page-header">
        <h1>Site Tasks</h1>
    </div>

    {foreach item=task key=taskPath from=$tasks}
        
        {*
        {$taskGroup = strtok($taskPath, '/')}
        {if $taskGroup != $lastTaskGroup}
            <h2>{$taskGroup}/</h2>
        {/if}
        {$lastTaskGroup = $taskGroup}
        *}

        <div class="card mb-3">
            <div class="card-header">
                    {icon $task.icon}
                    {$task.title|escape}
                    <small class="float-right">{$taskPath}</small>
            </div>
    
            <div class="card-body">
                {$task.description|escape|markdown}
        
                {if $task.warning}
                    <div class="alert alert-warning" role="alert">{$task.warning|escape|markdown}</div>
                {/if}
        
                <a class="btn btn-{tif $task.warning ? warning : secondary}" href="/site-admin/tasks/{$taskPath}" role="button">{$task.title|escape} &raquo;</a>
            </div>
        </div>
    {foreachelse}
        <div class="alert alert-info">No tasks are available to execute</div>
    {/foreach}
{/block}