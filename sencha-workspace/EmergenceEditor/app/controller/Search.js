/**
 * Controls site-wide search
 *
 * Responsibilities:
 * - Handle `#search?*` routes, switching to a new or existing search results tab
 * - Load content if needed when a search results tab is activated
 */
Ext.define('EmergenceEditor.controller.Search', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'tab.Search'
    ],

    routes: {
        'search\\?:token': {
            action: 'showToken',
            conditions: {
                ':token': '(.+)'
            }
        }
    },

    refs: {
        searchForm: 'emergence-toolbar form#searchForm',

        tabPanel: 'emergence-tabpanel',

        searchTab: {
            forceCreate: true,

            xtype: 'emergence-tab-search',
            title: 'Search Results'
        }
    },

    control: {
        searchForm: {
            beforeaction: 'onBeforeFormSubmit'
        },
        'emergence-toolbar form#searchForm textfield': {
            specialkey: 'onFormSpecialKey'
        },
        'emergence-toolbar form#searchForm button[action=search]': {
            click: 'onSearchButtonClick'
        },
        'emergence-toolbar form#searchForm button[action=reset]': {
            click: 'onResetButtonClick'
        },
        'emergence-tab-search': {
            activate: 'onResultsActivate'
        }
    },


    // route handlers
    showToken: function(token) {
        var me = this,
            tabPanel = me.getTabPanel(),
            searchTab = tabPanel.findUsableTab('emergence-tab-search', token);

        if (searchTab) {
            searchTab.setToken(token);
        } else {
            searchTab = tabPanel.add(me.getSearchTab({
                token: token
            }));
        }

        tabPanel.setActiveTab(searchTab);
    },


    // event handlers
    onBeforeFormSubmit: function(formPanel) {
        this.redirectTo('search?'+formPanel.getValues(true));
        return false;
    },

    onFormSpecialKey: function(field, event) {
        if (event.getKey() == event.ENTER) {
            this.getSearchForm().submit();
        }
    },

    onSearchButtonClick: function() {
        this.getSearchForm().submit();
    },

    onResetButtonClick: function() {
        this.getSearchForm().reset();
    },

    onResultsActivate: function(searchTab) {
        if (!searchTab.getLoadNeeded()) {
            return;
        }

        searchTab.setLoadNeeded(false);

        searchTab.load({
            params: {
                content: searchTab.getContent(),
                contentFormat: searchTab.getContentFormat(),
                case: searchTab.getCase(),
                filename: searchTab.getFilename(),
                include: searchTab.getInclude(),
                path: searchTab.getPath()
            },
            callback: function(records, operation, success) {
                if (success) {
                    return;
                }

                // eslint-disable-next-line vars-on-top
                var errorMessage = 'Failed to load search results',
                    errorResponse = operation.getError().response;

                if (errorResponse && errorResponse.data && errorResponse.data.message) {
                    errorMessage += ':<p>'+errorResponse.data.message+'</p>';
                }

                Ext.Msg.alert('Search failed', errorMessage);
            }
        });
    }
});