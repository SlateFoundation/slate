{extends "task.tpl"}

{block content}
    <div class="card">
        <div class="card-header">Select ActiveRecord class</div>

        <div class="card-body">
            <ul>
                {foreach item=class from=$classes}
                    <li><a href="?class={$class|escape:url}">{$class|escape}</li>
                {/foreach}
            </ul>
        </div>
    </div>
{/block}