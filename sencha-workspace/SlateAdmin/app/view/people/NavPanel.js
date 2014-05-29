/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'people-navpanel',
    requires: [
        'Ext.form.Panel'
    ],

    title: 'People',
    autoScroll: true,
    bodyPadding: 0,
    dockedItems: [{
        xtype: 'form',
        dock: 'top',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'textfield',
            anchor: '100%',
            inputType: 'search',
            itemId: 'searchField',
            emptyText: 'Search All People',
            selectOnFocus: true
        }]
    }],
    items: [{
        xtype: 'form',
        bodyPadding: 10,
        itemId: 'advancedSearchForm',
        title: 'Advanced Search',
//        collapsible: true,
//        collapsed: false,
//        stateful: true,
//        stateId: 'peopleAdvSearchPanel',
//        bodyPadding: '8 12',
        border: 0,
        defaults: {
            anchor: '100%',
            xtype: 'textfield',
            labelWidth: 45,
            labelSeparator: '',
            labelAlign: 'right',
            labelStyle: 'font-size: small; color: #666',
            labelPad: 10
        },
        items: [{
            fieldLabel: 'First',
            name: 'firstname'
        },{
            fieldLabel: 'Last',
            name: 'lastname'
        },{
            fieldLabel: 'User',
            name: 'username'
        },{
            fieldLabel: 'ID #',
            name: 'studentnumber'
        },{
            xtype: 'combo',
            fieldLabel: 'Year',
            name: 'year',
            queryMode: 'local',
            displayField: 'GraduationYear',
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
            store: {
                fields: ['gender'],
                data: [{gender: 'Male'}, {gender: 'Female'}]
            },
            displayField: 'gender',
            valueField: 'gender',
            queryMode: 'local',
            fieldLabel: 'Gender',
            name: 'gender'
        },{
            name: 'advisor',
            xtype: 'combo',
            valueField: 'Username',
            fieldLabel: 'Advisor',
            emptyText: 'Any',
            displayField: 'FullName',
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
            fieldLabel: 'Course',
            valueField: 'Handle',
            displayField: 'Title',
            name: 'course',
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
        }]
    }],

    // TODO: rename or move this to the controller?
    updateSearchOptions: function(query){
        if (!query) {
            return false;
        }
        
        var me = this,
            form = me.down('#advancedSearchForm'),
            queryArray = query.split(' '),
            fieldNames = {firstname: '', lastname: '' , username: '', studentnumber: '', year: '', gender: '', advisor: '', course: ''},
            i;
        
        for(i=0; i<queryArray.length; i++) {
            var result = /(.+):(.+)/.exec(queryArray[i]),
                field = result ? form.down('field[name='+result[1]+']') : false;
            
            if(field) {
                field.setValue(result[2]);
                delete fieldNames[result[1]];
            }
        }

        form.getForm().setValues(fieldNames);
        me.down('#searchField').setValue(query);
    }
});