/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.worksheets.PromptsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-standards-worksheets-promptsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Date',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.ComboBox',
        'Ext.grid.column.Action'
    ],
    
    store: 'progress.standards.Prompts',
    componentCls: 'progress-standards-worksheets-promptsgrid',
    tbar: [{
        xtype: 'button',
		text: 'Add Prompt',
		action: 'addPrompt'
	}, {
		xtype: 'tbfill'
	}, {
		xtype: 'button',
		text: 'Disable this worksheet',
		action: 'disableWorksheet'
	}],
	plugins: [{
		ptype: 'cellediting',
		clicksToEdit: 2,
		pluginId: 'promptEditing'
	}],
	columns: [{
		header: 'Prompt',
		dataIndex: 'Prompt',
		flex: 1,
		editor: {
			xtype: 'combo',
			allowBlank: false,
			mode: 'remote',
			minChars: 1,
			queryDelay: 750,
			typeAhead: true,
			queryParam: 'q',
			store: {
				fields: ['Prompt', 'ID'],
				pageSize: false,
				proxy: {
					type: 'ajax',
					url: '/standards/json/prompts',
					reader: {
						type: 'json',
						root: 'data'
					}
				}
			},
			valueField: 'Prompt',
			displayField: 'Prompt'
		}
	}, {
		xtype: 'actioncolumn',
		width: 30,
		items: [{
			tooltip: 'Delete Prompt',
			icon: '/img/icons/silk/delete.png',
			handler: function (grid, index) {
				this.up('progress-standards-worksheets-promptsgrid').fireEvent('itemdeleteclick', index);
			}
		}]
	}]
});
