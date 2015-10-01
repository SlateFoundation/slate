/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.Header',{
	extend: 'Ext.panel.Panel'
	,alias: 'widget.assets-header'

	,disabled: true
	,cls: 'data-header'
	,tpl: [
		'<dl class="kv-pairs">'
			,'<div class="kv-pair asset-assignee">'
				,'<dt class="kv-key">Assignee</dt>'
				,'<dd class="kv-value">{[values.AssigneeName || "No Assignee"]}<tpl if="Assignee"> ({Assignee.Class})</tpl></span>'
			,'</div>'
			,'<div class="kv-pair asset-location">'
				,'<dt class="kv-key">Location</dt>'
				,'<dd class="kv-value">{[(values.Location && values.Location.Title) || "No Location"]}</dd>'
			,'</div>'
			,'<div class="kv-pair asset-status">'
				,'<dt class="kv-key">Status</dt>'
				,'<dd class="kv-value">{[(values.Status && values.Status.Title) || "No Status"]}</dd>'
			,'</div>'
		,'</div>'
	]
});
