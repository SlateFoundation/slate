/* jslint browser: true, undef: true *//* global Ext*/
Ext.define('Emergence.cms.view.composer.Markdown', {
    extend: 'Emergence.cms.view.composer.Abstract',
    alias: 'emergence-cms-composer.markdown',
    cls: 'markdown-composer',
    requires: [
        'Ext.form.field.TextArea'
    ],

    inheritableStatics: {
        contentItemClass: 'Emergence\\CMS\\Item\\Markdown',
        buttonCfg: {
            text: 'Markdown Text',
            glyph: 0xf0f6+'@FontAwesome', // fa-file-text-o
            cls: 'icon-w-20',
            tooltip: 'A block of text formatted with Markdown'
        }
    },

    title: 'Markdown Text',
    height: 200,
    tools: [{
        type: 'help',
        tooltip: 'Markdown formatting guide',
        callback: function() {
            window.open('https://help.github.com/articles/markdown-basics', '_blank');
        }
    }],

    items: {
        xtype: 'textarea'
        //        grow: true // temporarily disabled due to ExtJS bug that causes the page to scroll to top on grow
    },

    initComponent: function() {
        var me = this,
            editorValue = me.contentItem ? me.contentItem.Data : '',
            textarea;

        me.callParent();

        textarea = me.textarea = me.down('textarea').setValue(editorValue);
        textarea.on('change', 'firePreviewChange', me);
    },

    getPreviewHtml: function(callback) {
        var me = this,
            _doRender = function() {
                callback(window.markdown.toHTML(me.textarea.getValue()));
            };

        if (window.markdown) {
            _doRender();
        } else {
            Ext.Loader.loadScripts({
                url: '/js/lib/markdown.js',
                cache: true,
                onLoad: _doRender
            });
        }
    },

    getItemData: function() {
        return Ext.applyIf({
            Data: this.textarea.getValue()
        }, this.callParent());
    }
});