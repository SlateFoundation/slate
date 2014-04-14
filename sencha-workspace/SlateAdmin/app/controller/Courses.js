/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Courses', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'courses.NavPanel'

//      ,'courses.Manager'
    ],

    stores: [
        'Sections',
        'SectionStudents'
    ],

    routes: {
        'courses': 'showCourses',
        'courses/:sectionPath': {
            action: 'showCourses',
            conditions: {
                ':sectionPath': 'sections/.+'
            }
        },
        'courses/enrolled': 'showEnrolledCourses',
        'courses/enrolled/:sectionPath': {
            action: 'showEnrolledCourses',
            conditions: {
                ':sectionPath': 'sections/.+'
            }
        },
        'courses/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+'
            }
        },
        'courses/search/:query/:sectionPath': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':sectionPath': 'sections/.+'
            }
        }
    },

    refs: [{
        ref: 'coursesNavPanel',
        selector: 'courses-navpanel',
        autoCreate: true,
        
        xtype: 'courses-navpanel'
    },{
        ref: 'coursesManager',
        selector: 'courses-manager',
        autoCreate: true,

        xtype: 'courses-manager'
    },{
        ref: 'courseGrid',
        selector: 'courses-grid',

        xtype: 'courses-grid'
    },{
        ref: 'termSelector',
        selector: 'courses-grid #courseGridTermSelector'
    },{
        ref: 'courseHeader',
        selector: 'course-header'
    },{
        ref: 'courseRosterGrid',
        selector: 'course-rostergrid'
    },{
        ref: 'coursesSearchField',
        selector: 'courses-navpanel textfield[inputType=search]'
    },{
        ref: 'courseEditor',
        selector: 'course-editor'
    }],


    // controller template methods
    init: function() {
        var me = this;
        me.doBufferedExecuteSearch = Ext.Function.createBuffered(me.doExecuteSearch, 1000);

        me.control({
            'courses-grid combobox[action=termSelector]': {
                change: me.onCourseTermChange
            },
            'courses-grid': {
                select: me.onCourseSelect
            },
            'courses-navpanel textfield[inputType=search]': {
                specialkey: me.onSearchSpecialKey
            }
        });

    },

    buildNavPanel: function() {
        return 'courses-navpanel';
    },


    // route handlers
    showCourses: function(sectionPath) {
        this.doShowCourses(true, sectionPath);
    },
    showEnrolledCourses: function(sectionPath) {
        this.doShowCourses(false, sectionPath);
    },

    doShowCourses: function(allCourses, sectionPath) {
        var me = this,
            viewportCt = me.application.getController('Viewport').getCardCt(),
            layout = viewportCt.getLayout(),
            coursesManager = me.getCoursesManager(),
            searchField = me.getCoursesNavPanel().down('form #searchField');

        searchField.reset();
        console.log('showing courses');
        if(sectionPath) {
            if(layout.getActiveItem() != coursesManager) {
                me.application.loadCard(coursesManager);
            }

            me.selectCourse(sectionPath);

        }
        else {
            me.doSearch({AllCourses:allCourses, query: null});
        }
    },

    showResults: function(query, sectionPath){
        var me = this,
            store = Ext.getStore('Sections'),
            coursesManager = me.getCoursesManager(),
            proxy = store.getProxy(),
            viewportCt = me.application.getController('Viewport').getCardCt(),
            layout = viewportCt.getLayout(),
            searchField = me.getCoursesNavPanel().down('form #searchField'),
            trimmedQuery, searchValues;


        query = Ext.util.History.decodeRouteComponent(query);

        // queue store to load
        proxy.abortLastRequest(true);

        searchField.setValue(query);

        if(layout.getActiveItem() != coursesManager) {
            me.application.loadCard(coursesManager);
        }

        console.log('loading search')

        if(sectionPath) {
            me.selectCourse(sectionPath);
        } else {
            proxy.markParamsDirty();
            me.doSearch({AllCourses: true, query: query});
        }
    },


    // event handlers
    onCourseSelect: function(selModel, record, index) {
        var me = this,
            path = 'courses',
            manager = me.getCoursesManager(),
            extraParams = Ext.getStore('Sections').getProxy().extraParams;

        if(extraParams) {
            if(extraParams.q){
                path += '/search/'+me.encodeHashString(extraParams.q);
            }
            else if(!extraParams.AllCourses) {
                path += '/enrolled';
            }
        }

        path += '/sections/'+record.get('Code');

        manager.updateSection(record);
        me.application.fireEvent('courseselected', record, me);

        Ext.util.History.add(path);
    },

    onCourseTermChange: function(field, newValue, oldValue) {
        this.doSearch({TermID: newValue});
    },

    onSearchSpecialKey: function(field, ev) {
        if(ev.getKey() == ev.ENTER) {
            Ext.util.History.add('courses/search/'+this.encodeHashString(field.getValue()));
        }
    },


    // controller methods
    selectCourse: function(sectionPath) {
        var me = this,
            grid = me.getCourseGrid(),
            sectionCode = sectionPath.split('/')[1],
            selModel = grid.getSelectionModel(),
            store = Ext.getStore('Sections');


        if(!sectionCode) {
            selModel.deselectAll();
            return true;
        } else if(Ext.isString(sectionCode)) {
            var courseRecord = store.findExact('Code', sectionCode);

            if(courseRecord >= 0) {
                selModel.select(courseRecord);
            } else {
                store.loadPage(1, {
                    params:{
                        q: 'code:'+sectionCode,
                        TermID: null
                    },
                    callback: function(records, operation, success) {
                    //  console.log(records, success, records);
                        if(!success || !records.length) {
                            console.log(arguments);
                            Ext.Msg.alert('Error','Could not find the course section you requested');
                        }
                        else
                            selModel.select(records[0]);
                    }
                });
            }

            return true;
        } else {
            selModel.select(sectionCode);
            return true;
        }

        return false;
    },

    doSearch: function(params) {
        params = params || {};

        var me = this,
            coursesManager = me.getCoursesManager(),
            store = Ext.getStore('Sections'),
            proxy = store.getProxy(),
            viewportCt = me.application.getController('Viewport').getCardCt(),
            layout = viewportCt.getLayout(),
            searchFilters = coursesManager.getCourseFilters(),
            searchParams = Ext.applyIf(params, searchFilters);


        if(layout.getActiveItem() != coursesManager) {
            me.application.loadCard(coursesManager);
        }


        proxy.setExtraParam('AllCourses', searchParams.AllCourses);
        proxy.setExtraParam('TermID', searchParams.TermID);
        proxy.setExtraParam('q', searchParams.query);

        coursesManager.setCourseFilters(searchParams);
        me.doBufferedExecuteSearch();
    },

    doExecuteSearch: function(forceReload, callback) {
        var store = Ext.getStore('Sections'),
            proxy = store.getProxy();

        if(forceReload || proxy.isExtraParamsDirty() || !store.isLoaded()) {
            store.removeAll();
            store.loadPage(1, {
                callback: callback,
                scope: this
            });
        }
    }
});