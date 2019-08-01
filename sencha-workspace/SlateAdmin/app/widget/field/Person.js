Ext.define('SlateAdmin.widget.field.Person', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'slate-personfield',
    requires: [
        'Slate.model.person.Person'
    ],


    config: {
        appendQuery: null
    },

    store: {
        model: 'Slate.model.person.Person',
        proxy: {
            type: 'slate-records',
            url: '/people',
            summary: true
        }
    },
    allowBlank: false,
    queryMode: 'remote',
    queryParam: 'q',
    valueField: 'ID',
    displayField: 'SortName',
    autoSelect: false,
    triggerAction: 'query',
    minChars: 2,
    forceSelection: true,
    hideTrigger: true,
    listeners: {
        beforequery: function (qe) {
            if (!qe) {
                return false;
            }

            var appendQuery = this.getAppendQuery();

            if (appendQuery) {
                qe.query += ' ' + appendQuery;
            }
        }
    }
});