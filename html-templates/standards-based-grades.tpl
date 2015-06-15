{extends "designs/site.tpl"}

{block "title"}Standards-Based Grades &mdash; {$dwoo.parent}{/block}

{block "content-inner-class"}full-bleed{/block}

{block "content"}

    {$sections = array(
        array( code => "ADV10-001",    complete =>  3, total => 56, expanded => false ),
        array( code => "ADV10-002",    complete =>  0, total => 40, expanded => false ),
        array( code => "SHALL-001",    complete => 10, total => 33, expanded => true  ),
        array( code => "GLOBAL-001",   complete => 24, total => 32, expanded => false ),
        array( code => "LABTECH-001",  complete => 14, total => 58, expanded => false ),
        array( code => "LABTECH-002",  complete =>  0, total => 26, expanded => false ),
        array( code => "CSE-001",      complete => 15, total => 41, expanded => false )
    )}

    {$reports = array(
        array( student => 'Vicky Boots',    complete => 0 ),
        array( student => 'Lennie Borda',   complete => 3 ),
        array( student => 'Odette Brew',    complete => 6 ),
        array( student => 'Ming Claar',     complete => 5 ),
        array( student => 'Lurline Duller', complete => 1 ),
        array( student => 'Armanda Eska',   complete => 4 )
    )}

    <div class="splitview">
        <div class="splitview-master">
            <header class="splitview-master-scope">
                <div class="stretch">
                    {checkbox myClassesOnly value=true label='My Classes Only'}
                    <div class="field">
                        <select class="field-control">
                            <option>Current Term</option>
                        </select>
                    </div>
                </div>
            </header>

            <div class="source-grid-ct">
                <table class="source-grid">
                    <thead>
                        <tr class="source-grid-header-row">
                            <th class="source-grid-col-header" colspan="2">Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foreach item=section from=$sections}
                            <tr class="source-grid-data-row {if $section[expanded]}is-expanded{/if}">
                                <td class="source-grid-data-cell">{$section[code]}</td>
                                <td class="source-grid-data-cell text-right">{$section[complete]}/{$section[total]}</td>
                            </tr>
                            <tr class="source-grid-expansion-row {if $section[expanded]}is-expanded{/if}">
                                <td class="source-grid-expansion-cell" colspan="2">
                                    {if $section[expanded]}
                                    <div class="source-grid-ct">
                                        <table class="source-grid">
                                            <thead>
                                                <tr class="source-grid-header-row">
                                                    <th class="source-grid-col-header">Student</th>
                                                    <th class="source-grid-col-header text-right">Graded</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {foreach item=report from=$reports}
                                                    <tr class="source-grid-data-row {if $report[selected]}is-selected{/if}">
                                                        <td class="source-grid-data-cell">{$report[student]}</td>
                                                        <td class="source-grid-data-cell text-right">{$report[complete]}/6</td>
                                                    </tr>
                                                {/foreach}
                                            </tbody>
                                            <tfoot>
                                                <tr class="source-grid-status-row">
                                                    <td class="source-grid-status-cell" colspan="3"><span class="source-grid-text-check">✓</span> <small>Last saved 00/00/00 at 00:00pm</small></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    {/if}
                                </td>
                            </tr>
                        {/foreach}
                    </tbody>
                </table>
            </div>

            <a class="button primary block" href="#">Manage Worksheets</a>
        </div>

        <div class="splitview-detail">
            <header class="page-header">
                <h1 class="header-title">Standards-Based Grades</h1>
            </header>

            <form>
                <fieldset>
                    {labeledField html='<select class="field-control"><option>Worksheet Title</option></select>' type=select label='Worksheet' required=true}

                    <div class="stretch">
                        {textarea description "Assignment Description"}
                    </div>

                    <div class="submit-area">
                        <input class="button primary pull-right" type="submit" value="Save Report">
                    </div>
                </fieldset>
            </form>
        </div>
    </div>
    

{/block}