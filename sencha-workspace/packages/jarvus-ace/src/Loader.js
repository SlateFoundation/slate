Ext.define('Jarvus.ace.Loader', {
    singleton: true,
    mixins: [
        'Ext.mixin.Observable',
        'Ext.Promise'
    ],

    config: {
        autoLoad: true,
        disableCaching: false,
        modules: [
            'ext-modelist.js',
            'ext-searchbox.js',
            'ext-whitespace.js',
            'mode-html.js',
            'mode-php.js',
            'mode-javascript.js',
            'mode-css.js',
            'mode-json.js',
            'mode-scss.js',
            'mode-sass.js',
            'mode-smarty.js',
            'mode-yaml.js',
            'mode-xml.js',
            'mode-svg.js',
            'mode-sh.js',
            'mode-sql.js',
            'mode-markdown.js',
            'mode-jsx.js',
            'worker-css.js',
            'worker-html.js',
            'worker-javascript.js',
            'worker-json.js',
            'worker-php.js',
            'theme-tomorrow_night_bright.js'
        ]
    },

    ready: false,

    constructor: function(config) {
        var me = this;

        me.mixins.observable.constructor.call(me, config);

        if (me.getAutoLoad()) {
            Ext.onReady(me.load, me);
        }
    },

    load: function() {
        var me = this,
            modules = me.getModules(),
            disableCaching = me.getDisableCaching(),
            previousDisableCaching;

        if (me.ready || me.loading) {
            return;
        }

        me.loading = true;

        if (disableCaching !== null) {
            previousDisableCaching = Ext.Loader.getConfig('disableCaching');
            Ext.Loader.setConfig('disableCaching', disableCaching);
        }

        Ext.Loader.loadScript({
            url: Ext.resolveResource('<@jarvus-ace>ace/ace.js'),
            onLoad: function() {
                Ext.Loader.loadScript({
                    url: Ext.Array.map(modules, function(module) {
                        return Ext.resolveResource('<@jarvus-ace>ace/'+module);
                    }),
                    onLoad: function() {
                        if (disableCaching !== null) {
                            Ext.Loader.setConfig('disableCaching', previousDisableCaching);
                        }

                        me.ready = true;
                        me.loading = false;
                        me.fireEvent('aceready', window.ace);
                    }
                });
            },
            onError: function() {
                Ext.Logger.error('Failed to load ace');
            }
        });
    },

    withAce: function(onReady, scope) {
        var me = this;

        scope = scope || me;

        if (me.ready) {
            Ext.callback(onReady, scope, [window.ace]);
        } else {
            me.on('aceready', onReady, scope, { single: true });

            if (!me.loading) {
                me.load();
            }
        }
    },

    getAce: function() {
        var me = this;

        return new Ext.Promise(function(resolve) {
            me.withAce(resolve);
        });
    },

    loadDiff: function() {
        var me = this,
            disableCaching = me.getDisableCaching(),
            previousDisableCaching;

        if (me.diffReady || me.diffLoading) {
            return;
        }

        me.diffLoading = true;

        if (disableCaching !== null) {
            previousDisableCaching = Ext.Loader.getConfig('disableCaching');
            Ext.Loader.setConfig('disableCaching', disableCaching);
        }

        Ext.Loader.loadScript({
            url: [
                Ext.resolveResource('<@jarvus-ace>diff_match_patch.js'),
                Ext.resolveResource('<@jarvus-ace>ace-diff.js')
            ],
            onLoad: function() {
                if (disableCaching !== null) {
                    Ext.Loader.setConfig('disableCaching', previousDisableCaching);
                }

                me.diffReady = true;
                me.diffLoading = false;
                me.fireEvent('diffready', window.AceDiff);
            }
        });
    },

    withDiff: function(onReady, scope) {
        var me = this;

        scope = scope || me;

        me.withAce(function() {
            if (me.diffReady) {
                Ext.callback(onReady, scope, [window.AceDiff]);
            } else {
                me.on('diffready', onReady, scope, { single: true });

                if (!me.diffLoading) {
                    me.loadDiff();
                }
            }
        });
    },

    getDiff: function() {
        var me = this;

        return new Ext.Promise(function(resolve) {
            me.withDiff(resolve);
        });
    },
});