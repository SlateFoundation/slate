/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Profile', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-profile',
    requires: [
        'Ext.form.Panel',
//        'Ext.ux.form.field.BoxSelect',
        'SlateAdmin.proxy.Records',
        'SlateAdmin.model.person.Group'
    ],


    title: 'Profile',
    glyph: 0xf007,
    itemId: 'profile',

    // panel config
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            text: 'Cancel',
            action: 'cancel',
            disabled: true,
            cls: 'glyph-danger',
            glyph: 0xf057 // fa-times-circle
        },{
            xtype: 'tbfill'
        },{
            text: 'Save',
            action: 'save',
            disabled: true,
            cls: 'glyph-success',
            glyph: 0xf058 // fa-check-circle
        }]
    }],

    layout: 'fit',
    
    items: {
        xtype: 'form',
        bodyPadding: '15 10 10',
        trackResetOnLoad: true,
        autoScroll: true,
        defaultType: 'textfield',
        fieldDefaults: {
            labelAlign: 'right',
            labelPad: 10,
            labelSeparator: '',
            anchor: '100%'
        },
        items: [{
            xtype: 'displayfield',
            name: 'Class',
            fieldLabel: 'Record Class'
        },{
            name: 'FirstName',
            fieldLabel: 'First Name'
        },{
            name: 'MiddleName',
            fieldLabel: 'Middle Name'
        },{
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
//        },{
//            name: 'groupIDs',
//            xtype: 'boxselect',
//            fieldLabel: 'Groups',
//            multiSelect: true,
//            delimiter: ',',
//            anchor: '100%',
//            queryMode: 'local',
//            stacked: true,
//            anyMatch: true,
//            lazyAutoLoad: false,
//            store: 'people.Groups',
//            displayField: 'namesPath',
//            valueField: 'ID'
        }]
    }
});