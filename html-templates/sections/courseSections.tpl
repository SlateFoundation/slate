{extends "designs/site.tpl"}


{block "content"}
    {load_templates "subtemplates/slate-forms.tpl"}

    <header class="page-header">
        <h2 class="header-title">Course Sections Directory</h2>
    </header>

    <form class="filter-list">
        <fieldset class="inline-fields">
            <h4 class="section-title">Filters</h4>

            {termField blankOption='Any' default=$Term}
            {courseField blankOption='Any' default=$Course}
            {locationField blankOption='Any' default=$Location}
            {scheduleField blankOption='Any' default=$Schedule}
            {checkbox inputName=enrolled_user value='*current' label='Only My Sections' default=$Course}

            <div class="submit-area">
                <input type="submit" value="Apply Filters">
                <a href="/sections?term=*current" class="button">Reset Filters</a>
            </div>
        </fieldset>
    </form>


    <?php
        // group courses by department
        $this->scope['sectionsByCourse'] = [];

        foreach ($this->scope['data'] AS $Section) {
            if (!isset($this->scope['sectionsByCourse'][$Section->CourseID])) {
                $this->scope['sectionsByCourse'][$Section->CourseID] = [
                    'Department' => $Section->Course->Department,
                    'Course' => $Section->Course,
                    'courses' => []
                ];
            }

            $this->scope['sectionsByCourse'][$Section->CourseID]['sections'][] = $Section;
        }

        uasort($this->scope['sectionsByCourse'], function ($group1, $group2) {
            return strcasecmp($group1['Department']->Title, $group2['Department']->Title) ?: strcasecmp($group1['Course']->Title, $group2['Course']->Title);
        });
    ?>

    <table class="auto-width row-stripes row-highlight">
        <thead>
            <tr>
                <th scope="col">Code</th>
                <th scope="col">Teachers</th>
                <th scope="col">Students</th>
                <th scope="col">Location</th>
                <th scope="col">Schedule</th>
            </tr>
        </thead>
        <tbody>
        {foreach item=group from=$sectionsByCourse}
            <tr>
                <th colspan="5">
                    {if $group.Course->Department}
                        {$group.Course->Department->Title|escape}
                        &raquo;
                    {/if}

                    {$group.Course->Title|escape}</th>
            </tr>
            {foreach item=Section from=$group.sections}
                <tr>
                    <td><a href="{$Section->getURL()}">{$Section->Code}</a></td>
                    <td>{foreach item=Teacher from=$Section->Teachers implode=', '}{personLink $Teacher}{/foreach}</td>
                    <td>{$Section->Students|count}</td>
                    <td>{$Section->Location->Title|escape}</td>
                    <td>{$Section->Schedule->Title|escape}</td>
                </tr>
            {/foreach}
        {/foreach}
        </tbody>
    </table>
{/block}