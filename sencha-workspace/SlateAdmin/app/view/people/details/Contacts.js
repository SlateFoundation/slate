/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Contacts', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-contacts',
    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Action',
        'Ext.grid.column.Template',
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.feature.Grouping',
        'Ext.form.field.ComboBox',
        'SlateAdmin.model.person.Relationship',
        'SlateAdmin.model.person.ContactPoint',
        'SlateAdmin.store.people.ContactPointTemplates',
        'SlateAdmin.widget.field.Person',
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
        xtype: 'grid',
        itemId: 'relationships',
        title: 'Related People',
        componentCls: 'slate-people-details-related',
        bodyBorder: '1 0',
        store: {
            model: 'SlateAdmin.model.person.Relationship',
            pageSize: false,
            remoteSort: true,
            autoSync: false
        },
        viewConfig: {
            loadMask: false,
            autoScroll: false,
            emptyText: 'No related people',
            getRowClass: function(record) {
                var cls = record.get('Class') == 'Emergence\\People\\GuardianRelationship' ? 'relationship-guardian' : 'relationship-nonguardian';
                
                if (record.phantom) {
                    cls += ' slate-grid-phantom';
                }
                
                if (record.dirty) {
                    cls += ' slate-grid-dirty';
                }
                
                if (!record.get('InverseRelationship')) {
                    cls += ' relationship-noinverse';
                }
                
                return cls;
            }
        },
        plugins: [
            {
                ptype: 'cellediting',
                clicksToEdit: 1
            }
        ],
        columns: {
            defaults: {
                menuDisabled: true
            },
            items: [
                {
                    itemId: 'person',
                    xtype: 'templatecolumn',
                    text: 'Name',
                    dataIndex: 'RelatedPerson',
                    tdCls: 'relationship-cell-person slate-grid-cell-primary',
                    flex: 1,
                    tpl: [
                        '<tpl if="RelatedPerson">',
                            '<tpl if="ID && RelatedPerson.ID"><a href="#{[this.getSearchRoute(values)]}"></tpl>',
                                '<tpl for="RelatedPerson">{FirstName} {MiddleName} {LastName}</tpl>',
                            '<tpl if="ID && RelatedPerson.ID"></a></tpl>',
                        '<tpl else>',
                            '<i class="fa fa-plus-circle"></i> Add new&hellip;',
                        '</tpl>',
                        {
                            getSearchRoute: function(relationship) {
                                var path = ['people', 'search', 'related-to-id:'+relationship.PersonID],
                                    relatedPerson = relationship.RelatedPerson,
                                    relatedUsername = relatedPerson.Username;
    
                                if (relatedUsername) {
                                    path.push(relatedUsername);
                                } else {
                                    path.push('?id='+relatedPerson.ID);
                                }
                                
                                path.push('contacts');
                                
                                return Ext.util.History.encodeRouteArray(path);
                            }
                        }
                    ],
                    editor: {
                        xtype: 'slate-personfield',
                        listeners: {
                            select: function(comboField) {
                                comboField.triggerBlur();
                            }
                        },
                        xhooks: {
                            setValue: function(value, doSelect) {
                                // transform value from object form back into string or number
                                if (Ext.isObject(value) && !value.isModel) {
                                    if (value.ID) {
                                        value = value.ID;
                                    } else {
                                        value = Ext.Array.clean([value.FirstName, value.MiddleName, value.LastName]).join(' ');
                                    }
                                }
                                
                                this.callParent([value || null, doSelect]);
                            }
                        }
                    }
                },
                {
                    itemId: 'relationship',
                    text: 'Relationship',
                    dataIndex: 'Label',
                    width: 120,
                    editor: {
                        xtype: 'combobox',
                        store: 'people.RelationshipTemplates',
                        allowBlank: false,
                        queryMode: 'local',
                        valueField: 'label',
                        displayField: 'label',
                        triggerAction: 'all',
                        autoSelect: false,
                        listeners: {
                            focus: function(comboField) {
                                comboField.expand();
                            },
                            select: function(comboField) {
                                comboField.triggerBlur();
                            }
                        }
                    }
                },
                {
                    itemId: 'inverse',
                    xtype: 'templatecolumn',
                    text: 'Inverse',
                    dataIndex: 'InverseRelationship.Label',
                    tdCls: 'relationship-cell-inverse',
                    width: 120,
                    tpl: [
                        '<tpl if="InverseRelationship">',
                            '{InverseRelationship.Label}',
    //                    '<tpl else>',
    //                        '<em>Unknown</em>',
                        '</tpl>'
                    ],
                    editor: {
                        xtype: 'textfield'
                    }
                },
                {
                    xtype: 'actioncolumn',
                    dataIndex: 'Class',
                    width: 54,
                    items: [
                        {
                            action: 'delete',
                            iconCls: 'relationship-delete glyph-danger',
                            glyph: 0xf056, // fa-minus-circle
                            tooltip: 'Delete relationship'
                        },
                        {
                            action: 'guardian',
                            iconCls: 'relationship-guardian glyph-shield',
                            glyph: 0xf132, // fa-shield
                            getTip: function(v, meta, record) {
                                return (v == 'Emergence\\People\\Relationship' ? 'Designate' : 'Undesignate') + ' guardian';
                            }
                        },
                        {
                            action: 'emergency',
                            iconCls: 'relationship-emergency glyph-emergency',
                            glyph: 0xf0f9, // fa-ambulance
                            getTip: function(v, meta, record) {
                                // TODO make this work
                                return (v == 'Emergence\\People\\Relationship' ? 'Designate' : 'Undesignate') + ' emergency contact';
                            }
                        }
                    ]
                }
            ]
        }
    },{
        xtype: 'grid',
        itemId: 'contactPoints',
        title: 'Contact Points',
        // columnLines: true,
        hideHeaders: true,
        componentCls: 'slate-people-details-contacts',
        disableSelection: true,
        store: {
            model: 'SlateAdmin.model.person.ContactPoint',
            groupField: 'Class',
            pageSize: false,
            remoteSort: true
        },
        viewConfig: {
            loadMask: false,
            autoScroll: false,
            getRowClass: function(record) {
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
                clicksToEdit: 1
            }
        ],
        features: [
            {
                ftype: 'grouping',
                collapsible: false,
                groupHeaderTpl: [
                    '<tpl for="this.getHeaderConfig(values)">',
                        '<span class="contact-type-header {typeCls}"><i class="fa fa-lg fa-fw {glyph}"></i> {title}</span>',
                    '</tpl>',
                    {
                        getHeaderConfig: function(values) {
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
                        focus: function(comboField) {
                            comboField.expand();
                        },
                        select: function(comboField) {
                            comboField.triggerBlur();
                        }
                    }
                },
                renderer: function(v, m, r) {
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
                getEditor: function(record) {
                    var me = this,
                        pointCls = record.get('Class'),
                        editorId = me.getItemId()+'-'+pointCls,
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
                width: 36,
                items: [
                    {
                        action: 'delete',
                        iconCls: 'contact-point-delete glyph-danger',
                        glyph: 0xf056, // fa-minus-circle
                        tooltip: 'Delete contact point'
                    },
                    {
                        action: 'primary',
                        iconCls: 'contact-point-primary glyph-star',
                        glyph: 0xf005, // fa-star
                        getTip: function(v, meta, record) {
                            return (v ? 'Unmark' : 'Mark') + ' as primary point for this type';
                        }
                    }
                ]
            }
        ]
    }]
});