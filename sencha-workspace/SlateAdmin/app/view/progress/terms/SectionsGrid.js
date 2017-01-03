Ext.define('SlateAdmin.view.progress.terms.SectionsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-terms-sectionsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Checkbox'
    ],


    width: 250,
    store: 'progress.terms.Sections',
    componentCls: 'progress-terms-grid',
    dockedItems: [
        {
            dock: 'top',

            xtype: 'toolbar',
            items: [
                {
                    itemId: 'termSelector',
                    flex: 1,

                    xtype: 'combobox',

                    queryMode: 'local',
                    store: 'Terms',
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
