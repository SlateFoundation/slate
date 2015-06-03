/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.asset.Location', {
    extend: 'SlateAdmin.model.Location',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    parentNode: null,

    fields: [{
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Title');
        }
    },{
        name: 'leaf',
        type: 'boolean',
        persist: false,
        convert: function(v, r) {
            if (typeof v == 'boolean') {
                return v;
            } else {
                return r.get('Left') == r.get('Right') - 1;
            }
        }
    }
    ],
    
    validations: [
        
    ],

    proxy: {
        type: 'slaterecords',
        url: '/assets/locations',
        
        extraParams: {
            format: 'json',
            parentLocation : 'all',
            limit: false
        }
    }
    
});