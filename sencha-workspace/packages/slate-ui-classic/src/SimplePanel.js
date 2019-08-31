Ext.define('Slate.ui.SimplePanel', {
    extend: 'Ext.container.Container',
    xtype: 'slate-simplepanel',
    requires: [
        'Ext.button.Button'
    ],


    config: {
        title: null,
        tools: []
    },

    componentCls: 'slate-simplepanel',

    items: [
        {
            xtype: 'container',
            componentCls: 'slate-simplepanel-header',
            layout: 'hbox',
            items: [
                {
                    flex: 1,
                    itemId: 'titleCmp',

                    xtype: 'component',
                    cls: 'slate-simplepanel-title'
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    itemId: 'toolsCt'
                }
            ]
        }
    ],


    // lifecycle methods
    initComponent: function() {
        var me = this,
            titleCmp, toolsCt;

        me.callParent(arguments);

        titleCmp = me.titleCmp = me.down('#titleCmp');
        toolsCt = me.toolsCt = me.down('#toolsCt');

        titleCmp.update(me.getTitle());
        toolsCt.add(me.getTools());
    },


    // config handlers
    applyTools: function(tools) {
        return Ext.Array.map(tools, function(tool) {
            tool = Ext.applyIf({
                ui: 'light'
            }, tool);

            return Ext.factory(tool, 'Ext.button.Button');
        });
    },

    updateTools: function(tools, oldTools) {
        var toolsCt = this.toolsCt;

        if (!toolsCt) {
            return;
        }
        if (oldTools) {
            toolsCt.removeAll();
        }

        toolsCt.add(tools);
    },

    updateTitle: function(title) {
        var me = this;

        if (me.rendered) {
            me.titleCmp.update(title);
        }
    }
});
