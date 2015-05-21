/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.Group', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',

    fields: [{
        name: 'ID',
        type: 'integer',
        allowNull: true
    },{
        name: 'Class',
        defaultValue: 'Emergence\\People\\Groups\\Group'
    },{
        name: 'Created',
        type: 'date',
        dateFormat: 'timestamp',
        allowNull: true
    },{
        name: 'CreatorID',
        type: 'integer',
        allowNull: true
    },{
        name: 'Handle',
        type: 'string',
        allowNull: true
    },{
        name: 'Name',
        type: 'string',
        allowNull: true
    },{
        name: 'Status',
        type: 'string',
        defaultValue: 'Active'
    },{
        name: 'Founded',
        type: 'date',
        dateFormat: 'timestamp'
    },{
        name: 'About',
        type: 'string',
        allowNull: true
    },{
        name: 'Population',
        type: 'integer',
        allowNull: true,
        persist: false
    },{
        name: 'ParentID',
        type: 'integer',
        allowNull: true
    },{
        name: 'Left',
        type: 'integer',
        allowNull: true
    },{
        name: 'Right',
        type: 'integer',
        allowNull: true
    },{
        name: 'namesPath',
        type: 'string',
        persist: false
    },{
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Name');
        }
    },{
        name: 'leaf',
        type: 'boolean',
        persist: false,
        depends: ['Left', 'Right'],
        convert: function(v, r) {
            if (typeof v == 'boolean') {
                return v;
            } else {
                return r.get('Left') == r.get('Right') - 1;
            }
        }
    },{
        name: 'qtip',
        depends: ['Population', 'Founded', 'About'],
        convert: function(v, r) {
            var qtip = [],
                population = r.get('Population'),
                founded = r.get('Founded'),
                about = r.get('About');
            
            if (founded) {
                qtip.push('Founded: ' + founded.toLocaleDateString());
            }
            
            if (Ext.isNumber(population)) {
                qtip.push('Population: ' + population.toLocaleString());
            }
            
            if (about) {
                qtip.push('About: <span style="white-space: pre">' + about + '</q>');
            }

            return qtip.join('<br>');
        }
    },{
        name: 'qshowDelay',
        defaultValue: 2000
    }],

    proxy: {
        type: 'slaterecords',
        url: '/groups'
    }
});
