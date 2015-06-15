{extends "designs/site.tpl"}

{block "title"}Enrollments Upload Wizard &mdash; {$dwoo.parent}{/block}

{block "content"}

    <header class="page-header">
        <h1 class="header-title">Enrollments Upload Wizard</h1>
    </header>

    <form class="reading-width setup-wizard">
        <ol class="wizard-steps">
            <li class="wizard-step"><p>Download or compile a CSV file of all users and related data from your SIS, LMS, or spreadsheets. <a href="#">Example CSV</a></p></li>
            <li class="wizard-step"><p>Upload your CSV file:</p> {field csv type=file required=yes}</li>
            <li class="wizard-step">
                <p>Map your fields to match the Slate fields:</p>
                <table class="form-table">
                    <thead>
{*
                        <tr>
                            <th colspan="2"></th>
                            <th colspan="2" class="form-table-col-header">Options</th>
                        </tr>
*}
                    </thead>
                    <tbody>
                        <tr>
                            <th colspan="2" class="form-table-row-label for-compact-input"><label id="first-row">First row contents:</label></th>
                            <td class="form-table-row-input">
                                <ul class="radio-group" role="radiogroup" aria-labelledby="first-row">
                                    <li class="radio-group-item"><label><input type="radio" name="first-row" value="headings">&nbsp;Field names</label></li>
                                    <li class="radio-group-item"><label><input type="radio" name="first-row" value="record">&nbsp;First record</label></li>
                                </ul>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                    <thead>
                        <tr>
                            <th class="form-table-col-header">Your CSV Field</th>
                            <th class="form-table-row-decoration"></th>
                            <th class="form-table-col-header">Slate Field</th>
                            <th class="form-table-row-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th class="form-table-row-label"><label for="field1"><kbd>fname</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field1" class="field-control">
                                    <option>First Name</option>
                                </select>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                        <tr>
                            <th class="form-table-row-label"><label for="field2"><kbd>lname</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field2" class="field-control">
                                    <option>Last Name</option>
                                </select>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                        <tr>
                            <th class="form-table-row-label"><label for="field3"><kbd>email</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field3" class="field-control">
                                    <option>School Email</option>
                                </select>

                                <div class="form-table-row-expansion">
                                    <p class="form-table-expansion-intro">This field includes subcategories that we can specify now to save time later:</p>
                                    <div class="left-labels">
                                        <label class="field">
                                            <kbd class="field-label">school_email</kbd>
                                            <select class="field-control">
                                                <option>School Email</option>
                                            </select>
                                        </label>
                                        <label class="field">
                                            <kbd class="field-label">home_email</kbd>
                                            <select class="field-control">
                                                <option>Personal Email</option>
                                            </select>
                                        </label>
                                        <label class="field">
                                            <kbd class="field-label">alt_email</kbd>
                                            <select class="field-control">
                                                <option>Fallback Email</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </td>
                            <td class="form-table-row-action">
                                <button class="button">Save Time</button>
                            </td>
                        </tr>
                        <tr>
                            <th class="form-table-row-label"><label for="field4"><kbd>uname</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field4" class="field-control">
                                    <option>Username</option>
                                </select>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                        <tr>
                            <th class="form-table-row-label"><label for="field5"><kbd>id</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field5" class="field-control">
                                    <option>ID</option>
                                </select>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                        <tr>
                            <th class="form-table-row-label"><label for="field6"><kbd>advisor</kbd></label></th>
                            <td class="form-table-row-decoration">&harr;</td>
                            <td class="form-table-row-input">
                                <select id="field6" class="field-control">
                                    <option>Advisor</option>
                                </select>
                            </td>
                            <td class="form-table-row-action"></td>
                        </tr>
                    </tbody>
                </table>
            </li>
            <li class="wizard-step"><p><input class="button button-primary" type="submit" value="Import CSV"> and you’re done!</p></li>
        </ol>
    </form>
{/block}