/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'people-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search'
    ],

    title: 'People',
    autoScroll: true,
    bodyPadding: 0,
    dockedItems: [{
        xtype: 'form',
        dock: 'top',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'searchfield',
            anchor: '100%',
            emptyText: 'Search All People'
        }]
    }],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'form',
        bodyPadding: 10,
        itemId: 'advancedSearchForm',
        title: 'Advanced Search',
        collapsible: true,
        collapsed: true,
        titleCollapse: true,
        stateful: true,
        stateId: 'peopleAdvSearchPanel',
        border: 0,
        defaults: {
            anchor: '100%',
            xtype: 'textfield',
            labelWidth: 45,
            labelSeparator: '',
            labelAlign: 'right',
            labelStyle: 'font-size: small; color: #666',
            labelPad: 10,
            autoSelect: false // only for comboboxes
        },
        items: [{
            name: 'firstname',
            fieldLabel: 'First'
        },{
            name: 'lastname',
            fieldLabel: 'Last'
        },{
            name: 'username',
            fieldLabel: 'User'
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
                    type: 'ajax',
                    url: '/people/json/*graduation-years',
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
                    type: 'ajax',
                    url: '/people/json/*advisors',
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
                    type: 'ajax',
                    url: window.SiteEnvironment && window.SiteEnvironment.user ? ('/people/json/'+window.SiteEnvironment.user.Username+'/courses') : '/sections/json',
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }
        },{
            xtype: 'button',
            action: 'search',
            text: 'Search'
        }]
    }]
});