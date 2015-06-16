/*jslint browser: true, undef: true, eqeq: true *//*global Ext,SlateAdmin*/
/**
 * People controller
 */
Ext.define('SlateAdmin.controller.People', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'SlateAdmin.API'
    ],

    // controller config
    views: [
        'people.NavPanel',
        'people.Manager'
    ],

    stores: [
        'people.People',
        'people.Groups',
        'people.GroupsTree',
        'people.AccountLevels'
    ],

    routes: {
        'people': 'showPeople',
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

    refs: [{
        ref: 'navPanel',
        selector: 'people-navpanel',
        autoCreate: true,

        xtype: 'people-navpanel'
    },{
        ref: 'searchField',
        selector: 'people-navpanel jarvus-searchfield'
    },{
        ref: 'advancedSearchForm',
        selector: 'people-navpanel people-advancedsearchform'
    },{
        ref: 'groupsTree',
        selector: 'people-navpanel #groups'
    },{
        ref: 'manager',
        selector: 'people-manager',
        autoCreate: true,

        xtype: 'people-manager'
    },{
        ref: 'grid',
        selector: 'people-grid'
    },{
        ref: 'exportResultsBtn',
        selector: 'people-grid #exportResultsBtn'
    },{
        ref: 'sendInvitationsBtn',
        selector: 'people-grid #sendInvitationsBtn'
    },{
        ref: 'selectionCountCmp',
        selector: 'people-grid #selectionCount'
    },{
        ref: 'exportColumnsMenu',
        selector: 'people-grid menu#csvExportColumns'
//    },{
//        ref: 'personMenu',
//        autoCreate: true,
//        selector: 'people-personmenu',
//        xtype: 'people-personmenu'
//    },{
//        ref: 'personHeader',
//        selector: 'people-manager #person-header'
//    },{
//        ref: 'peopleSearchField',
//        selector: 'people-navpanel textfield[inputType=search]'
//    },{
//        ref: 'personProfile',
//        selector: 'people-details-profile'
//    },{
//        ref: 'personCourses',
//        selector: 'people-details-courses'
//    },{
//        ref: 'personContacts',
//        selector: 'people-details-contacts'
//    },{
//        ref: 'personProgressNotes',
//        selector: 'people-details-progressnotes'
//    },{
//        ref: 'peopleSearchField',
//        selector: 'people-navpanel #peopleSearchField'
//    },{
//        ref: 'peopleSearchOptionsForm',
//        selector: 'people-navpanel #searchOptionsForm'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'people-navpanel': {
                expand: me.onNavPanelExpand
            },
            'people-navpanel jarvus-searchfield': {
                specialkey: me.onSearchSpecialKey,
                clear: me.onSearchClear
            },
            'people-navpanel people-advancedsearchform field': {
                specialkey: me.onAdvancedSearchFormSpecialKey
            },
            'people-navpanel button[action=search]': {
                click: me.onSearchClick
            },
            'people-navpanel #groups': {
                select: me.onGroupSelect
            },
            'people-grid': {
                select: { fn: me.onPersonSelect, buffer: 10 },
                deselect: { fn: me.onPersonDeselect, buffer: 10 }
            },
            'people-manager #detailTabs': {
                tabchange: me.onDetailTabChange
            },
            'people-grid button#exportResultsBtn menuitem[exportFormat]': {
                click: me.onExportFormatButtonClick
            },
            'people-grid menu#csvExportColumns': {
                beforeshow: me.onBeforeCsvExportColumnsMenuShow
            }
//            'people-grid #exportResultsBtn': {
//                click: me.onExportResultsClick
//            },
//            'people-grid #exportResultsBtn menu': {
//                afterrender: me.onExportMenuRendered,
//                exportfieldsrefill: me.onExportFieldsRefill
//            },
//            'people-grid #exportResultsBtn #exportTypeMenu menucheckitem': {
//                checkchange: me.onExportTypeChange
//            },
//            'people-grid #exportResultsBtn #exportFieldsMenu menucheckitem': {
//                checkchange: me.onExportFieldsChange
//            }
        });

        me.listen({
            store: {
                '#People': {
                    load: me.onStoreLoad
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
        var me = this,
            groupsTreePanel = me.getGroupsTree(),
            _selectRootNode = function() {
                groupsTreePanel.getSelectionModel().select(0, false, true);
            };

        Ext.suspendLayouts();
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(me.getManager());
        Ext.resumeLayouts(true);

        if (groupsTreePanel.rendered) {
            _selectRootNode();
        } else {
            groupsTreePanel.on('render', _selectRootNode);
        }
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
            ExtHistory = Ext.util.History,
            query = 'username:'+person;
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // queue store to load
        proxy.abortLastRequest(true);
        proxy.setExtraParam('q', query);

        // Clear searchfield, reset the advanced search form and select the root node of the navpanel's treepanel.
        me.getSearchField().setValue('');
        me.getAdvancedSearchForm().getForm().reset();
        me.getGroupsTree().getSelectionModel().select(0, false, true);

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // execute search (suppressed by doSearch if query hasn't changed) and select user
            me.doSearch(false, function() {
                // activate tab
                if (person && tab) {
                    manager.detailTabs.setActiveTab(tab);
                }

                // query has been performed so we can remove the q param so syncState() doesn't use it to change our path
                delete proxy.extraParams.q;

                me.selectPerson(person, function() {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts(true);
                });
            });
        }, 10);
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
            ExtHistory = Ext.util.History,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // decode query string for processing
        query = ExtHistory.decodeRouteComponent(query);
        person = ExtHistory.decodeRouteComponent(person);

        // queue store to load
        proxy.abortLastRequest(true);
        proxy.setExtraParam('q', query);

        // sync search field and form
        me.getSearchField().setValue(query);
        me.syncAdvancedSearchForm();

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // execute search (suppressed by doSearch if query hasn't changed) and select user
            me.doSearch(false, function() {
                // activate tab
                if (person && tab) {
                    manager.detailTabs.setActiveTab(tab);
                }

                me.selectPerson(person, function() {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts(true);
                });
            });
        }, 10);
    },


    // event handlers

    /**
     * Event Handler. Calls syncState when people-navpanel is expanded.
     * @param {SlateAdmin.view.people.NavPanel} navPanel The navigation panel
     */
    onNavPanelExpand: function() {
        this.syncState();
    },

    /**
     * Event Handler. Handles the inherited specialkey event of Jarvus.ext.form.field.Search .
     * If the key pressed is ENTER the query will be performed. If the key pressed is ENTER and the
     * search field is blank, the advanced search form will be reset.
     * @param {Jarvus.ext.form.field.Search} field The search field
     * @param {Ext.event.Event} ev The event object
     * @return {void}
     */
    onSearchSpecialKey: function(field, ev) {
        var query = field.getValue().trim();

        if (ev.getKey() == ev.ENTER) {
            if (query) {
                Ext.util.History.add(['people', 'search', query]);
            } else {
                this.getAdvancedSearchForm().getForm().reset();
            }
        }
    },

    /**
     * Event Handler. Resets the advanced search form and selects the root node of the navpanel's treepanel.
     * @param {Jarvus.ext.form.field.Search} field The search field
     * @param {Ext.event.Event} ev The event object
     * @return {void}
     */
    onSearchClear: function(field, ev) {
        this.getAdvancedSearchForm().getForm().reset();
        this.getGroupsTree().getSelectionModel().select(0, false, true);
    },

    /**
     * Event Handler. Handles the specialkey event of fields contained in SlateAdmin.view.people.AdvancedSearchForm.
     * If the key pressed is ENTER, syncQueryField will be called which updates the query string field
     * from the advanced search form.
     * @param {Ext.form.field.Base} field The advanced search form field
     * @param {Ext.event.Event} ev The event object
     * @return {void}
     */
    onAdvancedSearchFormSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER) {
            this.syncQueryField(true);
        }
    },

    /**
     * Event Handler. Handles the click event of the navpanel search button.  Calls syncQueryField to update
     * the query string field from the advanced search form.
     * @return {void}
     */
    onSearchClick: function() {
        this.syncQueryField(true);
    },

    /**
     * Event Handler. Handles the navpanel's treepanel select event.  Calls syncQueryField where the selected
     * group is added to the query string.
     * @return {void}
     */
    onGroupSelect: function() {
        this.syncQueryField(true);
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
     * @param {SlateAdmin.model.person.Person} personRecord The selected record
     * @param {Number} index The row index selected
     */
    onPersonSelect: function(selModel, personRecord, index) {
        var me = this,
            selectionCount = selModel.getCount();

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selectionCount == 1) {
            me.getManager().setSelectedPerson(personRecord);
            me.syncState();
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Event Handler. Handles the deselect event of the People grid. Calls onPersonSelect if deselect event
     * leaves one record selected.
     * @param {Ext.selection.RowModel} selModel The selection model
     * @param {SlateAdmin.model.person.Person} personRecord The selected record
     * @param {Number} index The row index selected
     */
    onPersonDeselect: function(selModel, personRecord, index) {
        var me = this,
            firstRecord;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            selModel.select(firstRecord);
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Event Handler. Calls syncState when active detail tab changes to that the change is reflected in the url
     */
    onDetailTabChange: function() {
        this.syncState();
    },

    onExportFormatButtonClick: function(menuItem) {
        var me = this,
            exportColumnsMenu = me.getExportColumnsMenu(),
            exportFormat = menuItem.exportFormat,
            params = Ext.applyIf({
                format: exportFormat
            }, me.getPeoplePeopleStore().getProxy().extraParams),
            url;

        if (exportFormat == 'json') {
            params.include = '*';
        } else if (exportFormat == 'csv') {
            params.columns = Ext.Array.pluck(exportColumnsMenu.query('menuitem[checked]'), 'itemId').join(',');
        }

        url = '/people?' + Ext.Object.toQueryString(params);

        if (exportFormat == 'json') {
            window.open(url, '_blank');
        } else {
            location.href = url;
        }
    },

    onBeforeCsvExportColumnsMenuShow: function(menu) {
        var me = this,
            columnsPlaceholder = menu.down('#columnsPlaceholder'),
            selectedFieldKeys = ['FirstName', 'LastName', 'Username', 'StudentNumber', 'GraduationYear', 'Advisor', 'PrimaryEmail'];

        if (menu.loaded) {
            return;
        }

        menu.loaded = true;

        columnsPlaceholder.show();

        SlateAdmin.API.request({
            method: 'GET',
            url: '/people/*fields',
            success: function(response) {
                var recordData = response.data,
                    fields = recordData.fields,
                    dynamicFields = recordData.dynamicFields,
                    menuItems = [],
                    key, keyBits;

                for (key in fields) {
                    if (!fields.hasOwnProperty(key)) {
                        continue;
                    }

                    if (key == 'RevisionID') {
                        continue;
                    }

                    keyBits = key.match(/(\w+)ID(s?)/);
                    if (keyBits && dynamicFields.hasOwnProperty(keyBits[1]+keyBits[2])) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: fields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'field'
                    });
                }

                for (key in dynamicFields) {
                    if (!dynamicFields.hasOwnProperty(key)) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: dynamicFields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'dynamicField'
                    });
                }

                Ext.suspendLayouts();
                menu.insert(menu.items.indexOf(columnsPlaceholder)+1, menuItems);
                columnsPlaceholder.hide();
                Ext.resumeLayouts(true);
            }
        });
    },

