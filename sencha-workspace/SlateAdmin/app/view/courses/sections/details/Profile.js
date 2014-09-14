/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.sections.details.Profile', {
    extend: 'SlateAdmin.view.courses.sections.details.AbstractDetails',
    xtype: 'courses-sections-details-profile',
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.TextArea'
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
            xtype: 'combobox',
            name: 'CourseID',
            fieldLabel: 'Course',
            queryMode: 'local',
            store: 'courses.Courses',
            valueField: 'ID',
            displayField: 'Title',
            forceSelection: true,
            allowBlank: true // doesn't seem to get around forceSelection
        },{
            name: 'Code',
            fieldLabel: 'Code'
        },{
            name: 'Title',
            fieldLabel: 'Title'
        },{
            xtype: 'combobox',
            name: 'TermID',
            fieldLabel: 'Term',
            queryMode: 'local',
            store: 'Terms',
            valueField: 'ID',
            displayField: 'Title',
            forceSelection: true,
            allowBlank: true // doesn't seem to get around forceSelection
        },{
            xtype: 'combobox',
            name: 'ScheduleID',
            fieldLabel: 'Schedule',
            queryMode: 'local',
            store: 'courses.Schedules',
            valueField: 'ID',
            displayField: 'Title',
            forceSelection: true,
            allowBlank: true, // doesn't seem to get around forceSelection
            selectOnFocus: true
        },{
            xtype: 'combobox',
            name: 'LocationID',
            fieldLabel: 'Location',
            queryMode: 'local',
            store: 'Locations',
            valueField: 'ID',
            displayField: 'Title',
            forceSelection: true,
            allowBlank: true, // doesn't seem to get around forceSelection
            selectOnFocus: true
        },{
            xtype: 'numberfield',
            name: 'StudentsCapacity',
            fieldLabel: 'Capacity',
            minValue: 1,
            emptyText: 'No limit'
        },{
            xtype: 'textarea',
            name: 'Notes',
            fieldLabel: 'Notes'
        }]
    }
});