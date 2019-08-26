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
        var me = this;

        if (!me.destroyed && operation.wasSuccessful()) {
            const records = operation.getRecords();

            // build an initial map of records by id
            const byId = {};

            for (const record of records) {
                byId[record.getId()] = record;
            }

            // decorate dataset with hierarchy metadata
            for (const record of records) {
                let namesStack = [ record.get('Name') ];

                const parentRecord = byId[record.get('ParentID')];
                if (parentRecord) {
                    namesStack = parentRecord.get('namesStack').concat(namesStack);
                }

                record.set('namesStack', namesStack, { commit: true });
            }
        }

        me.callParent(arguments);
    }
});