/*jslint browser: true, undef: true *//*global Ext*/
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
        collapsible: true,
        collapsed: true,
        // stateful: true, TODO fix collapsing state bug
        stateId: 'peopleAdvSearchPanel',
        defaults: {
            anchor: '100%',
            xtype: 'textfield',
            labelWidth: 45,
            labelSeparator: '',
            labelAlign: 'right',
            labelStyle: 'font-size: small; color: #666',
            labelPad: 10,
            autoSelect: false // only for combo boxes
        },
        items: [{
            name: 'firstname',
            fieldLabel: 'First'
        },{
            name: 'lastname',
            fieldLabel: 'Last'
        },{
            name: 'username',
            fieldLabel: 'Username'
        },{
            name: 'studentnumber',
            fieldLabel: 'ID #'
        },{
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
                        root: 'data'
                    }
                }
            } 
        },{
            xtype: 'combo',
            name: 'gender',
            fieldLabel: 'Gender',
            displayField: 'gender',
            valueField: 'gender',
            emptyText: 'Any',
            queryMode: 'local',
            store: ['Male', 'Female']
        },{
            xtype: 'combo',
            name: 'advisor',
            fieldLabel: 'Advisor',
            displayField: 'FullName',
            valueField: 'Username',
            emptyText: 'Any',
            queryMode: 'local',
            store: {
                fields: [
                    {name: 'Username'},
                    {
                        name: 'FullName',
                        convert: function(v, r) {
                            return r.raw.LastName + ', ' + r.raw.FirstName;
                        }
                    }
                ],
                proxy: {
                    type: 'slateapi',
                    url: '/people/*advisors',
                    summary: true,
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }        
        },{
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
                        root: 'data'
                    }
                }
            }
        },{
            xtype: 'button',
            anchor: false,
            margin: '0 0 0 55',
            action: 'search',
            text: 'Search',
            glyph: 0xf002 // fa-search
        }]
    }]
});