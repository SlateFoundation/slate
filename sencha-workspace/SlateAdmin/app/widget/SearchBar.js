/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.SearchBar', {
    extend: 'Ext.Container',
    xtype: 'slateadmin-searchbar',

    componentCls: 'slate-search-bar',
    items: [{
        xtype: 'textfield',
        cls: 'slate-search-field',
        emptyText: 'Search&hellip;',
        itemId: 'searchField',
        inputType: 'search',
        selectOnFocus: true,
        width: '100%'
    }]  
});