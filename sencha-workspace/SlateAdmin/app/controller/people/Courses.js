/*jslint browser: true, undef: true *//*global Ext*/
/**
 * people.Courses controller
 */
Ext.define('SlateAdmin.controller.people.Courses', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.details.Courses'
    ],

    stores: [
        'Terms@Slate.store'
    ],

    refs: {
        coursesPanel: {
            selector: 'people-details-courses',
            autoCreate: true,

            xtype: 'people-details-courses'
        },
        coursesGrid: 'people-details-courses grid',
        personCoursesTermSelector: 'people-details-courses #courseTermSelector'
    },

    control: {
        'people-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'people-details-courses': {
            personloaded: 'onPersonLoaded'
        },
        'people-details-courses combobox[name=courseTermSelector]': {
            change: 'onCourseTermSelect'
        }
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getCoursesPanel());
    },

    onPersonLoaded: function(coursesPanel, person) {
        var me = this,
            personSectionsStore = me.getCoursesGrid().getStore(),
            personSectionsProxy = personSectionsStore.getProxy(),
            termsStore = me.getTermsStore(),
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

        if (
            !selectedTerm
            && (selectedTerm = termsStore.getCurrentTerm())
        ) {
            // push selected term to combo
            termSelector.setSelection(selectedTerm);

            // switch to int
            selectedTerm = selectedTerm.getId();
        }

        coursesPanel.setLoading(false);

        // configure proxy and load store
        personSectionsProxy.url = '/people/' + person.get('ID') + '/courses';
        personSectionsProxy.setExtraParam('termID', selectedTerm || null);
        personSectionsStore.load();
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
