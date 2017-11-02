Ext.define('SlateAdmin.view.courses.sections.details.Participants', function() {
    var participantRoles = ['Teacher', 'Assistant', 'Student', 'Observer'];

    return {
        extend: 'SlateAdmin.view.courses.sections.details.AbstractDetails',
        xtype: 'courses-sections-details-participants',
        requires: [
            'Ext.grid.Panel',
            'Ext.grid.feature.Grouping',
            'Ext.grid.column.Action',
            'Ext.grid.column.Template',
            'Ext.grid.column.Date',
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
                store: participantRoles,
                triggerAction: 'all',
                editable: false,
                autoSelect: true,
                width: 100
            },
            {
                flex: 1,

                xtype: 'slate-personfield',
                itemId: 'personField'
            },{
                xtype: 'button',
                glyph: 0xf055, // fa-plus-circle
                cls: 'glyph-success',
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
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1
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
                grouper: {
                    property: 'Role',
                    sortProperty: 'Role',
                    transform: function(role) {
                        return participantRoles.indexOf(role);
                    }
                },
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
                },
                sorters: [{
                    property: 'PersonLastName',
                    direction: 'ASC'
                },{
                    property: 'PersonFirstName',
                    direction: 'ASC'
                }]
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
                    flex: 1,

                    header: 'Last Name',
                    dataIndex: 'PersonLastName'
                },{
                    flex: 1,

                    xtype: 'templatecolumn',
                    header: 'Username',
                    dataIndex: 'PersonUsername',
                    tpl: '<a href="#people/lookup/<tpl if="PersonUsername">{PersonUsername}<tpl else>?id={PersonID}</tpl>"><tpl if="PersonUsername">{PersonUsername}<tpl else>#{PersonID}</tpl></a>'
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
                    width: 100,

                    header: 'Cohort',
                    dataIndex: 'Cohort',
                    itemId: 'cohortField',
                    editor: {
                        xtype: 'combo',
                        itemId: 'cohortField',
                        displayField: 'Cohort',
                        valueField: 'Cohort',
                        forceSelection: false,
                        queryMode: 'local',
                        store: 'courses.SectionCohorts'
                    }
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
    }
});