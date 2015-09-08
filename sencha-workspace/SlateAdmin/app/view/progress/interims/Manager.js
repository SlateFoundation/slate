/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'progress-interims-manager',
    requires: [
        'SlateAdmin.view.progress.interims.Grid',
        'SlateAdmin.view.progress.interims.Report'
    ],

    componentCls: 'progress-interims-manager',
    layout: 'border',
    config: {
        interim: null,
        interimSaved: true
    },
    items: [{
        region: 'center',
        xtype: 'progress-interims-grid',
        width: 450,
        store: 'reports.Interims'
    },{
        region: 'east',
        split: true,
        xtype: 'container',
        itemId: 'reportCt',
        flex: 1,
        layout: 'card',
        items: [{
            xtype: 'component',
            itemId: 'curtain',
            html: '<p class="instructions">Select a student to begin or edit a report</p>'
        },{
            xtype: 'progress-interims-report',
            itemId: 'report',
            trackResetOnLoad: true
        }]
    }],


    //helper functions
    updateInterim: function (interim){
        var me = this,
            editor = me.down('progress-interims-report');

        me.interim = interim;

        editor.setLoading(true);
        me.getComponent('reportCt').getLayout().setActiveItem('report');
        me.down('progress-interims-report').loadRecord(interim);
        me.down('#deleteInterim').setDisabled(interim.get('Status') == 'Phantom');
        editor.setLoading(false);
    },

    unloadInterim: function (interim){
        var me = this;

        if (interim && interim != me.getInterim()) {
            return false;
        }

        me.getComponent('reportCt').getLayout().setActiveItem('curtain');
        me.down('progress-interims-grid').getSelectionModel().deselectAll();
            me.interim = null;
	}
});
