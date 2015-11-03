/*jslint browser: true, undef: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'progress-navpanel',
 //TODO: Delete extra link when nav panel arrow collapse is fixed
    title: 'Student Progress',
    data: true,

    applyData: function(data) {
        if (data !== true) {
            return data;
        }

        return location.search.match(/\Wenablesbg(\W|$)/) ? [
            {
                href: '#progress/standards', text: 'Standards Based Grades',
                children: [{
                    href: '#progress/standards/worksheets', text: 'Manage Worksheets'
                },{
                    href: '#progress/standards/printing', text: 'Search & Print'
                }]
            }, {
                href: '#progress/standards/worksheets', text: 'Manage Worksheets'
            },{
                href: '#progress/standards/printing', text: 'Search & Print'
            }, {
                href: '#progress/narratives', text: 'Narrative Reports',
                children: [{
                    href: '#progress/narratives/printing', text: 'Search & Print'
                }]
            }, {
                href: '#progress/narratives/printing', text: 'Search & Print'
            }, {
                href: '#progress/interims', text: 'Interim Reports',
                children: [{
                    href: '#progress/interims/printing', text: 'Search & Print'
                },{
                    href: '#progress/interims/email', text: 'Email'
                }]
            }, {
                href: '#progress/interims/printing', text: 'Search & Print'
            },{
                href: '#progress/interims/email', text: 'Email'
            }
        ] : [
            {
                href: '#progress/narratives', text: 'Narrative Reports',
            }, {
                href: '#progress/narratives/printing', text: '↳ Search & Print'
            }
        ]
    }
});