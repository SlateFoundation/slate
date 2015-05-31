Ext.define('SlateAdmin.view.AbstractActivity', {
    extend: 'Ext.Panel',

    xtype: 'abstract-activity-panel',
    requires: [
        'SlateAdmin.view.template.Activity'
    ],
    
    title: 'Activity Feed',
    
    config: {
        previewPhotos: null,
        emptyNoteFieldText: 'Leave a note…'
    },
    
    initComponent: function() {
        var me = this,
            dataview,
            filefield,
            dropArea,
            defaultItems = me._getDefaultItems();
            
        me.callParent(arguments);
        
        me.add(defaultItems);
        
        dropArea = me;
        
        dataview = me.down('dataview');
        filefield = me.down('filefield');
        
        dataview.on('render', function(view) {
//            view.el.on('click', me.onPreviewBtnClick, me, {delegate: 'a.preview-button'});

            view.on('itemclick', me.onPreviewItemClick, me);
            view.el.on('click', me.onRemovePhotoBtnClick, me, {delegate: 'a.remove-button'});
            view.el.on('click', function(evt) {
                evt.preventDefault();
//                Jarvus.LightBox.open(evt.currentTarget);
            }, me, {delegate: 'a.preview-button'})
            
            me.imagesToolTip = Ext.create('Ext.tip.ToolTip', {
                // The overall target element.
                target: view.el,
                // Each grid row causes its own separate show and hide.
                delegate: view.itemSelector,
                // Moving within the row should not hide the tip.
                trackMouse: true,
                // Render immediately so that tip.body can be referenced prior to the first show.
                renderTo: Ext.getBody(),
                listeners: {
                    // Change content dynamically depending on which element triggered the show.
                    beforeshow: function updateTipBody(tip) {
    //                        debugger;
                        if (view.getRecord(tip.triggerElement) && view.getRecord(tip.triggerElement).get('error')) {
                            tip.update(view.getRecord(tip.triggerElement).get('error'));
                        } else {
                            return false;
                        }
                    }
                }
            });
            
            me.initDropArea();
        }, me, {single: true});
        
        filefield.on('change', me.onAttachPhotoFieldChange, me);
    
    },
    
    initDropArea: function() {
        var me = this,
            dropArea = me.getEl();
        
        if (!this.rendered) {
            return me.on('render', me.initDropArea);
        }
        
        if (!dropArea) {
            console.alert('no droparea', me);
            return false;
        }
        
        dropArea.on("dragleave", function (evt) {
            var target = evt.target;
            
            if (target && target === dropArea) {
//              dropArea.addCls('dropping');
                me.removeCls('dropping');
            }
            evt.preventDefault();
            evt.stopPropagation();
        }, me);
        
        dropArea.on("dragenter", function (evt) {
            
            evt.preventDefault();
            evt.stopPropagation();
            
            dropArea.addCls('dropping');
        }, me);
        
        dropArea.on("dragover", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            
        }, me);
        
        dropArea.on("drop", function (evt) {

            evt.preventDefault();
            evt.stopPropagation();
            
            if (event && event.dataTransfer && event.dataTransfer.files.length) {
                Ext.each(event.dataTransfer.files, function(file) {
                    me.showFilePreview(file);
                }, me);    
            }
            
            me.removeCls('dropping');
            
        }, me);
        
    },
    
    //@private
    updateActivityData: function(model) {
        var me = this,
            activity = [],
            storyModel;
        
        
        if (model) {
            Ext.each(model.get('Stories'), function(story) {
                storyModel = Ext.ModelMgr.create(story, 'SlateAdmin.model.Activity');
                activity.push(storyModel.getData());
            });
        }

        me.down('#activityCmp').update(activity);
        
        me[model && !model.phantom? 'enable' : 'disable']();
    },
    
    onNewFileSelected: function(ev, t) {
        return this.onAttachPhotoFieldChange(ev, t);
    },
    
    onAddAnotherBtnClick: function(ev, target) {
        var me = this;
    },
    
    onPreviewItemClick: function(view, record) {
        var me = this,
            url;
        if (record && record.get('file') && !record.get('error')) {
            Jarvus.LightBox.open({
                href: record.get('href'),
                title: record.get('filename')
            }, '.upload-previews.activity-note > li.upload-preview a.preview-button', true);    
        } else {
            error = record ? record.get('error') : 'There is an unknown error with this file.';
            me.imagesToolTip.setRecord(record);
            me.imagesToolTip.show();
        }
    },
    
    onRemovePhotoBtnClick: function(ev, t) {
        var me = this,
            dataview = me.down('dataview'),
            node = Ext.fly(t).parent('.upload-preview'),
            photo = dataview.getRecord(node);
        
        photo.destroy();
    },
    
    onAttachPhotoFieldChange: function(filefield, fileName) {
        var me = this,
            i = 0;
        
        if (event && event.currentTarget && event.currentTarget.files && event.currentTarget.files.length) {
            for (; i < event.currentTarget.files.length; i++) {
                me.showFilePreview(event.currentTarget.files[i]);
            }
            
            //reset file field value
            event.currentTarget.value = '';
        }
    },
    
    showFilePreview: function(file) {
        var me = this,
            dataview = me.down('dataview'),
            reader = new FileReader(),
            isPhoto, node,
            newPhotos = [],
            validFileTypes = [
                'image/png',
                'image/jpeg'
//                'image/gif'
            ],
            pendingPhoto = {
                loading: true,
                file: file
            };
        
        newPhotos = dataview.store.add(pendingPhoto);
        
        reader.onload = function(readerEvent) {
            newPhotos[0].set({
                loading: false,
                previewUrl: readerEvent.target.result,
                href: URL.createObjectURL(file),
                filename: file.name
            });
        };
        
        if (validFileTypes.indexOf(file.type) != -1) {
            reader.readAsDataURL(file);
        } else {
            newPhotos[0].set('loading', false);
            newPhotos[0].set('error', 'File could not be read. You must use either JPG or PNG images.');
            //set to stock image.
            newPhotos[0].set('previewUrl', Ext.BLANK_IMAGE_URL);
        }
    },
    
    _getDefaultItems: function() {
        var me = this,
            defaultItems = [{
                xtype: 'form',
                bodyStyle: { background: 'none', border: 0 },
                margin: '0 0 10',
                items: [{
                    xtype: 'textareafield',
                    grow: 'true',
                    growMin: 23,
                    fieldStyle: { padding: '10px' },
                    emptyText: me.getEmptyNoteFieldText(), //'Leave a note…', 
                    anchor: '100%'
                },{
                    xtype: 'dataview',
                    itemId: 'previewCmp',
                    autoEl: 'ul',
                    cls: 'upload-previews activity-note',
                    disableSelection: true,
                    autoScroll: true,
                    store: {
                        fields: ['filename', 'previewUrl', 'error', 'loading', 'file', 'href'],
                        data: []
                    },
                    itemSelector: '.upload-preview',
                    tpl: [
                        '<tpl for=".">',
                            '<li class="upload-preview <tpl if="loading">loading</tpl>" style="background-image:url({previewUrl})">',
                                '<tpl if="!error && !loading && file">',
                                    '<a href="{href}" title="{filename}" class="preview-button fa fa-eye fa-2x" title="Preview {filename}"></a>',
                                '</tpl>',
                                '<a href="javascript:void(0)" class="remove-button fa fa-times" title="Remove {filename}"></a>',
                            '</li>',
                        '</tpl>'
        //                '<li class="upload-add-another">',
        //                    '<input type="file" name="addAnother" class="add-another" style="opacity:0; height:100%; width:100%;">',
        //                    '<a href="#" class="add-button fa fa-plus fa-2x">',
        //    
        //                    '</a>',
        //                '</li>'
                    ]
                },{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    items: [{
                        xtype: 'filefield',
                        buttonOnly: true,
                        buttonConfig: {
                            text: 'Attach&hellip;',
                            glyph: 0xf0c6
                        }
                    },{
                        xtype: 'tbfill'
                    },{
                        xtype: 'button',
                        itemId: 'submitNote',
                        cls: 'glyph-note',
                        disabled: true,
                        text: 'Leave a Note',
                        glyph: 0xf075 // fa-comment
                    }]
                }]
            },{
                xtype: 'component',
                itemId: 'activityCmp',
                tpl: Ext.create('SlateAdmin.view.template.Activity')
            }];
            
            return defaultItems;
    }
});