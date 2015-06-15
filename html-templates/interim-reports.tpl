{extends "designs/site.tpl"}

{block "title"}Interim Reports &mdash; {$dwoo.parent}{/block}

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
                            <tr class="source-grid-data-row">
                                <td class="source-grid-data-cell">{$section[code]}</td>
                                <td class="source-grid-data-cell text-right">{$section[complete]}/{$section[total]}</td>
                            </tr>
                        {/foreach}

                        <tr class="source-grid-data-row">
                            <td class="source-grid-data-cell" colspan="2">Search &amp; Print</td>
                        </tr>
                                        
                        <tr class="source-grid-data-row is-expanded">
                            <td class="source-grid-data-cell" colspan="2">Email</td>
                        </tr>
                        <tr class="source-grid-expansion-row is-expanded">
                            <td class="source-grid-expansion-cell" colspan="2">
                                <div class="stretch master-indented-section">
                                    <div class="field">
                                        <select class="field-control">
                                            <option>Advisor</option>
                                        </select>
                                    </div>

                                    <div class="field">
                                        <select class="field-control">
                                            <option>Author</option>
                                        </select>
                                    </div>

                                    <div class="field">
                                        <input class="field-control" placeholder="Author">
                                    </div>
                                </div>

                                <div class="master-indented-section">
                                    <h2 class="splitview-master-heading">Recipients</h2>
    
                                    <div class="inline-fields">
                                        {checkbox recipientFilter value='advisors' label='Advisors'}
                                        {checkbox recipientFilter value='parents' label='Parents'}
                                        <button class="button small">Clear Filters</button>
                                    </div>
                                </div>

                                <div class="source-grid-ct">
                                    <table class="source-grid top-align">
                                        <thead>
                                            <tr class="source-grid-header-row">
                                                <th class="source-grid-col-header">Student</th>
                                                <th class="source-grid-col-header">Recipient(s)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loop array('Vicky Boots', 'Lennie Borda', 'Odette Brew', 'Ming Claar', 'Lurline Duller', 'Armanda Eska', 'Yvonne Fisk')}
                                            <tr class="source-grid-data-row">
                                                <td class="source-grid-data-cell">{$}</td>
                                                <td class="source-grid-data-cell">
                                                    <ul class="plain">
                                                        <li>Brittany Boots</li>
                                                        <li>Alejandro Bordo</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            {/loop}
                                        </tbody>
                                        <tfoot>
                                            <tr class="source-grid-footer-row">
                                                <td class="source-grid-col-summary">7 reports</td>
                                                <td class="source-grid-col-action"><button type="submit" class="primary">Send All Emails</button></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>

        <div class="splitview-detail">
            <header class="page-header">
                <h1 class="header-title">Lennie Borda’s Interim Report&ensp;<small class="muted text-nowrap">2014–15 3rd Quarter</small></h1>
            </header>

            <form>
                <div class="form-actions text-right">
                    {loop array('Print', 'Email Parents', 'Email Student')}
                        <button class="button primary" type="button">{$}</button>
                    {/loop}
                </div>
            </form>

            {loop array(
                array(
                    'section'           => 'English 3 - Rami - D',
                    'instructor'        => 'Meenoo Rami',
                    'instructorEmail'   => 'mrami@scienceleadership.org',
                    'currentGrade'      => 'F',
                    'comments'          => '<p>Dear Lennie,</p><p>You’re currently failing. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Ms. Rami</p>'
                ), array(
                    'section'           => 'American History - Jonas - C',
                    'instructor'        => 'Pearl Jonas',
                    'instructorEmail'   => 'pjonas@scienceleadership.org',
                    'currentGrade'      => 'F',
                    'comments'          => '<p>Dear Lennie,</p><p>You’re currently failing. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Ms. Jonas</p>'
                )
            )}
                <article class="well slate-report">
                    <div class="report-body">
                        <section class="report-section">
                            <header class="report-section-header">
                                <h2 class="report-section-title text-nolead">{$section}</h2>
                            </header>
    
                            <dl class="text-notrail">
                                <div class="dli">
                                    <dt>Instructor</dt>
                                    <dd>{$instructor}&ensp;<a href="{$instructorEmail}">{$instructorEmail}</a></dd>
                                </div>
                                <div class="dli">
                                    <dt>Current Grade</dt>
                                    <dd>{$currentGrade}</dd>
                                </div>
                                <div class="dli">
                                    <dt>Comments</dt>
                                    <dd>{$comments}</dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                </article>
            {/loop}
        </div>
    </div>
    

{/block}