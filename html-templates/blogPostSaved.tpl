{extends designs/site.tpl}

{block "content"}
    <h1>&ldquo;{$data->Title|escape}&rdquo; {tif $data->isNew ? created : updated}</h1>
    <p>Here&rsquo;s the link to your blog post:<br><a href="/blog/{$data->Handle}">http://{$.server.HTTP_HOST}/blog/{$data->Handle}</a></p>
{/block}