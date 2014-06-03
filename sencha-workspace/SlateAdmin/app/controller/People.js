/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.People', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.NavPanel',

        'people.Manager'
//      ,'people.PersonMenu'
    ],

    stores: [
        'People',
        'people.AccountLevels'
    ],

    routes: {
        'people': 'showPeople',
        'people/lookup/:person': 'showPerson',
        'people/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+'
            }
        },
        'people/search/:query/:person': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':person': '[^/]+'
            }
        },
        'people/search/:query/:person/:tab': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':person': '[^/]+',
                ':tab': '[^/]+'
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
        selector: 'people-navpanel searchfield'
    },{
        ref: 'advancedSearchForm',
        selector: 'people-navpanel #advancedSearchForm'
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
            'people-navpanel searchfield': {
                specialkey: me.onSearchSpecialKey,
                clear: me.onSearchClear
            },
            'people-navpanel #advancedSearchForm field': {
                specialkey: me.onAdvancedSearchFormSpecialKey
            },
            'people-navpanel button[action=search]': {
                click: me.onAdvancedSearchFormSearchClick
            },
            'people-grid': {
                select: { fn: me.onPersonSelect, buffer: 10 },
                deselect: { fn: me.onPersonDeselect, buffer: 10 }
            },
            'people-manager #detailTabs': {
                tabchange: me.onDetailTabChange
            }
//            'people-navpanel fieldset #groupsMenu': {
//                select: me.onGroupSelect
//            },
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

    buildNavPanel: function() {
        return this.getNavPanel();
    },


    // route handlers
    showPeople: function() {
        this.application.loadCard(this.getManager());
    },

    showPerson: function(person) {
//        debugger;
    },

    showResults: function(query, person, tab) {
        var me = this,
            ExtHistory = Ext.util.History,
            store = me.getPeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        //decode query string for processing
        query = ExtHistory.decodeRouteComponent(query);
        person = ExtHistory.decodeRouteComponent(person);

        // queue store to load
        proxy.abortLastRequest(true);
        proxy.setExtraParam('q', query);

        // sync search field and form
        me.getSearchField().setValue(query);
        me.syncAdvancedSearchForm();

        // activate manager
        me.application.loadCard(manager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // execute search (suppressed by doSearch if query hasn't changed) and select user
            me.doSearch(false, function() {
                if (person) {
                    // activate tab
                    if (tab) {
                        manager.detailTabs.setActiveTab(tab);
                    }

                    me.selectPerson(person, function() {
                        ExtHistory.resumeState();
                        Ext.resumeLayouts(true);
                    });
                } else {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts(true);
                }
            });
        }, 10);
    },


    // event handlers
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
    
    onSearchClear: function(field, ev) {
        this.getAdvancedSearchForm().getForm().reset();
    },
    
    onAdvancedSearchFormSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER) {
            this.syncQueryField(true);
        }
    },
    
    onAdvancedSearchFormSearchClick: function() {
        this.syncQueryField(true);
    },

    onStoreLoad: function() {
        this.syncGridStatus();
    },

    onPersonSelect: function(selModel, record, index) {
        var me = this,
            selectionCount = selModel.getCount(),
            path = ['people'],
            manager = me.getManager(),
            detailTabs = manager.detailTabs,
            extraParams = me.getPeopleStore().getProxy().extraParams,
            activeTab = null;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selectionCount == 1) {
            manager.setSelectedPerson(record);

            me.syncState();

            me.application.fireEvent('personselected', record, me);
        }

        Ext.resumeLayouts(true);
    },

    onPersonDeselect: function(selModel, record, index) {
        var me = this,
            firstRecord;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            me.onPersonSelect(selModel, firstRecord, firstRecord.index);
        }

        Ext.resumeLayouts(true);
    },

    onDetailTabChange: function(detailTabs, activeTab) {
        this.syncState();
    },

