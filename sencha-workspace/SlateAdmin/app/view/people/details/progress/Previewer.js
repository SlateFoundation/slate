/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.Previewer',{
    extend: 'Ext.window.Window',
    xtype: 'people-details-progress-previewer',

    config: {
        report: null
    },

    layout: 'fit',
    height: 600,
    width: 1166,
    modal: true,
    title: 'Report Preview',
    items: [{
        xtype: 'component',
        itemId: 'previewBox',
        cls: 'print-preview',
        flex: 1,
        disabled: true,
        renderTpl: '<iframe width="100%" height="100%"></iframe>',
        renderSelectors: {
            iframeEl: 'iframe'
        },
        listeners: {
            afterrender: {
                fn: function (previewBox) {
                    this.mon(previewBox.iframeEl, 'load', function () {
                        previewBox.setDisabled(false);
                        previewBox.setLoading(false);
                    }, this);
                },
                delay: 10
            }
        }
    }],

    //helper functions
    updateReport: function (report){
        var me = this,
            filterForm = me.getComponent('filterForm'),
            previewBox = me.getComponent('previewBox'),
            reportClass = report.get('Class'),
            apiHost = SlateAdmin.API.getHost(),
            loadingSrc = '',
            params = {},
            loadMask,
            printLoadingInterval;

        switch (reportClass) {
            case 'Slate\\Progress\\Narratives\\Report':
                me.setTitle('Narrative Preview');

                loadingSrc = '/standards/print/preview';
                loadMask = {msg: 'Loading Narrative&hellip;'};
                loadingSrc = '/narratives/print/preview';
                params = {
                    narrativeID: report.get('ID')
                }

                break;

            case 'Standards':
                me.setTitle('Standards Preview');

                loadMask = {msg: 'Loading Standards&hellip;'};
                loadingSrc = '/standards/print/preview'
                params = {
                    studentID: report.get('StudentID'),
                    sectionID: report.get('CourseSectionID'),
                    termID: report.get('TermID')
                }
                break;

            case 'Slate\\Progress\\Interims\\Report':
                me.setTitle('Interims Preview');

                loadMask = {msg: 'Loading Interims&hellip;'};
                loadingSrc = '/interims/pdf/'+report.get('ID');
                break;
        }

        params.downloadToken = Math.random();

        if (Ext.isEmpty(apiHost)) {
            printLoadingInterval = setInterval(function () {
                if (Ext.util.Cookies.get('downloadToken') == params.downloadToken) {
                    clearInterval(printLoadingInterval);
                    previewBox.setLoading(false);
                }
            }, 500);

            previewBox.setLoading(loadMask);
        }

        previewBox.iframeEl.dom.src  = SlateAdmin.API.buildUrl(loadingSrc+'?'+Ext.Object.toQueryString(params));
    }
});
