Ext.define('Jarvus.ace.Util', {
    requires: [
        'Ext.Promise',

        /* globals Jarvus */
        'Jarvus.ace.Loader',
    ],
    singleton: true,


    extensionModes: {
        tpl: 'smarty'
    },

    modeIcons: {
        default: 'code',
        text: 'file-text',
    },

    modeForPath: function(path) {
        var me = this;

        return new Ext.Promise(function(resolve, reject) {
            Jarvus.ace.Loader.withAce(function(ace) {
                var aceModelist = ace.require('ace/ext/modelist'),
                    mode;

                mode = aceModelist.modesByName[me.extensionModes[me.extension(path)]];

                if (!mode) {
                    mode = aceModelist.getModeForPath(path);
                }

                if (mode) {
                    resolve(mode);
                } else {
                    reject();
                }
            });
        });
    },

    iconForMode: function(mode, useDefault) {
        var modeIcons = this.modeIcons,
            icon = modeIcons[mode.name];

        if (!icon && useDefault !== false) {
            icon = modeIcons.default;
        }

        return icon || null;
    },

    basename: function(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    },

    extension: function(path) {
        return path.substr(path.lastIndexOf('.')+1);
    }
});