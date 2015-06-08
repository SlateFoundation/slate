/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Asset', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
        'SlateAdmin.model.Activity'
    ],


    parentNode: null,


    // model config
    idProperty: 'ID',
    
    fields: [
        
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            defaultValue: 'Slate\\Assets\\Asset'
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
            name: 'OwnerID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'OwnerClass',
            useNull: true
        },
        {
            name: 'Name',
            useNull: true
        },
        {
            name: 'Data',
            useNull: true
        },
        {
            name: 'LocationID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'Location',
            useNull: true
        },
        {
            name: 'StatusID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'Status',
            useNull: true
        },
        {
            name: 'AssigneeID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'AssigneeClass',
            useNull: true
        },
        {
            name: 'Aliases',
            useNull: true
        },
        'Assignee',
        'Stories',
        'Owner',
        'Aliases',
        'matches',
        {
            name: 'AssigneeModifiedTime', 
            convert: function(v, r) {
                if (r.raw.AssigneeModified) {
                    return new Date(r.raw.StatusModified.Created * 1000);
                } else {
                    return null;
                }   
            }
        },
        {
            name: 'LocationModifiedTime', 
            convert: function(v, r) {
                if (r.raw.LocationModified) {
                    return new Date(r.raw.StatusModified.Created * 1000);
                } else {
                    return null;
                }   
            }
        },
        {
            name: 'StatusModifiedTime', 
            convert: function(v, r) {
                
                if (r.raw.StatusModified) {
                    return new Date(r.raw.StatusModified.Created * 1000);
                } else {
                    return null;
                }
            }
        }
        
    ],

    proxy: {
        type: 'slaterecords',
        url: '/assets',

        reader: {
            totalProperty: 'total',
            successProperty: 'success',
            root: 'data',
            type: 'json'
        },
        
        include: [
            'Location',
            'Status',
            'Assignee',
            'Owner',            
            'Aliases',
            
            'Stories',
            
            'LocationModified',
            'StatusModified',
            'AssigneeModified'
        ]
    }
    
});