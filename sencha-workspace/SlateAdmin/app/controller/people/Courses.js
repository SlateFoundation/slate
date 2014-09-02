/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.people.Courses', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.details.Courses'
    ],

    refs: [{
        ref: 'coursesPanel',
        selector: 'people-details-courses',
        autoCreate: true,
        
        xtype: 'people-details-courses'
    },{
        ref: 'coursesGrid',
        selector: 'people-details-courses grid'
    },{
        ref: 'personCoursesTermSelector',
        selector: 'people-details-courses #courseTermSelector'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'people-manager #detailTabs': {
                beforerender: me.onBeforeTabsRender
            },
            'people-details-courses': {
                personloaded: me.onPersonLoaded
            },
            'people-details-courses combobox[name=courseTermSelector]': {
                change: me.onCourseTermSelect
            }
        });
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getCoursesPanel());
    },
    
    onPersonLoaded: function(coursesPanel, person) {
        var me = this,
            personSectionsStore = me.getCoursesGrid().getStore(),
            personSectionsProxy = personSectionsStore.getProxy(),
            termsStore = Ext.getStore('Terms'),
            termSelector = me.getPersonCoursesTermSelector(),
            selectedTerm = termSelector.getValue();
            
        // ensure terms are loaded
        if (!termsStore.isLoaded()) {
            coursesPanel.setLoading('Loading terms&hellip;');
            termsStore.load({
                callback: function() {
                    me.onPersonLoaded(coursesPanel, person);
                }
            });

            return;
        }
        
        if (!selectedTerm) {
            selectedTerm = termsStore.getCurrentTerm();
            if (selectedTerm) {
                selectedTerm = selectedTerm.getId();
            }
        }
        
        coursesPanel.setLoading(false);

        // configure proxy and load store
        personSectionsProxy.url = '/people/' + person.get('ID') + '/courses';
        personSectionsProxy.setExtraParam('termID', selectedTerm);
        personSectionsStore.load();

        // push selected term to combo
        termSelector.setValue(selectedTerm);
    },

    onCourseTermSelect: function(field, newValue, oldValue) {
        var me = this,
            personSectionsStore = me.getCoursesGrid().getStore(),
            personSectionsProxy = personSectionsStore.getProxy();
        
        personSectionsProxy.setExtraParam('termID', newValue);

        if (personSectionsProxy.isExtraParamsDirty()) {
            personSectionsStore.load();
        }
    }
});