/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.Search', {
    extend: 'Ext.util.Observable',
    requires: [
        'Ext.DomHelper',
        'Ext.JSON',
        'Ext.XTemplate',
        'Ext.data.Connection',
        'Ext.util.DelayedTask'
    ],

    config: {
        searchForm: null,
        resultsVisible: false,
        url: '/search/json',
        searchFieldSelector: 'input[type=search]',
        searchDelay: 300,
        minChars: 2,
        groupResultsLimit: 5,
        interceptTabs: false,
        noResultsCls: 'no-results',
        noResultsText: 'No results',
        resultsTpl: [
            '<tpl foreach="results.data">',
                '<tpl if="values.length">',
                    '<section class="results-group">',
                        '<h1 class="group-title">{[this.getGroupTitle(xkey, values)]}</h1>',
                        '<tpl for="Ext.Array.slice(values, 0, parent.groupResultsLimit)">',
                            '<li class="search-result">{[this.renderModel(values)]}</li>',
                        '</tpl>',
                        '<tpl if="values.length &gt; parent.groupResultsLimit">',
                            '<li class="search-result"><a class="more-link" href="/search?q={[encodeURIComponent(parent.query)]}#results-{[xkey]}">{[values.length - parent.groupResultsLimit]} more&hellip;</a></li>',
                        '</tpl>',
                    '</section>',
                '</tpl>',
            '</tpl>',
            {
                getGroupTitle: function(modelClass, models) {
                    var modelWidget = modelClass && Ext.ClassManager.getByAlias('modelwidget.'+modelClass);
                    return modelWidget ? modelWidget.getCollectionTitle(models) : modelClass;
                },
                renderModel: function(model) {
                    var modelClass = model.Class,
                        modelWidget = modelClass && Ext.ClassManager.getByAlias('modelwidget.'+modelClass);

                    // <a href="#">{[values.Title||values.Username]}</a>
                    if (modelWidget) {
                        return modelWidget.getHtml(model);
                    } else {
                        return '['+(modelClass || 'unrenderable item')+']';
                    }
                }
            }
        ]
    },

    constructor: function(config) {
        var me = this;

        me.callParent(arguments);

        me.initConfig(config);

        me.searchTask = Ext.create('Ext.util.DelayedTask', me.doSearch, me);

        me.searchConnection = Ext.create('Ext.data.Connection', {
            url: me.getUrl(),
            method: 'GET',
            listeners: {
                scope: me,
                requestcomplete: me.onResults
            }
        });

        Ext.onReady(me.onDocReady, me);
    },

    applySearchForm: function(searchForm) {
        return Ext.get(searchForm);
    },

    applyResultsVisible: function(visible) {
        this.resultsCt && this.resultsCt.setStyle('display', visible ? '' : 'none');
    },

    applyResultsTpl: function(resultsTpl) {
        return (Ext.isObject(resultsTpl) && resultsTpl.isTemplate) ? resultsTpl : new Ext.XTemplate(resultsTpl);
    },

    onDocReady: function() {
        var me = this,
            searchForm = me.getSearchForm(),
            searchFieldSelector = me.getSearchFieldSelector(),
            fieldEl;

        if (!searchForm) {
            return;
        }

        fieldEl = me.fieldEl = searchForm.down(searchFieldSelector);

        me.resultsCt = searchForm.createChild({
            tag: 'ul',
            cls: 'search-results',
            style: {
                display: 'none'
            }
        });

//      searchForm.on('submit', 'onFormSubmit', me);
        searchForm.on('keydown', 'onFormKeyDown', me);

        if (fieldEl) {
            fieldEl.set({autocomplete: 'off'});
            fieldEl.on({
                scope: me,
                keyup: me.onFieldKeyUp,
                focus: me.onFieldFocus
            });
        }

        Ext.getBody().on('click', 'onBodyClick', me);
    },

//  onFormSubmit: function(ev, t) {
//      ev.stopEvent();
//      console.log('onFormSubmit', t);
//  },

    onFormKeyDown: function(ev, t) {
        var me = this,
            resultsCt = me.resultsCt,
            key = ev.getKey(),
            isDown = key == ev.DOWN,
            searchResults = resultsCt.query('.search-result'),
            searchResultsLength = searchResults.length,
            lastResultIndex = searchResultsLength - 1,
            targetSearchResult, targetSearchResultIndex,
            nextFocusIndex;

        if (!isDown && key != ev.UP) {
            if (me.getInterceptTabs() && key == ev.TAB) {
                isDown = !ev.shiftKey;
            } else {
                return;
            }
        }

        ev.stopEvent();

        if (!this.getResultsVisible()) {
            return;
        }

        targetSearchResult = ev.getTarget('.search-result', resultsCt);

        if (targetSearchResult) {
            targetSearchResultIndex = searchResults.indexOf(targetSearchResult);

            if((targetSearchResultIndex == 0 && !isDown) || (targetSearchResultIndex == lastResultIndex && isDown)) {
                me.fieldEl.focus();
                return;
            }

            nextFocusIndex = targetSearchResultIndex + (isDown ? 1 : -1);
        } else {
            nextFocusIndex = isDown ? 0 : lastResultIndex;
        }

        Ext.fly(searchResults[nextFocusIndex]).down('a').focus();
    },

    onFieldKeyUp: function(ev, t) {
        var me = this,
            resultsCt = me.resultsCt,
            query = t.value;

        if (me.lastTypedQuery == query) {
            return;
        }

        me.lastTypedQuery = query;

        if (t.value.length >= me.getMinChars()) {
            me.getSearchForm().addCls('is-waiting');
            me.setResultsVisible(true);
            me.searchTask.delay(me.getSearchDelay());
        } else {
            me.searchConnection.abort();
            me.setResultsVisible(false);
            me.resultsCt.update('');
            me.lastRequestedQuery = null;
        }
    },

    onFieldFocus: function(ev, t) {
        if (this.lastRequestedQuery) {
            this.setResultsVisible(true);
        }
    },

    onBodyClick: function(ev, t) {
        if (!ev.within(this.searchForm)) {
            this.setResultsVisible(false);
        }
    },

    onResults: function(connection, response) {
        var me = this,
            responseData = Ext.decode(response.responseText),
            resultsCt = me.resultsCt,
            noResultsCls = me.getNoResultsCls(),
            resultsTpl = me.getResultsTpl(),
            searchForm = me.getSearchForm();

        searchForm.removeCls('is-loading');

        if (responseData.totalResults) {
            searchForm.removeCls(noResultsCls);
            resultsTpl.overwrite(resultsCt, {
                results: responseData,
                groupResultsLimit: me.getGroupResultsLimit(),
                query: me.lastRequestedQuery
            });
        } else {
            resultsCt.update('<div class="empty-text">' + me.getNoResultsText() + '</div>');
            searchForm.addCls(noResultsCls);
        }
    },

    doSearch: function() {
        var me = this,
            fieldEl = me.fieldEl,
            searchForm = me.getSearchForm(),
            query = fieldEl && fieldEl.getValue();

        searchForm.removeCls('is-waiting');

        // abort any existing search
        me.searchConnection.abort();

        if (!query || query.length < me.getMinChars() || query == me.lastRequestedQuery) {
            return;
        }

        searchForm.addCls('is-loading');
        me.searchConnection.request({
            params: {
                q: query
            }
        });

        me.lastRequestedQuery = query;
    }
});