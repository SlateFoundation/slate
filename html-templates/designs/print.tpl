<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{block title}Report{/block}</title>
    <style>
        {file_get_contents(Site::resolvePath('site-root/css/reports/print.css')->RealPath)}
    </style>
</head>

{load_templates 'designs/print.subtemplates.tpl'}

<body class="{$.responseId}">
{block "body"}
    <details><summary>Dump</summary>{dump $Record}</details>
    <h1 class="doc-title">{$.responseId}</h1>
{/block}
</body>
</html>