//    onExportMenuRendered: function(exportMenu) {
//        var grid = exportMenu.up('people-grid'),
//            exportItems = grid.getExportItems();
//
//        if(!exportItems) {
//            exportMenu.setLoading(true);
//
//            Ext.Ajax.request({
//                url: '/people/json/reportFields',
//                method: 'GET',
//                success: function(response) {
//                    var r = Ext.decode(response.responseText);
//                    grid.setExportItems(r.data);
//
//                    grid.fireEvent('exportfieldsloaded');
//
//                    exportMenu.setLoading(false);
//                }
//            });
//        }
//    },
//
//    onExportFieldsRefill: function(exportFields) {
//        var me = this,
//            grid = me.getPeopleGrid(),
//            exportMenu = me.getExportResultsBtn().menu;
//
//        if(grid.exportFieldsLoaded) {
//            grid.checkExportItems(exportFields);
//        } else {
//            grid.on('exportfieldsloaded', function() {
//                grid.checkExportItems(exportMenu.pendingCheckedFields);
//
//                exportMenu.pendingCheckedFields = false;
//            }, null, {single: true});
//        }
//    },
//
//    onExportTypeChange: function(field) {
//        field.up('menu').fireEvent('exportformatchange');
//    },
//
//    onExportFieldsChange: function(checkItem) {
//        checkItem.up('menu').fireEvent('exportformatchange');
//    },
//
//    onExportResultsClick: function(exportButton, evt) {
//        var checkItemsMenu = exportButton.menu,
//            grid = exportButton.up('people-grid'),
//            responseMode = checkItemsMenu.down('#exportTypeMenu menucheckitem[checked=true]').value,
//            exportItems = grid.getExportItems(),
//            checkedItems = checkItemsMenu.query('#exportFieldsMenu menucheckitem[checked=true]'),
//            loadedQuery = Ext.getStore('People').getProxy().extraParams,
//            queryParam = {
//                q: loadedQuery ? loadedQuery.q : ''
//            };
//
//            if(exportItems && checkedItems.length != exportItems.length) {
//                var exportFields = [];
//
//                for(var i=0; i<checkedItems.length; i++) {
//                    exportFields.push(checkedItems[i].value);
//                }
//                queryParam.exportFields = exportFields.join(',');
//            }
//
//            grid.setLoading('Exporting Students &hellip;');
//
//            Jarvus.util.CookieSniffer.downloadFile('/people/' + responseMode + '?' + Ext.Object.toQueryString(queryParam, true), function(){
//                grid.setLoading(false);
//            });
//    },


    // controller methods
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

    /**
     * Sets the title and path (url) based on the selection in the grid and the active tab in details panel.
     * @return {void}
     */
    syncState: function() {
        var me = this,
            manager = me.getManager(),
            selModel = me.getGrid().getSelectionModel(), // TODO: unused remove?
            detailTabs = manager.detailTabs,
            personRecord = manager.getSelectedPerson(),
            extraParams = me.getPeoplePeopleStore().getProxy().extraParams,
            path = ['people'],
            title = 'People',
            activeTab = null;

        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '&ldquo;' + extraParams.q + '&rdquo;';
        } else if(personRecord) {
            path.push('lookup');
        }

        if (personRecord) {
            if (personRecord.get('Username')) {
                path.push(personRecord.get('Username'));
            } else {
                path.push('?id='+personRecord.get('ID'));
            }

            title = personRecord.getFullName();

            activeTab = detailTabs.getActiveTab() || detailTabs.items.getAt(0);

            if (activeTab) {
                path.push(activeTab.getItemId());
                title = activeTab.title + ' &mdash; ' + title;
            }
        }

        Ext.util.History.pushState(path, title);
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
     * Updates the advanced search form from the query string field
     *
     * Inverse of {@link #method-syncQueryField}
     */
    syncAdvancedSearchForm: function() {
        var me = this,
            form = me.getAdvancedSearchForm().getForm(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName,
            groupsTreePanel = me.getGroupsTree(),
            rootGroupNode = me.getPeopleGroupsTreeStore().getRootNode(),
            query = me.getSearchField().getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term,
            values = {};

        // build map of keyed search terms
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex].split(/:/, 2);
            if (term.length == 2) {
                values[term[0]] = term[1];
            }
        }

        Ext.suspendLayouts();

        // sync advanced search fields from query term values
        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();

            if (fieldName in values) {
                field.setValue(values[fieldName]);
            } else {
                field.reset();
            }
        }

        // sync group selection
        if (values.group) {
            rootGroupNode.expand(false, function() {
                var groupNode = rootGroupNode.findChild('Handle', values.group, true);

                if (groupNode) {
                    groupsTreePanel.selectRecord(groupNode, false, true); // true to suppress select event because we're bringing the tree in-sync with an existing selection rather than making a new one
                }
            });
        } else {
            groupsTreePanel.selectRecord(rootGroupNode, false, true); // true to suppress select event because we're bringing the tree in-sync with an existing selection rather than making a new one
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Updates the query string field from the advanced search form.
     * Inverse of {@link #method-syncAdvancedSearchForm}
     * @param {Boolean} [execute=false] Will perform the query by adding the query string to Ext.util.History
     */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),
            form = me.getAdvancedSearchForm().getForm(),
            selectedGroups = me.getGroupsTree().getSelectionModel().getSelection(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName, fieldValue,
            query = searchField.getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm,
            fieldNames = [],
            unmatchedTerms = [],
            queuedTerms = [];

        // build list of field names and queued terms from advanced search form
        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();
            fieldValue = field.getValue();

            fieldNames.push(fieldName);

            if (fieldValue) {
                queuedTerms.push(fieldName + ':' + (fieldValue.match(/\s+/) ? '"' + fieldValue + '"' : fieldValue));
            }
        }

        // add selected group
        fieldNames.push('group');
        if (selectedGroups.length > 0 && (fieldValue = selectedGroups[0].get('Handle'))) {
            queuedTerms.push('group:'+fieldValue);
        }

        // scan query for terms that don't match a field
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex];
            splitTerm = term.split(/:/, 2);
            if (splitTerm.length != 2 || !Ext.Array.contains(fieldNames, splitTerm[0])) {
                unmatchedTerms.push(term);
            }
        }

        // build a query string that combines the unmatched terms with field values
        query = Ext.String.trim(Ext.Array.merge(unmatchedTerms, queuedTerms).join(' '));
        searchField.setValue(query);

        if (execute) {
            Ext.util.History.add(query ? ['people', 'search', query] : 'people');
        }
    },

    /**
     * Selects a person (or clears selection) and updates grid+manager state without firing any select/deselect events
     */
    selectPerson: function(person, callback) {
        var me = this,
            manager = me.getManager(),
            grid = me.getGrid(),
            store = grid.getStore(),
            selModel = grid.getSelectionModel(),
            personRecord, queryParts, fieldName, fieldValue,
            _finishSelectPerson;

        _finishSelectPerson = function() {
            if (personRecord) {
                selModel.select(personRecord, false, true);
            } else {
                selModel.deselectAll(true);
            }

            manager.setSelectedPerson(personRecord || null);
            me.syncGridStatus();
            me.syncState();
            Ext.callback(callback, me);
        };

        if (!person) {
           _finishSelectPerson();
        } else if (Ext.isString(person) && person.charAt(0) != '?') {
            personRecord = store.findRecord('Username', person);

            if (personRecord) {
                _finishSelectPerson();
            } else {
                // TODO: check if query params impacts this?
                store.load({
                    url: '/people/'+person,
                    callback: function(records, operation, success) {
                        if (!success || !records.length) {
                            Ext.Msg.alert('Error', 'Could not find the group/person you requested');
                        } else {
                            personRecord = records[0];
                        }

                        _finishSelectPerson();
                    }
                });
            }
        } else if (Ext.isString(person)) {
            queryParts = person.substr(1).split('=',2);
            fieldName = queryParts[0];
            fieldValue = queryParts[1];

            if (fieldName == 'id') {
                personRecord = store.getById(parseInt(fieldValue, 10));

                if (personRecord) {
                    _finishSelectPerson();
                } else {
                    // TODO: check if query params impacts this?
                    store.load({
                        url: '/people/'+fieldValue,
                        callback: function(records, operation, success) {
                            if (!success || !records.length) {
                                Ext.Msg.alert('Error', 'Could not find the person you requested');
                            } else {
                                personRecord = records[0];
                            }

                            _finishSelectPerson();
                        }
                    });
                }
            } else {
                Ext.Msg.alert('Error', 'Unknown person field: '+fieldName);
                _finishSelectPerson();
            }
        } else {
            personRecord = person;
            _finishSelectPerson();
        }
    }
});
