/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Courses', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox'
    ],


    // controller config
    views: [
        'courses.NavPanel',
        'courses.sections.Manager'
    ],

    stores: [
        'courses.Departments',
        'courses.Schedules',
        'courses.Teachers',
        'courses.Courses',
        'courses.SectionsResult',
        'Terms@Slate.store',
        'Locations@Slate.store',
        'courses.Courses',
        'courses.Schedules'
//        'SectionStudents'
    ],

    models: [
        'course.Section'
    ],

    routes: {
        'courses': 'showResults',
        'course-sections': 'showResults',

        'course-sections/create': 'showCreateSection',

        'course-sections/lookup/:section': {
            action: 'showSection',
            conditions: {
                ':section': '([^/]+)'
            }
        },
        'course-sections/lookup/:section/:tab': {
            action: 'showSection',
            conditions: {
                ':section': '([^/]+)'
            }
        },

        'course-sections/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)'
            }
        },
        'course-sections/search/:query/:section': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)',
                ':section': '([^/]+)'
            }
        },
        'course-sections/search/:query/:section/:tab': {
            action: 'showResults',
            conditions: {
                ':query': '([^/]+)',
                ':section': '([^/]+)',
                ':tab': '([^/]+)'
            }
        }
//        'courses/enrolled': 'showEnrolledCourses',
//        'courses/enrolled/:sectionPath': {
//            action: 'showEnrolledCourses',
//            conditions: {
//                ':sectionPath': '(sections/.+)'
//            }
//        },
//        'courses/search/:query': {
//            action: 'showResults',
//            conditions: {
//                ':query': '([^/]+)'
//            }
//        },
//        'courses/search/:query/:sectionPath': {
//            action: 'showResults',
//            conditions: {
//                ':query': '([^/]+)',
//                ':sectionPath': '(sections/.+)'
//            }
//        }
    },

    refs: {
        navPanel: {
            selector: 'courses-navpanel',
            autoCreate: true,

            xtype: 'courses-navpanel'
        },
        termSelector: 'courses-navpanel field[name=term]',
        sectionsManager: {
            selector: 'courses-sections-manager',
            autoCreate: true,

            xtype: 'courses-sections-manager'
        },
        sectionsGrid: 'courses-sections-grid'
    },

    control: {
        'courses-navpanel': {
            beforeexpand: 'onNavPanelBeforeExpand'
        },
        'courses-navpanel field': {
            specialkey: 'onNavFieldSpecialKey'
        },
        'courses-navpanel button[action=search]': {
            click: 'onSearchClick'
        },
        'courses-navpanel button[action=reset]': {
            click: 'onResetClick'
        },
        'courses-sections-manager': {
            sectioncommit: 'onSectionCommit'
        },
        'courses-sections-grid': {
            select: { fn: 'onSectionSelect', buffer: 10 },
            deselect: { fn: 'onSectionDeselect', buffer: 10 }
        },
        'courses-sections-manager #detailTabs': {
            tabchange: 'onDetailTabChange'
        }
//            'courses-grid combobox[action=termSelector]': {
//                change: 'onCourseTermChange'
//            },
//            'courses-grid': {
//                select: 'onCourseSelect'
//            },
//            'courses-navpanel textfield[inputType=search]': {
//                specialkey: 'onSearchSpecialKey'
//            }
    },


    // controller template methods
    init: function() {
        // var me = this;

//        me.listen({
//            store: {
//                '#courses.SectionsResult': {
//                    prefetch: me.onResultsFetch
//                }
//            }
//        });
    },

    buildNavPanel: function() {
        return this.getNavPanel();
    },


    // route handlers
    showSection: function(section, tab) {
        var me = this,
            ExtHistory = Ext.util.History,
            sectionsResultStore = me.getCoursesSectionsResultStore(),
            sectionsManager = me.getSectionsManager();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // decode query string for processing
        section = me.decodeRouteComponent(section);

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(sectionsManager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // activate tab
            if (section && tab) {
                sectionsManager.detailTabs.setActiveTab(tab);
            }

            me.selectSection(section, function() {
                ExtHistory.resumeState();
                Ext.resumeLayouts(true);
            });
        }, 10);
    },

    showCreateSection: function() {
        var me = this,
            ExtHistory = Ext.util.History,
            sectionsManager = me.getSectionsManager(),
            selectedSection = sectionsManager.getSelectedSection();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(sectionsManager);

        // select phantom section if one isn't already loaded
        if (!selectedSection || !selectedSection.phantom) {
            me.selectSection(me.getCourseSectionModel().create());
        }

        ExtHistory.resumeState();
        Ext.resumeLayouts(true);
    },

    showResults: function(query, section, tab) {
        var me = this,
            ExtHistory = Ext.util.History,
            termsStore = me.getTermsStore(),
            sectionsManager = me.getSectionsManager(),
            sectionsResultStore = me.getCoursesSectionsResultStore(),
            sectionsResultProxy = sectionsResultStore.getProxy(),
            termSelector, currentTerm;

        // apply default query
        if (!query) {
            // ensure terms are loaded
            if (!termsStore.isLoaded()) {
                sectionsManager.setLoading('Loading terms&hellip;');
                termsStore.on('load', function() {
                    sectionsManager.setLoading(false);
                    me.showResults(query, section, tab);
                }, me, { single: true });

                if (!termsStore.isLoading()) {
                    termsStore.load();
                }

                return;
            }

            termSelector = me.getTermSelector();
            currentTerm = termsStore.getCurrentTerm();
            if (termSelector && currentTerm) {
                query = 'term:'+currentTerm.get('Handle');
            }
        } else if (query == '*') {
            query = '';
        }

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // decode query string for processing
        query = me.decodeRouteComponent(query);
        section = me.decodeRouteComponent(section);

        // queue store to load
        sectionsResultProxy.abortLastRequest(true);
        sectionsResultProxy.setExtraParam('q', query);

        // sync search field and form
        me.syncSearchForm();

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(sectionsManager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // execute search (suppressed by doSearch if query hasn't changed) and select user
            me.doSearch(false, function() {
                // activate tab
                if (section && tab) {
                    sectionsManager.detailTabs.setActiveTab(tab);
                }

                me.selectSection(section, function() {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts(true);
                });
            });
        }, 10);
    },


    // event handlers
    onNavPanelBeforeExpand: function(navPanel) {
        Ext.util.History.pushState('course-sections', 'Course Sections');
    },

    onNavFieldSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER) {
            this.executeSearch();
        }
    },

    onSearchClick: function() {
        this.executeSearch();
//        var me = this,
//            sectionsGrid = me.getSectionsGrid(),
//            sectionsResultStore = me.getCoursesSectionsResultStore();
//
//        sectionsGrid.reconfigure(sectionsResultStore);
//        sectionsResultStore.loadPage(1);
    },

    onResetClick: function() {
        this.getNavPanel().getForm().reset();
        this.executeSearch();
    },

    onSectionCommit: function() {
        this.syncState();
    },

    onResultsFetch: function(sectionsResultStore, records, successful, operation) {
        var coursesStore = this.getCoursesCoursesStore(),
            rawData = sectionsResultStore.getProxy().getReader().rawData,
            courses = rawData.related && rawData.related.Course;

        if (courses) {
            coursesStore.loadData(courses, true);
        }
    },

    onSectionSelect: function(selModel, sectionRecord, index) {
        var me = this,
            selectionCount = selModel.getCount();

        Ext.suspendLayouts();

        if (selectionCount == 1) {
            me.getSectionsManager().setSelectedSection(sectionRecord);
            me.syncState();
        }

        Ext.resumeLayouts(true);
    },

    onSectionDeselect: function(selModel, sectionRecord, index) {
        var me = this,
            firstRecord;

        Ext.suspendLayouts();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            me.onSectionSelect(selModel, firstRecord, firstRecord.index);
        }

        Ext.resumeLayouts(true);
    },

    onDetailTabChange: function(detailTabs, activeTab) {
        this.syncState();
    },


    // controller methods
    doSearch: function(forceReload, callback) {
        var me = this,
            grid = me.getSectionsGrid(),
            store = me.getCoursesSectionsResultStore(),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty() || (!store.isLoading() && !store.isLoaded())) {
            proxy.abortLastRequest(true);
            me.getSectionsManager().setSelectedSection(null);
            grid.getSelectionModel().clearSelections();
            store.removeAll();

            grid.setLoading('Preparing to search&hellip;');
            Ext.StoreMgr.requireLoaded(['Terms', 'Locations', 'courses.Courses', 'courses.Schedules'], function() {
                grid.setLoading(false);
                store.loadPage(1, {
                    callback: callback,
                    scope: me
                });
            });
        } else {
            Ext.callback(callback, me);
        }
    },

    syncState: function() {
        var me = this,
            sectionsManager = me.getSectionsManager(),
            selModel = me.getSectionsGrid().getSelectionModel(),
            detailTabs = sectionsManager.detailTabs,
            sectionRecord = sectionsManager.getSelectedSection(),
            extraParams = me.getCoursesSectionsResultStore().getProxy().extraParams,
            isLookup = sectionRecord && !sectionRecord.phantom,
            path = ['course-sections'],
            title = 'Course Sections',
            activeTab = null;

        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '&ldquo;' + extraParams.q + '&rdquo;';
        } else if(isLookup) {
            path.push('lookup');
        }

        if (isLookup) {
            path.push(sectionRecord.get('Code'));
            title = sectionRecord.get('Title');

            activeTab = detailTabs.getActiveTab() || detailTabs.items.getAt(0);

            if (activeTab) {
                path.push(activeTab.getItemId());
                title = activeTab.title + ' &mdash; ' + title;
            }
        } else if (sectionRecord) {
            path.push('create');
            title = 'Create section';
        }

        Ext.util.History.pushState(path, title);
    },

    /**
     * Selects a section (or clears selection) and updates grid+manager state without firing any select/deselect events
     */
    selectSection: function(section, callback) {
        var me = this,
            sectionsManager = me.getSectionsManager(),
            sectionsGrid = me.getSectionsGrid(),
            sectionsResultStore = me.getCoursesSectionsResultStore(),
            selModel = sectionsGrid.getSelectionModel(),
            oldSelectedRecord = sectionsManager.getSelectedSection(),
            sectionId, queryParts,
            _finishSelectSection;

        _finishSelectSection = function(sectionRecord, forceDeselect) {
            if (sectionRecord && !forceDeselect) {
                if (-1 == sectionsResultStore.indexOf(sectionRecord)) {
                    sectionsResultStore.loadRecords([sectionRecord]);
                }

                selModel.select(sectionRecord, false, true);
                sectionsGrid.ensureVisible(sectionRecord);
            } else {
                selModel.deselectAll(true);
            }

            sectionsManager.setSelectedSection(sectionRecord || null);
            me.syncState();
            Ext.callback(callback, me);
        };

        // defer selection if store is already loading
        if (sectionsResultStore.isLoading()) {
            sectionsResultStore.on('load', function() {
                me.selectSection(section, callback);
            }, me, {single: true});

            return;
        }

        // selection is being cleared
        if (!section) {
           return _finishSelectSection();
        }

        // section is already a loaded model
        if (section.isModel) {
            return _finishSelectSection(section, section.phantom); // force deselect if this is a phantom model
        }

        // section is a string containing an id query or a section code
        if (section.charAt(0) == '?') {
            queryParts = section.substr(1).split('=', 2);
            sectionId = parseInt(queryParts[1], 10);

            if (queryParts[0] != 'id' || !sectionId) {
                Ext.Msg.alert('Error', 'Only id query with integer value is supported');
                return _finishSelectSection();
            }

            if (oldSelectedRecord && oldSelectedRecord.getId() == sectionId) {
                section = oldSelectedRecord;
            } else {
                try {
                    section = sectionsResultStore.getById(sectionId);
                } catch(err) {
                    section = null;
                }
            }
        } else {
            sectionId = section;

            if (oldSelectedRecord && oldSelectedRecord.get('Code') == sectionId) {
                section = oldSelectedRecord;
            } else {
                section = sectionsResultStore.getAt(sectionsResultStore.findExact('Code', sectionId));
            }
        }

        // model was found in loaded result set
        if (section) {
            return _finishSelectSection(section);
        }

        // model needs to be loaded from server and rendered without a result set
        sectionsGrid.setLoading('Preparing to load course&hellip;');
        sectionsResultStore.getProxy().resetExtraParams();
        Ext.StoreMgr.requireLoaded(['Terms', 'Locations', 'courses.Courses', 'courses.Schedules'], function() {
            sectionsGrid.setLoading(false);
            sectionsResultStore.load({
                url: '/sections/'+sectionId,
                callback: function(records, operation, success) {
                    if (!success || !records.length) {
                        Ext.Msg.alert('Error', 'Could not find the course section you requested');
                    }

                    _finishSelectSection(records && records[0]);
                }
            });
        });
    },

    syncSearchForm: function() {
        var me = this,
            form = me.getNavPanel().getForm(),
            query = me.getCoursesSectionsResultStore().getProxy().extraParams.q || '',
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm, field,
            unmatchedTerms = [];

        Ext.suspendLayouts();

        form.reset();

        // distribute terms between named fields and unmatched terms queue
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex];
            splitTerm = term.split(/:/, 2);

            if (splitTerm.length == 2 && (field = form.findField(splitTerm[0]))) {
                field.setValue(splitTerm[1]);
            } else {
                unmatchedTerms.push(term);
            }
        }

        form.findField('query').setValue(unmatchedTerms.join(' '));

        Ext.resumeLayouts(true);
    },

    executeSearch: function() {
        var me = this,
            sectionsResultStore = me.getCoursesSectionsResultStore(),
            formValues = me.getNavPanel().getForm().getValues(),
            queryTerms = [];

        Ext.Object.each(formValues, function(fieldName, fieldValue) {
            if (!fieldValue) {
                return;
            }

            if (fieldName == 'query') {
                queryTerms.push(fieldValue);
            } else {
                queryTerms.push(fieldName + ':' + fieldValue);
            }
        });

        Ext.util.History.pushState(['course-sections', 'search', queryTerms.join(' ') || '*']);
    }







