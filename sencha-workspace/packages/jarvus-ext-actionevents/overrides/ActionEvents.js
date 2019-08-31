/*jslint browser: true, undef: true *//*global Ext,Slate*/
Ext.define('Jarvus.ext.actionevents.override.grid.column.ActionEvents', {
    override: 'Ext.grid.column.Action',

    handler: function(view, rowIndex, colIndex, item, e, record, row) {
        var grid = view.ownerCt;
        grid.fireEvent((item.action||'action')+'click', grid, record, item, rowIndex, colIndex, row, e);
    }
});
