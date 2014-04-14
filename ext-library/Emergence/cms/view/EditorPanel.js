/*jslint browser: true, undef: true *//*global Ext,Emergence*/
/**
 * TODO: Move UI->model workflows out of change events and into syncContentRecord method
 */
Ext.define('Emergence.cms.view.EditorPanel', {
    extend: 'ExtUx.portal.Panel',
    xtype: 'emergence-cms-editorpanel',
    requires:[
        'Ext.form.field.Text',
        'Ext.container.ButtonGroup',
        'Ext.layout.container.Fit',

        'Emergence.cms.view.Toolbar',
        'Emergence.cms.model.Content',

        // composers
        'Emergence.cms.view.composer.Unknown',
        'Emergence.cms.view.composer.Html',
        'Emergence.cms.view.composer.Multimedia',
        'Emergence.cms.view.composer.Embed'
    ],

    config: {
        contentRecord: null
    },

    composers: [
        'Emergence.cms.view.composer.Html',
        'Emergence.cms.view.composer.Multimedia',
        'Emergence.cms.view.composer.Embed'
    ],

    cls: ['x-portal', 'emergence-content-editor'],
    border: false,

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: {
            xtype: 'textfield',
            cls: 'field-title',
            itemId: 'titleField',
            flex: 1,
            selectOnFocus: true,
            emptyText: 'Title'
        }
    },{
        xtype: 'emergence-cms-toolbar',
        dock: 'top'
    },{
        xtype: 'buttongroup',
        dock: 'bottom',
        itemId: 'inserterCt',
        title: 'Add more content blocks',
        minHeight: 100,
        defaults: {
            scale: 'large',
            iconAlign: 'top',
            flex: 1
        },
        layout: {
            type: 'hbox',
            pack: 'center',
            align: 'stretch'
        }
    }],

    layout: 'fit',
    items: [{
        itemId: 'composerCt'
//      ,renderTpl:[
//          '<p style="text-align:center;margin-top:3em;line-height:16px;font-style:italic;"><img src="/img/icons/loader/indicator.gif"> Loading blog editor&hellip;</p>'
//      ]
//      ,renderData: {}

    }],


    // @override
    initComponent: function() {
        var me = this,
            composers = me.composers,
            statusBtn,
            visibilityBtn,
            publishBtn,
            publishCheckBox,
            toolbarCt,
            publishDateTime,
            inserterCt,
            //,composerCt = me.down('#composerCt')
            i = 0, composerClassName, composerClass, inserterBtn;

        me.on('drop', me.onComposerDrop, me);

        //composerCt.setLoading("Loading&hellip");

        me.addEvents(
            /**
             * Fired when all available composer classes have been loaded
             */
            'composersready'
        );

        me.callParent();


        Ext.require(composers, function() {
            inserterCt = me.down('#inserterCt');

            for (; i < composers.length; i++) {
                composerClassName = composers[i];
                composerClass = Ext.ClassManager.get(composerClassName);

                if (composerClass.buttonCfg) {
                    inserterBtn = inserterCt.add(Ext.applyIf({
                        composerClassName: composerClassName
                    }, composerClass.buttonCfg));

                    inserterBtn.on('click', me.onInserterBtnClick, me);
                }
            }

            //inserterCt.setLoading(false);
            me.composersReady = true;
            me.fireEvent('composersready', me);
        });

        // fire event on saveBtn click
        me.down('#saveBtn').on('click', 'onSaveClick', me);

        // fire event on viewBtn click
        me.down('#viewBtn').on('click', 'onViewClick', me);

        // fire event for status option click
        statusBtn = me.down('#statusBtn');
        Ext.each(statusBtn.menu.items.items, function(option)  {
            option.on('click', 'onStatusClick', me);
        });

        // fire event for visibility option click
        visibilityBtn = me.down('#visibilityBtn');
        Ext.each(visibilityBtn.menu.items.items, function(option)  {
            option.on('click', 'onVisibilityClick', me);
        });

        //fire event for publish change
        publishBtn = me.down('#publishBtn');
        publishCheckBox = publishBtn.menu.items.items[0];
        publishDateTime = publishBtn.menu.items.items[1];
        publishCheckBox.on('change', 'onPublishImmediatelyCheck', me);
        publishDateTime.on('change', 'onPublishTimeSet', me);

        //composerCt.setLoading(false);
    },


    openRecord: function(record, options) {
        options = Ext.apply({
            newWindow: false,
            pathAppend: false,
            hash: false
        }, options);

        var url = record.toUrl();

        if (options.pathAppend) {
            url += options.pathAppend;
        }

        if (options.hash) {
            url += '#'+options.hash;
        }

        if (options.newWindow) {
            window.open(url);
        } else {
            window.location = url;
        }
    },

    errorResponseToText: function(obj) {
        var errRecords,
            msg = '<strong>' + ( obj.message ? obj.message : 'There was a problem saving your changes' ) +'</strong>',
            i = 0, field;

        if (obj.failed) {
            errRecords = obj.failed;
        } else if(obj.data && obj.data.validationErrors) {
            errRecords = [obj.data];
        }

        if (errRecords && errRecords.length) {
            msg += ':<ul>';
            for (; i < errRecords.length; i++) {
                for (field in errRecords[i].validationErrors) {
                    msg += '<li>'+errRecords[i].validationErrors[field]+'</li>';
                }
            }
            msg += '</ul>';
        }

        return msg;
    },

    updateContentRecord: function(contentRecord) {
        var me = this,
            composerCt = me.down('#composerCt'),
            contentItems,
            publishBtn = me.down('#publishBtn'),
            tagsField = me.down('#tagsField'),
            composers = me.composers,
            i = 0, itemData,
            j, composerClassName, composerClass;

        // load record first if string provided
        if (Ext.isString(contentRecord)) {
            Emergence.cms.model.Content.load(contentRecord, {
                success: function(contentRecord) {
                    me.setContentRecord(contentRecord);
                }
            });
            return;
        }

        if (Ext.isObject(contentRecord)){
            contentRecord = me.contentRecord = Ext.ModelManager.create(contentRecord, 'Emergence.cms.model.Content');
        }

        // defer loading content record until composers are ready
        if (!me.composersReady) {
            me.on('composersready', function() {
                me.updateContentRecord(contentRecord);
            }, me, {single: true});
            return;
        }

        // load title
        me.down('#titleField').setValue(contentRecord.get('Title'));

        // load status attributes
        me.down('#statusBtn').setIconCls('icon-status-' + contentRecord.get('Status'));
        me.down('#visibilityBtn').setIconCls('icon-visibility-' + contentRecord.get('Visibility'));
        me.updatePublished(publishBtn); // TODO: convert to sync function

        // load tags
        tagsField.setValue(Ext.Array.map(contentRecord.get('tags') || [], function(tag) {
            return parseInt(tag.ID, 10);
        }));

        // load content items
        contentItems = contentRecord.get('items');
        composerCt.removeAll();

        contentItemsLoop:for (;i < contentItems.length; i++) {
            itemData = contentItems[i];

            availableComposers:for (j = 0; j < composers.length; j++) {
                composerClassName = composers[j];
                composerClass = Ext.ClassManager.get(composerClassName);
                var contentItemClass = composerClass.contentItemClass;

                if (Ext.isArray(contentItemClass)) {
                    if (Ext.Array.contains(contentItemClass, itemData.Class)) {
                        composerCt.add(new composerClass({
                            contentItem: itemData
                        }));
                        continue contentItemsLoop;
                    }
                } else if (composerClass.contentItemClass == itemData.Class) {
                    composerCt.add(new composerClass({
                        contentItem: itemData
                    }));
                    continue contentItemsLoop;
                }
            }

            composerCt.add(Ext.create('Emergence.cms.view.composer.Unknown', {
                contentItem: itemData
            }));
        }
    },

    syncContentRecord: function() {
        var me = this,
            composerCt = me.down('#composerCt'),
            contentRecord = me.contentRecord,
            order = 1, itemData,
            items = [];

        // update title
        contentRecord.set('Title', me.down('#titleField').getValue());

        // update tags list
        contentRecord.set('tags', Ext.Array.map(me.down('#tagsField').getValueRecords(), function(tag) {
            return tag.get('ID') || tag.get('Title');
        }));

        // compile and set items array
        composerCt.items.each(function(composer) {
            itemData = composer.getItemData();
            items.push(Ext.apply({}, {
                ContentID: contentRecord.get('ID'),
                Order: order++
            }, itemData));
        });

        contentRecord.set('items', items);

        return contentRecord;
    },

    onInserterBtnClick: function(btn) {
        var composerCt = this.down('#composerCt'),
            composer = composerCt.add(Ext.create(btn.composerClassName));

        composer.on('dragstart', function() {
            composerCt.items.each(function(item) {
                if (item !== composer) {
                    item.fireEvent('siblingdragstart', item, composer);
                }
            });
        });
    },

    onComposerDrop: function(dropEvent) {
        var composer = dropEvent.panel;

        composer.fireEvent('dropped', composer, dropEvent);

        dropEvent.column.items.each(function(item) {
            if (item !== composer) {
                item.fireEvent('siblingdrop', item, composer);
            }
        });
    },

    onPublishImmediatelyCheck: function(item, newValue, oldValue, eOpts) {
        var me = this,
            publishDateTime,
            contentRecord;

        if (item.checked) {
            me.contentRecord.set('Published', null);
        } else {
            me.contentRecord.set('Published', new Date());
        }

        me.updatePublished(item);
    },

    onPublishTimeSet: function(item, newValue, oldValue, eOpts) {
        var me = this,
            contentRecord;

        me.contentRecord.set('Published', newValue);
        me.updatePublished(item);
    },

    updatePublished: function(item){
        var me = this,
            publishBtn,
            publishDateTime;

        if (item.itemId == 'publishBtn'){
            item = item.menu.items.items[0];
        }

        publishBtn = item.up('#publishBtn');
        publishDateTime = publishBtn.menu.items.items[1];


        if (item.itemId != 'publish') {
            item = publishBtn.menu.items.items[0];
        }

        var p = me.contentRecord.get('Published');
        if (p) {
            publishDateTime.setValue(p);
            publishDateTime.setDisabled(false);
            item.checked = false;
            publishBtn.setText(Ext.Date.format(p, 'M d, Y - g:i A'));
        } else {
            publishDateTime.setDisabled(true);
            item.checked = true;
            publishBtn.setText('To Be Published Immediately');
        }
    },

    onVisibilityClick: function(item, e) {
        var me = this,
            contentRecord,
            contentVisibility;

        contentVisibility = me.down('#visibilityBtn');
        me.contentRecord.set('Visibility', item.text);
        contentVisibility.setIconCls('icon-visibility-' + me.contentRecord.get('Visibility'));
    },

    onStatusClick: function(item, e) {
        var me = this,
            contentRecord,
            contentStatus;

        contentStatus = me.down('#statusBtn');
        me.contentRecord.set('Status', item.text);
        contentStatus.setIconCls('icon-status-' + me.contentRecord.get('Status'));
    },

    onViewClick: function() {
        this.openRecord(this.contentRecord, {newWindow: true});
    },

    onSaveClick: function() {
        var me = this,
            contentRecord = me.getContentRecord(),
            wasPhantom = contentRecord.phantom;

        me.setLoading('Saving&hellip;');
        contentRecord = me.syncContentRecord();

        contentRecord.save({
            success: function() {
                if (wasPhantom) {
                    me.setLoading('Opening new post&hellip;');
                    me.openRecord(contentRecord, {
                        pathAppend: '/edit'
                    });
                } else {
                    me.setLoading(false);
                }
            },
            failure: function() {
                window.alert('Failed to save blog post, please backup your work to another application and report this to your technical support contact');
            }
        });
    }
});