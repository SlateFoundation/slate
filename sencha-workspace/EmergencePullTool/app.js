/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'EmergencePullTool.Application',
    requires: [
        'Ext.plugin.Viewport'
    ],


    name: 'EmergencePullTool',

    // The name of the initial view to create.
    mainView: 'EmergencePullTool.view.Main'
});
