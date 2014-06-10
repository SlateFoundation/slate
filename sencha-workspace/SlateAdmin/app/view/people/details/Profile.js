/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Profile', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-profile',
    requires: [
        'Ext.form.Panel',
        'Ext.ux.form.field.BoxSelect',
        'SlateAdmin.proxy.Records',
        'SlateAdmin.model.Group'
    ],


    title: 'Profile',
    itemId: 'profile',


    // panel config
    layout: 'fit',
    items: {
        xtype: 'form',
        border: false,
        trackResetOnLoad: true,
        autoScroll: true,
        bodyPadding: '10',
        defaults: {
            labelSeparator: ''
        },
        items: [{
            xtype: 'displayfield',
            name: 'Class',
            fieldLabel: 'Record Class'
        },{
            xtype: 'textfield',
            name: 'FirstName',
            fieldLabel: 'First Name'
        },{
            xtype: 'textfield',
            name: 'MiddleName',
            fieldLabel: 'Middle Name'
        },{
            xtype: 'textfield',
            name: 'LastName',
            fieldLabel: 'Last Name'
        },{
            xtype: 'combo',
            name: 'Gender',
            fieldLabel: 'Gender',
            forceSelection: true,
            queryMode: 'local',
            store: ['Male', 'Female']
        },{
            xtype: 'textfield',
            name: 'StudentNumber',
            fieldLabel: 'Student #'
        },{
            xtype: 'combo',
            store: 'people.AccountLevels',
            fieldLabel: 'Account Level',
            queryMode: 'local',
            valueField: 'value',
            displayField: 'value',
            name: 'AccountLevel',
            emptyText: '(None)',
            triggerAction: 'all',
            editable: false
        },{
            name: 'groupIDs',
            xtype: 'boxselect',
            fieldLabel: 'Groups',
            multiSelect: true,
            delimiter: ',',
            anchor: '100%',
            queryMode: 'local',
            stacked: true,
            anyMatch: true,
            lazyAutoLoad: false,
            store: 'Groups',
            displayField: 'namesPath',
            valueField: 'ID'
        },{
            text: 'Save',
            cls: 'glyph-success',
            scale: 'medium',
            margin: '10 105',
            action: 'save',
            xtype: 'button',
            glyph: 0xf058 // fa-check-circle
        }]
    }
});