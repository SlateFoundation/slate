Ext.define('EmergenceConsoleTheme.dom.Shadow', {
    override: 'Ext.dom.Shadow',

// method copied from https://docs.sencha.com/extjs/6.2.0/modern/src/Shadow.js.html
    beforeShow: function() {
        var me = this,
            style = me.el.dom.style,
            shim = me.shim;

        if (Ext.supports.CSS3BoxShadow) {
// begin override
            // style[me.boxShadowProperty] = '0 0 ' + (me.offset + 2) + 'px #888';
            style[me.boxShadowProperty] = '0 0 ' + (me.offset + 2) + 'px rgba(0, 0, 0, .6)';
// end override
        } else {
            style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=" + me.opacity + ") progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (me.offset) + ")";
        }

        // if we are showing a shadow, and we already have a visible shim, we need to
        // realign the shim to ensure that it includes the size of target and shadow els
        if (shim) {
            shim.realign();
        }
    }
})