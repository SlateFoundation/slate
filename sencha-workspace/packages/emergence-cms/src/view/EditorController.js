Ext.define('Emergence.cms.view.EditorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.emergence-cms-editor',
    requires: [
        'Ext.window.MessageBox',
        'Emergence.cms.view.composer.Unknown'
    ],

    control: {
        '#': {
            contentrecordchange: 'onContentRecordChange'
        },
        'buttongroup[reference=inserterCt] button': {
            click: 'onInserterButtorClick'
        },
        'button[action=save]': {
            click: 'onSaveClick'
        },
        'button[reference=statusBtn] menucheckitem, button[reference=visibilityBtn] menucheckitem': {
            checkchange: 'onEnumMenuCheckChange'
        },
        'button[reference=publishedTimeBtn] menucheckitem': {
            checkchange: 'onPublishImmediatelyCheckChange'
        },
        'button[reference=publishedTimeBtn] field': {
            change: 'onPublishTimeFieldChange'
        }
    },


    // lifecycle overrides
    init: function() {
        var me = this,
            editorView = me.getView(),
            inserterCt = me.lookupReference('inserterCt'),
            contentRecord = editorView.getContentRecord(),
            composers = me.composers = [],
            composerClasses = editorView.getComposers() || Ext.ClassManager.getNamesByExpression('emergence-cms-composer.*'),
            composersLength = composerClasses.length, composerIndex = 0, composer, buttonCfg;

        // scan for composers and create buttons
        for (; composerIndex < composersLength; composerIndex++) {
            composer = Ext.ClassManager.get(composerClasses[composerIndex]);
            buttonCfg = composer.buttonCfg;

            composers.push(composer);

            if (buttonCfg) {
                inserterCt.add(Ext.applyIf({
                    composer: composer
                }, composer.buttonCfg));
            }
        }
    },


    // event handers
    onContentRecordChange: function(view, contentRecord) {
        this.syncFromRecord();
    },

    onInserterButtorClick: function(button) {
        this.getView().addView(button.composer.create(), 0);
    },

    onSaveClick: function() {
        var me = this,
            editorView = me.getView(),
            contentRecord = editorView.getContentRecord(),
            wasPhantom = contentRecord.phantom;

        editorView.setLoading('Saving&hellip;');
        me.syncToRecord();

        contentRecord.save({
            callback: function(record, operation, success) {
                var contentItemsData = contentRecord.get('items');

                if (success && wasPhantom) {
                    editorView.setLoading('Opening new post&hellip;');
                    location.href = contentRecord.getProxy().getConnection().buildUrl(contentRecord.toUrl() + '/edit');
                } else {
                    editorView.setLoading(false);

                    // write server-returned content item data to each composer
                    editorView.items.getAt(0).items.each(function(composer, composerIndex) {
                        composer.setContentItem(contentItemsData[composerIndex]);
                    });

                    if (!success) {
                        Ext.Msg.show({
                            title: 'Failed to save blog post',
                            message: operation.getError() || 'Please backup your work to another application and report this to your technical support contact',
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR
                        });
                    }
                }
            }
        });
    },

    onEnumMenuCheckChange: function(menuItem, checked) {
        if (!checked) {
            return;
        }

        var parentButton = menuItem.up('button');

        parentButton.setText(menuItem.text);
        parentButton.setGlyph(menuItem.glyph);
    },

    onPublishImmediatelyCheckChange: function(menuItem, checked) {
        var publishedTimeBtn = this.lookupReference('publishedTimeBtn');

        publishedTimeBtn.down('datefield').setDisabled(checked);
        publishedTimeBtn.down('timefield').setDisabled(checked);

        this.syncPublishedTimeBtnText();
    },

    onPublishTimeFieldChange: function() {
        this.syncPublishedTimeBtnText();
    },


    // protected methods
    syncPublishedTimeBtnText: function() {
        var publishedTimeBtn = this.lookupReference('publishedTimeBtn'),
            immediateChecked = publishedTimeBtn.down('menucheckitem').checked,
            date, text;

        if (immediateChecked) {
            text = 'Publish on save';
        } else {
            date = this.getView().getSelectedDateTime();
            text = /* (date > new Date() ? 'Publish ' : 'Published ') + */ Ext.Date.format(date, 'n/j/Y g:i a');
        }

        publishedTimeBtn.setText(text);
    },

    syncFromRecord: function() {
        var me = this,
            editorView = me.getView(),
            contentRecord = editorView.getContentRecord(),
            isPhantom = contentRecord.phantom,
            publishedTime = contentRecord.get('Published'),
            contentItems = contentRecord.get('items') || [],
            contentItemsLength = contentItems.length, contentItemsIndex = 0, contentItemData, contentItemClass,
            composers = me.composers,
            composersLength = composers.length, composersIndex, composer, composerItemClass,
            composersColumn = editorView.items.getAt(0),
            //            openBtn = me.lookupReference('openBtn'),
            publishedTimeBtn = me.lookupReference('publishedTimeBtn'),
            tagsField = me.lookupReference('tagsField'),
            tagsStore = tagsField.getStore(),
            tagsData = Ext.Array.map(contentRecord.get('tags') || [], function(tag) {
                return parseInt(tag.ID, 10);
            });

        Ext.batchLayouts(function() {
            // sync title
            me.lookupReference('titleField').setValue(contentRecord.get('Title'));

            // sync tags -- wait for store to load if necessary
            if (tagsStore.isLoaded()) {
                tagsField.setValue(tagsData);
            } else {
                tagsStore.on('load', function() {
                    tagsField.setValue(tagsData);
                }, me, { single: true });
            }

            // sync status/visibility fields
            me.lookupReference('statusBtn').down('[value="'+contentRecord.get('Status')+'"]').setChecked(true);
            me.lookupReference('visibilityBtn').down('[value="'+contentRecord.get('Visibility')+'"]').setChecked(true);

            // sync publish time fields
            publishedTimeBtn.down('menucheckitem').setChecked(isPhantom);
            publishedTimeBtn.down('datefield').setValue(isPhantom ? new Date() : publishedTime);
            publishedTimeBtn.down('timefield').setValue(isPhantom ? new Date() : publishedTime);

            // remove any existing composers from the column if its been initialized already
            if (composersColumn) {
                composersColumn.removeAll();
            }

            // instantiate appropriate composer for each item
            contentItemsLoop:for (;contentItemsIndex < contentItemsLength; contentItemsIndex++) {
                contentItemData = contentItems[contentItemsIndex];
                contentItemClass = contentItemData.Class;

                for (composersIndex = 0; composersIndex < composersLength; composersIndex++) {
                    composer = composers[composersIndex];
                    composerItemClass = composer.contentItemClass;

                    if (

                        Ext.isArray(composerItemClass)
                             && Ext.Array.contains(composerItemClass, contentItemClass)
                         || composerItemClass == contentItemClass

                    ) {
                        editorView.addView(composer.create({
                            contentItem: contentItemData
                        }), 0);
                        continue contentItemsLoop;
                    }
                }

                editorView.addView(Ext.create('Emergence.cms.view.composer.Unknown', {
                    contentItem: contentItemData
                }));
            }

            me.fireViewEvent('syncfromrecord', editorView, contentRecord);
        });
    },

    syncToRecord: function() {
        var me = this,
            editorView = me.getView(),
            composersColumn = editorView.items.getAt(0),
            contentRecord = editorView.getContentRecord(),
            itemsData = [],
            order = 1;

        // update title
        contentRecord.set('Title', me.lookupReference('titleField').getValue());

        // update status metadata
        contentRecord.set('Status', me.lookupReference('statusBtn').down('[checked]').value);
        contentRecord.set('Visibility', me.lookupReference('visibilityBtn').down('[checked]').value);

        // update published-on timestamp
        contentRecord.set('Published', me.lookupReference('publishedTimeBtn').down('menucheckitem').checked ? new Date() : editorView.getSelectedDateTime());

        // update tags list
        contentRecord.set('tags', Ext.Array.map(me.lookupReference('tagsField').getValueRecords(), function(tag) {
            return tag.get('ID') || tag.get('Title');
        }));

        // update items list
        if (composersColumn) {
            composersColumn.items.each(function(composer) {
                itemsData.push(Ext.apply({}, {
                    ContentID: contentRecord.get('ID'),
                    Order: order++
                }, composer.getItemData()));
            });
        }

        contentRecord.set('items', itemsData);

        me.fireViewEvent('synctorecord', editorView, contentRecord);
    }
});