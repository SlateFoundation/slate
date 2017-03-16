<article class="doc-item">
	<header class="doc-header">
		<h3 class="item-title">{$Note->Subject}</h3>

		<div class="meta">
			<span class="item-creator">
				{$Creator = $Note->Creator}
				{$Creator->FullName}
				{if $Creator->Email}&lt;<a class="url" href="mailto:{$Creator->Email}">{$Creator->Email}</a>&gt;{/if}
			</span>
			<time class="item-datetime">{date_format $Note->Created '%b %e, %Y'}</time>
		</div>
	</header>

	<div class="item-body">{$Note->Message}</div>
</article>