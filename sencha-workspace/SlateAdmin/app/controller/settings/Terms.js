Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'SlateAdmin.controller.settings.AbstractTreeManagerController',


    // controller config
    managerRoute: 'settings/terms',
    managerTitle: 'Terms — Settings',
    loadingMessage: 'Loading terms&hellip;',
    deleteConfirmTitle: 'Deleting Term',
    deleteConfirmMessage: 'Are you sure you want to delete this term?',

    views: [
        'settings.terms.Manager'
    ],

    stores: [
        'Terms@Slate.store'
    ],

    routes: {
        'settings/terms': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        managerPanel: {
            selector: 'terms-manager',
            autoCreate: true,

            xtype: 'terms-manager'
        }
    },

    control: {
        managerPanel: {
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            browsecoursesclick: 'onBrowseCoursesClick',
            createtermclick: 'onCreateChildClick',
            deletetermclick: 'onDeleteRecordClick'
        },
        'terms-manager button[action=create-term]': {
            click: 'onCreateClick'
        }
    },

    listen: {
        store: {
            '#Terms': {
                beforeload: 'onBeforeStoreLoad',
                load: 'onStoreLoad'
            }
        }
    },


    // event handlers
    onManagerPanelActivate: function() {
        this.getTermsStore().loadIfDirty();
        this.syncManagerState();
    },

    onBrowseCoursesClick: function(grid, record) {
        this.redirectTo(['course-sections', 'search', 'term:' + record.get('Handle')]);
    },


    // controller methods
    buildNodeData: function(parentRecord) {
        if (!parentRecord) {
            return {};
        }

        // child terms start spanning their parent's dates
        return {
            StartDate: parentRecord.get('StartDate'),
            EndDate: parentRecord.get('EndDate')
        };
    }
});
