Ext.define('SlateAdmin.view.LinksNavPanel', {
    extend: 'Ext.Panel',
    xtype: 'links-navpanel',
    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.Routing'
    ],

    config: {
        activeLink: null
    },

    tpl: [
        '<ul class="slate-nav-list">',
        '    <tpl for=".">',

        '        <li class="slate-nav-list-item">',
        '            <a class="slate-nav-list-link <tpl if="selected">selected</tpl>" href="{href}">{text}</a>',
        '        </li>',

        '        <tpl for="children">',
        '            <li class="slate-nav-list-item">',
        '                <a class="slate-nav-list-link <tpl if="selected">selected</tpl>" href="{href}">&#x2937; {text}</a>',
        '            </li>',
        '        </tpl>',

        '    </tpl>',
        '</ul>'
    ],

    onRender: function() {
        var me = this,
            activeLink = me.getActiveLink();

        me.callParent(arguments);

        if (Ext.isString(activeLink)) {
            me.setActiveLink(activeLink);
        }
    },

    applyActiveLink: function(link) {
        if (Ext.isArray(link)) {
            link = SlateAdmin.util.Routing.encodeRouteArray(link);
        }

        if (Ext.isString(link) && this.rendered) {
            link = this.getTargetEl().down('a[href="#'+link+'"]') || link;
        }

        return link;
    },

    updateActiveLink: function(newLink, oldLink) {
        var me = this;

        if (me.rendered) {
            if (newLink && !Ext.isString(newLink)) {
                newLink.addCls('selected');
            }

            if (oldLink && !Ext.isString(oldLink)) {
                oldLink.removeCls('selected');
            }
        }
    }
});