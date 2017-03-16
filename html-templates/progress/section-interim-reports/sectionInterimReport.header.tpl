<header>
    {if $Report->getStudent()->Advisor}
        <div class="advisor">
            Advisor: {$Report->getStudent()->Advisor->FullName}
            <a href="mailto:{$Report->getStudent()->Advisor->PrimaryEmail}">{$Report->getStudent()->Advisor->PrimaryEmail}</a>
        </div>
    {/if}
    {*TODO: exclude title with a variable? *}
    <h1>
        <span class="pretitle">{$Report->getType()} report for</span>
        {$Report->getStudent()->FullName}
    </h1>

    <h3 class="term">
        {$Report->getTerm()->Title|escape}
    </h3>
</header>