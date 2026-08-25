/**
 * People controller
 */
Ext.define('SlateAdmin.controller.People', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle',
        'SlateAdmin.util.PageTitle'
    ],

    // controller config
    views: [
        'people.NavPanel',
        'people.Manager'
    ],

    models: [
        'Person@Slate.model.person'
    ],

    stores: [
        'people.People',
        'people.Groups@Slate.store',
        'people.AccountLevels'
    ],

    routes: {
        'people': 'showPeople',
        'people/all': 'showResults',
        'people/create': 'showCreatePerson',
        'people/lookup/:person': {
            action: 'showPerson',
            conditions: {
                ':person': '([^/]+)'
            }
        },
        /**
         * @route people/lookup /:person/:tab
         * show person with requested details tab
         * @param {String} person The requested person
         * @param {String} tab The requested details tab
         */
        'people/lookup/:person/:tab': {
            action: 'showPerson',
            conditions: {
                ':person': '([^/]+)'
            }
        },
        'people/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)'
            }
        },
        'people/search/:query/:person': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)',
                ':person': '([^/]+)'
            }
        },
        'people/search/:query/:person/:tab': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)',
                ':person': '([^/]+)',
                ':tab': '([^/]+)'
            }
        }
    },

    refs: {
        navPanel: {
            selector: 'people-navpanel',
            autoCreate: true,

            xtype: 'people-navpanel'
        },
        searchField: 'people-navpanel jarvus-searchfield',
        advancedSearchForm:'people-navpanel people-advancedsearchform',
        groupsTree: 'people-navpanel #groups',
        manager: {
            selector: 'people-manager',
            autoCreate: true,

            xtype: 'people-manager'
        },
        grid: 'people-grid',
        exportResultsBtn: 'people-grid #exportResultsBtn',
        sendInvitationsBtn: 'people-grid #sendInvitationsBtn',
        selectionCountCmp: 'people-grid #selectionCount'
    },

    control: {
        navPanel: {
            beforeexpand: 'onNavPanelBeforeExpand'
        },
        manager: {
            activate: 'onManagerActivate',
            selectedpersonchange: 'onManagerSelectedPersonChange'
        },
        'people-manager #detailTabs': {
            tabchange: 'onDetailTabChange'
        },
        'people-grid': {
            select: { fn: 'onPersonSelect', buffer: 10 },
            deselect: { fn: 'onPersonDeselect', buffer: 10 }
        }
    },

    // controller template methods
    init: function() {
        this.listen({
            store: {
                '#People': {
                    load: this.onStoreLoad,
                    scope: this
                }
            }
        });
    },

    /**
     * Called by SlateAdmin.controller.Viewport when it is launched and requests all of the
     * application navpanels in order to add them to SlateAdmin.view.Navigation
     * @return {SlateAdmin.view.people.NavPanel}
     */
    buildNavPanel: function() {
        return this.getNavPanel();
    },

    // route handlers

    /**
     * Route Handler for people route.
     * Instructs the Viewport controller to add SlateAdmin.view.people.Manager to the Viewport's center
     * region card container, and ensures that the root node of the navpanel's treepanel is selected.
     * @return {void}
     */
    showPeople: function() {
        var me = this;

        Ext.suspendLayouts();
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(me.getManager());
        Ext.resumeLayouts(true);

        SlateAdmin.util.PageTitle.setTitle('People');
    },

    /**
     * Route Handler for people/lookup/:person/:tab route.
     * Performs a search by username specified by person parameter, selects the person in the result
     * set and activates the appropriate profile tab.
     * @param {String} person The username to search by and select in the result list
     * @param {String} tab The profile tab to activate
     * @return {void}
     */
    showPerson: function(person, tab) {
        var me = this,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        me.suspendStateSync();
        Ext.suspendLayouts();

        // queue store to load
        proxy.abortLastRequest(true);

        // Clear searchfield, reset the advanced search form and select the root node of the navpanel's treepanel.
        me.getSearchField().setValue('');
        me.getAdvancedSearchForm().getForm().reset();
        me.getGroupsTree().getSelectionModel().select(0, false, true);

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);

        Ext.resumeLayouts(true);

        // execute search (suppressed by doSearch if query hasn't changed) and select user
        me.doSearch(false, function() {
            // activate tab
            if (person && tab) {
                manager.setActiveDetailTab(tab);
            }

            // query has been performed, so clear the q param so syncState()
            // doesn't use it to change our path
            proxy.setExtraParam('q', null);

            me.selectPerson(person, function() {
                me.resumeStateSync();
            });
        });
    },

    /**
     * Route Handler for the following routes:
     *
     * - people/search/:query
     * - people/search/:query/:person
     * - people/search/:query/:person/:tab
     *
     * Performs the search specified by the query parameter.  If person and tab are specified it will select
     * the person in the result set and activate the appropriate profile tab.
     * @param {String} query The search query.
     * @param {String} person The person to select
     * @param {String} tab The profile tab to activate
     * @return {void}
     */
    showResults: function(query, person, tab) {
        var me = this,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        me.suspendStateSync();
        Ext.suspendLayouts();

        // decode query string for processing
        query = me.decodeRouteComponent(query);
        person = me.decodeRouteComponent(person);

        // queue store to load
        proxy.abortLastRequest(true);
        proxy.setExtraParam('q', query);
        
        // set ?status=* when querying by account level
        if (query && query.match('accountlevel:')) {
            proxy.setExtraParam('status', '*');
        } else {
            proxy.setExtraParam('status', null);
        }

        // sync search field and form
        me.getSearchField().setValue(query);
        me.application.getController('people.Search').syncAdvancedSearchForm();

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);

        Ext.resumeLayouts(true);

        SlateAdmin.util.PageTitle.setTitle(query ? '\u201c' + query + '\u201d' : 'People');

        // execute search (suppressed by doSearch if query hasn't changed) and select user
        me.doSearch(false, function() {
            // activate tab
            if (person && tab) {
                manager.setActiveDetailTab(tab);
            }

            me.selectPerson(person, function() {
                me.resumeStateSync(false);
            });
        });
    },

    showCreatePerson: function() {
        var me = this,
            manager = me.getManager();

        me.suspendStateSync();
        Ext.suspendLayouts();

        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);
        manager.setActiveDetailTab('profile');

        SlateAdmin.util.PageTitle.setTitle('Create Person');

        me.selectPerson(me.getPersonModel().create(), function() {
            me.resumeStateSync(false);
            Ext.resumeLayouts(true);
        });
    },

    // event handlers

    /**
     * Event Handler. Calls syncState when people-navpanel is expanded.
     * @param {SlateAdmin.view.people.NavPanel} navPanel The navigation panel
     * @return {void}
     */
    onNavPanelBeforeExpand: function() {
        this.syncState();
    },

    /**
     * Event Handler. Handles the People store's load event. Calls syncGridStatus to update the bottom toolbar.
     * @return {void}
     */
    onStoreLoad: function() {
        this.syncGridStatus();
    },

    /**
     * Event Handler. Handles the select event of the People grid. Sets the selectedPerson of the
     * SlateAdmin.view.people.Manager to the selected record and calls syncGridStatus to update the bottom toolbar.
     * @param {Ext.selection.RowModel} selModel The selection model
     * @param {Slate.model.person.Person} personRecord The selected record
     * @param {Number} index The row index selected
     * @return {void}
     */
    onPersonSelect: function(selModel, personRecord, index) {
        var me = this;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            me.getManager().setSelectedPerson(personRecord);
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Event Handler. Handles the deselect event of the People grid. Calls onPersonSelect if deselect event
     * leaves one record selected.
     * @param {Ext.selection.RowModel} selModel The selection model
     * @param {Slate.model.person.Person} personRecord The selected record
     * @param {Number} index The row index selected
     * @return {void}
     */
    onPersonDeselect: function(selModel, personRecord, index) {
        var me = this,
            selectionCount = selModel.getCount(),
            firstRecord;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selectionCount == 1) {
            firstRecord = selModel.getSelection()[0];
            selModel.select(firstRecord);
        } else if (selectionCount == 0) {
            me.getManager().setSelectedPerson(null);
        }

        Ext.resumeLayouts(true);
    },

    onManagerActivate: function() {
        this.getPeopleGroupsStore().loadIfDirty();
    },

    /**
     * Event handler. Calls syncState when person loaded into manager changes so that it is reflected in the url
     */
    onManagerSelectedPersonChange: function() {
        this.syncState();
    },

    /**
     * Event Handler. Calls syncState when active detail tab changes to that the change is reflected in the url
     * @return {void}
     */
    onDetailTabChange: function() {
        this.syncState();
    },

    // controller methods

    /**
     * Performs a reload of the store if forceReload parameter is true or the proxy's extraParams are dirty.
     * @param {Boolean} forceReload=false Set to true to force reload of store even if proxy's extraParams have not changed
     * @param {function} callback the callback function to perform
     * @return {void}
     */
    doSearch: function(forceReload, callback) {
        var me = this,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            proxy.abortLastRequest(true);
            me.getManager().setSelectedPerson(null);
            me.getGrid().getSelectionModel().clearSelections();
            store.removeAll();
            store.load({
                callback: callback,
                scope: me
            });
        } else {
            Ext.callback(callback, me);
        }
    },

    // controller-local replacement for the retired Ext.util.History
    // suspend/flush counter: while a route handler choreographs UI state,
    // selection events' syncState calls collapse into one trailing sync
    // (or are discarded when resumed with flush=false)
    stateSyncSuspended: 0,

    suspendStateSync: function() {
        this.stateSyncSuspended++;
    },

    resumeStateSync: function(flush) {
        var me = this;

        if (me.stateSyncSuspended && !--me.stateSyncSuspended) {
            if (flush !== false && me.stateSyncPending) {
                me.syncState();
            }

            me.stateSyncPending = false;
        }
    },

    /**
     * Sets the visibility and text for components in the bottom toolbar for the selected record(s)
     * @return {void}
     */
    syncGridStatus: function() {
        var me = this,
            grid = me.getGrid(),
            selectionCountCmp = me.getSelectionCountCmp(),
            exportResultsBtn = me.getExportResultsBtn(),
            sendInvitationsBtn = me.getSendInvitationsBtn(),
            selectionCount = grid.getSelectionModel().getCount(),
            actionCount = selectionCount || grid.getStore().getTotalCount(),
            hideBulkEditBtns = selectionCount >= 2;

        Ext.suspendLayouts();

        // update footer labels/buttons
        if (selectionCount >= 1) {
            selectionCountCmp.setText(selectionCount + (selectionCount==1?' person':' people') + ' selected');
            selectionCountCmp.show();
        } else {
            selectionCountCmp.hide();
        }

        if (actionCount >= 1) {
            exportResultsBtn.setText(
                'Export ' +
                (actionCount > 1 ? actionCount + ' ' : ' ') +
                'Result' +
                (actionCount != 1 ? 's' : '')
            );
            exportResultsBtn.enable();

            sendInvitationsBtn.setText(
                'Send ' +
                (actionCount > 1 ? actionCount + ' ' : ' ') +
                'Login Invitation' +
                (actionCount != 1 ? 's' : '')
            );
            sendInvitationsBtn.enable();
        } else {
            exportResultsBtn.setText('Export Results');
            exportResultsBtn.disable();
            sendInvitationsBtn.setText('Send Login Invitations');
            sendInvitationsBtn.disable();
        }

        // disable any components marked bulkOnly unless multiple rows are selected
        Ext.each(grid.query('toolbar [bulkOnly]'), function(editBtn) {
            editBtn.setDisabled(!hideBulkEditBtns);
        });

        Ext.resumeLayouts(true);
    },

    /**
     * Sets the title and path (url) based on the selection in the grid and the active tab in details panel.
     * @return {void}
     */
    syncState: function() {
        var me = this,
            manager = me.getManager(),
            personRecord = manager.getSelectedPerson(),
            extraParams = me.getPeoplePeopleStore().getProxy().extraParams,
            path = ['people'],
            title = 'People',
            activeTab = null;

        if (me.stateSyncSuspended) {
            me.stateSyncPending = true;
            return;
        }

        me.stateSyncPending = false;

        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '\u201c' + extraParams.q + '\u201d';
        } else if (personRecord) {
            path.push(personRecord.phantom ? 'create' : 'lookup');
        }

        if (personRecord && !personRecord.phantom) {
            if (personRecord.get('Username')) {
                path.push(personRecord.get('Username'));
            } else {
                path.push('?id='+personRecord.get('ID'));
            }

            title = personRecord.getFullName();

            activeTab = manager.getActiveDetailTab();

            if (activeTab) {
                path.push(activeTab.getItemId());
                title = activeTab.title + ' \u2014 ' + title;
            }
        }

        me.redirectTo(path);
        SlateAdmin.util.PageTitle.setTitle(title);
    },

    /**
     * Selects a person (or clears selection) and updates grid+manager state without firing any select/deselect events
     * @param {String|Slate.model.person.Person} person A username, an "?id=value" query string, or a person record
     * @param {Function} callback The callback function to perform
     * @return {void}
     */
    selectPerson: function(person, callback) {
        var me = this,
            store = me.getGrid().getStore(),
            handle = null;

        // resolve string handles against the loaded result set first
        if (Ext.isString(person)) {
            if (person.charAt(0) != '?') {
                handle = person;
                person = store.getAt(store.findExact('Username', person));
            } else if (person.indexOf('?id=') === 0) {
                handle = person.substr(4);
                person = store.getById(parseInt(handle, 10));
            } else {
                Ext.Msg.alert('Error', 'Unknown person field: ' + person.substr(1).split('=', 2)[0]);
                person = null;
                handle = null;
            }
        }

        if (person || !handle) {
            me.finishSelectPerson(person || null, callback);
            return;
        }

        // not in the result set — load the individual record by handle/id
        store.load({
            url: '/people/' + handle,
            callback: function(records, operation, success) {
                if (!success || !records.length) {
                    Ext.Msg.alert('Error', 'Could not find the group/person you requested');
                }

                me.finishSelectPerson(records && records[0] || null, callback);
            }
        });
    },

    // @private
    finishSelectPerson: function(personRecord, callback) {
        var me = this,
            selModel = me.getGrid().getSelectionModel();

        if (personRecord) {
            selModel.select(personRecord, false, true);
        } else {
            selModel.deselectAll(true);
        }

        me.getManager().setSelectedPerson(personRecord);
        me.syncGridStatus();
        me.syncState();
        Ext.callback(callback, me);
    }
});
