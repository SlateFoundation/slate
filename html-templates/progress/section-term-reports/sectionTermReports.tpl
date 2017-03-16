<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Term Reports</title>
{block css}
    <style type="text/css">
        {\Slate\Progress\SectionTermReport::getCSS()}
    </style>
{/block}
    </head>
    <body>

{block student-reports}
    {$lastReport = false}

    <section class="student">
    {foreach item=Report from=$data}

        {if $lastReport->StudentID != $Report->StudentID}
            {if $lastReport}
    </section>
    <section class="student">
            {/if}
            {$Report->getHeaderHTML()}
        {/if}

        {block report}
            {$Report->getBodyHTML()}
        {/block}

            {$lastReport = $Report}
    {foreachelse}
        <p class="empty-report">No reports matching your criteria are available</p>
    {/foreach}
    </section>
{/block}
</body>
</html>