Ext.define('SlateAdmin.model.asset.TemplateDataField', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],
    
    fields: [
        'name'    
    ],
    
    proxy: {
        type: 'slaterecords',
        url: '/assets/*extra-info-fields',
        extraParams: {
            format: 'json'
        }
    }
});