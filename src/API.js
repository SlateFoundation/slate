/*jslint browser: true ,undef: true *//*global Ext*/
Ext.define('Slate.API', {
    extend: 'Emergence.util.AbstractAPI',
    singleton: true,

    // example function
    getMySections: function(callback, scope) {
        this.request({
            url: '/sections/json',
            method: 'GET',
            params: {
                AllCourses: 'false'
            },
            success: callback,
            scope: scope
        });
    }
});
