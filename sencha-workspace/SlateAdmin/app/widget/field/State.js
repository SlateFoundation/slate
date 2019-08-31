/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.field.State', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'slate-statefield',
    
    width: 50,
    forceSelection: true,
    emptyText: 'ST',
    store: ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
});