/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.asset.Ticket', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
        'SlateAdmin.model.Activity'
    ],

    // model config
    idProperty: 'ID',
    
    fields: [
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            defaultValue: 'Slate\\Assets\\Ticket'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true
        },
        {
            name: 'CreatorID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'Name',
            useNull: true
        },
        {
            name: 'Description',
            useNull: true
        },
        {
            name: 'Status',
            useNull: true,
            defaultValue: 'Open'
        },
        {
            name: 'AssigneeID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'AssigneeClass',
            defaultValue: 'Person',
            useNull: true
        },
        {
            name: 'AssetID',
            type: 'integer',
            useNull: true
        },
        'Assignee',
        'Stories',
        'Asset'
    ],
    
    validations: [
        
    ],
    
//    associations: [
//        {
//            type: 'hasMany',
//            name: 'Activities',
//            model: 'SlateAdmin.model.asset.Activity',
//            primaryKey: 'ID',
//            foreignKey: 'ObjectID',
//            
//            getterName: 'getActivities',
//            setterName: 'setActivities',
//            
//            associationKey: 'Stories'
//        }   
//    ],

    proxy: {
        type: 'slaterecords',
        url: '/tickets',

        reader: {
            totalProperty: 'total',
            successProperty: 'success',
            root: 'data',
            type: 'json'
        },
        
        extraParams: {
            format: 'json',

            "include[]": [
                'Stories',
                'Assignee',
                'Asset.Assignee'
            ]
        }
    }

    // model methods
    
});