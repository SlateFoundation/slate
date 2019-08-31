{*
{$clickySiteId = 12345}

<script type="text/javascript">
{if $.User}
    var clicky_custom = {
		session: {
			username: '{$.User->Username}'
			,email: '{$.User->Email}'
			,full_name: '{$.User->FullName}'
		}
	};
{/if}

var clicky_site_ids = clicky_site_ids || [];
clicky_site_ids.push({$clickySiteId});
(function() {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = '//static.getclicky.com/js';
	( document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0] ).appendChild( s );
})();
</script>
<noscript><p><img alt="Clicky" width="1" height="1" src="//in.getclicky.com/{$clickySiteId}ns.gif" /></p></noscript>
*}