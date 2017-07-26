Ext.define('SlateAdmin.view.settings.site.Manager', {
    extend: 'Ext.form.Panel',
    xtype: 'site-manager',
    requires: [
        'SlateAdmin.view.settings.site.ColorsList',
        'SlateAdmin.view.settings.site.RestoreButton'
    ],

    scrollable: true,

    items: [
        {
            region: 'center',
            scrollable: 'y',
            items: [
                {
                    title: 'School Info',
                    bodyPadding: 10,
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'right',
                        labelSeparator: '',
                        labelWidth: 90,
                        width: 400
                    },
                    items: [
                        {
                            fieldLabel: 'Name',
                            value: 'Science Leadership Academy'
                        },
                        {
                            fieldLabel: 'Abbreviation',
                            value: 'SLA'
                        },
                        {
                            xtype: 'textarea',
                            fieldLabel: 'Slogan',
                            value: 'Learn · Create · Lead'
                        }
                    ]
                },
                {
                    layout: 'hbox',
                    defaults: {
                        flex: 1,
                        layout: 'auto',
                        bodyPadding: 10,

                        defaults: {
                            xtype: 'textfield',
                            labelAlign: 'right',
                            labelSeparator: '',
                            labelWidth: 90
                        }
                    },
                    items: [
                        {
                            width: 240,
                            flex: 0,
                            xtype: 'site-colorslist',
                            title: 'Theme Colors',
                            restoreLabel: 'theme colors',
                            colors: {
                                'Base':       '#31a0da',
                                'Accent':     '#0cacff',
                                'Background': '#f5f5f5',
                                'Text':       '#333',
                                'Heading':    '#333',
                                'Link':       '#31a0da',
                                'Border':     '#d4d4d4',
                                'Button':     '#d4dce1',
                                'Destructive':'ff332e',
                            }
                        },
                        {
                            width: 270,
                            flex: 0,
                            bodyPadding: '10 40 10 10',
                            xtype: 'site-colorslist',
                            title: 'Special Colors',
                            restoreLabel: 'special colors',
                            colors: {
                                'Info':       '#5bc0de',
                                'Success':    '#23ad23',
                                'Alert':      '#f09b24',
                                'Danger':     '#d43734',
                                'Muted':      '#949494',
                                'Shaded':     '#326a87'
                            }
                        },
                        {
                            minWidth: 240,
                            title: 'Typography',
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'site-restorebutton',
                                            settingsLabel: '<strong>font settings</strong>'
                                        }
                                    ]
                                }
                            ],
                            items: [
                                {
                                    xtype: 'container',
                                    defaults: {
                                        labelAlign: 'right',
                                        labelSeparator: '',
                                        labelWidth: 90,
                                        xtype: 'textfield'
                                    },
                                    items: [
                                        {
                                            width: '100%',
                                            fieldLabel: 'Body Font',
                                            value: 'Lato, \'Lucida Grande\', Verdana, \'Helvetica Neue\', sans-serif'
                                        },
                                        {
                                            width: '100%',
                                            fieldLabel: 'Heading Font',
                                            value: 'Sanchez, Lato, Rockwell, \'Rockwell Std\', Georgia, serif'
                                        },
                                        {
                                            width: '100%',
                                            fieldLabel: 'Code Font',
                                            value: 'Consolas, monospace'
                                        },
                                        {
                                            fieldLabel: 'Font Weight',
                                            value: '400'
                                        },
                                        {
                                            fieldLabel: 'Font Size',
                                            value: '16px'
                                        },
                                        {
                                            fieldLabel: 'Line Height',
                                            value: '1.5'
                                        },
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        },
        {
            xtype: 'toolbar',
            border: '1 0',
            margin: '10 0 0',
            padding: '5 10',
            items: [

                {
                    text: 'Save Changes',
                    action: 'save',
                    // disabled: true,
                    cls: 'glyph-success',
                    glyph: 0xf058 // fa-check-circle
                },
                '->',
                {
                    text: 'Discard Changes',
                    action: 'reset',
                    // disabled: true,
                    cls: 'glyph-danger',
                    glyph: 0xf00d  // fa-times
                },
            ]
        }
    ]
});