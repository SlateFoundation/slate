Ext.define('Jarvus.ace.DiffPanel', {
    extend: 'Ext.Panel',
    xtype: 'acediffpanel',
    requires: [
        /* globals Jarvus */
        'Jarvus.ace.Loader',
        'Jarvus.ace.Util'
    ],


    config: {
        leftPath: null,
        leftRevision: null,
        leftMode: null,

        rightPath: null,
        rightRevision: null,
        rightMode: null,

        theme: 'ace/theme/tomorrow_night_bright',
        tabSize: 4,
        softTabs: true,
        showPrintMargin: false,
        showInvisibles: true,
        displayIndentGuides: true
    },

    componentCls: 'acediffpanel',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    items: [
        {
            flex: 1,
            itemId: 'editor-left',

            xtype: 'component',
        },
        {
            width: 100,
            itemId: 'gutter',

            xtype: 'component',
            cls: 'gutter'
        },
        {
            flex: 1,
            itemId: 'editor-right',

            xtype: 'component'
        }
    ],


    // lifecycle methods
    afterRender: function() {
        var me = this;

        me.callParent(arguments);

        // TODO: use Jarvus.ace.Panel instances with managed themes
        Jarvus.ace.Loader.withDiff(function(AceDiff) {
            var differ = new AceDiff({
                theme: me.getTheme(),
                left: {
                    el: me.getComponent('editor-left').el.dom,
                    editable: false,
                    copyLinkEnabled: false
                },
                right: {
                    el: me.getComponent('editor-right').el.dom,
                    editable: false,
                    copyLinkEnabled: false
                },
                gutter: {
                    el: me.getComponent('gutter').el.dom
                }
            });

            me.differ = differ;

            // fire differready event
            me.fireEvent('differready', me, differ);

            // attach resize
            me.on('resize', function() {
                var editors = differ.editors;

                editors.left.ace.resize();
                editors.right.ace.resize();
            }, null, { buffer: 250 });
        });
    },


    // config handlers
    updateLeftPath: function(path, oldPath) {
        var me = this,
            mode = me.getLeftMode();

        me.syncTitle();

        me.fireEvent('leftpathchange', me, path, oldPath);

        // set mode from path
        if (path && !mode) {
            Jarvus.ace.Util.modeForPath(path).then(function(resolvedMode) {
                me.setLeftMode('ace/mode/'+resolvedMode.name);
            });
        }
    },

    updateLeftRevision: function(revision, oldRevision) {
        var me = this;

        me.syncTitle();

        me.fireEvent('leftrevisionchange', me, revision, oldRevision);
    },

    updateLeftMode: function(mode, oldMode) {
        var me = this;

        me.withDiffer(function(diffPanel, differ) {
            differ.editors.left.ace.getSession().setMode(mode)
        });

        me.fireEvent('leftmodechange', me, mode, oldMode);
    },

    updateRightPath: function(path, oldPath) {
        var me = this,
            mode = me.getRightMode();

        me.syncTitle();

        me.fireEvent('rightpathchange', me, path, oldPath);

        // set mode from path
        if (path && !mode) {
            Jarvus.ace.Util.modeForPath(path).then(function(resolvedMode) {
                me.setRightMode('ace/mode/'+resolvedMode.name);
            });
        }
    },

    updateRightRevision: function(revision, oldRevision) {
        var me = this;

        me.syncTitle();

        me.fireEvent('rightrevisionchange', me, revision, oldRevision);
    },

    updateRightMode: function(mode, oldMode) {
        var me = this;

        me.withDiffer(function(diffPanel, differ) {
            differ.editors.right.ace.getSession().setMode(mode)
        });

        me.fireEvent('rightmodechange', me, mode, oldMode);
    },


    // local methods
    withDiffer: function(onReady, scope) {
        var me = this,
            differ = me.differ;

        scope = scope || me;

        if (differ) {
            Ext.callback(onReady, scope, [me, differ]);
        } else {
            me.on('differready', onReady, scope, { single: true });
        }
    },

    loadContent: function(leftContent, rightContent, callback, scope) {
        var me = this;

        me.withDiffer(function(diffPanel, differ) {
            var editors = differ.editors;

            editors.left.ace.setValue(leftContent, -1);
            editors.right.ace.setValue(rightContent, -1);

            Ext.callback(callback, scope || me);
        });
    },

    syncTitle: function() {
        var me = this;

        me.setTitle(Ext.String.format(
            '{0} ({1}&rarr;{2})',
            Jarvus.ace.Util.basename(me.getRightPath()),
            me.getLeftRevision(),
            me.getRightRevision()
        ));
    }
});