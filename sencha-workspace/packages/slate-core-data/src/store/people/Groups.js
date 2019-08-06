Ext.define('Slate.store.people.Groups', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Group',

    config: {
        sorters: 'Left',
        pageSize: 0,
        proxy: {
            type: 'slaterecords',
            url: '/groups',
            include: 'Population',
            extraParams: {
                parentGroup: 'any'
            }
        },
    },


    onProxyLoad: function(operation) {
        var me = this,
            i = 0, count, group, parentGroup;

        me.callParent(arguments);

        if (operation.wasSuccessful()) {
            for (count = me.getCount(); i < count; i++) {
                group = me.getAt(i);
                parentGroup = me.getById(group.get('ParentID'));
                group.set('namesPath', (parentGroup ? parentGroup.get('namesPath') : '') + '/' + group.get('Name'));
            }
        }
    }
});