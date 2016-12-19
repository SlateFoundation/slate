{if count($students) == 1 && $students[0]->Advisor}
    {$from = $students[0]->Advisor->EmailRecipient}
{else}
    {$from = $.User->EmailRecipient}
{/if}

{capture assign=subject}{strip}

    {if count($students) > 1}
        Term reports for {count($students)} students
    {else}
        Term report for {$students[0]->FullName}
    {/if}

    {if count($terms) == 1}
        , {$terms[0]->Title}
    {/if}

{/strip}{/capture}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{$subject|escape}</title>

        <style type="text/css">
            a:visited { color: #a35500 !important; }
            a:hover { color: #6a3700 !important; }
            a:active { color: #6a3700 !important; }
        </style>
    </head>
    <body style="color: #333; font-family: Georgia, serif; font-size: 16px; line-height: 1.3;">

        <h2>{$subject|escape}</h2>

        {foreach item=Report from=$data}
            <div style="margin: 1em 0; background-color: #ecf5f9; border: 1px solid #789dab; padding: 1em; border-radius: .25em;">
                {$Section = $Report->Section}
                {$Instructor = $Section->Instructors.0}

                <h3 style="margin: 0 0 1em; color: #004b66;">{$Section->Title}</h3>

                {if count($students) > 1}
                    <div style="margin: 1em 0;">
                        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Student</span>
                        <br />
                        <span style="display: block; margin-left: 1.5em;">
                            <strong>{$Report->Student->FullName|escape}</strong>
                        </span>
                    </div>
                {/if}

                {if count($terms) > 1}
                    <div style="margin: 1em 0;">
                        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Term</span>
                        <br />
                        <span style="display: block; margin-left: 1.5em;">
                            <strong>{$Report->Term->Title|escape}</strong>
                        </span>
                    </div>
                {/if}

                <div style="margin: 1em 0;">
                    <span style="color: #5e6366; font-size: smaller; font-style: italic;">Teacher{tif count($Section->Teachers) != 1 ? s}</span>
                    <br />
                    <span style="display: block; margin-left: 1.5em;">
                        {foreach item=Teacher from=$Section->Teachers implode='<br />'}
                            <strong>{$Teacher->FullName|escape}</strong>
                            &lt;<a href="mailto:{$Teacher->Email|escape}?subject=Re:%20{$subject|escape:url}" style="color: #a35500;">{$Teacher->Email|escape}</a>&gt;
                        {/foreach}
                    </span>
                </div>

                {if $Report->Grade}
                    <div style="margin: 1em 0;">
                        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Current Grade</span>
                        <br />
                        <span style="display: block; margin-left: 1.5em;">
                            <strong>{$Report->Grade}</strong>
                        </span>
                    </div>
                {/if}

                {if $Report->Notes}
                    <span style="color: #5e6366; font-size: smaller; font-style: italic;">Notes</span>
                    <br />
                    <div style="display: block; margin: 0 1.5em;">
                        {if $Report->NotesFormat == 'html'}
                            {$Report->Notes}
                        {elseif $Report->NotesFormat == 'markdown'}
                            {$Report->Notes|escape|markdown}
                        {else}
                            {$Report->Notes|escape}
                        {/if}
                    </div>
                {/if}
            </div>
        {/foreach}
    </body>
</html>