//    showEnrolledCourses: function(sectionPath) {
//        this.doShowCourses(false, sectionPath);
//    },
//
//    doShowCourses: function(allCourses, sectionPath) {
//        var me = this,
//            viewportCt = me.application.getController('Viewport').getCardCt(),
//            layout = viewportCt.getLayout(),
//            coursesManager = me.getCoursesManager(),
//            searchField = me.getCoursesNavPanel().down('form #searchField');
//
//        searchField.reset();
//        console.log('showing courses');
//        if(sectionPath) {
//            if(layout.getActiveItem() != coursesManager) {
//                me.application.loadCard(coursesManager);
//            }
//
//            me.selectCourse(sectionPath);
//
//        }
//        else {
//            me.doSearch({AllCourses:allCourses, query: null});
//        }
//    },
//
//    showResults: function(query, sectionPath){
//        var me = this,
//            store = Ext.getStore('Sections'),
//            coursesManager = me.getCoursesManager(),
//            proxy = store.getProxy(),
//            viewportCt = me.application.getController('Viewport').getCardCt(),
//            layout = viewportCt.getLayout(),
//            searchField = me.getCoursesNavPanel().down('form #searchField'),
//            trimmedQuery, searchValues;
//
//
//        query = me.decodeRouteComponent(query);
//
//        // queue store to load
//        proxy.abortLastRequest(true);
//
//        searchField.setValue(query);
//
//        if(layout.getActiveItem() != coursesManager) {
//            me.application.loadCard(coursesManager);
//        }
//
//        console.log('loading search')
//
//        if(sectionPath) {
//            me.selectCourse(sectionPath);
//        } else {
//            proxy.markParamsDirty();
//            me.doSearch({AllCourses: true, query: query});
//        }
//    },
//
//
//    // event handlers
//    onCourseSelect: function(selModel, record, index) {
//        var me = this,
//            path = 'courses',
//            manager = me.getCoursesManager(),
//            extraParams = Ext.getStore('Sections').getProxy().extraParams;
//
//        if(extraParams) {
//            if(extraParams.q){
//                path += '/search/'+me.encodeHashString(extraParams.q);
//            }
//            else if(!extraParams.AllCourses) {
//                path += '/enrolled';
//            }
//        }
//
//        path += '/sections/'+record.get('Code');
//
//        manager.updateSection(record);
//        me.application.fireEvent('courseselected', record, me);
//
//        Ext.util.History.add(path);
//    },
//
//    onCourseTermChange: function(field, newValue, oldValue) {
//        this.doSearch({TermID: newValue});
//    },
//
//    onSearchSpecialKey: function(field, ev) {
//        if(ev.getKey() == ev.ENTER) {
//            Ext.util.History.add('courses/search/'+this.encodeHashString(field.getValue()));
//        }
//    },
//
//
//    // controller methods
//    selectCourse: function(sectionPath) {
//        var me = this,
//            grid = me.getCourseGrid(),
//            sectionCode = sectionPath.split('/')[1],
//            selModel = grid.getSelectionModel(),
//            store = Ext.getStore('Sections');
//
//
//        if(!sectionCode) {
//            selModel.deselectAll();
//            return true;
//        } else if(Ext.isString(sectionCode)) {
//            var courseRecord = store.findExact('Code', sectionCode);
//
//            if(courseRecord >= 0) {
//                selModel.select(courseRecord);
//            } else {
//                store.loadPage(1, {
//                    params:{
//                        q: 'code:'+sectionCode,
//                        TermID: null
//                    },
//                    callback: function(records, operation, success) {
//                    //  console.log(records, success, records);
//                        if(!success || !records.length) {
//                            console.log(arguments);
//                            Ext.Msg.alert('Error','Could not find the course section you requested');
//                        }
//                        else
//                            selModel.select(records[0]);
//                    }
//                });
//            }
//
//            return true;
//        } else {
//            selModel.select(sectionCode);
//            return true;
//        }
//
//        return false;
//    },
//
//    doSearch: function(params) {
//        params = params || {};
//
//        var me = this,
//            coursesManager = me.getCoursesManager(),
//            store = Ext.getStore('Sections'),
//            proxy = store.getProxy(),
//            viewportCt = me.application.getController('Viewport').getCardCt(),
//            layout = viewportCt.getLayout(),
//            searchFilters = coursesManager.getCourseFilters(),
//            searchParams = Ext.applyIf(params, searchFilters);
//
//
//        if(layout.getActiveItem() != coursesManager) {
//            me.application.loadCard(coursesManager);
//        }
//
//
//        proxy.setExtraParam('AllCourses', searchParams.AllCourses);
//        proxy.setExtraParam('TermID', searchParams.TermID);
//        proxy.setExtraParam('q', searchParams.query);
//
//        coursesManager.setCourseFilters(searchParams);
//        me.doBufferedExecuteSearch();
//    },
//
//    doExecuteSearch: function(forceReload, callback) {
//        var store = Ext.getStore('Sections'),
//            proxy = store.getProxy();
//
//        if(forceReload || proxy.isExtraParamsDirty() || !store.isLoaded()) {
//            store.removeAll();
//            store.loadPage(1, {
//                callback: callback,
//                scope: this
//            });
//        }
//    }
});
