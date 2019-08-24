Ext.define('Slate.store.people.Groups', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Groups'
    ],


    model: 'Slate.model.person.Group',

    config: {
        sorters: 'Left',
        pageSize: 0,
        proxy: {
            type: 'slate-groups',
            include: 'Population',
            extraParams: {
                parentGroup: 'any'
            }
        },
    },


    onProxyLoad: function(operation) {
        var me = this,
            i = 0, count, group, parentGroup, namesStack;

        me.callParent(arguments);

        if (!operation.wasSuccessful()) {
            return;
        }

        me.beginUpdate();
        for (count = me.getCount(); i < count; i++) {
            group = me.getAt(i);
            parentGroup = me.getById(group.get('ParentID'));
            namesStack = [ group.get('Name') ];

            if (parentGroup) {
                namesStack = parentGroup.get('namesStack').concat(namesStack);
            }

            group.set('namesStack', namesStack);
        }
        me.endUpdate();
    }
});