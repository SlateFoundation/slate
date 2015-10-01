/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.details.Tickets', {
	extend: 'Ext.Panel'
	,alias: 'widget.assets-details-tickets'

	,cls: 'assets-details-tickets'
	,title: 'Tickets'
	,layout: {
		type: 'vbox'
		,align:'stretch'
	}
	,tbar: [{
		text: 'Add Ticket'
		,action: 'addTicket'
		,icon: '/img/icons/fugue/ticket--plus.png'
	}]
	,items: [{
		xtype: 'dataview'
		,itemId: 'ticketList'
		,itemSelector: 'li.asset-ticket'
		,layout: 'fit'
		,store: 'assets.details.Tickets'
		,autoScroll: true
		,emptyText: 'There are no tickets for this asset.'
		,tpl: [
			'<ol class="asset-tickets rich-list">'
			,'<tpl for=".">'
				,'<li class="asset-ticket rich-list-item" value="{ID}">'
					,'<div class="meta">'
						,'<div class="index">'
							,'<span class="datum type">{Type}</span> '
							,'<span class="datum id">#{ID}</span>'
						,'</div>'
						,'<div class="primary">'
							,'<time class="datum created token" '
								,'datetime="{Created:date(\'c\')}" '
								   ,'title="{Created:date(\'F j, Y, g:i a\')}">'
								,'{Created:date(\'M j\')}<span class="token-extended">{Created:date(\', Y, g:i a\')}</span>'
							,'</time> '
							,'<span class="datum status">{Status}</span> '
						,'</div>'
					,'</div>'
					,'<div class="description">{FirstNote}</div>'
				,'</li>'
			,'</tpl>'
			,'</ol>'
		]
	}]
});
