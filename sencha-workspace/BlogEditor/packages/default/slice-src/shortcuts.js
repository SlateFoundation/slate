/*
 * This file defines the core framework "shortcuts". These are the modes and states of the
 * various components keyed by their xtype.
 * 
 * To add more shortcuts for an xtype to a derived theme, call Ext.theme.addShortcuts in
 * a theme-specific file and script tag that file in to that theme's 'theme.html' file.
 */
Ext.theme.addShortcuts({
    'tooltip': [{
        setup: function(component, ct) {
            component.render(Ext.getBody());
            component.showBy(ct);
            ct.setHeight(component.getHeight());
            ct.dom.appendChild(component.el.dom);
            component.el.setLeft(0);
            component.el.setTop(0);
        },
        config: {
            width: 100,
            height: 40,
            shadow: false,
            hide: function(){}
        }
    }],

    'widget.buttongroup': [
        {
            folder: 'btn-group',
            filename: 'btn-group-{ui}-framed-notitle',
            config: {
                columns: 2,
                defaults: {
                    scale: 'small'
                },
                items: [{
                    xtype:'splitbutton',
                    text: 'Menu Button',
                    iconCls: 'add16',
                    menu: [{text: 'Menu Item 1'}]
                },{
                    xtype:'splitbutton',
                    text: 'Cut',
                    iconCls: 'add16',
                    menu: [{text: 'Cut Menu Item'}]
                },{
                    text: 'Copy',
                    iconCls: 'add16'
                },{
                    text: 'Paste',
                    iconCls: 'add16',
                    menu: [{text: 'Paste Menu Item'}]
                },{
                    text: 'Format',
                    iconCls: 'add16'
                }]
            }
        },
        {
            folder: 'btn-group',
            filename: 'btn-group-{ui}-framed',
            config: {
                columns: 2,
                title: 'Manifest',
                defaults: {
                    scale: 'small'
                },
                items: [{
                    xtype:'splitbutton',
                    text: 'Menu Button',
                    iconCls: 'add16',
                    menu: [{text: 'Menu Item 1'}]
                },{
                    xtype:'splitbutton',
                    text: 'Cut',
                    iconCls: 'add16',
                    menu: [{text: 'Cut Menu Item'}]
                },{
                    text: 'Copy',
                    iconCls: 'add16'
                },{
                    text: 'Paste',
                    iconCls: 'add16',
                    menu: [{text: 'Paste Menu Item'}]
                },{
                    text: 'Format',
                    iconCls: 'add16'
                }]
            }
        }
    ],

    'widget.progressbar': [
        {
            xtype: 'widget.progressbar',
            folder: 'progress',
            filename: 'progress-{ui}',
            delegate: '.' + Ext.baseCSSPrefix + 'progress-bar',
            config: {
                width: 100,
                value: 1,
                animate: false
            }
        }
    ],

    'widget.tab': [
        {
            xtype: 'widget.tabpanel',
            filename: 'tabpanel-{ui}',
            stretch: 'bottom',
            config: {
                height: 200,
                width: 200,
                items: [{
                    title: 'Tab 1',
                    html: 'test'
                }, {
                    title: 'Tab 2',
                    html: 'test'
                }]
            }
        },
        {
            xtype: 'widget.tabpanel',
            filename: 'tab-bar-{ui}',
            folder: 'tab-bar',
            delegate: '.' + Ext.baseCSSPrefix + 'tab-bar',
            stretch: 'bottom',
            offsets: {
                bottom: 3,
                left: 1
            },
            config: {
                dock: 'top',
                items: [{
                    text: 'Tab 1'
                }],
                width: 300,
                listeners: {
                    afterRender: function(comp) {
                        comp.el.down('.' + Ext.baseCSSPrefix + 'tab-bar-body')
                            .setStyle("visibility", "hidden");
                        comp.el.down('.' + Ext.baseCSSPrefix + 'tab-bar-strip')
                            .setStyle("visibility", "hidden");
                        comp.el.down('.' + Ext.baseCSSPrefix + 'panel-body')
                            .setStyle("visibility", "hidden");
                    }
                }
            }
        },
        {
            filename: 'tab-{ui}-top',
            stretch: 'bottom',
            config: {
                text: 'Normal Top Tab',
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-top-active',
            stretch: 'bottom',
            config: {
                text: 'Active Top Tab',
                active: true,
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-top-over',
            over: true,
            stretch: 'bottom',
            config: {
                text: 'Over Top Tab',
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-top-disabled',
            stretch: 'bottom',
            config: {
                text: 'Disabled Top Tab',
                closable: false,
                disabled: true
            }
        },
        {
            filename: 'tab-{ui}-bottom',
            stretch: 'bottom',
            config: {
                text: 'Normal Bottom Tab',
                position: 'bottom',
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-bottom-active',
            stretch: 'bottom',
            config: {
                text: 'Active Bottom Tab',
                position: 'bottom',
                active: true,
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-bottom-over',
            over: true,
            stretch: 'bottom',
            config: {
                text: 'Over Bottom Tab',
                position: 'bottom',
                closable: false
            }
        },
        {
            filename: 'tab-{ui}-bottom-disabled',
            stretch: 'bottom',
            config: {
                text: 'Disabled Bottom Tab',
                position: 'bottom',
                closable: false,
                disabled: true
            }
        }
    ],

    'widget.window': [
        // Floating
        {
            filename: 'window-{ui}',
            title: 'Window',
            config: {
                closable: false,
                height: 200,
                width: 200,
                fbar: {
                    items: [{
                        text: 'Submit'
                    }]
                },
                tbar: {
                    items: [{
                        text: 'Button'
                    }]
                }
            }
        },
        // window w/header
        {
            stretch: 'bottom',
            filename: 'window-header-{ui}-top',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Top Window',
                closable: false,
                width: 200,
                html: '&#160;',
                headerPosition: 'top'
            }
        },
        {
            stretch: 'top',
            filename: 'window-header-{ui}-bottom',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Bottom Window',
                closable: false,
                width: 200,
                html: '&#160;',
                headerPosition: 'bottom'
            }
        },
        {
            stretch: 'right',
            filename: 'window-header-{ui}-left',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Left Window',
                closable: false,
                height: 200,
                width: 200,
                headerPosition: 'left'
            }
        },
        {
            stretch: 'left',
            filename: 'window-header-{ui}-right',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Right Window',
                closable: false,
                height: 200,
                width: 200,
                headerPosition: 'right'
            }
        },
        // collapsed window w/header
        {
            stretch: 'bottom',
            filename: 'window-header-{ui}-collapsed-top',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Top Collapsed',
                collapsed: true,
                closable: false,
                expandOnShow: false,
                width: 200,
                headerPosition: 'top'
            }
        },
        {
            stretch: 'top',
            filename: 'window-header-{ui}-collapsed-bottom',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Bottom Collapsed',
                collapsed: true,
                closable: false,
                expandOnShow: false,
                width: 200,
                headerPosition: 'bottom'
            }
        },
        {
            stretch: 'right',
            filename: 'window-header-{ui}-collapsed-left',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Left Collapsed',
                collapsed: true,
                closable: false,
                expandOnShow: false,
                height: 200,
                width: 200,
                headerPosition: 'left'
            }
        },
        {
            stretch: 'left',
            filename: 'window-header-{ui}-collapsed-right',
            folder: 'window-header',            
            delegate: '.' + Ext.baseCSSPrefix + 'window-header',
            config: {
                title: 'Right Collapsed',
                collapsed: true,
                closable: false,
                expandOnShow: false,
                height: 200,
                width: 200,
                headerPosition: 'right'
            }
        }
    ], // window

    'widget.panel': [
        {
            config: {
                width: 200,
                frame: true,
                html: 'Framed panel'
            }
        },
        // panel w/header
        {
            stretch: 'bottom',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-top',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Top',
                width: 200,
                html: '&#160;',
                headerPosition: 'top'
            }
        },
        {
            stretch: 'top',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-bottom',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Bottom',
                width: 200,
                html: '&#160;',
                headerPosition: 'bottom'
            }
        },
        {
            stretch: 'right',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-left',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Left',
                height: 200,
                width: 200,
                headerPosition: 'left'
            }
        },
        {
            stretch: 'left',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-right',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Right',
                height: 200,
                width: 200,
                headerPosition: 'right'
            }
        },
        // framed panel w/header
        {
            stretch: 'bottom',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-top',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Top Framed',
                width: 200,
                frame: true,
                html: '&#160;',
                headerPosition: 'top'
            }
        },
        {
            stretch: 'top',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-bottom',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Bottom Framed',
                width: 200,
                frame: true,
                html: '&#160;',
                headerPosition: 'bottom'
            }
        },
        {
            stretch: 'right',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-left',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Left Framed',
                height: 200,
                width: 200,
                frame: true,
                headerPosition: 'left'
            }
        },
        {
            stretch: 'left',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-right',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Right Framed',
                height: 200,
                width: 200,
                frame: true,
                headerPosition: 'right'
            }
        },
        // collapsed framed panel w/header
        {
            stretch: 'bottom',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-collapsed-top',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Top Framed/Collapsed',
                collapsed: true,
                width: 200,
                frame: true,
                headerPosition: 'top'
            }
        },
        {
            stretch: 'top',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-collapsed-bottom',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Bottom Framed/Collapsed',
                collapsed: true,
                width: 200,
                frame: true,
                headerPosition: 'bottom'
            }
        },
        {
            stretch: 'right',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-collapsed-left',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Left Framed/Collapsed',
                collapsed: true,
                height: 200,
                width: 200,
                frame: true,
                headerPosition: 'left'
            }
        },
        {
            stretch: 'left',
            folder: 'panel-header',
            filename: 'panel-header-{ui}-framed-collapsed-right',
            delegate: '.' + Ext.baseCSSPrefix + 'panel-header',
            config: {
                title: 'Right Framed/Collapsed',
                collapsed: true,
                height: 200,
                width: 200,
                frame: true,
                headerPosition: 'right'
            }
        }
    ],

    'widget.toolbar': [
        {
            filename: 'toolbar-{ui}',
            stretch: 'bottom',
            config: {
                width: 200,
                items: [{
                    text: 'test'
                }]
            }
        }
    ],

    'widget.button': [
        //small button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-small',
            config: {
                scale: 'small',
                text: 'Button'
            }
        },
        {
            filename: 'btn-{ui}-small-over',
            stretch: 'bottom',
            over: true,
            config: {
                scale: 'small',
                text: 'Button'
            }
        },
        {
            filename: 'btn-{ui}-small-focus',
            stretch: 'bottom',
            config: {
                scale: 'small',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-small-focus'
            }
        },
        {
            filename: 'btn-{ui}-small-pressed',
            stretch: 'bottom',
            config: {
                scale: 'small',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-small-pressed'
            }
        },
        {
            filename: 'btn-{ui}-small-disabled',
            stretch: 'bottom',
            config: {
                scale: 'small',
                text: 'Button',
                disabled: true
            }
        },

        //medium button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-medium',
            config: {
                scale: 'medium',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-medium-over',
            over: true,
            config: {
                scale: 'medium',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-medium-focus',
            config: {
                scale: 'medium',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-medium-focus'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-medium-pressed',
            config: {
                scale: 'medium',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-medium-pressed'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-medium-disabled',
            config: {
                scale: 'medium',
                text: 'Button',
                disabled: true
            }
        },

        //large button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-large',
            config: {
                scale: 'large',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-large-over',
            over: true,
            config: {
                scale: 'large',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-large-focus',
            config: {
                scale: 'large',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-large-focus'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-large-pressed',
            config: {
                scale: 'large',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-large-pressed'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-large-disabled',
            config: {
                scale: 'large',
                text: 'Button',
                disabled: true
            }
        },

        //small toolbar button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-small',
            config: {
                scale: 'small',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-small-over',
            over: true,
            config: {
                scale: 'small',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-small-focus',
            config: {
                scale: 'small',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-small-focus'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-small-pressed',
            config: {
                scale: 'small',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-small-pressed'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-small-disabled',
            config: {
                scale: 'small',
                ui: '{ui}-toolbar',
                text: 'Button',
                disabled: true
            }
        },

        //medium toolbar button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-medium',
            config: {
                scale: 'medium',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-medium-over',
            over: true,
            config: {
                scale: 'medium',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-medium-focus',
            config: {
                scale: 'medium',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-medium-focus'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-medium-pressed',
            config: {
                scale: 'medium',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-medium-pressed'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-medium-disabled',
            config: {
                scale: 'medium',
                ui: '{ui}-toolbar',
                text: 'Button',
                disabled: true
            }
        },

        //large toolbar button
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-large',
            config: {
                scale: 'large',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-large-over',
            over: true,
            config: {
                scale: 'large',
                ui: '{ui}-toolbar',
                text: 'Button'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-large-focus',
            config: {
                scale: 'large',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-large-focus'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-large-pressed',
            config: {
                scale: 'large',
                ui: '{ui}-toolbar',
                text: 'Button',
                cls: Ext.baseCSSPrefix + 'btn-{ui}-toolbar-large-pressed'
            }
        },
        {
            stretch: 'bottom',
            filename: 'btn-{ui}-toolbar-large-disabled',
            config: {
                scale: 'large',
                ui: '{ui}-toolbar',
                text: 'Button',
                disabled: true
            }
        }
    ]

});
