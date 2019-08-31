Ext.define('Emergence.cms.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'emergence-cms-toolbar',
    requires: [
        //      'Ext.tab.Panel',
        //      'Ext.layout.container.Border',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Date',
        'Ext.form.field.Time',
        'Emergence.ext.proxy.Records'
        //         'ExtUx.form.field.BoxSelect',
        //         'ExtUx.DateTimeField'
    ],

    padding: '8 0 8 8',

    items: [
        {
            reference: 'statusBtn',

            xtype: 'button',
            text: 'Set status',
            menu: {
                //                plain: true,
                items: [
                    '<div class="menu-title">Publish status</div>',
                    {
                        xtype: 'menucheckitem',
                        group: 'status',
                        text: 'Draft',
                        value: 'Draft',
                        glyph: 0xf044+'@FontAwesome', // fa-pencil-square-o
                        tooltip: 'This content is not complete and will only be accessible to the author via the "my drafts" page'
                    },
                    {
                        xtype: 'menucheckitem',
                        group: 'status',
                        text: 'Published',
                        value: 'Published',
                        glyph: 0xf046+'@FontAwesome', // fa-check-square-o
                        tooltip: 'Anyone online can find or view this content'

                    }
                ]
            }
        },
        {
            reference: 'visibilityBtn',

            xtype: 'button',
            text: 'Set visibility',
            menu: {
                //                plain: true,
                items: [
                    '<div class="menu-title">Visibility</div>',
                    {
                        xtype: 'menucheckitem',
                        group: 'visibility',
                        text: 'Login required',
                        value: 'Private',
                        glyph: 0xf0c0+'@FontAwesome', // fa-group
                        tooltip: 'Only users logged into the site can find or view this content'
                    },
                    {
                        xtype: 'menucheckitem',
                        group: 'visibility',
                        text: 'Public',
                        value: 'Public',
                        glyph: 0xf0ac+'@FontAwesome', // fa-globe
                        tooltip: 'Anyone online can find or view this content'
                    }
                ]
            }
        },
        '->',
        {
            reference: 'publishedTimeBtn',

            xtype: 'button',
            text: 'Publication time',
            glyph: 0xf017+'@FontAwesome', // fa-clock-o
            menu: {
                plain: true,
                width: 200,
                items: [
                    '<div class="menu-title">Publication time</div>',
                    {
                        xtype: 'menucheckitem',
                        text: 'Publish on save'
                    },
                    '-',
                    {
                        xtype: 'fieldcontainer',
                        layout: 'anchor',
                        defaults: { anchor: '100%' },
                        padding: '6 6 0',
                        items: [{
                            xtype: 'datefield'
                        }, {
                            xtype: 'timefield',
                            submitFormat: 'H:i'
                        }]
                    }
                ]
            }
        }
    ]
});