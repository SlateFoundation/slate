Ext.define('Jarvus.ace.Panel', {
    extend: 'Ext.Panel',
    xtype: 'acepanel',
    requires: [
        /* globals Jarvus */
        'Jarvus.ace.Loader',
        'Jarvus.ace.Util'
    ],


    config: {
        path: null,
        revision: null,
        line: null,

        mode: null,
        theme: 'ace/theme/tomorrow_night_bright',
        tabSize: 4,
        softTabs: true,
        showPrintMargin: false,
        showInvisibles: true,
        displayIndentGuides: true
    },


    // lifecycle methods
    afterRender: function() {
        var me = this;

        me.callParent(arguments);

        Jarvus.ace.Loader.withAce(function(ace) {
            var aceEditor = ace.edit(me.getTargetEl().dom),
                aceSession = aceEditor.getSession();

            me.aceEditor = aceEditor;

            // configure editor
            aceEditor.setTheme(me.getTheme());
            aceEditor.setShowPrintMargin(me.getShowPrintMargin());
            aceEditor.setShowInvisibles(me.getShowInvisibles());
            aceEditor.setDisplayIndentGuides(me.getDisplayIndentGuides());
            aceSession.setTabSize(me.getTabSize());
            aceSession.setUseSoftTabs(me.getSoftTabs());

            // listen for changes to mark dirty
            aceEditor.on('input', Ext.bind(me.onEditorInput, me));

            // fire editorready event
            me.fireEvent('editorready', me, aceEditor, aceSession);

            // attach resize
            me.on('resize', function() {
                aceEditor.resize();
            }, null, { buffer: 250 });
        });
    },


    // config handlers
    updatePath: function(path, oldPath) {
        var me = this;

        me.syncTitle();

        Jarvus.ace.Util.modeForPath(path).then(function(mode) {
            me.setMode(mode);
        });

        me.fireEvent('pathchange', me, path, oldPath);
    },

    updateRevision: function() {
        this.syncTitle();
    },

    applyLine: function(line) {
        return parseInt(line, 10) || null;
    },

    updateLine: function(line) {
        var me = this,
            highlightedLineRange = me.highlightedLineRange;

        me.withEditor(function(acePanel, aceEditor, aceSession) {
            if (highlightedLineRange) {
                aceSession.removeMarker(highlightedLineRange.id);
            }

            if (!line) {
                return;
            }

            me.highlightedLineRange = aceSession.highlightLines(line-1, line-1);

            if (me.contentLoaded) {
                aceEditor.scrollToLine(line, true, true);
            }
        });
    },

    updateMode: function(mode, oldMode) {
        var me = this,
            iconCls = Jarvus.ace.Util.iconForMode(mode);

        if (iconCls) {
            iconCls = 'x-fa fa-'+iconCls;
        }

        me.setIconCls(iconCls);

        me.withEditor(function (acePanel, aceEditor, aceSession) {
            aceSession.setMode(mode.mode);
        });

        me.fireEvent('modehange', me, mode, oldMode);
    },


    // event handlers
    onEditorInput: function() {
        var me = this,
            aceEditor = me.aceEditor,
            aceSession = aceEditor.getSession(),
            isClean = aceSession.getUndoManager().isClean();

        me.fireEvent('input', me, aceEditor, aceSession);

        if (me.dirty != !isClean) {
            me.dirty = !isClean;
            me.fireEvent('dirtychange', me, !isClean, aceEditor, aceSession);
        }
    },


    // public methods
    withEditor: function(onReady, scope) {
        var me = this,
            aceEditor = me.aceEditor;

        scope = scope || me;

        if (aceEditor) {
            Ext.callback(onReady, scope, [me, aceEditor, aceEditor.getSession()]);
        } else {
            me.on('editorready', onReady, scope, { single: true });
        }
    },

    loadContent: function(content, callback, scope) {
        var me = this,
            line = me.getLine();

        me.withEditor(function(acePanel, aceEditor, aceSession) {
            aceSession.setValue(content);
            me.dirty = false;
            me.contentLoaded = true;

            if (line) {
                aceEditor.scrollToLine(line, true, true);
            }

            Ext.callback(callback, scope || me);
        });
    },

    withContent: function(callback, scope) {
        var me = this;

        me.withEditor(function(acePanel, aceEditor, aceSession) {
            Ext.callback(callback, scope || me, [aceSession.getValue()]);
        });
    },

    isDirty: function() {
        return this.dirty;
    },

    markClean: function(callback, scope) {
        var me = this;

        me.withEditor(function(acePanel, aceEditor, aceSession) {
            aceSession.getUndoManager().markClean();
            me.dirty = false;
            me.fireEvent('dirtychange', me, false, aceEditor, aceSession);
            Ext.callback(callback, scope || me);
        });
    },

    syncTitle: function() {
        var me = this,
            path = me.getPath(),
            revision = me.getRevision(),
            title = path ? Jarvus.ace.Util.basename(path) : me.getInitialConfig('title');

        if (revision) {
            title += '@' + revision;
        }

        me.setTitle(title);
    }
});