/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Courses', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-courses',
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'Slate.model.course.SectionParticipant',
        'Slate.proxy.courses.SectionParticipants'
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
            emptyText: 'No courses for selected term',
            getRowClass: function(record){
                return record.get('isInactive') === true ? 'participant-inactive' : '';
            }
        },
        plugins: {
            ptype: 'cellediting',
            clicksToEdit: 1
        },
        store: {
            model: 'Slate.model.course.SectionParticipant',
            proxy: {
                type: 'slate-courses-participants',
                include: ['Section.Location', 'Section.Schedule'],
                startParam: false,
                limitParam: false,
                pageParam: false
            },
            sorters: [{
                property: 'isInactive',
                direction: 'ASC'
            }],
            autoSync: true
        },
        columns: {
            defaults: {
                menuDisabled: true
            },
            items: [{
                header: 'Section',
                dataIndex: 'Code',
                width: 90,
                xtype: 'templatecolumn',
                tpl: '<tpl for="Section"><a href="#course-sections/lookup/{Code}" alt={Title}>{Code}</a></tpl>'
            },{
                width: 100,

                xtype: 'datecolumn',
                header: 'Start',
                dataIndex: 'StartDate',
                format:'Y-m-d',
                editor: 'datefield'
            },{
                width: 100,

                xtype: 'datecolumn',
                header: 'End',
                dataIndex: 'EndDate',
                format:'Y-m-d',
                editor: 'datefield'
            },{
                header: 'Schedule',
                dataIndex: 'Schedule',
                width: 90,
                xtype: 'templatecolumn',
                tpl: '<tpl for="Section"><tpl for="Schedule">{Title}</tpl></tpl>'
            },{
                header: 'Location',
                width: 130,
                dataIndex: 'Location',
                xtype: 'templatecolumn',
                tpl: '<tpl for="Section"><tpl for="Location">{Title}</tpl></tpl>'
            }]
        }
    }
});