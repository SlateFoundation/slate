/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'emergence-cms-toolbar',
    requires:[
//      'Ext.tab.Panel',
//      'Ext.layout.container.Border',
        'Ext.form.field.Checkbox',
        'ExtUx.form.field.BoxSelect',
        'ExtUx.DateTimeField'
    ],


    items:[{
        text: 'Tags',
        xtype: 'button',
        cls: 'x-toolbar-left-standButton',
        iconCls: 'icon-content-tags',
        itemId: 'tagsBtn',
        menu: {
            plain: true,
            items: [{
                xtype: 'comboboxselect',
                itemId: 'tagsField',
                allowBlank: true,
                tooltip: 'Press enter after each tag',
                displayField: 'Title',
                valueField: 'ID',
                triggerAction: 'all',
                delimiter: ',',
                queryMode: 'local',
                forceSelection: false,
                createNewOnEnter: true,
                createNewOnBlur: true,
                width: 200,
                minChars: 2,
                stacked: true,
                filterPickList: true,
                typeAhead: true,
                store: {
                    autoLoad: true,
                    fields: [
                        {name: 'ID', type: 'int', useNull: true},
                        'Title'
                    ],
                    proxy: {
                        type: 'ajax',
                        url: '/tags/json',
                        reader: {
                            type: 'json',
                            root: 'data'
                        }
                    }
                }
            }]
        }

    },{
        xtype: 'button',
        text: 'Status',
        cls: 'x-toolbar-left-standButton',
        itemId: 'statusBtn',
        menu: {
            plain: true,
            items:[{
                text: 'Draft',
                iconCls: 'icon-status-Draft'
            },{
                text: 'Published',
                iconCls: 'icon-status-Published'

            }]
        }

    },{
        xtype: 'button',
        text: 'Visibility',
        cls: 'x-toolbar-left-standButton',
        itemId: 'visibilityBtn',
        menu: {
            plain: true,
            items: [{
                text: 'Private'
            },{
                text: 'Public'
            }]
        }
    },{
        xtype: 'button',
        cls: 'x-toolbar-left-standButton',
        iconCls: 'icon-content-published',
        text: 'Published on',
        itemId: 'publishBtn',
        menu: {
            plain: true,
            width: 200,
            items: [{
                xtype: 'checkbox',
                boxLabel: 'Publish Immediately',
                itemId: 'publish'
            },{
                xtype: 'datetimefield',
                //width: 50,
                //anchor: '100%',
                value: new Date(),
                itemId: 'publishDate'
            }]
        }
    },'->',
    {
        xtype: 'button',
        text: 'View',
        itemId: 'viewBtn'

    },'-',{
        xtype: 'button',
        itemId: 'saveBtn',
        text: 'Save'

    }]
});