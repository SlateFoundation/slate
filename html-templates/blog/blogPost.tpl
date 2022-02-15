{extends designs/site.tpl}

{block "title"}{$data->Title|escape} &mdash; {$dwoo.parent}{/block}

{block "content"}
    {load_templates "subtemplates/blog.tpl"}
    {blogPost $data showComments=true showCommentsSummary=false includeSummaryInBody=true}
{/block}