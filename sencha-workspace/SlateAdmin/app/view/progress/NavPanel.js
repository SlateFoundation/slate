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
                href: '#progress/interims/report',
                children: [
                    {
                        text: 'Print / Export',
                        href: '#progress/interims/print'
                    },
                    {
                        text: 'Email',
                        href: '#progress/interims/email'
                    }
                ]
            },
            {
                text: 'Section Term Reports',
                href: '#progress/terms/report',
                children: [
                    {
                        text: 'Print / Export',
                        href: '#progress/terms/print'
                    },
                    {
                        text: 'Email',
                        href: '#progress/terms/email'
                    }
                ]
            }
        ];
    }
});