{* page name/responseId => 'optional description' *}
{$navItems = array(
    'home' => 'Skeleton v2'
    'blog' => ''
    'pages' => ''
    'contact' => ''
)}

{load_templates subtemplates/nav.tpl}

{nav $navItems mobileHidden=$mobileHidden mobileOnly=$mobileOnly}