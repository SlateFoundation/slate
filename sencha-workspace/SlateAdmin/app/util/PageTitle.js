/**
 * Maintains the document title as "{context} — {site base title}".
 *
 * Successor to the title half of the retired Ext.util.History pushState
 * override: titles are set via document.title (plain text — no markup
 * interpretation), so user-derived context like search queries is safe.
 */
Ext.define('SlateAdmin.util.PageTitle', {
    singleton: true,

    separator: ' — ',

    baseTitle: null,

    /**
     * @param {String|null} title Context title, or null to restore the base title
     */
    setTitle: function(title) {
        var me = this;

        if (me.baseTitle === null) {
            me.baseTitle = document.title;
        }

        document.title = title
            ? title + me.separator + me.baseTitle
            : me.baseTitle;
    }
});
