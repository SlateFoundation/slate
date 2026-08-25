/**
 * Owns the people search surfaces — the search field, the advanced search
 * form, and the groups tree — keeping them and the URL in sync. The People
 * controller owns routing/selection and delegates form-from-query syncing
 * here; all query execution flows through redirectTo, so the URL stays the
 * single source of truth.
 */
Ext.define('SlateAdmin.controller.people.Search', {
    extend: 'Ext.app.Controller',


    // controller config
    refs: {
        searchField: 'people-navpanel jarvus-searchfield',
        advancedSearchForm: 'people-navpanel people-advancedsearchform',
        groupsTree: 'people-navpanel #groups'
    },

    control: {
        'people-navpanel jarvus-searchfield': {
            specialkey: 'onSearchSpecialKey',
            clear: 'onSearchClear'
        },
        'people-navpanel people-advancedsearchform field': {
            specialkey: 'onAdvancedSearchFormSpecialKey'
        },
        'people-navpanel button[action=search]': {
            click: 'onSearchClick'
        },
        'people-navpanel #groups': {
            itemclick: 'onGroupSelect'
        }
    },


    // event handlers
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
                this.redirectTo(['people', 'search', query]);
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


    // controller methods
    /**
     * Updates the advanced search form from the query string field
     * Inverse of {@link #method-syncQueryField}
     * @return {void}
     */
    syncAdvancedSearchForm: function() {
        var me = this,
            form = me.getAdvancedSearchForm().getForm(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName,
            groupsTreePanel = me.getGroupsTree(),
            rootGroupNode = groupsTreePanel.getStore().getRootNode(),
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
     * @param {Boolean} [execute=false] If true, will perform the query by adding the query string to Ext.util.History
     * @return {void}
     */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),
            form = me.getAdvancedSearchForm().getForm(),
            selectedGroups = me.getGroupsTree().getSelectionModel().getSelection(),
            rootGroupSelected = false,
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
            fieldValue = field.getSubmitValue();

            fieldNames.push(fieldName);

            if (fieldValue) {
                queuedTerms.push(fieldName + ':' + (fieldValue.match(/\s+/) ? '"' + fieldValue + '"' : fieldValue));
            }
        }

        // add selected group
        fieldNames.push('group');
        if (selectedGroups.length > 0 && (fieldValue = selectedGroups[0].get('Handle'))) {
            if (fieldValue !== 'slate-internal-people-root-node') {
                // push group if it is not the root node
                queuedTerms.push('group:'+fieldValue);
            } else {
                rootGroupSelected = true;
            }
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

        if (!query && rootGroupSelected) {
            // if there's no query and root group is selected, redirect to people/all
            me.redirectTo('people/all');
            return;
        }

        searchField.setValue(query);

        if (execute) {
            me.redirectTo(query ? ['people', 'search', query] : 'people');
        }
    }
});
