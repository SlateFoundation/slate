{extends "progress/section-interim-reports/sectionInterimReports.tpl"}

{block student-reports}
    {$Report = $data}
    <section class="student">
       {$Report->getHeaderHTML()}
        {block report}
            {$Report->getBodyHTML()}
        {/block}
    </section>
{/block}