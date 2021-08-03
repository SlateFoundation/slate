/**
 * TODO: Move UI->model workflows out of change events and into syncContentRecord method
 * TODO: make component load correctly when contentRecord is set before render without afterrender deferment hack
 */
Ext.define('Emergence.cms.view.Editor', {
    extend: 'Ext.dashboard.Dashboard',
    xtype: 'emergence-cms-editor',
    requires: [
        'Ext.form.field.Text',
        'Ext.container.ButtonGroup',

        'Emergence.cms.view.EditorController',
        'Emergence.cms.view.Toolbar',
        'Emergence.cms.model.Content',

        // composers
        'Emergence.cms.view.composer.Unknown',
        'Emergence.cms.view.composer.Markdown',
        'Emergence.cms.view.composer.Html',
        'Emergence.cms.view.composer.Multimedia',
        'Emergence.cms.view.composer.Embed'
    ],

    controller: 'emergence-cms-editor',

    config: {
        contentRecord: null,
        composers: ['html', 'markdown', 'multimedia', 'embed'],
        includeSummary: false,
    },

    columnWidths: [1],
    maxColumns: 1,
    cls: ['emergence-content-editor'],
    bodyStyle: {
        borderWidth: '1px 0',
        padding: 0
    },

    header: {
        xtype: 'toolbar',
        padding: '4 7',
        items: [
            {
                reference: 'titleField',
                flex: 1,

                xtype: 'textfield',
                cls: 'field-title',
                selectOnFocus: true,
                emptyText: 'Title',
                hideLabel: true
            },
            {
                xtype: 'tbspacer',
                width: 7,
            },
            {
                cls: 'save-btn',
                text: 'Save',
                glyph: 0xf0ee + '@FontAwesome', // fa-cloud-upload
                scale: 'large',
                action: 'save'
            }
        ]
    },

    dockedItems: [{
        dock: 'top',

        xtype: 'toolbar',
        border: false,
        padding: '4 0 0 8',
        items: [
            {
                xtype: 'tbtext',
                text: '<i class="fa fa-lg fa-tags"></i> Tags'
            }, {
                reference: 'tagsField',
                flex: 1,

                xtype: 'tagfield',
                allowBlank: true,
                tooltip: 'Press enter after each tag',
                hideLabel: true,
                displayField: 'Title',
                valueField: 'ID',
                triggerAction: 'all',
                delimiter: ',',
                queryMode: 'local',
                forceSelection: false,
                createNewOnEnter: true,
                createNewOnBlur: true,
                width: 200,
                minChars: 2,
                filterPickList: true,
                typeAhead: true,
                //                emptyText: 'Biology, Homepage', // Temporarily disabled due to bug EXTJS-13378: http://www.sencha.com/forum/showthread.php?285390-emptyText-breaks-the-new-Ext.form.field.Tag-component
                store: {
                    autoLoad: true,
                    fields: [
                        { name: 'ID',
                            type: 'int',
                            useNull: true },
                        'Title'
                    ],
                    proxy: {
                        type: 'records',
                        url: '/tags'
                    }
                }
            }
        ]
    }, {
        dock: 'top',

        xtype: 'emergence-cms-toolbar',
        border: false,
        layout: {
            overflowHandler: 'menu'
        },
    }, {
        reference: 'summaryFieldCt',
        dock: 'top',
        hidden: !this.includeSummary,

        xtype: 'toolbar',
        border: false,
        padding: '0 0 0 8',
        items: [
            {
                reference: 'summaryField',
                flex: 1,
                xtype: 'textarea',
                emptyText: 'Summarize your post here. This summary may appear in blog feeds, with a link to the full contents.',
                grow: true,
            },
        ],
    }, {
        reference: 'inserterCt',

        xtype: 'buttongroup',
        border: 1,
        cls: 'segmented-btn-group',
        dock: 'bottom',
        title: 'Add a content block:',
        minHeight: 100,
        bodyPadding: 0,
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

    getSelectedDateTime: function() {
        var publishedTimeCt = this.down('#publishTimeCt'),
            date = publishedTimeCt.down('datefield').getValue() || new Date(),
            time = publishedTimeCt.down('timefield').getValue() || new Date();

        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(0);

        return date;
    },

    applyContentRecord: function(contentRecord) {
        if (Ext.isObject(contentRecord) && !contentRecord.isModel) {
            contentRecord = Ext.create('Emergence.cms.model.Content', contentRecord);
        }

        return contentRecord;
    },

    updateContentRecord: function(contentRecord, oldContentRecord) {
        var me = this,
            fireChange = function() {
                me.fireEvent('contentrecordchange', me, contentRecord, oldContentRecord);
            };

        // defer event until render
        if (me.rendered) {
            fireChange();
        } else {
            me.on('afterrender', fireChange);
        }
    },

    applyComposers: function(composers) {
        var aliasPrefix = 'emergence-cms-composer.',
            composersLength = composers.length, composorsIndex = 0, composer;

        for (; composorsIndex < composersLength; composorsIndex++) {
            composer = composers[composorsIndex];
            if (composer.indexOf(aliasPrefix) !== 0) {
                composer = aliasPrefix + composer;
            }
            composers[composorsIndex] = Ext.ClassManager.getNameByAlias(composer);
        }

        return composers;
    },

    updateIncludeSummary: function (includeSummary, includeSummaryOld) {
        var me = this,
            fieldCt = me.lookup('summaryFieldCt'),
            field = me.lookup('summaryField'),
            toggleBtn = me.lookup('summaryToggleBtn'),
            _removeSummary = function () {
                fieldCt.setVisible(false); // hide field
                field.setValue(); // clear it
            };

        if (field) {
            if (includeSummary) {
                fieldCt.setVisible(true);
                field.focus();
            } else {
                // before removing summary, confirm deleting the field contents
                if (field.getValue().trim().length > 0) {
                    Ext.Msg.show({
                        title: 'Delete post summary',
                        message: 'Removing the summary will delete any text you have written there.',
                        icon: Ext.Msg.WARNING,
                        buttons: [
                            Ext.Msg.YES,
                            Ext.Msg.NO,
                        ],
                        buttonText: {
                            // yes and no reversed so that "Keep it" will be the default
                            no: 'Delete and remove',
                            yes: 'Keep it',
                        },
                        fn: function (btn) {
                            if (btn === 'no') {
                                _removeSummary();
                            } else if (btn === 'yes') {
                                // if we want to keep the summary, then toggle it back on
                                if (toggleBtn.toggle) {
                                    toggleBtn.toggle(true);
                                } else if (toggleBtn.setChecked) {
                                    toggleBtn.setChecked(true); // if it's in an overflow menu
                                }
                            }
                        }
                    });
                } else {
                    _removeSummary();
                }
            }
        }
    },
//     onComposerDrop: function(dropEvent) {
//         var composer = dropEvent.panel;
//
//         composer.fireEvent('dropped', composer, dropEvent);
//
//         dropEvent.column.items.each(function(item) {
//             if (item !== composer) {
//                 item.fireEvent('siblingdrop', item, composer);
//             }
//         });
//     },
});
