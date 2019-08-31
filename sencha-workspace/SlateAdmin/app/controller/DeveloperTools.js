/**
 * This controller is only loaded in development builds and provides extra tools for developers.
 *
 * Developer features are enabled by adding flags to the page's query string, for example:
 *
 * .../?**loglayouts**
 *
 * ## Available flags
 *
 *  - **loglayouts**: log a message to the console every time a layout run completes
 *  - **breakonlayout**: break every time a layout run completes so that the call stack that causes them can be traced
 *  - **traceonlayout**: print a stack trace each time there is a layout
 */
Ext.define('SlateAdmin.controller.DeveloperTools', {
    extend: 'Ext.app.Controller',

    init: function() {
        console.warn('DeveloperTools controller active');

        var me = this,
            app = me.application,
            breakOnLayout = location.search.match(/breakonlayout/),
            traceOnLayout = location.search.match(/traceonlayout/),
            runCompleteCount = 0;

        // monitor layouts
        if (traceOnLayout || breakOnLayout || location.search.match(/loglayouts/)) {
            Ext.Function.interceptAfter(Ext.layout.Context.prototype, 'runComplete', function() {
                runCompleteCount++;

                console.groupCollapsed('layout run #%s complete (%s items)', runCompleteCount, Ext.Object.getSize(this.items));

                if (breakOnLayout) {
                    debugger;
                }

                if (traceOnLayout) {
                    console.trace();
                }

                console.groupEnd();
            });
        }

        // log route handling
        // app.on({
        //     beforeroute: function(app, route, result, token) {
        //         console.groupCollapsed('%s.%s(%o) handling route: %s', route.controller.id, route.action, result, token);
        //     },
        //     route: function() {
        //         console.groupEnd();
        //     }
        // });

        // log navigation events
        me.control({
            'slateadmin-navigation': {
                beforerender: function(panel) { console.info('navigation->beforerender'); },
                render: function(panel) { console.info('navigation->render'); }
            },
            'slateadmin-navigation > *': {
                beforerender: function(panel) { console.info('navigation.%s->beforerender', panel.title); },
                beforeexpand: function(panel) { console.info('navigation.%s->beforeexpand', panel.title); },
                expand: function(panel) { console.info('navigation.%s->expand', panel.title); }
            }
        });
    }
});