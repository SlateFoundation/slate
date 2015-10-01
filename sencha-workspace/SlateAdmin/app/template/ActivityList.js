/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,WhartonConnect*/
Ext.define('SlateAdmin.template.ActivityList', {
	extend: 'Ext.XTemplate'

	,constructor: function() {
		this.callParent([
			'<ol class="ticket-events rich-list">'
			,'<tpl for=".">'
				,'<li class="ticket-event rich-list-item">'
					,'<div class="meta">'
						,'<div class="primary">'
							,'<time class="datum created token" '
								,'datetime="{Created:date(\'c\')}" '
								   ,'title="{Created:date(\'F j, Y, g:i a\')}">'
								,'{Created:date(\'M j\')}<span class="token-extended">{Created:date(\', Y, g:i a\')}</span>'
							,'</time> '
						,'</div>'
					,'</div>'
					,'<div class="actor">'
						,'<tpl if="Actor">'
							,'{[values.Actor.FirstName]} {[values.Actor.LastName]}'
						,'<tpl else>'
							,'The internal system'
						,'</tpl>'
					,'</div>'
					,'{[this.generateDataTpl(values)]}'
				,'</li>'
			,'</tpl>'
			,'</ol>'
		]);
	}

	,generateDataTpl: function(record) {
		var tpl = '';

		switch(record.Class) {
			case 'DeltaActivity':
				tpl = this.generateDeltaActvityTpl(record);
				break;

			case 'CommentActivity':
				tpl = 'commented on this: &ldquo;'+record.Data+'&rdquo;';
				break;

			case 'AliasActivity':
				tpl = 'aliased '+record.Data.Type+' to &ldquo;'+record.Data.Identifier+'&rdquo;'
				break;

			case 'MediaActivity':
				tpl = this.generateMediaActivityTpl(record);
				break;
		}

		return tpl;
	}
	,generateDeltaActvityTpl: function(record) {
		var modifier = ''
			,tpl;

		switch(record.Verb) {
			case 'create':
				tpl = 'created '+record.Data.Class+' #'+record.ID;
				break;

			case 'update':
				tpl = 'changed:<br>';
				for(var key in record.Data) {

					var changes = record.Data[key];

					if(Ext.isObject(changes.before))
					{
						tpl += changes.before.displayKey+' from '+changes.before.displayValue+' to '+changes.after.displayValue+'<br>';
					}
					else
					{
						tpl += key+' from '+changes.before+' to '+changes.after+'<br>';
					}
				}
				break;

			case 'delete':
				tpl = 'deleted '+record.Class+' '+record.ID;
				break;
		}

		return tpl;
	}
	,generateMediaActivityTpl: function(record) {
		var tpl = (record.Data.Note ? 'commented on this: &ldquo;'+record.Data.Note+'&rdquo;<br>' : '');

		tpl += '<a target="_blank" href="/media/open/'+record.Data.MediaID+'">'
			+		'<img height=50 width=50 src="/thumbnail/'+record.Data.MediaID+'"/50x50>'
			+ '</a>';

		return tpl;
	}
});