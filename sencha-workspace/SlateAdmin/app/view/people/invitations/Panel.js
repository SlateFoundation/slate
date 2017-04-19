/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.invitations.Panel', {
    extend: 'Ext.Panel',
    xtype: 'people-invitationspanel',
    requires: [
        'Ext.grid.Panel',
        'Ext.selection.CheckboxModel'
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
            },{
                text: 'First Name',
                dataIndex: 'FirstName',
                flex: 1
            },{
                text: 'Last Name',
                flex: 1,
                dataIndex: 'LastName'
            },{
                text: 'Email Address',
                flex: 2,
                dataIndex: 'Email',
                emptyCellText: '<em>Add email to invite</em>'
            },{
                text: 'Account Status',
                flex: 2,
                dataIndex: 'Person',
                sortable: false,
                renderer: function(Person, metaData) {
                    var cls, text;

                    if (Person.get('Class') == 'Person' || Person.get('AccountLevel') == 'Contact') {
                        text = 'Name only, no login';
                        cls = 'person-nologin';
                    } else if(Person.get('Class') == 'Student') {
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
            }]
        }
    },{
        xtype: 'textareafield',
        fieldLabel: 'Message Template',
        labelAlign: 'top',
        value: [
            '{recipientFirst} {recipientLast},',
            '\n\n',
            'You have been invited to setup an account at the {schoolName} website -- **{websiteHostname}**.',
            'With this account you will be able to log in to your personal dashboard and access all of our connected systems with one click.'
        ].join(' ')
    },{
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