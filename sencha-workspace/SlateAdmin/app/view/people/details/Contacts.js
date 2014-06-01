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
//        'Ext.selection.CellModel',
//        'SlateAdmin.model.Person',
        'SlateAdmin.model.person.Relationship',
        'SlateAdmin.model.person.ContactPoint',
        'SlateAdmin.store.people.ContactPointTemplates',
        'SlateAdmin.widget.field.contact.Postal',
        'SlateAdmin.widget.grid.ContactPointCellEditor'
    ],


    title: 'Contacts',
    itemId: 'contacts',


    // panel config
    autoScroll: true,
    layout: 'anchor',
    defaults: {
        anchor: '100%',
        border: false,
        bodyBorder: false
    },

/*
    tbar: {
        layout: 'hbox',
//        itemId: 'relationshipAddBar',
        items: ['Add Guardian:',{
            xtype: 'combo',
            flex: 1,
            selectOnFocus: true,
            name: 'ContactName',
            autoSelect: false,
            emptyText: 'First and Last name',
            store: {
                model: 'SlateAdmin.model.Person'
            },
            mode: 'remote',
            displayField: 'FullName',
            valueField: 'ID',
            queryParam: 'q',
            lazyRender: 'true',
            allowBlank: false,
            blankText: 'Select or type the full name of the contact'
        },{
            xtype: 'combo',
            flex: 1,
            emptyText: 'Relationship',
            name: 'ContactRelationship',
            selectOnFocus: true,
            autoSelect: false,
            typeAhead: true,
            triggerAction: 'all',
            mode: 'local',
            store: ['Mother','Father','Guardian','Aunt','Uncle','Grandmother','Grandfather','Foster Mother','Foster Father','Stepmother','Stepfather','Sister','Brother','Unknown'],
            lazyRender: true,
            allowBlank: false,
            blankText: 'Select or Type the contact\'s relationship with this person'

        },{
            xtype: 'button',
            glyph: 0xf0c7, //fa-floppy-o
            text: 'Save',
            name: 'relationshipAdd',
            // icon: '/img/icons/fugue/card--plus.png'
        }]
    },
*/

    items: [{
        xtype: 'grid',
        itemId: 'relationships',
        title: 'Related People',
        collapsible: true,
        titleCollapse: true,
        componentCls: 'slate-people-details-related',
        bodyBorder: '1 0',
        store: {
            model: 'SlateAdmin.model.person.Relationship',
            pageSize: false,
            remoteSort: true,
            autoSync: true
        },
        viewConfig: {
            loadMask: false,
            autoScroll: false,
            emptyText: 'No related people',
            getRowClass: function(record) {
                var cls = record.get('Class') == 'Emergence\\People\\GuardianRelationship' ? 'relationship-guardian' : 'relationship-nonguardian';
                
                if (record.phantom) {
                    cls += ' relationship-phantom';
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
        columns: [
            {
                itemId: 'person',
                xtype: 'templatecolumn',
                text: 'Name',
                tdCls: 'relationship-cell-person',
                flex: 1,
                tpl: [
                    '<tpl for="RelatedPerson">',
                        '<a href="#{[this.getSearchRoute(parent, values)]}">{FirstName} {MiddleName} {LastName}</a>',
                    '</tpl>',
                    {
                        getSearchRoute: function(relationship, relatedPerson) {
                            var path = ['people', 'search', 'related-to-id:'+relationship.PersonID],
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
                    xtype: 'combobox',
                    store: {
                        model: 'SlateAdmin.model.Person'
                    },
                    name: 'RelatedPerson',
                    allowBlank: false,
                    queryMode: 'remote',
                    queryParam: 'q',
                    valueField: 'ID',
                    displayField: 'FullName',
                    autoSelect: false
                }
            },
            {
                itemId: 'relationship',
                text: 'Relationship',
                dataIndex: 'Relationship',
                tdCls: 'relationship-cell-label',
                editor: {
                    xtype: 'textfield',
                    name: 'Relationship',
                    allowBlank: false
                }
            },
            {
                itemId: 'inverse',
                xtype: 'templatecolumn',
                text: 'Inverse',
                tdCls: 'relationship-cell-inverse',
                tpl: [
                    '<tpl if="InverseRelationship">',
                        '{InverseRelationship.Relationship}',
//                    '<tpl else>',
//                        '<em>Unknown</em>',
                    '</tpl>'
                ]
            },
            {
                xtype: 'actioncolumn',
                width: 40,
                items: [
                    {
                        iconCls: 'relationship-delete glyph-danger',
                        glyph: 0xf056, // fa-minus-circle
                        tooltip: 'Delete Relationship',
                        action: 'delete'
                    },
                    {
                        iconCls: 'relationship-guardian glyph-shield',
                        glyph: 0xf132, // fa-shield
                        tooltip: 'Designate Guardian',
                        action: 'guardian'
                    }
                ]
            }
        ]
    },{
        xtype: 'grid',
        itemId: 'contactPoints',
        title: 'Contact Points',
        // columnLines: true,
        collapsible: true,
        titleCollapse: true,
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
                    cls += ' contact-phantom';
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
                tdCls: 'contact-cell-label',
                width: 145,
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
                width: 40,
                items: [
                    {
                        iconCls: 'contact-point-delete glyph-danger',
                        glyph: 0xf056, // fa-minus-circle
                        tooltip: 'Delete Contact Point',
                        action: 'delete'
                    },
                    {
                        iconCls: 'contact-point-primary glyph-star',
                        glyph: 0xf005, // fa-star
                        tooltip: 'Mark as Primary',
                        action: 'primary'
                    }
                ]
            }
        ]
    }]
});