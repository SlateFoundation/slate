/*jslint browser: true, undef: true *//*global Ext,SWFUpload*/
Ext.define('Emergence.cms.view.composer.Multimedia', {
    extend: 'Emergence.cms.view.composer.Abstract',
    xtype: 'emergence-cms-composer-multimedia',
    requires: [
        'Ext.ProgressBar',
        'ExtUx.SWFUpload'
    ],

    inheritableStatics: {
        contentItemClass: 'Emergence\\CMS\\Item\\Media',
        buttonCfg: {
            text: 'Upload Media',
            iconCls: 'icon-content-multimedia',
            tooltip: 'Add an audio, video, or photo file from your computer.'
        }
    },

    title: 'Multimedia',
    height: 200,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    targetUrl: '/media/json/upload',
    fieldName: 'Media',
    buttonText: '<span class="btnText">Browse…</span>',
    fileTypes: '*',
    fileTypesDescription: 'Multimedia Files',
    fileSizeLimit: '300 MB',
    buttonWidth: 158,

    initComponent: function() {
        var me = this,
            contentArea;

        me.contentItem = me.contentItem ? me.contentItem : {Data:{}};

        me.items = me.getItems();

        me.callParent(arguments);
        contentArea = me.down('#mediaView');
        contentArea.on('render', 'onContentAreaRendered', me);
    },

    getItems: function() {
        var me = this,
            progressBar = Ext.create('Ext.ProgressBar', {
                text: 'Preparing Flash Uploader&hellip;',
                height: 30,
                flex: 1
            }),
            uploader = Ext.create('ExtUx.SWFUpload', {
                progressBar: progressBar,
                swfUploadCfg: {
                    autoStart: true,
                    debugMode: false,
                    targetUrl: me.targetUrl,
                    fieldName: me.fieldName,
                    file_size_limit: me.fileSizeLimit,
                    file_types: me.fileTypes,
                    file_types_description: me.fileTypesDescription,
                    button_text: me.buttonText,
    //              button_height: this.buttonHeight,
                    button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE
                },
                listeners: {
                    scope: me,
                    uploadResponse: me.onUploadResponse
                }
            });

        return [{
            xtype: 'component',
            itemId: 'mediaView',
            flex: 1,
            renderTpl: '<center><img style="padding: 20px" src="'+Ext.BLANK_IMAGE_URL+'" class="content-image" height=150 width=150 /></center>',
            renderSelectors: {contentImage: '.content-image'}
        },{
            xtype: 'toolbar',
            docked: 'bottom',
            height: 30,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [uploader, progressBar]
        }];
    },

    getItemData: function(){
        var me = this,
            mediaID = false;

        if (me.contentItem && me.contentItem.Data && me.contentItem.Data.MediaID) {
            mediaID = me.contentItem.Data.MediaID;
        }

        return Ext.applyIf({
            Class: 'Emergence\\CMS\\Item\\Media',
            Data: {
                MediaID: mediaID
            }
        }, this.callParent());
    },

    onUploadResponse: function(file, responseText, receivedResponse) { //file upload response
        var me = this,
            r = Ext.decode(responseText);

        if (r.success) {
            var mediaData = r.data,
                mediaView = me.down('#mediaView');

            me.contentItem.Data.MediaID = mediaData.ID;
            mediaView.contentImage.dom.src = '/thumbnail/'+mediaData.ID+'/150x150';
            mediaView.show();
        } else {
            Ext.Msg.alert('Upload failed', r.message ? r.message : 'Your upload failed, please try again later or contact support');
        }

        me.uploading = false;
    },


    onContentAreaRendered: function() {
        var me = this,
            mediaView = me.down('#mediaView');


        if (me.contentItem && me.contentItem.Data && me.contentItem.Data.MediaID) {
            mediaView.contentImage.dom.src = '/thumbnail/' + me.contentItem.Data.MediaID;
        }
    }
});