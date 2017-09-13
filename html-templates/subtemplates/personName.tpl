{template personName Person summary=on}{strip}
    {$Person->FullName|escape}
    {if $summary && $Person->isA('Emergence\People\IUser')}
        &thinsp;
        {if $Person->isA('Slate\People\Student')}
            (Student {$Person->GraduationYear})
        {elseif $Person->hasAccountLevel('Administrator')}
            (Administrator)
        {elseif $Person->hasAccountLevel('Teacher')}
            (Teacher)
        {elseif $Person->hasAccountLevel('Staff')}
            (Staff)
        {/if}
    {/if}
{/strip}{/template}