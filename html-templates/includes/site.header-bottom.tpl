{include "includes/site.menu.tpl"}

{* TODO: replace with VFS-based contentBlocks engine *}

{$heroNode = Site::resolvePath('content-blocks/about/short.md')}

{if $heroNode}
    <div class="inner hero-ct">
        <div class="hero-text">
    	   {$heroNode->RealPath|file_get_contents|markdown}
        </div>
    </div>
{/if}