/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.asset.TreeNode', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    parentNode: null,

    // model config
    idProperty: 'CustomHandle',
    
    fields: [{
        name: 'ID'
    },
    {
        name: 'Class',
        defaultValue: 'Asset'
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
        name: 'Title',
        type: 'string'
    },
    {
        name: 'Handle',
        type: 'string'
    },
    {
        name: 'ParentID',
        type: 'integer',
        useNull: true
    },
    {
        name: 'Parent',
        useNull: true
    },
    {
        name: 'Left',
        type: 'integer',
        persist: false,
        useNull: true
    },
    {
        name: 'Right',
        type: 'integer',
        persist: false,
        useNull: true
    },
    {
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.getNodeText();
        }
    },
    {
        name: 'leaf',
        type: 'boolean',
        persist: false,
        convert: function(v, r) {

            if (typeof v == 'boolean') {
                return v;
            } else if (r.get('Right') && r.get('Left')) {
                return r.get('Right') == r.get('Left') + 1;
            } else {
                return true;
            }
        }
    },{
        name: 'qtitle',
        type: 'integer',
        persist: false,
        convert: function(v, r) {
            v = 0;
            
            if (r.get('assetsCount') || r.get('ticketsCount')) {
                v = r.get('assetsCount') || r.get('ticketsCount');
            }
            
            return v;
        }
    },{
        name: 'nodeParam',
        useNull: true,
        persist: false
    },{
        name: 'queryParam',
        convert: function(v, r) {
            return v || r.getQueryParam();
        },
        useNull: true,
        persist: false
    },{
        name: 'nodeField',
        useNull: true,
        persist: false
    },{
        name: 'url',
        useNull: true,
        persist: false,
        convert: function(v, r) {
            return v || r.getUrl();
        }
    },{
        name: 'rootHash',
        useNull: true,
        persist: false
    },{
        name: 'assetsCount',
        useNull: true,
        type: 'integer',
        persist: false
    },{
        name: 'ticketsCount',
        useNull: true,
        type: 'integer',
        persist: false
    },
    {
        name: 'CustomHandle',
        convert: function(v, r) {
            return r.get('Class').split('\\').pop().toLowerCase() + '-' + r.get('ID');
        }
    },
    {
        name: 'ParentCustomHandle',
        convert: function(v, r) {
            return r.get('ParentID') ? (r.get('Class').split('\\').pop().toLowerCase() + '-' + r.get('ParentID')) : null;
        }
    },{
        name: 'hideCount',
        type: 'boolean',
        defaultValue: false
    },
    'Username'],
    
    getNodeText: function() {
        var v, r = this;
        
        switch(r.get('Class').split('\\').pop()) {
            case 'Location':
            case 'Status':
                v = r.get('Title');
                break;
            
            case 'Person':
                v = r.get('Username') ? r.get('Username') : (r.raw.FirstName + ' ' + r.raw.LastName);
                break;

            case 'User':
                v = r.get('Username');
                break;
        }  
        
        return v;
    },
    
    getQueryValue: function(deep) {
        var r = this, v,
            deepRecord,
            rootNodes = ['assets', 'tickets', 'root'];
        
        switch (r.get('Class').split('\\').pop()) {
            case 'Ticket':
                v = r.get('ID');
                break;         
                
            case 'Person':
                v = [r.raw.FirstName, r.raw.LastName].join(' ');
                break;

            case 'User':
                v = r.get('Username');
                break;
                
            case 'Status':
            case 'Location':
                
                v = r.get('Handle');
                break;
        }
        
        return v; 
    },
    
    getQueryParam: function(deep) {
        var r = this, v,
            deepRecord,
            rootNodes = ['assets', 'tickets', 'root'];
        
        if (r.data.queryParam) {
            v = r.data.queryParam;
        } else if(rootNodes.indexOf(r.get('Handle')) !== -1) {
            return null;
        }
        
        if (!v && deep !== false && r.parentNode) {
            deepRecord = r;
        
            while (!v && deepRecord && deepRecord.parentNode) {
                deepRecord = deepRecord.parentNode;
                v = deepRecord.data.queryParam;
            }
            
        }
        
        return v;
    },
    
    getUrl: function(deep) {
        var r = this, v,
            rootNodes = ['assets', 'tickets', 'root'];
        
        if(rootNodes.indexOf(r.getId()) !== -1) {
            return null;
        }
        
        if (deep !== false && r.parentNode) {
            deep = r;
        
            while (deep && !deep.get('url')) {
                deep = deep.parentNode;
            }
            
            v = deep.get('url');
        } else {
            v = r.get('url');
        }
        return v;
    },

    proxy: {
        
        type: 'slaterecords',
        url: '/',
        include: '*.data',
        
        extraParams: {
            format: 'json'
        },
        
        buildRequest: function(operation) {
            var me = this,
                node = operation.node,
                url = node.get('url'),
                request;
                            
            request = me.superclass.buildRequest.call(me, arguments);

            if (!url) {
                return false;
            }
            
            request.url = node.get('url');
            
            request.params['include[]'] = ['ticketsCount', 'assetsCount'];
            
            //load all nodes at once.
            if(node.get('nodeParam')) {
                request.params[node.get('nodeParam')] = 'any';
            }
            
            
            request.action = operation.action;
            request.method = 'GET';
            
            return request;
        }
    }
});