exports.init = function(runtime) {
    runtime.register({
        tint: function(color, percentage) {
            // http://compass-style.org/reference/compass/helpers/colors/#tint
            return this.mix(new Fashion.ColorRGBA(255, 255, 255, 1), color, percentage);
        }
    });
};