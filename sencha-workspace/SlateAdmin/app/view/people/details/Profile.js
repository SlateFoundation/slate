/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Profile', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-profile',
    requires: [
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.form.field.Tag',
        'Ext.form.field.Number'
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
        fieldDefaults: {
            labelAlign: 'right',
            labelPad: 10,
            labelSeparator: '',
            anchor: '100%',
            labelWidth: 120,
        },
        defaults: {
            xtype: 'fieldset',
            defaultType: 'textfield'
        },
        items: [{
            xtype: 'fieldset',
            itemId: 'loginFields',

            title: 'Admin',
            items: [{
                xtype: 'combo',
                name: 'Class',
                store: 'people.Classes',
                queryMode: 'local',
                valueField: 'name',
                displayField: 'label',
                fieldLabel: 'Record Type',
                triggerAction: 'all',
                editable: false
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
                xtype: 'textfield',
                name: 'Username',
                fieldLabel: 'Username',
                readOnly: true
            },{
                xtype: 'fieldcontainer',
                itemId: 'temporaryPasswordFieldCt',
                fieldLabel: 'Temp Password',
                layout: 'hbox',
                hidden: true,
                items: [{
                    flex: 1,

                    xtype: 'textfield',
                    name: 'TemporaryPassword',
                    readOnly: true,
                    emptyText: 'Personal password in effect'
                },{
                    xtype: 'button',
                    action: 'reset-temporary-password',
                    text: 'Reissue',
                    glyph: 0xf084 // fa-key
                }]
            },{
                xtype: 'fieldcontainer',
                itemId: 'masqueradeBtnCt',
                fieldLabel: 'Masquerade',
                hidden: true,
                items: [{
                    xtype: 'button',
                    action: 'masquerade',
                    text: 'Log in as this user',
                    glyph: 0xf090 // fa-sign-in
                }]
            }]
        },{
            xtype: 'fieldset',
            itemId: 'personalFields',

            title: 'Personal',
            items: [{
                name: 'PreferredName',
                fieldLabel: 'Preferred Name'
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
                xtype: 'datefield',
                name: 'BirthDate',
                fieldLabel: 'Birth Date'
            }]
        },{
            xtype: 'fieldset',
            itemId: 'schoolFields',

            title: 'School',
            items: [{
                name: 'StudentNumber',
                fieldLabel: 'Student #',
                hidden: true
            },{
                xtype: 'numberfield',
                name: 'GraduationYear',
                fieldLabel: 'Grad Year',
                minValue: 1990,
                hidden: true
            },{
                xtype: 'combo',
                name: 'AdvisorID',
                fieldLabel: 'Advisor',
                hidden: true,

                store: 'people.Advisors',
                displayField: 'SortName',
                valueField: 'ID',
                forceSelection: true,
                typeAhead: false,
                queryMode: 'local',
                emptyText: 'Select',
                matchFieldWidth: false,
                anyMatch: true
            },{
                xtype: 'tagfield',
                name: 'groupIDs',
                fieldLabel: 'Groups',
                multiSelect: true,
                delimiter: ',',
                anchor: '100%',
                queryMode: 'local',
                stacked: true,
                anyMatch: true,
                lazyAutoLoad: false,
                store: 'people.Groups',
                displayField: 'namesPath',
                valueField: 'ID'
            }]
        },{
            xtype: 'fieldset',
            itemId: 'profileFields',

            title: 'Profile',
            items: [{
                name: 'Location',
                fieldLabel: 'Location'
            },{
                xtype: 'textarea',
                name: 'About',
                fieldLabel: 'About Me'
            }]
        }]
    }
});
