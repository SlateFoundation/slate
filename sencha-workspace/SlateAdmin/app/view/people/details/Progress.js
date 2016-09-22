/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.details.Progress', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-progress',
    requires: [
        'Ext.grid.Panel'
    ],


    title: 'Progress',
    glyph: 0xf095,
    itemId: 'progress',

    layout: 'fit',

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            text: 'New Note',
            action: 'composeNote',
            cls: 'glyph-success',
            glyph: 0xf055 // fa-plus-circle
        },{
            xtype: 'button',
            text: 'Types',
            itemId: 'reportTypes',
            glyph: 0xf0ca, // fa-list-ul
            menu: {
                floating: true,
                items: [{
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Progress Notes',
                    value: 'progressnotes'
                },{
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Narratives',
                    value: 'narratives'
                },{
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Interims',
                    value: 'interims'
                },{
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Standards',
                    value: 'standards'
                }]
            }
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'tbtext',
            text: 'Term: '
        },{
            flex: 1,
            xtype: 'combobox',
            itemId: 'progressReportsTermSelector',
            name: 'progressReportsTermSelector',
            emptyText: 'Any',
            store: 'Terms',
            valueField: 'ID',
            displayField: 'Title',
            queryMode: 'local',
            forceSelection: true
        }]
    },{
        xtype: 'toolbar',
        dock: 'bottom',
        items: ['->',{
            xtype: 'button',
            text: 'Export',
            action: 'export-reports',
            glyph: 0xf064 // fa-share
        }]
    }],

    items: [{
        xtype: 'dataview',
        itemId: 'progressReportsList',
        store: 'people.ProgressReports',
        itemSelector: '.person-record',
        emptyText: '<div class="empty-text">No progress records found for selected type and term.</div>',
        autoScroll: true,
        tpl: [
            '<ol class="person-records rich-list">',
                '<tpl for=".">',
                    '<li class="person-record rich-list-item clickable">',
                        '<div class="meta">',
                            '<span class="datum token type">{Type}</span>',
                            '<span class="datum author">{AuthorUsername}</span>',
                            '<time class="datum token index date" datetime="{Date:date(\'c\')}" title="{Date:date(\'F j, Y, g:i a\')}">',
                            '{Date:date(\'M j, Y\')}',
                            '<span class="token-extended">{Date:date(\', Y, g:i a\')}</span>',
                            '</time>',
                        '</div>',
                        '<div class="description">{Subject}</div>',
                    '</li>',
                '</tpl>',
            '</ol>'
        ]
    }]
});