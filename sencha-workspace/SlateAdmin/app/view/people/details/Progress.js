/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Progress', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-progress',
    requires: [
        'Ext.grid.Panel'
    ],


    title: 'Progress',
    glyph: 0xf095,
    itemId: 'progress',


    // panel config
    autoScroll: true,
    layout: 'anchor',
    defaults: {
        anchor: '100%',
        border: false,
        bodyBorder: false
    },

    items: [{
        xtype: 'toolbar',
		docked: 'top',
		items: [{
			xtype: 'button',
			text: 'New Note',
			action: 'composeNote',
			icon: '/img/icons/fugue/notebook--plus.png'
		},{
			xtype: 'button',
			text: 'Types',
			itemId: 'reportTypes',
			icon: '/img/icons/fugue/ui-check-boxes.png',
			menu: {
				floating: true,
				items: [{
					xtype: 'menucheckitem',
					checked: true,
					text: 'Progress Notes',
					value: 'progressnotes'
				},{
					xtype: 'menucheckitem',
					checked: true,
					text: 'Narratives',
					value: 'narratives'
				},{
					xtype: 'menucheckitem',
					checked: true,
					text: 'Interims',
					value: 'interims'
				},{
					xtype: 'menucheckitem',
					checked: true,
					text: 'Standards',
					value: 'standards'
				}]
			}
		},{
			xtype: 'tbseparator'
		},{
			xtype: 'tbtext',
			text: 'Term: '
		},{		
			xtype: 'combobox',
			emptyText: 'Current Term',
			valueField: 'ID',
			editable: false,
			flex: 1,
			itemId: 'progressReportsTermSelector',
			value: 17,
			queryMode: 'local',
			name: 'progressReportsTermSelector',
			displayField: 'Title',
			store: {
				fields: ['Title',{name: "ID", type: 'integer'}],
				proxy: {
					type: 'slateapi',
					url: '/terms',
					limitParam: false,
					pageParam: false,
					startParam: false,
					reader: {
						type: 'json',
						rootProperty: 'data'
					}
				}
			}
		},{
			xtype: 'button',
			text: 'Export',
			action: 'export-reports',
			icon: '/img/icons/fugue/folder-export.png'	
		}]
	},{
		xtype: 'dataview',
		itemId: 'progressReportsList',
		store: 'people.ProgressReports',
		itemSelector: '.person-record',
		emptyText: '<div style="text-align:center">No Progress Records</div>',
		flex: 1,
		autoScroll: true,
		tpl: [
            '<ol class="person-records rich-list">',
                '<tpl for=".">',
                    '<li class="person-record rich-list-item clickable">',
                        '<div class="meta">',
                            '<span class="datum token type">{Type}</span>',
                            '<span class="datum author">{AuthorUsername}</span>',
                            '<time class="datum token index date" datetime="{Date:date(\'c\')}" title="{Date:date(\'F j, Y, g:i a\')}">',
                            '{Date:date(\'M j\')}<span class="token-extended">{Date:date(\', Y, g:i a\')}</span>',
                            '</time>',
                        '</div>',
                        '<div class="description">{Subject}</div>',
                    '</li>',
                '</tpl>',
            '</ol>'
		]
	}]
});