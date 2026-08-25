/**
 * @abstract
 * Shared sections grid (term selector + my-classes filter) for the
 * progress report authoring sections; subclasses set xtype/componentCls
 * and their module's Sections store. Standardizes on the chained Terms
 * combo store one twin carried (the other bound the global Terms store
 * directly — one-sided drift, reconciled here).
 */
Ext.define('SlateAdmin.view.progress.AbstractSectionsGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.form.field.ComboBox',
        'Ext.form.field.Checkbox',
        'Ext.data.ChainedStore'
    ],


    width: 250,
    dockedItems: [
        {
            dock: 'top',

            xtype: 'toolbar',
            items: [
                {
                    itemId: 'termSelector',
                    flex: 1,

                    xtype: 'combobox',

                    store: {
                        type: 'chained',
                        source: 'Terms'
                    },
                    queryMode: 'local',
                    valueField: 'Handle',
                    displayField: 'Title',

                    forceSelection: true
                }
            ]
        },
        {
            dock: 'top',

            xtype: 'toolbar',
            items: [
                {
                    xtype: 'checkboxfield',
                    boxLabel: 'Show only my classes',
                    name: 'myClassesOnly'
                }
            ]
        }
    ],
    columns: [{
        flex: 1,

        text: 'Section',
        dataIndex: 'Code'
    }]
});
