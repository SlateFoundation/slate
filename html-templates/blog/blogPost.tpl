{extends designs/site.tpl}

{block "title"}{$data->Title} &mdash; {$dwoo.parent}{/block}

{block "content"}
    {blogPost $data showComments=true}
{/block}