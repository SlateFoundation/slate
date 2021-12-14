Ext.define('SlateAdmin.view.people.details.Contacts', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-contacts',
    requires: [
        'Slate.ui.PanelLegend',
        'SlateAdmin.view.people.details.contacts.List',

        'Ext.grid.Panel',
        'Ext.grid.column.Action',
        'Ext.grid.column.Template',
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.feature.Grouping',
        'SlateAdmin.model.person.ContactPoint',
        'SlateAdmin.store.people.ContactPointTemplates',
        'SlateAdmin.widget.field.contact.Postal',
        'SlateAdmin.widget.grid.ContactPointCellEditor'
    ],


    title: 'Contacts',
    glyph: 0xf095,
    itemId: 'contacts',


    // panel config
    autoScroll: true,
    layout: 'anchor',
    defaults: {
        anchor: '100%',
        border: false,
        bodyBorder: false
    },

    items: [{
        xtype: 'panel',
        title: 'Relationships',
        dockedItems: [{
            dock: 'top',
            xtype: 'slate-panellegend',
            data: [{
                icon: 'shield',
                iconCls: 'glyph-shield',
                label: 'Guardian',
            }],
        }],
        items: [{
            xtype: 'people-details-contacts-list',
        }],
    }, {
        xtype: 'grid',
        itemId: 'contactPoints',
        title: 'Contact Points',
        hideHeaders: true,
        componentCls: 'slate-people-details-contacts',
        cls: 'has-small-group-headers',
        disableSelection: true,
        store: {
            model: 'SlateAdmin.model.person.ContactPoint',
            groupField: 'Class',
            pageSize: false,
            sorters: [
                {
                    property: 'Class',
                    direction: 'ASC'
                },
                {
                    sorterFn: function (r1, r2) {
                        r1 = r1.phantom;
                        r2 = r2.phantom;

                        if (r1 == r2) {
                            return 0;
                        }

                        return r1 ? 1 : -1;
                    }
                },
                {
                    property: 'ID',
                    direction: 'ASC'
                }
            ]
        },
        dockedItems: [{
            dock: 'top',
            xtype: 'slate-panellegend',
            data: [{
                icon: 'star',
                iconCls: 'glyph-star',
                label: 'Primary',
            }],
        }],
        viewConfig: {
            loadMask: false,
            autoScroll: false,
            getRowClass: function (record) {
                var cls = '';

                switch (record.get('Class')) {
                    case 'Emergence\\People\\ContactPoint\\Email':
                        cls = 'contact-email';
                        break;
                    case 'Emergence\\People\\ContactPoint\\Link':
                        cls = 'contact-link';
                        break;
                    case 'Emergence\\People\\ContactPoint\\Network':
                        cls = 'contact-network';
                        break;
                    case 'Emergence\\People\\ContactPoint\\Phone':
                        cls = 'contact-phone ';
                        break;
                    case 'Emergence\\People\\ContactPoint\\Postal':
                        cls = 'contact-postal';
                        break;
                    default:
                        cls = 'contact-unknown';
                        break;
                }

                if (record.phantom) {
                    cls += ' slate-grid-phantom';
                }

                if (record.dirty) {
                    cls += ' slate-grid-dirty';
                }

                if (record.get('Primary')) {
                    cls += ' contact-primary';
                }

                return cls;
            }
        },
        plugins: [
            {
                ptype: 'cellediting',
                pluginId: 'cellediting',
                clicksToEdit: 1
            }
        ],
        features: [
            {
                ftype: 'grouping',
                collapsible: false,
                groupHeaderTpl: [
                    '<tpl for="this.getHeaderConfig(values)">',
                    '<span class="contact-type-header {typeCls}"><i class="fa fa-fw {glyph}"></i> {title}</span>',
                    '</tpl>',
                    {
                        getHeaderConfig: function (values) {
                            var title, typeCls, glyph;

                            switch (values.groupValue) {
                                case 'Emergence\\People\\ContactPoint\\Email':
                                    title = 'Email Addresses';
                                    typeCls = 'contact-email';
                                    glyph = 'fa-envelope-o';
                                    break;
                                case 'Emergence\\People\\ContactPoint\\Link':
                                    title = 'Website Links';
                                    typeCls = 'contact-link';
                                    glyph = 'fa-link';
                                    break;
                                case 'Emergence\\People\\ContactPoint\\Network':
                                    title = 'Online Networks';
                                    typeCls = 'contact-network';
                                    glyph = 'fa-globe';
                                    break;
                                case 'Emergence\\People\\ContactPoint\\Phone':
                                    title = 'Phone Numbers';
                                    typeCls = 'contact-phone';
                                    glyph = 'fa-phone';
                                    break;
                                case 'Emergence\\People\\ContactPoint\\Postal':
                                    title = 'Postal Addresses';
                                    typeCls = 'contact-postal';
                                    glyph = 'fa-home';
                                    break;
                                default:
                                    return null;
                            }

                            return {
                                title: title,
                                typeCls: typeCls,
                                glyph: glyph
                            };
                        }
                    }
                ]
            }
        ],
        columns: [
            {
                itemId: 'label',
                text: 'Label',
                dataIndex: 'Label',
                width: 145,
                tdCls: 'slate-grid-cell-primary',
                editor: {
                    xtype: 'combobox',
                    store: {
                        type: 'contactpointtemplates'
                    },
                    allowBlank: false,
                    queryMode: 'local',
                    valueField: 'label',
                    displayField: 'label',
                    triggerAction: 'all',
                    autoSelect: false,
                    listeners: {
                        focus: function (comboField) {
                            comboField.expand();
                        },
                        select: function (comboField) {
                            comboField.up('editor').completeEdit();
                        }
                    }
                },
                renderer: function (v, m, r) {
                    return v || '<i class="fa fa-plus-circle"></i> Add new&hellip;';
                }
            },
            {
                itemId: 'value',
                text: 'Value',
                dataIndex: 'String',
                tdCls: 'contact-cell-value',
                flex: 1,
                renderer: function (v) {
                    return v ? v.replace(/\n/g, ', ') : '';
                },
                getEditor: function (record) {
                    var me = this,
                        pointCls = record.get('Class'),
                        editorId = me.getItemId() + '-' + pointCls,
                        editors = me.up('grid').findPlugin('cellediting').editors,
                        editor = editors.getByKey(editorId),
                        field;

                    if (editor) {
                        return editor;
                    }

                    switch (pointCls) {
                        //                        case 'Emergence\\People\\ContactPoint\\Email':
                        //                            return 'contact-email';
                        //                        case 'Emergence\\People\\ContactPoint\\Link':
                        //                            return 'contact-link';
                        //                        case 'Emergence\\People\\ContactPoint\\Network':
                        //                            return 'contact-network';
                        //                        case 'Emergence\\People\\ContactPoint\\Phone':
                        //                            return 'contact-phone ';
                        case 'Emergence\\People\\ContactPoint\\Postal':
                            field = Ext.create('SlateAdmin.widget.field.contact.Postal');
                            break;
                        default:
                            field = Ext.create('Ext.form.field.Text');
                            break;
                    }

                    editor = Ext.create('SlateAdmin.widget.grid.ContactPointCellEditor', {
                        floating: true,
                        editorId: editorId,
                        field: field
                    });

                    editors.add(editor);

                    return editor;
                }
            },
            {
                xtype: 'actioncolumn',
                dataIndex: 'Primary',
                align: 'end',
                items: [
                    {
                        action: 'delete',
                        iconCls: 'contact-point-delete glyph-danger',
                        glyph: 0xf056, // fa-minus-circle
                        tooltip: 'Delete contact point'
                    },
                    {
                        action: 'primary',
                        glyph: 0xf005, // fa-star
                        getClass: function (v) {
                            return [
                                'glyph-star',
                                v ? '' : 'glyph-inactive',
                            ].join(' ');
                        },
                        getTip: function (v) {
                            return (v ? 'Unmark' : 'Mark') + ' as primary point for this type';
                        },
                    }
                ]
            }
        ]
    }]
});
