{extends "designs/email.tpl"}

{block meta}
    {if count($students) == 1 && $students[0]->Advisor}
        {$from = $students[0]->Advisor->EmailRecipient}
    {else}
        {$from = $.User->EmailRecipient}
    {/if}
    
    {capture assign=subject}{strip}
    
        {if count($students) > 1}
            {$reportPluralNoun|ucfirst} for {count($students)} students
        {else}
            {$reportSingularNoun|ucfirst} for {$students[0]->FullName}
        {/if}
    
        {if count($terms) == 1}
            , {$terms[0]->Title}
        {/if}
    
    {/strip}{/capture}

    {$dwoo.parent}
{/block}

{block body}
    {foreach item=studentGroup from=Slate\Progress\Util::groupReportsByStudent($data)}
        {foreach item=termGroup from=Slate\Progress\Util::groupReportsByTerm($studentGroup.reports)}
            <h2>
                {$reportSingularNoun|ucfirst} for {$studentGroup.student->FullName|escape}, {$termGroup.term->Title|escape}
            </h2>

            {foreach item=Report from=$termGroup.reports}
                <div style="margin: 1em 0; background-color: #ecf5f9; border: 1px solid #789dab; padding: 1em; border-radius: .25em;">
                    {$Report->getBodyHtml(3, array(), 'email')}
                </div>
            {/foreach}
        {/foreach}
    {foreachelse}
        <em>No reports matching your criteria are available</em>
    {/foreach}
{/block}