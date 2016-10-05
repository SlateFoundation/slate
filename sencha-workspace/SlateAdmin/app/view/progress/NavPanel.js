Ext.define('SlateAdmin.view.progress.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'progress-navpanel',


    title: 'Student Progress',
    data: true,

    applyData: function(data) {
        if (data !== true) {
            return data;
        }

        return [
            {
                text: 'Section Interim Reports',
                href: '#progress/interims',
                children: [
                    {
                        text: 'Search & Print',
                        href: '#progress/interims/print'
                    }
                    // {
                    //     text: 'Email',
                    //     href: '#progress/interims/email'
                    // }
                ]
            },
            {
                text: 'Section Term Reports',
                href: '#progress/narratives',
                children: [
                    {
                        text: 'Search & Print',
                        href: '#progress/narratives/print'
                    }
                    // {
                    //     text: 'Email',
                    //     href: '#progress/narratives/email'
                    // }
                ]
            }
        ];
    }
});