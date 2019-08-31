Ext.define('EmergenceEditor.view.FilesystemTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'emergence-filesystemtree',
    requires: [
        'Ext.selection.RowModel',
        'Ext.tree.plugin.TreeViewDragDrop',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Text'
    ],

    componentCls: 'emergence-filesystemtree',

    header: false,
    title: 'Filesystem',
    stateId: 'editor-filesystemtree',
    stateful: {
        storeState: false
    },
    plugins: {
        id: 'cellediting',
        ptype: 'cellediting',
        clicksToEdit: 1
    },

    store: 'FilesystemTree',
    useArrows: true,
    rootVisible: false,
    selModel: {
        selType: 'rowmodel',
        mode: 'MULTI'
    },
    viewConfig: {
        componentCls: 'emergence-filesystemtree-view',
        loadMask: false,
        plugins: {
            ptype: 'treeviewdragdrop',
            appendOnly: true,
            dragText: '{0} selected item{1}',
            containerScroll: true
        }
    },

    columns: [
        {
            flex: 1,

            xtype: 'treecolumn',
            dataIndex: 'Handle',
            align: 'left',
            sortable: false,
            editor: {
                xtype: 'textfield',
                allowBlank: false
            }
        }
    ]
});