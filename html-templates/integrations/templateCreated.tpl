{extends designs/site.tpl}

{block title}Template Job Created &mdash; {$dwoo.parent}{/block}

{block content}
    {$Job = $data}
    <h1>Template job created</h1>

    <p>Your template job for {$Job->Integrator} has been created. It can be invoked without authentication by sending a POST request to the following URL:</p>
    <p><a href="{$scriptBaseUrl}?template={$Job->Handle}">{$scriptBaseUrl}?template={$Job->Handle}</a></p>

    <p>or, view and manage the template here:</p>
    <p><a href="{$scriptBaseUrl}/{$Job->Handle}">{$scriptBaseUrl}/{$Job->Handle}</a></p>
{/block}