/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.Common', {
    singleton: true,
    requires: [
        'Ext.DomHelper',
        'Ext.XTemplate',
        'Site.widget.Login',
        'Site.widget.Search',
        'Site.widget.model.Person',
        'Site.widget.model.CourseSection',
        'Site.widget.model.Content',
        'Site.widget.model.Event'
    ],

    constructor: function() {
        Ext.onReady(this.onDocReady, this);
    },

    onDocReady: function() {
        var me = this,
            body = Ext.getBody(),
            modalTemplate;

        // menu enhancements
        Ext.select('.header-ct, .main-ct').on('click', function(ev, t){
            // clear selected nav if click outside nav
            if (!ev.getTarget('nav')) {
                Ext.select('nav .selected').removeCls('selected');
            }
        });

        Ext.select('.header-ct nav').on('click', function(ev, t){
            var menuItem = ev.getTarget('.menu-item', null, true),
                submenu  = ev.getTarget('.submenu');

            // clear selected class for repeat clicks, otherwise radio it here
            if (menuItem.hasCls('selected')) {
                menuItem.removeCls('selected');
            } else {
                menuItem.radioCls('selected');
            }

            // clear submenus if other menus are accessed
            if (!submenu) {
                Ext.select('.has-submenu').removeCls('selected');
            }
        },{
            delegate: '.menu-item'
        });

        // site search
        me.siteSearch = Ext.create('Site.widget.Search', {
            searchForm: body.down('.search-form.site-search')
        });

        // modal dialog used by delete buttons
        // TODO: move this to its own class
        modalTemplate = Ext.create('Ext.XTemplate', [
            '<div class="modal-mask">',
                '<div class="modal-dialog">',
                    '<header class="modal-header">',
                        '<div class="modal-close-button">&times;</div>',
                        '<h2 class="modal-title">{title}</h2>',
                    '</header>',
                    '<div class="modal-body">{body}</div>',
                    '<footer class="modal-buttons">',
                        '<button class="cancel">{no}</button>',
                        '<button class="<tpl if="destructive">destructive<tpl else>primary</tpl>">{yes}</button>',
                    '</footer>',
                '</div>',
            '</div>'
        ]);

        body.on('click', function(ev, t) { // delegated to '.confirm' below
            ev.stopEvent();
            t = ev.getTarget(null, null, true);

            var blogPostEl = t.up('.blog-post'),
                confirmData = {
                    title: t.getAttribute('data-confirm-title') || 'Confirm',
                    body: t.getAttribute('data-confirm-body')  || 'Are you sure?',
                    yes:  t.getAttribute('data-confirm-yes')   || 'Yes',
                    no:   t.getAttribute('data-confirm-no')    || 'No',
                    url:  t.getAttribute('data-confirm-url')   || '',
                    destructive: !!t.getAttribute('data-confirm-destructive')
                },
                modal = modalTemplate.append(body, confirmData, true);
                
            body.addCls('blurred');

            modal.on('click', function(ev, t) {
                t = ev.getTarget(null, null, true);

                if (t.hasCls('modal-close-button') || t.hasCls('cancel')) {
                    modal.destroy();
                    body.removeCls('blurred');
                } else if (t.hasCls('destructive') || t.hasCls('primary')) {
                    modal.down('.modal-dialog').addCls('waiting');
                    Ext.Ajax.request({
                        url: confirmData.url,
                        method: 'POST',
                        success: function(response) {
                            var r = Ext.decode(response.responseText);

                            if (r.success) {
                                modal.destroy();
                                body.removeCls('blurred');
                                blogPostEl.destroy();
                            } else {
                                modal.down('.modal-body').update('There was a problem processing your request. Would you like to try again?');
                                modal.down('.cancel').update('Cancel');
                                modal.down('.modal-buttons :last-child').update('Try Again');
                            }
                        },
                        failure: function(response) {
                            modal.down('.modal-body').update('There was a problem processing your request. Would you like to try again?');
                            modal.down('.cancel').update('Cancel');
                            modal.down('.modal-buttons :last-child').update('Try Again');
                        }
                    });
                }
            });
        }, null, { delegate: '.confirm' });
    }
});