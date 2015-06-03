/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.assets.TreeNodes', {
    extend: 'Ext.data.TreeStore',

    model: 'SlateAdmin.model.asset.TreeNode',
    
    nodeParam: null,
    parentIdProperty: 'ParentCustomHandle',
    
    root: {
        
        leaf: false,
        loaded: true,
        
        Handle: 'root',
        Class: 'Root',
        
        data: [{
            //used to hide node's total count.
            hideCount: true,
            text: 'Assets',
            leaf: false,
            
            Class: 'Asset',
            Handle: 'assets',
            url: '/assets',
            queryParam: false,
            data : [{
                text: 'Statuses',                
                leaf: false,
                hideCount: true,
                
                Class: 'Slate\\Assets\\Status',
                ID: 'statuses',
                url: '/assets/statuses',
                nodeParam: 'parentStatus',
                nodeField: 'ID',
                queryParam: 'assets-status'
            },{
                text: 'Locations',
                leaf: false,
                hideCount: true,
                
                Class: 'Emergence\\Locations\\Location',
                ID: 'locations',
                url: '/assets/locations',
                nodeParam: 'parentLocation',
                nodeField: 'ID',
                queryParam: 'location'
            }]
        },{
            text: 'Tickets',
            leaf: false,
            hideCount: true,
            
            Class: 'Ticket',
            ID: 'tickets',
            url: '/tickets',
            queryParam: false,

            data: [{
                text: 'Assignee',                
                leaf: false,
                hideCount: true,
                
                Class: 'Ticket',
                ID: 'assignees',
                url: '/tickets/assignees',
                nodeField: 'Assignee',
                queryParam: 'assignee'
            },{
                text: 'Statuses',
                leaf: false,
                hideCount: true,
                
                ID: 'statuses',
                Class: 'Ticket',                
                queryParam: 'tickets-status',
                url: '/tickets/statuses',
                _Xdata: [{
                    text: 'Open',
                    leaf: true,
                    
                    ID: 'open',
                    Class: 'Ticket'
                    
                },{
                    text: 'Closed',
                    leaf: true,
                    
                    ID: 'closed',
                    Class: 'Ticket'
                    
                }]
            }]
        }]
    }
});