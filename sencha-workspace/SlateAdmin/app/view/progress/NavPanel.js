/*jslint browser: true, undef: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'progress-navpanel',

    title: 'Student Progress',
    data: [
        {
            href: '#progress/standards', text: 'Standards Based Grades', 
            children: [{
                href: '#progress/standards/worksheets', text: 'Manage Worksheets'
            },{
                href: '#progress/standards/printing', text: 'Search & Print'
            }]
        }, { 
            href: '#progress/narratives', text: 'Narrative Reports', 
            children: [{
                href: '#progress/narratives/printing', text: 'Search & Print'
            }]
        }, {
            href: '#progress/interims', text: 'Interim Reports', 
            children: [{
                href: '#progress/interims/printing', text: 'Search & Print'
            },{
                href: '#progress/interims/email', text: 'Email'
            }] 
        }
    ]
});