/**
 * Works around issue where thumbs beyond #2 get z-indexed
 * beneath the slider
 */
Ext.define('Jarvus.hotfixes.slider.ThumbsLimit', {
    override: 'Ext.slider.Multi',


    promoteThumb: function(topThumb) {
        var thumbs = this.thumbStack || (this.thumbStack = Ext.Array.slice(this.thumbs)),
            ln = thumbs.length,
            zIndex = 10000, i;

        // Move topthumb to position zero
        if (thumbs[0] !== topThumb) {
            Ext.Array.remove(thumbs, topThumb);
            thumbs.unshift(topThumb);
        }

        // Then shuffle the zIndices
        for (i = 0; i < ln; i++) {
            thumbs[i].el.setStyle('zIndex', zIndex);
            zIndex -= 10;
        }
    }
});