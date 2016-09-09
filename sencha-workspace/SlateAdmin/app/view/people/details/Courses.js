/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Courses', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-courses',
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'SlateAdmin.model.course.Section',
        'SlateAdmin.proxy.API'
    ],


    title: 'Courses',
    glyph: 0xf073,
    itemId: 'courses',


    // panel config
    layout: 'fit',

    tbar: [{
        xtype: 'combobox',
        fieldLabel: 'Term',
        labelWidth: 36,
        editable: false,
        emptyText: 'Current Term',
        valueField: 'ID',
        flex: 1,
        itemId: 'courseTermSelector',
        queryMode: 'local',
        name: 'courseTermSelector',
        displayField: 'Title',
        store: 'Terms'
    }],

    items: {
        xtype: 'grid',
        border: false,
        viewConfig: {
            emptyText: 'No courses for selected term'
        },
        store: {
            model: 'SlateAdmin.model.course.Section',
            proxy: {
                type: 'slateapi',
                startParam: false,
                limitParam: false,
                pageParam: false,
                extraParams: {
                    include: 'Schedule,Location'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        },
        columns: {
            defaults: {
                menuDisabled: true
            },
            items: [{
                header: 'Section',
                dataIndex: 'Code',
                width: 90
            },{
                header: 'Title',
                dataIndex: 'Title',
                flex: 1,
                renderer: function(v, m, r){
                    return r.getLink();
                }
            },{
                header: 'Schedule',
                dataIndex: 'Schedule',
                width: 90,
                xtype: 'templatecolumn',
                tpl: '<tpl for="Schedule">{Title}</tpl>'
            },{
                header: 'Location',
                width: 130,
                dataIndex: 'Location',
                xtype: 'templatecolumn',
                tpl: '<tpl for="Location">{Title}</tpl>'
            }]
        }
    }
});