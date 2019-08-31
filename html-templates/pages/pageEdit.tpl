{extends webapps/EmergenceContentEditor/sencha.tpl}

{block title}{if $data->isPhantom}Create page{else}Edit &ldquo;{$data->Title|escape}&rdquo;{/if} &mdash; {$dwoo.parent}{/block}