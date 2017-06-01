<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{block title}Report{/block}</title>

    {block css}
        {cssmin "reports/print.css" embed=true}
    {/block}
</head>

<body class="{block body-class}{str_replace('/', '_', $.responseId)}-tpl{/block}">
    {block body}
        <h1 class="doc-title">{$.responseId}</h1>
        <details><summary>Dump</summary>{dump}</details>
    {/block}
</body>
</html>