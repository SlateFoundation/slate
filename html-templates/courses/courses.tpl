{extends "designs/site.tpl"}

{block "title"}Courses &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Courses Directory</h2>
    </header>

    <?php
        // group courses by department
        $this->scope['coursesByDepartment'] = [];

        foreach ($this->scope['data'] AS $Course) {
            if (!isset($this->scope['coursesByDepartment'][$Course->DepartmentID])) {
                $this->scope['coursesByDepartment'][$Course->DepartmentID] = [
                    'Department' => $Course->Department,
                    'courses' => []
                ];
            }

            $this->scope['coursesByDepartment'][$Course->DepartmentID]['courses'][] = $Course;
        }

        uasort($this->scope['coursesByDepartment'], function ($group1, $group2) {
            return strcasecmp($group1['Department']->Title, $group2['Department']->Title);
        });
    ?>

    <table class="auto-width row-stripes row-highlight">
        <thead>
            <tr>
                <th scope="col">Code</th>
                <th scope="col">Title</th>
                <th scope="col">Sections</th>
            </tr>
        </thead>
        <tbody>
        {foreach item=group from=$coursesByDepartment}
            <tr>
                <th colspan="3">{$group.Department->Title|escape}</th>
            </tr>
            {foreach item=Course from=$group.courses}
                <tr>
                    <td><a href="{$Course->getURL()}">{$Course->Code}</a></td>
                    <td><a href="{$Course->getURL()}">{$Course->Title|escape}</a></td>
                    <td><a href="/sections?course={$Course->Code}">{$Course->Sections|count}</a></td>
                </tr>
            {/foreach}
        {/foreach}
        </tbody>
    </table>
{/block}