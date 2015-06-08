/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.Manager', {
    extend: 'Ext.grid.Panel',
    xtype: 'settings-courses-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'settings.courses.Courses',
    columns: [{
        text: 'Title',
        width: 200,
        dataIndex: 'Title',
        editor: 'textfield'
    }, {
        text: 'Code',
        width: 100,
        dataIndex: 'Code',
        editor: 'textfield'
    },{
        text: 'Department',
        width: 100,
        dataIndex: 'DepartmentID',
        renderer: function (v,m,r) {
            var department = r.get('Department');
            
            return department ? department.Title : 'None';
        },
        editor: {
            xtype: 'combobox',
            displayField: 'Title',
            queryMode: 'local',
            typeAhead: true,
            valueField: 'ID',
            store: {
                fields: [
                    'Title',
                    {
                        name: 'ID',
                        type: 'integer'
                        
                    }
                ],
                proxy: {
                    type: 'ajax',
                    url: '/departments/json',
					limitParam: false,
					pageParam: false,
					startParam: false,
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }
        }
    }, {
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: {
            xtype: 'combo',
            displayField: 'name',
            store: {
                fields: ['name'],
                data: [
                    {name: 'Live'},
                    {name: 'Hidden'},
                    {name: 'Deleted'}
                ]
            }
        }
    }, {
        text: 'Description',
        flex: 1,
        dataIndex: 'Description',
        editor: 'textareafield'
    }],
    tbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Course',
        action: 'create-course'
    }],
    plugins: [{
        ptype: 'cellediting',
        clicksToEdit: 2,
        pluginId: 'courseEditing'
    }]
});