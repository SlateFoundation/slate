/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.sections.details.Participants', {
    extend: 'SlateAdmin.view.courses.sections.details.AbstractDetails',
    xtype: 'courses-sections-details-participants',
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.feature.Grouping',
        'Ext.grid.column.Action',
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'SlateAdmin.proxy.API',
        'SlateAdmin.widget.field.Person',
        'SlateAdmin.model.course.SectionParticipant'
    ],


    title: 'Participants',
    glyph: 0xf073,
    itemId: 'participants',

    tbar: [
        {
            xtype: 'combobox',
            itemId: 'roleField',
            emptyText: 'Role',
            value: 'Student',
            store: ['Observer','Student','Assistant','Teacher'],
            triggerAction: 'all',
            editable: false,
            autoSelect: true,
            width: 100
        },
        {
            flex: 1,

            xtype: 'slate-personfield',
            itemId: 'personField',
            forceSelection: true
        },{
            xtype: 'button',
            text: 'Add',
            action: 'add-participant'
        }
    ],

    // panel config
    layout: 'fit',
    items: {
        xtype: 'grid',
        border: false,
        viewConfig: {
            emptyText: 'No participants enrolled'
        },
        features: [{
            ftype: 'grouping',
            collapsible: false,
            groupHeaderTpl: [
                '{groupValue} <tpl if="children.length &gt; 1"><small class="muted">({children.length})</small></tpl>'
            ]
        }],
        store: {
            model: 'SlateAdmin.model.course.SectionParticipant',
            groupField: 'Role',
            remoteSort: true,
            proxy: {
                type: 'slateapi',
                startParam: false,
                limitParam: false,
                pageParam: false,
                extraParams: {
                    include: 'Person'
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
                flex: 1,

                header: 'First Name',
                dataIndex: 'PersonFirstName'
            },{
                header: 'Last Name',
                dataIndex: 'PersonLastName'
            },{
                flex: 1,

                xtype: 'templatecolumn',
                header: 'Username',
                dataIndex: 'PersonUsername',
                tpl: '<a href="#people/lookup/<tpl if="PersonUsername">{PersonUsername}<tpl else>?id={PersonID}</tpl>"><tpl if="PersonUsername">{PersonUsername}<tpl else>#{PersonID}</tpl></a>'
            },{
                xtype: 'actioncolumn',
                width: 40,
                items: [{
                    action: 'delete',
                    iconCls: 'participant-delete glyph-danger',
                    glyph: 0xf056, // fa-minus-circle
                    tooltip: 'Remove participant'
                }]
            }]
        }
    }
});