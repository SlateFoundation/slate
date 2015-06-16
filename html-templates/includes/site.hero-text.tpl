{* TODO: replace with VFS-based contentBlocks engine *}
{$heroNode = Site::resolvePath('content-blocks/about/short.md')}
{if $heroNode}
	{$heroNode->RealPath|file_get_contents|markdown}
{/if}