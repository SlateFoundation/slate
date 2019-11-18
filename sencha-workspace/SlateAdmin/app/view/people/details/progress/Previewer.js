/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.Previewer',{
    extend: 'Ext.window.Window',
    xtype: 'people-details-progress-previewer',
    requires: [
        /* global SlateAdmin */
        'SlateAdmin.API',
        'SlateAdmin.widget.PrintPreview'
    ],

    config: {
        report: null,
        url: null
    },

    layout: 'fit',
    height: 600,
    width: 1166,
    modal: true,
    title: 'Report Preview',
    items: [{
        flex: 1,

        xtype: 'slate-printpreview',
        listeners: {
            afterrender: {
                fn: function (previewBox) {
                    this.mon(previewBox.iframeEl, 'load', function () {
                        previewBox.setLoading(false);
                    }, this);
                },
                delay: 10
            }
        }
    }],
    bbar: [
        '->',
        {
            action: 'launch-browser',
            text: 'Open in new browser',
            glyph: 0xf08e // fa-external-link
        }
    ],

    // helper functions
    updateReport: function (report) {
        var me = this,
            noun = report.get('Noun'),
            previewBox = me.down('slate-printpreview');

        me.setTitle('Preview '+noun);
        previewBox.setLoading({
            msg: 'Loading '+noun+'&hellip;'
        });

        this.setUrl(SlateAdmin.API.buildUrl(report.getUrl()));
    },

    updateUrl: function(url) {
        this.down('slate-printpreview').iframeEl.dom.src = url;
    }
});
