Ext.define('EmergenceEditor.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'emergence-toolbar',
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox'
    ],


    items: [
        {
            action: 'save',
            text: 'Save',
            iconCls: 'x-fa fa-save', // tempting to change to fa-cloud-upload...
            tooltip: 'Save current editor (Ctrl+s)',
            disabled: true
        },
        {
            text: 'Search Site',
            iconCls: 'x-fa fa-search',
            tooltip: 'Search contents of all files in site',
            menu: {
                plain: true,
                listeners: {
                    show: function(menu) {
                        menu.down('textfield').focus();
                    }
                },
                items: {
                    xtype: 'form',
                    itemId: 'searchForm',
                    bodyPadding: 10,
                    width: 240,
                    defaults: {
                        anchor: '100%',
                        labelAlign: 'top'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'content',
                            fieldLabel: 'Search contents',
                            emptyText: '$myVar',
                            allowBlock: false
                        },
                        {
                            xtype: 'checkbox',
                            name: 'contentFormat',
                            boxLabel: 'Use regex',
                            inputValue: 'regex'
                        },
                        {
                            xtype: 'checkbox',
                            name: 'case',
                            boxLabel: 'Match case',
                            inputValue: 'match'
                        },
                        {
                            xtype: 'checkbox',
                            name: 'include',
                            boxLabel: 'Include parent',
                            inputValue: 'parent',
                            checked: true
                        },
                        {
                            xtype: 'textfield',
                            name: 'filename',
                            fieldLabel: 'Filename',
                            emptyText: '*.php'
                        },
                        {
                            xtype: 'textfield',
                            name: 'path',
                            fieldLabel: 'Search within',
                            emptyText: 'php-classes/Emergence/'
                        }
                    ],
                    buttons: [
                        {
                            xtype: 'button',
                            action: 'reset',
                            text: 'Reset',
                            ui: 'default-toolbar'
                        },
                        {
                            xtype: 'component',
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            action: 'search',
                            text: 'Search',
                            formBind: true
                        }
                    ]
                }
            }
        },
        '->',
        {
            action: 'open-book',
            text: 'Open Book',
            iconCls: 'x-fa fa-book',
            tooltip: 'Launch emergence book',
            href: 'https://emergenceplatform.gitbooks.io/emergence-book/',
            hrefTarget: '_blank'
        },
        {
            action: 'open-forums',
            text: 'Open Forums',
            iconCls: 'x-fa fa-comments-o',
            tooltip: 'Launch emergence forums',
            href: 'http://forum.emr.ge/',
            hrefTarget: '_blank'
        }
    ]
});