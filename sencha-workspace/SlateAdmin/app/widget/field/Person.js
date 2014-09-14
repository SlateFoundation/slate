/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.field.Person', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'slate-personfield',
    requires: [
        'SlateAdmin.model.person.Person'
    ],

    store: {
        model: 'SlateAdmin.model.person.Person',
        proxy: {
            type: 'slaterecords',
            url: '/people',
            summary: true
        }
    },
    allowBlank: false,
    queryMode: 'remote',
    queryParam: 'q',
    valueField: 'ID',
    displayField: 'FullName',
    autoSelect: false,
    triggerAction: 'query',
    minChars: 2
});