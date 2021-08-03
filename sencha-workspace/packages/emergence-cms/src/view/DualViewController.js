Ext.define('Emergence.cms.view.DualViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.emergence-cms-dualview',
    requires: [
        'Ext.util.MixedCollection'
    ],

    control: {
        'emergence-cms-editor': {
            contentrecordchange: 'onContentRecordChange'
        },
        'emergence-cms-editor field[reference=titleField]': {
            change: 'onTitleChange'
        },
        'emergence-cms-editor field[reference=tagsField]': {
            change: 'onTagsChange'
        },
        'emergence-cms-editor menucheckitem#publishOnSaveCheck': {
            checkchange: 'onPublishTimeChange'
        },
        'emergence-cms-editor #publishTimeCt field': {
            change: 'onPublishTimeChange'
        },
        'emergence-cms-editor dashboard-column': {
            //            add: 'onComposerAdd', // TODO: uncomment when this is fixed: http://www.sencha.com/forum/showthread.php?288314-Having-an-add-event-listener-in-a-ViewController-prevents-menu-item-events...
            move: 'onComposerMove',
            remove: 'onComposerRemove'
        },
        'emergence-cms-composer': {
            previewchange: 'onComposerPreviewChange'
        }
    },

    // lifecycle overrides
    beforeInit: function() {
        this.itemEls = new Ext.util.MixedCollection();
    },

    // TODO: delete this method and uncomment the identical listener in the control config above after upgrading to ext 5.0.1
    init: function() {
        this.control('emergence-cms-editor dashboard-column', { add: 'onComposerAdd' });
    },


    // event handlers
    onContentRecordChange: function(editor, contentRecord) {
        var view = this.getView(),
            previewCmp = view.rendered && view.lookupReference('preview'),
            author = contentRecord.phantom ? window.SiteEnvironment && window.SiteEnvironment.user : contentRecord.get('Author'),
            context = contentRecord.get('Context');

        if (previewCmp) {
            if (author) {
                previewCmp.authorLink.set({ href: '/people/' + (author.Username || author.ID) }).update(author.FirstName + ' ' + author.LastName);
                previewCmp.authorWrapper.show();
            }
            if (context) {
                previewCmp.contextLink.set({ href: context.recordURL }).update(context.recordTitle);
                previewCmp.contextWrapper.show();
            }
            if (author || context) {
                previewCmp.infoWrapper.show();
            }
        }
    },

    onTitleChange: function(titleField, value) {
        var previewCmp = this.lookupReference('preview'),
            contentRecord = this.lookupReference('editor').getContentRecord(),
            href = contentRecord && !contentRecord.phantom && contentRecord.toUrl();

        previewCmp.titleLink.set({ href: href || '#' }).update(value);
    },

    onTagsChange: function(tagsField) {
        var previewCmp = this.lookupReference('preview'),
            tagsWrapper = previewCmp.tagsWrapper,
            tagsData = Ext.pluck(tagsField.getValueRecords(), 'data');

        Ext.suspendLayouts();

        if (!tagsData || !tagsData.length) {
            tagsWrapper.hide();
        } else {
            previewCmp.lookupTpl('tagsListTpl').overwrite(previewCmp.tagsCt, tagsData);
            tagsWrapper.show();
        }

        Ext.resumeLayouts(true);
    },

    onPublishTimeChange: Ext.Function.createBuffered(function() {
        var editorView = this.lookupReference('editor'),
            previewCmp = this.lookupReference('preview'),
            date = editorView.down('menucheckitem#publishOnSaveCheck').checked ? new Date() : editorView.getSelectedDateTime();

        previewCmp.timeEl.set({ datetime: Ext.Date.format(date, 'c') }).update(Ext.Date.format(date, 'l, F j, Y \\a\\t g:i a'));
        previewCmp.timeWrapper.show();
        previewCmp.infoWrapper.show();
    }, 50),

    onComposerAdd: function(column, itemComposer, position) {
        var me = this,
            itemEls = me.itemEls,
            previewCmp = me.lookupReference('preview'),
            itemTpl = previewCmp.lookupTpl('itemTpl'),
            itemId = itemComposer.getContentItemId(),
            itemData = {
                itemId: itemId,
                contentCls: itemComposer.self.contentCls
            };

        itemComposer.getPreviewHtml(function(html) {
            itemData.html = html;

            if (position > 0 && itemEls.getCount()) {
                itemEls.insert(position, itemId, itemTpl.insertAfter(itemEls.getAt(position - 1), itemData, true));
            } else {
                itemEls.add(itemId, itemTpl.insertFirst(previewCmp.itemsCt, itemData, true));
            }
        });
    },

    onComposerMove: function(column, itemComposer, prevIndex, newIndex) {
        var me = this,
            itemEls = me.itemEls,
            previewCmp = me.lookupReference('preview'),
            itemId = itemComposer.getContentItemId(),
            itemEl = itemEls.get(itemId),
            anchorItemEl = itemEls.getAt(newIndex);

        // reorder in DOM
        if (newIndex > prevIndex) {
            itemEl.insertAfter(anchorItemEl);
        } else {
            itemEl.insertBefore(anchorItemEl);
        }

        // reorder internal collection
        itemEls.remove(itemEl);
        itemEls.insert(newIndex, itemId, itemEl);
    },

    onComposerRemove: function(column, itemComposer) {
        var itemEls = this.itemEls,
            itemEl = itemEls.get(itemComposer.getContentItemId());

        itemEls.remove(itemEl);
        itemEl.destroy();
    },

    onComposerPreviewChange: function(itemComposer, html) {
        this.itemEls.get(itemComposer.getContentItemId()).update(html);
    }
});