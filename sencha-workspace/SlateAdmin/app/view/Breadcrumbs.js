Ext.define('SlateAdmin.view.Breadcrumbs', {
    extend: 'Ext.toolbar.Breadcrumb',
    xtype: 'slateadmin-breadcrumbs',

    store: {
        xclass: 'Ext.data.TreeStore',
        root: {
            text: 'Slate Admin',
            children: [{
                text: 'People',
                children: [{
                    text: 'Student',
                    children: [{
                        text: 'Class of 2016',
                        children: [{
                            selected: true,
                            text: 'Colby Marks'
                        }]
                    }]
                }]
            }]
        }
    },

    initComponent: function() {
        this.setSelection(this.getStore().findNode('selected', true));

        this.callParent();
    }
});