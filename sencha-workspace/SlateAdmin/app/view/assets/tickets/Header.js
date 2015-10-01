/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.Header',{
	extend: 'Ext.panel.Panel'
	,alias: 'widget.assets-tickets-header'

	,disabled: true
	,cls: 'data-header'
	,tpl: [
		'<dl class="kv-pairs">'
			,'<div class="kv-pair asset-assignee">'
				,'<dt class="kv-key">Assignee</dt>'
				,'<dd class="kv-value editable">{[values.AssigneeName ? values.AssigneeName : "Not Assigned"]}</a></span>'
			,'</div>'
			,'<div class="kv-pair asset-location">'
				,'<dt class="kv-key">Serial</dt>'
				,'<dd class="kv-value">{[values.Serial ? values.Serial : "No Serial"]}</dd>'
			,'</div>'
			,'<div class="kv-pair asset-status">'
				,'<dt class="kv-key">Status</dt>'
				,'<dd class="kv-value">{[values.Status ? values.Status : "No Status"]}</dd>'
			,'</div>'
			,'<div class="kv-pair asset-firstComment">'
				,'<dt class="kv-key">Description</dt>'
				,'<dd class="kv-value">{[values.FirstNote ? values.FirstNote : "No Description"]}</dd>'
			,'</div>'
		,'</dl>'
	]
});
