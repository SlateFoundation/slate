/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Header', {
    extend: 'Ext.Container',
    xtype: 'slateadmin-header',

    componentCls: 'slate-header',
    height: 50,
    layout: {
        type: 'hbox',
        align: 'middle'
    },
    defaultType: 'component',
    items: [{
        html: '<a class="header-link" href="/"><img class="header-logo" src="resources/images/slate-header-logo.png" width=54 height=40 alt="Slate"></a>'
    },{
        flex: 1
    },{
        cls: 'user-tools',
        tpl: [
            '<a class="user-link" href="/profile">',
                '<img class="user-avatar" src="<tpl if="PrimaryPhotoID">/thumbnail/{PrimaryPhotoID}/72x72/cropped<tpl else>/img/blank-avatar.png</tpl>" width=32 height=32>',
                '<span class="user-name">{FirstName} {LastName}</span>',
            '</a>',
            '<div class="header-separator"></div>',
            '<a class="logout-link" href="/logout">Log Out</a>'
        ],
        // TDOO: read & set from controller
        data: window.SiteUser
    }]  
});