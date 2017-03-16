{extends "progress/section-term-reports/sectionTermReports.tpl"}

{block student-reports}
    {$Report = $data}
    <section class="student">
        {$Report->getHeaderHTML()}

        {$Report->getBodyHTML()}
    </section>
{/block}