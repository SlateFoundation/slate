// using mid-gray is a poor way to lighten a shadow
// (shows up too light on a dark background)
// here we replace it with a semi-transparent black

// based on 6.0.2 classic

Ext.define('SlateTheme.dom.Shadow', {
    override: 'Ext.dom.Shadow',

    beforeShow: function() {
        var me = this,
            style = me.el.dom.style,
            shim = me.shim;

        if (Ext.supports.CSS3BoxShadow) {
// begin changes
            style[me.boxShadowProperty] = '0 0 ' + (me.offset + 2) + 'px rgba(0,0,0,.4)';
// end changes
        } else {
            style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=" + me.opacity + ") progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (me.offset) + ")";
        }

        // if we are showing a shadow, and we already have a visible shim, we need to
        // realign the shim to ensure that it includes the size of target and shadow els
        if (shim) {
            shim.realign();
        }
    }
});