<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>People</title>
    <style>
        {file_get_contents(Site::resolvePath('site-root/css/fonts/lato.css')->RealPath)}
        {file_get_contents(Site::resolvePath('site-root/css/reports/print.css')->RealPath)}
    </style>
</head>
<body class="people">
    <h1 class="doc-title">People</h1>

    {template contact_info Person relationship=null show_name=true}
        <section class="subsection">
            {if $show_name}<h4 class="subhead">{$Person->FullName}{if $relationship}<small>{$relationship}</small>{/if}</h4>{/if}
            <dl>
                {if $Person->Email}
                <div class="dli">
                    <dt>Email</dt>
                    <dd><a class="url" href="mailto:{$Person->Email}">{$Person->Email}</a></dd>
                </div>
                {/if}

                {if $Person->Phone}
                <div class="dli">
                    <dt>Phone</dt>
                    <dd>{$Person->Phone|phone}</a></dd>
                </div>
                {/if}

                {if $Person->Address}
                <div class="dli">
                    <dt>Address</dt>
                    <dd>{$Person->Address}</a></dd>
                </div>
                {/if}

                {if $Person->Advisor}
                <div class="dli">
                    <dt>Advisor</dt>
                    <dd>{$Person->Advisor->FullName} &lt;<a class="url" href="mailto:{$Person->Advisor->EmailRecipient|escape:url}">{$Person->Advisor->Email}</a>&gt;</dd>
                </div>
                {/if}
            </dl>
        </section>
    {/template}

    {foreach item=Person from=$data}
        <article class="doc-item">
            <header class="doc-header">
                <h3 class="item-title">
                    {$Person->FullName}
                    {if $Person->GraduationYear}<small class="item-datetime">Class of {$Person->GraduationYear}</small>{/if}
                </h3>

                {if $Person->StudentNumber}<div class="meta">#{$Person->StudentNumber}</div>{/if}
            </header>

            <div class="item-body">
                {contact_info $Person show_name=false}

                {foreach item=GuardianRelationship from=$Person->GuardianRelationships}
                    {contact_info $GuardianRelationship->RelatedPerson $GuardianRelationship->Relationship}
                {/foreach}
            </div>
        </article>
    {/foreach}
</body>
</html>