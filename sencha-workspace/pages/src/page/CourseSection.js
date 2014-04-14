/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.page.CourseSection', {
    singleton: true,
    requires: [
        'Site.Common'
    ],

    constructor: function() {
        if (window.CourseSectionData) {
            Ext.onReady(this.onDocReady, this);
        }
    },

    onDocReady: function() {
        Ext.select('a[href^=#copy-section-emails]').on('click', function(ev, t) {
            ev.stopEvent();

            Ext.Ajax.request({
                url: '/sections/json/'+window.CourseSectionData.Handle+'/roster',
                success: function(response){
                    var r = Ext.decode(response.responseText);

                    window.prompt('Select and copy student emails', Ext.Array.map(Ext.Array.filter(r.data, function(personData) {
                        return personData.Email;
                    }), function(personData) {
                        return '"'+personData.FirstName+' '+personData.LastName+'" <'+personData.Email+'>';
                    }).join(', '));
                },
                method: 'POST'
            });
        });
    }
});

