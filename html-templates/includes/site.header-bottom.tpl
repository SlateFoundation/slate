{include "includes/site.menu.tpl"}

{* TODO: replace with VFS-based contentBlocks engine *}

{$heroNode = Site::resolvePath('content-blocks/about/short.md')}
{$heroMarkdown = $heroNode->RealPath|file_get_contents|trim}

{if $heroMarkdown}
    <div class="inner hero-ct">
        <div class="hero-text">
    	   {$heroMarkdown|markdown}
        </div>
    </div>
{/if}