//    onGroupSelect: function(selModel, record, index) {
//        var me = this,
//            peopleManager = me.getPeopleManager(),
//            queryArray = [],
//            form = me.getPeopleSearchOptionsForm(),
//            values = form.getValues(false, false, false, true);
//
//        for(var key in values) {
//
//            queryArray.push({
//                field: key,
//                value: values[key]
//            });
//        }
//
//        queryArray.push({value:record.get('Handle'), field:'group'});
//
//        Ext.util.History.add('people/search/'+me.encodeHashString(me.concatFieldsToQuery(queryArray)));
//    },
//
//    onSearchOptionChange: function(field, newValue) {
//        var me = this,
//            form = me.getPeopleSearchOptionsForm(),
//            values = form.getValues(false, false, false, true)//Won't return combo's that have just had their value changed to blank unless i pass these params,
//            queryArray = [],
//            query,
//            searchValue = me.getPeopleSearchField().getValue(),
//            manager = me.getPeopleManager(),
//            loadedQuery = Ext.getStore('People').getProxy().extraParams;
//
//        for(var key in values) {
//            queryArray.push({
//                field: key,
//                value: values[key]
//            });
//        }
//
//        query = me.concatFieldsToQuery(queryArray, loadedQuery.q);
//
//        if(searchValue != loadedQuery.q || loadedQuery.q != query) {
//            loadedQuery.q = query;
//        }
//        else{
//            return;
//        }
//
//
//
//        Ext.util.History.add('people/search/'+me.encodeHashString(query));
//    },
//
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
//    concatFieldsToQuery: function(fields, loadedQuery) {
//        var loadedQueryArray,
//            j;
//
//        for(j = 0; j<fields.length; j++) {
//            var field = fields[j].field,
//                value = fields[j].value,
//                foundFieldQuery = false,
//                queryString = field+':' + value;
//
//            if(loadedQuery) {
//                loadedQueryArray = loadedQuery.split(' ');
//
//                for(var i = 0; i<loadedQueryArray.length && !foundFieldQuery; i++) {
//                    var regexField = new RegExp('^'+field+':');
//                    if(regexField.test(loadedQueryArray[i])) {
//
//                        if(value) {
//                            loadedQueryArray[i] = queryString;
//                        } else {
//                            delete loadedQueryArray[i];
//                        }
//                        foundFieldQuery = true;
//                    }
//                }
//
//
//                loadedQuery = loadedQueryArray.join(' ');
//            }
//
//            if(loadedQuery && value && !foundFieldQuery) {
//                loadedQuery += ' '+queryString;
//            } else if (!loadedQuery && value) {
//                loadedQuery = queryString;
//            }
//        }
//
//        return loadedQuery.trim();
//    },
//
    doSearch: function(forceReload, callback) {
        var me = this,
            store = Ext.getStore('People'),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            me.getManager().setSelectedPerson(null);
            store.removeAll();
            me.getGrid().getSelectionModel().clearSelections();
            store.load({
                callback: callback,
                scope: me
            });
        } else {
            Ext.callback(callback, me);
        }
    },

    syncState: function() {
        var me = this,
            selModel = me.getGrid().getSelectionModel(),
            manager = me.getManager(),
            detailTabs = manager.detailTabs,
            personRecord = manager.getSelectedPerson(),
            extraParams = me.getPeopleStore().getProxy().extraParams,
            path = ['people'],
            activeTab = null;


        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
        }

        if (personRecord) {
            if (personRecord.get('Username')) {
                path.push(personRecord.get('Username'));
            } else {
                path.push('?id='+personRecord.get('ID'));
            }

            activeTab = detailTabs.getActiveTab() || detailTabs.items.getAt(0);
            path.push(activeTab.getItemId());
        }

        Ext.util.History.pushState(path);
    },

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
            query = me.getSearchField().getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term,
            values = {};

        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex].split(/:/, 2);
            if (term.length == 2) {
                values[term[0]] = term[1];
            }
        }

        Ext.suspendLayouts();

        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();

            if (fieldName in values) {
                field.setValue(values[fieldName]);
            } else {
                field.reset();
            }
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Updates the query string field from the advanced search form
     *
     * Inverse of {@link #method-syncAdvancedSearchForm}
     */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),
            form = me.getAdvancedSearchForm().getForm(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName, fieldValue,
            query = searchField.getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm,
            fieldNames = [],
            unmatchedTerms = [],
            queuedTerms = [];

        // build list of field names and queued terms
        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();
            fieldValue = field.getValue();

            fieldNames.push(fieldName);

            if (fieldValue) {
                queuedTerms.push(fieldName + ':' + (fieldValue.match(/\s+/) ? '"' + fieldValue + '"' : fieldValue));
            }
        }

        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex];
            splitTerm = term.split(/:/, 2);
            if (splitTerm.length != 2 || !Ext.Array.contains(fieldNames, splitTerm[0])) {
                unmatchedTerms.push(term);
            }
        }

        query = Ext.Array.merge(unmatchedTerms, queuedTerms).join(' ');
        searchField.setValue(query);

        if (execute) {
            Ext.util.History.add(['people', 'search', query]);
        }
    },

    selectPerson: function(person, callback) {
        var me = this,
            manager = me.getManager(),
            grid = me.getGrid(),
            store = grid.getStore(),
            selModel = grid.getSelectionModel(),
            personRecord, queryParts, fieldName, fieldValue;

        if (!person) {
            selModel.deselectAll();
            Ext.callback(callback, me);
            return true;
        } else if (Ext.isString(person) && person.charAt(0) != '?') {
            personRecord = store.findExact('Username', person);

            if (personRecord >= 0) {
                selModel.select(personRecord);
                Ext.callback(callback, me);
            } else {

                store.load({
                    url: '/people/json/'+person,
                    callback: function(records, operation, success) {
                        if (!success || !records.length) {
                            Ext.Msg.alert('Error','Could not find the group/person you requested');
                        } else {
                            selModel.select(records[0]);
                        }

                        Ext.callback(callback, me);
                    }
                });
            }

            return true;
        } else if (Ext.isString(person)) {
            queryParts = person.substr(1).split('=',2);
            fieldName = queryParts[0];
            fieldValue = queryParts[1];

            if (fieldName == 'id') {
                personRecord = store.getById(parseInt(fieldValue, 10));

                if (personRecord) {
                    selModel.select(personRecord);
                    Ext.callback(callback, me);
                } else {
                    store.load({
                        url: '/people/json/'+fieldValue,
                        callback: function(records, operation, success) {
                            if (!success || !records.length) {
                                Ext.Msg.alert('Error','Could not find the person you requested');
                            } else {
                                selModel.select(records[0]);
                            }

                            Ext.callback(callback, me);
                        }
                    });
                }

                return true;
            } else {
                Ext.Msg.alert('Error', 'Unknown person field: '+fieldName);

                Ext.callback(callback, me);
                return false;
            }
        } else {
            selModel.select(person);

            Ext.callback(callback, me);
            return true;
        }

        return false;
    }
});