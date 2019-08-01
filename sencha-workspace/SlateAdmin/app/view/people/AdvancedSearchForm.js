/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Advanced Search Form
 */
Ext.define('SlateAdmin.view.people.AdvancedSearchForm', {
    extend: 'Ext.form.Panel',
    xtype: 'people-advancedsearchform',
    requires: [
        'Ext.form.FieldSet',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'SlateAdmin.proxy.API'
    ],

    layout: 'auto',
    items: [{
        xtype: 'fieldset',
        title: 'Advanced Search',
        cls: 'navpanel-search-criteria',
        collapsible: true,
        collapsed: true,
        // stateful: true, TODO fix collapsing state bug
        stateId: 'people-advancedsearchform-fieldset',
        defaults: {
            anchor: '100%',
            xtype: 'textfield',
            labelWidth: 65,
            labelSeparator: '',
            labelAlign: 'right',
            autoSelect: false // only for combo boxes
        },
        items: [{
            name: 'firstname',
            fieldLabel: 'First'
        }, {
            name: 'lastname',
            fieldLabel: 'Last'
        }, {
            name: 'username',
            fieldLabel: 'Username'
        }, {
            name: 'studentnumber',
            fieldLabel: 'ID #'
        }, {
            xtype: 'combo',
            name: 'year',
            fieldLabel: 'Year',
            displayField: 'GraduationYear',
            emptyText: 'Any',
            queryMode: 'local',
            store: {
                fields: ['GraduationYear'],
                proxy: {
                    type: 'slateapi',
                    url: '/people/*graduation-years',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }, {
            xtype: 'combo',
            name: 'gender',
            fieldLabel: 'Gender',
            displayField: 'gender',
            valueField: 'gender',
            emptyText: 'Any',
            queryMode: 'local',
            store: ['Male', 'Female']
        }, {
            xtype: 'combo',
            name: 'advisor',
            fieldLabel: 'Advisor',
            displayField: 'FullName',
            valueField: 'Username',
            matchFieldWidth: false,
            emptyText: 'Any',
            queryMode: 'local',
            store: {
                fields: [
                    { name: 'Username' },
                    { name: 'FirstName' },
                    { name: 'LastName' },
                    {
                        name: 'FullName',
                        calculate: function(data) {
                            return data.LastName + ', ' + data.FirstName;
                        },
                        depends: ['FirstName', 'LastName']
                    }
                ],
                proxy: {
                    type: 'slateapi',
                    url: '/people/*advisors',
                    summary: true,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }, {
            xtype: 'combo',
            name: 'ward-advisor',
            fieldLabel: 'Ward Advisor',
            displayField: 'FullName',
            valueField: 'Username',
            matchFieldWidth: false,
            emptyText: 'Any',
            queryMode: 'local',
            store: {
                fields: [
                    { name: 'Username' },
                    { name: 'FirstName' },
                    { name: 'LastName' },
                    {
                        name: 'FullName',
                        calculate: function(data) {
                            return data.LastName + ', ' + data.FirstName;
                        },
                        depends: ['FirstName', 'LastName']
                    }
                ],
                proxy: {
                    type: 'slateapi',
                    url: '/people/*advisors',
                    summary: true,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }, {
            xtype: 'combo',
            name: 'course',
            fieldLabel: 'Course',
            displayField: 'Title',
            valueField: 'Handle',
            emptyText: 'Any',
            queryMode: 'local',
            store: {
                fields: ['Handle', 'Title'],
                proxy: {
                    type: 'slateapi',
                    summary: true,
                    url: window.SiteEnvironment && window.SiteEnvironment.user ? ('/people/'+window.SiteEnvironment.user.Username+'/courses') : '/sections',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }, {
            xtype: 'button',
            anchor: false,
            margin: '0 0 0 70',
            action: 'search',
            text: 'Search',
            glyph: 0xf002 // fa-search
        }]
    }]
});
