/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.page.CourseSection', {
    singleton: true,
               
                     
      

    constructor: function() {
        if (window.CourseSectionData) {
            Ext.onReady(this.onDocReady, this);
        }
    },

    onDocReady: function() {
        Ext.getBody().on('click', function(ev, t) {
            ev.stopEvent();

            Ext.Ajax.request({
                method: 'GET',
                url: '/sections/'+window.CourseSectionData.Handle+'/roster',
                params: {
                    include: 'PrimaryEmail'
                },
                headers: {
                    Accept: 'application/json'
                },
                success: function(response){
                    var r = Ext.decode(response.responseText);

                    window.prompt('Select and copy student emails', Ext.Array.map(Ext.Array.filter(r.data, function(personData) {
                        return personData.PrimaryEmail;
                    }), function(personData) {
                        return '"'+personData.FirstName+' '+personData.LastName+'" <'+personData.PrimaryEmail.Data+'>';
                    }).join(', '));
                }
            });
        }, null, { delegate: 'a[href^="#copy-section-emails"]'});
    }
});


