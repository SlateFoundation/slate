Ext.define('Slate.model.person.RelationshipTemplate', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.API'
    ],


    // model config
    idProperty: 'label',

    fields: [
        {
            name: 'label',
            type: 'string',
            mapping: 'Relationship.Label'
        },
        {
            name: 'class',
            type: 'string',
            mapping: 'Relationship.Class'
        },
        {
            name: 'Relationship'
        },
        {
            name: 'Person'
        },
        {
            name: 'InverseRelationship'
        }
    ],

    proxy: {
        type: 'slate-api',
        url: '/relationships/*templates',
        pageParam: false,
        startParam: false,
        limitParam: false,
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    getInverseLabel: function(gender) {
        var inverse = this.get('InverseRelationship');

        if (!inverse) {
            return null;
        }

        return inverse.Label[gender || 'Neutral'] || null;
    }
});
