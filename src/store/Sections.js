/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SparkClassroom.store.Sections', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.model.Section'
    ],


    config: {
        model: 'Slate.model.Section'
    }
});