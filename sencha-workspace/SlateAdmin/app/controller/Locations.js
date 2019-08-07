/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Locations', {
    extend: 'Ext.app.Controller',


    // controller config
    stores: [
        'Locations@Slate.store'
    ]
});