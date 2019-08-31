Ext.define('SlateAdmin.view.people.invitations.Panel', {
    extend: 'Ext.Panel',
    xtype: 'people-invitationspanel',
    requires: [
        'Ext.form.field.ComboBox',
        'Ext.grid.Panel',
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.column.Check',
        'Ext.grid.column.Date',
        'Ext.selection.CheckboxModel',
        'Ext.data.ChainedStore'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        layout: {
            pack: 'end'
        },
        items: [{
            xtype: 'button',
            action: 'cancel',
            text: 'Cancel'
        },{
            xtype: 'button',
            action: 'send',
            text: 'Send emails now'
        }]
    }],
    items: [{
        xtype: 'grid',
        flex: 1,
        store: 'people.Invitations',
//      selType: 'checkboxmodel',
        columnLines: true,
//      multiSelect: true,
        viewConfig: {
            markDirty: false,
            getRowClass: function(person) {
                return person.get('Email') ? '' : 'x-item-disabled';
            }
        },
        plugins: {
            ptype: 'cellediting',
            clicksToEdit: 1
        },
        columns: {
            defaults: {
                menuDisabled: true
            },
            items: [{
                xtype: 'checkcolumn',
                width: 35,
                dataIndex: 'selected',
                resizable: false,
                sortable: false,
                text: '<img class="x-grid-checkcolumn" src="'+Ext.BLANK_IMAGE_URL+'">'
            }, {
                text: 'First Name',
                dataIndex: 'FirstName',
                width: 100
            }, {
                text: 'Last Name',
                dataIndex: 'LastName',
                width: 100
            }, {
                text: 'Email Address',
                flex: 2,
                dataIndex: 'Email',
                emptyCellText: '<em>Add email to invite</em>'
            }, {
                text: 'Account Status',
                width: 150,
                dataIndex: 'Person',
                sortable: false,
                renderer: function(Person, metaData) {
                    var cls, text;

                    if (Person.get('Class') == 'Emergence\\People\\Person' || Person.get('AccountLevel') == 'Contact') {
                        text = 'Name only, no login';
                        cls = 'person-nologin';
                    } else if (Person.get('Class') == 'Slate\\People\\Student') {
                        if (Person.get('Username')) {
                            text = 'Student';
                            cls = 'student';
                        } else {
                            text = 'Student, no login';
                            cls = 'student-nologin';
                        }
                    } else {
                        text = Person.get('AccountLevel') || 'Contact';
                        cls = text.toLowerCase();

                        if (!Person.get('Username')) {
                            text += ', no login';
                            cls += '-nologin';
                        }
                    }

                    metaData.tdCls = cls;
                    return text;
                }
            }, {
                text: 'Invite As',
                dataIndex: 'UserClass',
                width: 100,
                editor: {
                    xtype: 'combo',
                    valueField: 'name',
                    displayField: 'label',
                    store: {
                        type: 'chained',
                        source: 'people.Classes',
                        filters: [{
                            filterFn: function(item) {
                                return Ext.Array.contains(item.get('interfaces'), 'Emergence\\People\\IUser');
                            }
                        }]
                    },
                    matchFieldWidth: false,
                    queryMode: 'local',
                    editable: false
                },
                renderer: function(userClass, metaData) {
                    return metaData.column.getEditor().getStore().getById(userClass).get('label');
                }
            }, {
                xtype: 'datecolumn',
                text: 'Invite Sent',
                dataIndex: 'Invited',
                emptyCellText: 'Never'
            }]
        }
    }, {
        xtype: 'textareafield',
        fieldLabel: 'Message Template',
        labelAlign: 'top',
        value: [
            '{recipientFirst} {recipientLast},',
            '\n\n',
            'You have been invited to setup an account at the {schoolName} website -- **{websiteHostname}**.',
            'With this account you will be able to log in to your personal dashboard and access all of our connected systems with one click.'
        ].join(' ')
    }, {
        xtype: 'panel',
        itemId: 'emailPreview',
        height: 200,
        autoScroll: true,
        bodyPadding: 5,
        styleHtmlContent: true,
        title: 'Preview of email for selected person:',
        tpl: [
            '<strong>From:</strong> <a href="mailto:{from:htmlEncode}">{from:htmlEncode}</a>',
            '<br><strong>To:</strong> <a href="mailto:{to:htmlEncode}">{to:htmlEncode}</a>',
            '<br><strong>Subject:</strong> {subject:htmlEncode}',
            '{body}'
        ]
    }]
});