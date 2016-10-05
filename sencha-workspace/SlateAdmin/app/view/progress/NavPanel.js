/*jslint browser: true, undef: true *//*global Ext*/
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

        return [
            {
                href: '#progress/interims', text: 'Section Interim Reports',
                children: [
                    {
                        href: '#progress/interims/print', text: 'Search & Print'
                    }
                    // {
                    //     href: '#progress/interims/email', text: 'Email'
                    // }
                ]
            },
            {
                href: '#progress/narratives', text: 'Section Term Reports',
                children: [
                    {
                        href: '#progress/narratives/print', text: 'Search & Print'
                    }
                    // {
                    //     href: '#progress/narratives/email', text: 'Email'
                    // }
                ]
            }
        ];
    }
});