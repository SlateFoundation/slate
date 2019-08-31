Ext.define('SlateAdmin.view.people.details.Progress', {
    extend: 'SlateAdmin.view.people.details.AbstractDetails',
    xtype: 'people-details-progress',
    requires: [
        'Ext.grid.Panel',
        'Ext.data.ChainedStore'
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
        }, {
            xtype: 'button',
            text: 'Types',
            itemId: 'classesSelector',
            glyph: 0xf0ca, // fa-list-ul
            menu: {
                floating: true,
                items: [{
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Progress Notes',
                    value: 'Slate\\Progress\\Note'
                }, {
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Term Reports',
                    value: 'Slate\\Progress\\SectionTermReport'
                }, {
                    xtype: 'menucheckitem',
                    checked: true,
                    text: 'Interim Reports',
                    value: 'Slate\\Progress\\SectionInterimReport'
                }]
            }
        }, {
            xtype: 'tbspacer'
        }, {
            xtype: 'tbseparator'
        }, {
            xtype: 'tbtext',
            text: 'Term: '
        }, {
            flex: 1,
            xtype: 'combobox',
            itemId: 'termSelector',
            emptyText: 'Any',

            store: {
                type: 'chained',
                source: 'Terms'
            },
            queryMode: 'local',
            valueField: 'Handle',
            displayField: 'Title',

            forceSelection: true
        }]
    }, {
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                xtype: 'button',
                text: 'Export',
                action: 'export-reports',
                glyph: 0xf064 // fa-share
            },
            {
                action: 'launch-browser',
                text: 'Open',
                glyph: 0xf08e // fa-external-link
            }
        ]
    }],

    items: [{
        xtype: 'dataview',
        itemId: 'progressReportsList',
        store: 'people.ProgressReports',
        emptyText: '<div class="empty-text">No progress records found for selected type and term.</div>',
        autoScroll: true,
        itemSelector: '.person-record',
        tpl: [
            '<ol class="person-records rich-list">',
                '<tpl for=".">',
                    '<li class="person-record rich-list-item clickable">',
                        '<div class="meta">',
                            '<span class="datum token type">{Noun}</span>',
                            '<span class="datum author">{Author.Username}</span>',
                            '<tpl if="Timestamp">',
                                '<time class="datum token index date" datetime="{Timestamp:date(\'c\')}" title="{Timestamp:date(\'F j, Y, g:i a\')}">',
                                    '{Timestamp:date(\'M j, Y\')}<span class="token-extended">{Timestamp:date(\', Y, g:i a\')}</span>',
                                '</time>',
                            '</tpl>',
                        '</div>',
                        '<div class="description">{Title:htmlEncode}</div>',
                    '</li>',
                '</tpl>',
            '</ol>'
        ]
    }]
});