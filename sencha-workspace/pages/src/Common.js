/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.Common', {
    singleton: true,
    requires: [
        'Ext.DomHelper',
        'Ext.XTemplate',
        'Site.widget.Login',
        'Site.widget.Search',
        'Site.widget.model.Person',
        'Site.widget.model.Tag',
        'Site.widget.model.CourseSection',
        'Site.widget.model.Content',
        'Site.widget.model.Event'
    ],

    constructor: function() {
        // register model widget aliases
        Ext.ClassManager.addAlias('Site.widget.model.Person', 'modelwidget.Slate\\People\\Student');

        // register onReady handler
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

            var confirmLink = ev.getTarget('.confirm', null, true),
                successTarget = confirmLink.getAttribute('data-confirm-success-target'),
                successMessage = confirmLink.getAttribute('data-confirm-success-message'),
                confirmData = {
                    title: confirmLink.getAttribute('data-confirm-title') || 'Confirm',
                    body: confirmLink.getAttribute('data-confirm-body')   || 'Are you sure?',
                    yes:  confirmLink.getAttribute('data-confirm-yes')    || 'Yes',
                    no:   confirmLink.getAttribute('data-confirm-no')     || 'No',
                    url:  confirmLink.getAttribute('data-confirm-url')    || confirmLink.getAttribute('href'),
                    destructive: !!confirmLink.getAttribute('data-confirm-destructive')
                },
                modal = modalTemplate.append(body, confirmData, true);
                
            body.addCls('blurred');

            modal.on('click', function(ev, t) {
                t = ev.getTarget('button', null, true);

                if (t.hasCls('modal-close-button') || t.hasCls('cancel')) {
                    modal.destroy();
                    body.removeCls('blurred');
                } else if (t.hasCls('destructive') || t.hasCls('primary')) {
                    modal.down('.modal-dialog').addCls('waiting');
                    Ext.Ajax.request({
                        url: confirmData.url,
                        method: 'POST',
                        headers: {
                            Accept: 'application/json'
                        },
                        success: function(response) {
                            var r = Ext.decode(response.responseText),
                                successTargetEl = successTarget && confirmLink.up(successTarget);

                            if (r.success) {
                                modal.destroy();
                                body.removeCls('blurred');
                                
                                if (successTargetEl) {
                                    if (successMessage) {
                                        successTargetEl.replaceWith({ tag: 'p', cls: 'status', html: successMessage});
                                    } else {
                                        successTargetEl.destroy();
                                    }
                                }
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
            }, null, { delegate: 'button' });
        }, null, { delegate: '.confirm' });
    }
});