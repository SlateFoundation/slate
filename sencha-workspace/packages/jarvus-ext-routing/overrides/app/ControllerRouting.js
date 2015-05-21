/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Jarvus.ext.override.app.ControllerRouting', (function() {

    var paramMatchingRegex = new RegExp(/:([0-9A-Za-z\_]*)/g),
        routes = [],
        routesLength;

    return {
        override: 'Ext.app.Application',
        requires: [
            'Ext.util.History'
        ],

        onBeforeLaunch: function() {
            var app = this,
                suspendLayoutUntilInitialRoute = app.suspendLayoutUntilInitialRoute,
                History = Ext.util.History,
                controllers, c = 0, cLength,
                controller, controllerRoutes, url, route, paramsInMatchString, conditions, matcherRegex, p, pLength, param, config;
                
            if (suspendLayoutUntilInitialRoute) {
                Ext.suspendLayouts();
            }

            app.callParent(arguments);

            // initialize routes list from controllers
            controllers = app.controllers.items;
            cLength = controllers.length;

            for (; c < cLength; c++) {
                controller = controllers[c];
                controllerRoutes = controller.routes;

                if (Ext.isObject(controllerRoutes)) {
                    for (url in controllerRoutes) {
                        route = controllerRoutes[url];
                        paramsInMatchString = url.match(paramMatchingRegex) || [];
                        conditions = route.conditions || {};
                        matcherRegex = url;

                        for (p = 0, pLength = paramsInMatchString.length; p < pLength; p++) {
                            param = paramsInMatchString[p];
                            matcherRegex = matcherRegex.replace(param, '(' + (conditions[param] || '[%a-zA-Z0-9\-\\_\\s,]+') + ')');
                        }

                        config = {
                            url: url,
                            controller: controller,
                            matcherRegex: new RegExp('^' + matcherRegex + '$')
                        };

                        if (Ext.isString(route)) {
                            config.action = route;
                        } else {
                            Ext.apply(config, route);
                        }

                        routes.push(config);
                    }
                }
            }

            routesLength = routes.length;

            // initialize history and attach to events
            History.on('change', 'onHistoryChange', app);
            History.init(function() {
                var token = History.getToken();

                app.onHistoryChange(token);
                
                if (suspendLayoutUntilInitialRoute) {
                    Ext.resumeLayouts(true);
                }
            });
        },

        onHistoryChange: function(token) {
            var app = this,
                onRouteNotFound = app.onRouteNotFound,
                i = 0,
                route, result, controller;

            token = token || '';

            for(; i < routesLength; i++) {
                route = routes[i];
                result = token.match(route.matcherRegex);

                if(result) {
                    result.shift();
                    controller = route.controller;

                    //<debug>
                    if (!Ext.isFunction(controller[route.action])) {
                        Ext.log.warn('Function "'+route.action+'" not defined in controller "'+controller.$className+'" for route "'+route.url+'"');
                    }
                    //</debug>

                    if (app.fireEvent('beforeroute', app, route, result, token) !== false) {
                        controller[route.action].apply(controller, result);
                        app.fireEvent('route', app, route, result, token);
                        return;
                    }
                }
            }

            if (onRouteNotFound) {
                onRouteNotFound.call(app, token);
            }
        },

        redirectTo: function(url) {
            Ext.util.History.add(url, true);
        }
    };
})(), function() {
    // add alias to controller
    this.superclass.redirectTo = this.prototype.redirectTo;
});
