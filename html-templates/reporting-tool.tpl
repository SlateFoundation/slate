{extends "designs/site.tpl"}

{block "title"}Reporting Tool &mdash; {$dwoo.parent}{/block}

{block "content-inner-class"}full-bleed{/block}

{block "js-bottom"}
    {$dwoo.parent}

    <script>
        // TODO: make this actually dynamic
        (function(){
            var btn  = document.querySelector('[data-menu]');
            var menu = document.querySelector('.slate-popup-menu');
            menu.style.left = btn.offsetLeft + btn.clientWidth - menu.clientWidth + 'px';
            menu.style.top = btn.offsetTop + btn.clientHeight + 'px';
        })();
    </script>
{/block}

{block "content"}

    <div class="splitview">
        <div class="splitview-master">
            <div class="splitview-master-scope">
                <div class="stretch">
                    {loop array('Term', 'Advisor', 'Author')}
                        <div class="field">
                            <select class="field-control">
                                <option>{$}</option>
                            </select>
                        </div>
                    {/loop}
                    {field inputName=student placeholder=Student}
                </div>

                <h2 class="splitview-master-heading">Report Type</h2>
                <ul class="checkbox-group">
                    {$types = array('All', 'Standards', 'Narratives', 'Interims', 'Progress Notes')}
                    {loop $types}
                        {if $.loop.default.first}
                            <li class="checkbox-group-item">{checkbox inputName=reportType value=$ label=$ attribs='checked'}</li>
                        {else}
                            <li class="checkbox-group-item">{checkbox inputName=reportType value=$ label=$}</li>
                        {/if}
                    {/loop}
                </ul>
            </div>
        </div>

        <div class="splitview-detail">
            <header class="page-header">
                <h1 class="header-title">Reporting Tool</h1>
            </header>

            <form>
                <div class="form-actions text-right">
                    {loop array('Preview', 'Print', 'Email', 'Save to CSV')}
                        <button class="button primary" type="button" {if $.loop.default.index == 2}data-menu{/if}>{$}</button>
                    {/loop}
                </div>
            </form>

            <article class="well slate-report">
                <header class="report-header">
                    <h1 class="report-title">
                        <small class="report-type">Standards-Based Report Card for</small>
                        <div class="report-subject">Aaron Block</div>
                    </h1>

                    <address class="report-contact">
                        <strong class="report-contact-name">Advisor: Stephanie Sessa</strong>
                        <div class="report-contact-email">ssessa@scienceleadership.org</div>
                    </address>
                </header>

                <div class="report-body">
                    <section class="report-section">
                        <header class="report-section-header">
                            <h2 class="report-section-title">2014–15: 3rd Quarter</h2>
                        </header>

                        <div class="report-section-notes">
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            <p><strong>– Tom Jackson<br>
                                tjackson@scienceleadership.org<br>
                                Academic Standards Committee Chair</strong>
                            </p>
                        </div>

                        <section class="report-subsection">
                            <header class="report-subsection-header">
                                <h3 class="report-subsection-title">Engineering Advance &middot; Kamal &middot; d1</h3>
                            </header>

                            <h4 class="report-heading-4">Instructor</h4>
                            <p><strong>Matthew VanKouwenberg</strong>&ensp;mvankouwenberg@scienceleadership.org</p>

                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Standard</th>
                                        <th class="text-right">Mid-Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Student will accurately define and state an engineering problem to be solved.</td>
                                        <td class="text-right text-nowrap">Approaching expectations</td>
                                    </tr>
                                    <tr>
                                        <td>Student will evaluate pros and cons of potential solutions leading to design selection.</td>
                                        <td class="text-right text-nowrap">Approaching expectations</td>
                                    </tr>
                                </tbody>
                            </table>
                    </section>
                </div>
            </article>
        </div>
    </div>
    
    <div class="slate-popup-menu">
        <header class="menu-header">
            <h4 class="menu-title">Recipients</h4>
        </header>

        <div class="menu-body">
            <ul class="checkbox-group">
                {$opts = array('Advisors', 'Parents')}
                {loop $opts}
                    {if $.loop.default.first}
                        <li class="checkbox-group-item">{checkbox inputName=recipients value=$ label=$ attribs='checked'}</li>
                    {else}
                        <li class="checkbox-group-item">{checkbox inputName=recipients value=$ label=$}</li>
                    {/if}
                {/loop}
            </ul>

            <a class="button primary block" href="#">Send</a>
        </div>
    </div>
{/block}