var Ext = Ext || {};
Ext.Boot = Ext.Boot || (function(emptyFn) {
    var doc = document,
        _emptyArray = [],
        _config = {
            disableCaching: (/[?&](?:cache|disableCacheBuster)\b/i.test(location.search) || !(/http[s]?\:/i.test(location.href)) || /(^|[ ;])ext-cache=1/.test(doc.cookie)) ? false : true,
            disableCachingParam: '_dc',
            loadDelay: false,
            preserveScripts: true,
            charset: 'UTF-8'
        },
        _assetConfig = {},
        cssRe = /\.css(?:\?|$)/i,
        resolverEl = doc.createElement('a'),
        isBrowser = typeof window !== 'undefined',
        _environment = {
            browser: isBrowser,
            node: !isBrowser && (typeof require === 'function'),
            phantom: (window && (window._phantom || window.callPhantom)) || /PhantomJS/.test(window.navigator.userAgent)
        },
        _tags = (Ext.platformTags = {}),
        _debug = function(message) {},
        _apply = function(object, config, defaults) {
            if (defaults) {
                _apply(object, defaults);
            }
            if (object && config && typeof config === 'object') {
                for (var i in config) {
                    object[i] = config[i];
                }
            }
            return object;
        },
        _merge = function() {
            var lowerCase = false,
                obj = Array.prototype.shift.call(arguments),
                index, i, len, value;
            if (typeof arguments[arguments.length - 1] === 'boolean') {
                lowerCase = Array.prototype.pop.call(arguments);
            }
            len = arguments.length;
            for (index = 0; index < len; index++) {
                value = arguments[index];
                if (typeof value === 'object') {
                    for (i in value) {
                        obj[lowerCase ? i.toLowerCase() : i] = value[i];
                    }
                }
            }
            return obj;
        },
        _getKeys = (typeof Object.keys == 'function') ? function(object) {
            if (!object) {
                return [];
            }
            return Object.keys(object);
        } : function(object) {
            var keys = [],
                property;
            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }
            return keys;
        },
        Boot = {
            loading: 0,
            loaded: 0,
            apply: _apply,
            env: _environment,
            config: _config,
            assetConfig: _assetConfig,
            scripts: {},
            currentFile: null,
            suspendedQueue: [],
            currentRequest: null,
            syncMode: false,
            debug: _debug,
            useElements: true,
            listeners: [],
            Request: Request,
            Entry: Entry,
            allowMultipleBrowsers: false,
            browserNames: {
                ie: 'IE',
                firefox: 'Firefox',
                safari: 'Safari',
                chrome: 'Chrome',
                opera: 'Opera',
                dolfin: 'Dolfin',
                edge: 'Edge',
                webosbrowser: 'webOSBrowser',
                chromeMobile: 'ChromeMobile',
                chromeiOS: 'ChromeiOS',
                silk: 'Silk',
                other: 'Other'
            },
            osNames: {
                ios: 'iOS',
                android: 'Android',
                windowsPhone: 'WindowsPhone',
                webos: 'webOS',
                blackberry: 'BlackBerry',
                rimTablet: 'RIMTablet',
                mac: 'MacOS',
                win: 'Windows',
                tizen: 'Tizen',
                linux: 'Linux',
                bada: 'Bada',
                chromeOS: 'ChromeOS',
                other: 'Other'
            },
            browserPrefixes: {
                ie: 'MSIE ',
                edge: 'Edge/',
                firefox: 'Firefox/',
                chrome: 'Chrome/',
                safari: 'Version/',
                opera: 'OPR/',
                dolfin: 'Dolfin/',
                webosbrowser: 'wOSBrowser/',
                chromeMobile: 'CrMo/',
                chromeiOS: 'CriOS/',
                silk: 'Silk/'
            },
            browserPriority: [
                'edge',
                'opera',
                'dolfin',
                'webosbrowser',
                'silk',
                'chromeiOS',
                'chromeMobile',
                'ie',
                'firefox',
                'safari',
                'chrome'
            ],
            osPrefixes: {
                tizen: '(Tizen )',
                ios: 'i(?:Pad|Phone|Pod)(?:.*)CPU(?: iPhone)? OS ',
                android: '(Android |HTC_|Silk/)',
                windowsPhone: 'Windows Phone ',
                blackberry: '(?:BlackBerry|BB)(?:.*)Version/',
                rimTablet: 'RIM Tablet OS ',
                webos: '(?:webOS|hpwOS)/',
                bada: 'Bada/',
                chromeOS: 'CrOS '
            },
            fallbackOSPrefixes: {
                windows: 'win',
                mac: 'mac',
                linux: 'linux'
            },
            devicePrefixes: {
                iPhone: 'iPhone',
                iPod: 'iPod',
                iPad: 'iPad'
            },
            maxIEVersion: 12,
            detectPlatformTags: function() {
                var me = this,
                    ua = navigator.userAgent,
                    isMobile = /Mobile(\/|\s)/.test(ua),
                    element = document.createElement('div'),
                    isEventSupported = function(name, tag) {
                        if (tag === undefined) {
                            tag = window;
                        }
                        var eventName = 'on' + name.toLowerCase(),
                            isSupported = (eventName in element);
                        if (!isSupported) {
                            if (element.setAttribute && element.removeAttribute) {
                                element.setAttribute(eventName, '');
                                isSupported = typeof element[eventName] === 'function';
                                if (typeof element[eventName] !== 'undefined') {
                                    element[eventName] = undefined;
                                }
                                element.removeAttribute(eventName);
                            }
                        }
                        return isSupported;
                    },
                    getBrowsers = function() {
                        var browsers = {},
                            maxIEVersion, prefix, value, key, index, len, match, version, matched;
                        len = me.browserPriority.length;
                        for (index = 0; index < len; index++) {
                            key = me.browserPriority[index];
                            if (!matched) {
                                value = me.browserPrefixes[key];
                                match = ua.match(new RegExp('(' + value + ')([\\w\\._]+)'));
                                version = match && match.length > 1 ? parseInt(match[2]) : 0;
                                if (version) {
                                    matched = true;
                                }
                            } else {
                                version = 0;
                            }
                            browsers[key] = version;
                        }
                        if (browsers.ie) {
                            var mode = document.documentMode;
                            if (mode >= 8) {
                                browsers.ie = mode;
                            }
                        }
                        version = browsers.ie || false;
                        maxIEVersion = Math.max(version, me.maxIEVersion);
                        for (index = 8; index <= maxIEVersion; ++index) {
                            prefix = 'ie' + index;
                            browsers[prefix + 'm'] = version ? version <= index : 0;
                            browsers[prefix] = version ? version === index : 0;
                            browsers[prefix + 'p'] = version ? version >= index : 0;
                        }
                        return browsers;
                    },
                    getOperatingSystems = function() {
                        var systems = {},
                            value, key, keys, index, len, match, matched, version, activeCount;
                        keys = _getKeys(me.osPrefixes);
                        len = keys.length;
                        for (index = 0 , activeCount = 0; index < len; index++) {
                            key = keys[index];
                            value = me.osPrefixes[key];
                            match = ua.match(new RegExp('(' + value + ')([^\\s;]+)'));
                            matched = match ? match[1] : null;
                            if (matched && (matched === 'HTC_' || matched === 'Silk/')) {
                                version = 2.3;
                            } else {
                                version = match && match.length > 1 ? parseFloat(match[match.length - 1]) : 0;
                            }
                            if (version) {
                                activeCount++;
                            }
                            systems[key] = version;
                        }
                        keys = _getKeys(me.fallbackOSPrefixes);
                        len = keys.length;
                        for (index = 0; index < len; index++) {
                            key = keys[index];
                            if (activeCount === 0) {
                                value = me.fallbackOSPrefixes[key];
                                match = ua.toLowerCase().match(new RegExp(value));
                                systems[key] = match ? true : 0;
                            } else {
                                systems[key] = 0;
                            }
                        }
                        return systems;
                    },
                    getDevices = function() {
                        var devices = {},
                            value, key, keys, index, len, match;
                        keys = _getKeys(me.devicePrefixes);
                        len = keys.length;
                        for (index = 0; index < len; index++) {
                            key = keys[index];
                            value = me.devicePrefixes[key];
                            match = ua.match(new RegExp(value));
                            devices[key] = match ? true : 0;
                        }
                        return devices;
                    },
                    browsers = getBrowsers(),
                    systems = getOperatingSystems(),
                    devices = getDevices(),
                    platformParams = Boot.loadPlatformsParam();
                _merge(_tags, browsers, systems, devices, platformParams, true);
                _tags.phone = !!((_tags.iphone || _tags.ipod) || (!_tags.silk && (_tags.android && (_tags.android < 3 || isMobile))) || (_tags.blackberry && isMobile) || (_tags.windowsphone));
                _tags.tablet = !!(!_tags.phone && (_tags.ipad || _tags.android || _tags.silk || _tags.rimtablet || (_tags.ie10 && /; Touch/.test(ua))));
                _tags.touch = isEventSupported('touchend') || navigator.maxTouchPoints || navigator.msMaxTouchPoints;
                _tags.desktop = !_tags.phone && !_tags.tablet;
                _tags.cordova = _tags.phonegap = !!(window.PhoneGap || window.Cordova || window.cordova);
                _tags.webview = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)(?!.*FBAN)/i.test(ua);
                _tags.androidstock = (_tags.android <= 4.3) && (_tags.safari || _tags.silk);
                _merge(_tags, platformParams, true);
            },
            loadPlatformsParam: function() {
                var paramsString = window.location.search.substr(1),
                    paramsArray = paramsString.split("&"),
                    params = {},
                    i,
                    platforms = {},
                    tmpArray, tmplen, platform, name, enabled;
                for (i = 0; i < paramsArray.length; i++) {
                    tmpArray = paramsArray[i].split("=");
                    params[tmpArray[0]] = tmpArray[1];
                }
                if (params.platformTags) {
                    tmpArray = params.platformTags.split(",");
                    for (tmplen = tmpArray.length , i = 0; i < tmplen; i++) {
                        platform = tmpArray[i].split(":");
                        name = platform[0];
                        enabled = true;
                        if (platform.length > 1) {
                            enabled = platform[1];
                            if (enabled === 'false' || enabled === '0') {
                                enabled = false;
                            }
                        }
                        platforms[name] = enabled;
                    }
                }
                return platforms;
            },
            filterPlatform: function(platform, excludes) {
                platform = _emptyArray.concat(platform || _emptyArray);
                excludes = _emptyArray.concat(excludes || _emptyArray);
                var plen = platform.length,
                    elen = excludes.length,
                    include = (!plen && elen),
                    i, tag;
                for (i = 0; i < plen && !include; i++) {
                    tag = platform[i];
                    include = !!_tags[tag];
                }
                for (i = 0; i < elen && include; i++) {
                    tag = excludes[i];
                    include = !_tags[tag];
                }
                return include;
            },
            init: function() {
                var scriptEls = doc.getElementsByTagName('script'),
                    script = scriptEls[0],
                    len = scriptEls.length,
                    re = /\/ext(\-[a-z\-]+)?\.js$/,
                    entry, src, state, baseUrl, key, n, origin;
                Boot.hasReadyState = ("readyState" in script);
                Boot.hasAsync = ("async" in script);
                Boot.hasDefer = ("defer" in script);
                Boot.hasOnLoad = ("onload" in script);
                Boot.isIE8 = Boot.hasReadyState && !Boot.hasAsync && Boot.hasDefer && !Boot.hasOnLoad;
                Boot.isIE9 = Boot.hasReadyState && !Boot.hasAsync && Boot.hasDefer && Boot.hasOnLoad;
                Boot.isIE10p = Boot.hasReadyState && Boot.hasAsync && Boot.hasDefer && Boot.hasOnLoad;
                Boot.isIE10 = (new Function('/*@cc_on return @_jscript_version @*/')()) === 10;
                Boot.isIE10m = Boot.isIE10 || Boot.isIE9 || Boot.isIE8;
                Boot.isIE11 = Boot.isIE10p && !Boot.isIE10;
                for (n = 0; n < len; n++) {
                    src = (script = scriptEls[n]).src;
                    if (!src) {
                        
                        continue;
                    }
                    state = script.readyState || null;
                    if (!baseUrl && re.test(src)) {
                        baseUrl = src;
                    }
                    if (!Boot.scripts[key = Boot.canonicalUrl(src)]) {
                        entry = new Entry({
                            key: key,
                            url: src,
                            done: state === null || state === 'loaded' || state === 'complete',
                            el: script,
                            prop: 'src'
                        });
                    }
                }
                if (!baseUrl) {
                    script = scriptEls[scriptEls.length - 1];
                    baseUrl = script.src;
                }
                Boot.baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                origin = window.location.origin || window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
                Boot.origin = origin;
                Boot.detectPlatformTags();
                Ext.filterPlatform = Boot.filterPlatform;
            },
            canonicalUrl: function(url) {
                resolverEl.href = url;
                var ret = resolverEl.href,
                    dc = _config.disableCachingParam,
                    pos = dc ? ret.indexOf(dc + '=') : -1,
                    c, end;
                if (pos > 0 && ((c = ret.charAt(pos - 1)) === '?' || c === '&')) {
                    end = ret.indexOf('&', pos);
                    end = (end < 0) ? '' : ret.substring(end);
                    if (end && c === '?') {
                        ++pos;
                        end = end.substring(1);
                    }
                    ret = ret.substring(0, pos - 1) + end;
                }
                return ret;
            },
            getConfig: function(name) {
                return name ? Boot.config[name] : Boot.config;
            },
            setConfig: function(name, value) {
                if (typeof name === 'string') {
                    Boot.config[name] = value;
                } else {
                    for (var s in name) {
                        Boot.setConfig(s, name[s]);
                    }
                }
                return Boot;
            },
            getHead: function() {
                return Boot.docHead || (Boot.docHead = doc.head || doc.getElementsByTagName('head')[0]);
            },
            create: function(url, key, cfg) {
                var config = cfg || {};
                config.url = url;
                config.key = key;
                return Boot.scripts[key] = new Entry(config);
            },
            getEntry: function(url, cfg, canonicalPath) {
                var key, entry;
                key = canonicalPath ? url : Boot.canonicalUrl(url);
                entry = Boot.scripts[key];
                if (!entry) {
                    entry = Boot.create(url, key, cfg);
                    if (canonicalPath) {
                        entry.canonicalPath = true;
                    }
                }
                return entry;
            },
            registerContent: function(url, type, content) {
                var cfg = {
                        content: content,
                        loaded: true,
                        css: type === 'css'
                    };
                return Boot.getEntry(url, cfg);
            },
            processRequest: function(request, sync) {
                request.loadEntries(sync);
            },
            load: function(request) {
                var request = new Request(request);
                if (request.sync || Boot.syncMode) {
                    return Boot.loadSync(request);
                }
                if (Boot.currentRequest) {
                    request.getEntries();
                    Boot.suspendedQueue.push(request);
                } else {
                    Boot.currentRequest = request;
                    Boot.processRequest(request, false);
                }
                return Boot;
            },
            loadSync: function(request) {
                var request = new Request(request);
                Boot.syncMode++;
                Boot.processRequest(request, true);
                Boot.syncMode--;
                return Boot;
            },
            loadBasePrefix: function(request) {
                request = new Request(request);
                request.prependBaseUrl = true;
                return Boot.load(request);
            },
            loadSyncBasePrefix: function(request) {
                request = new Request(request);
                request.prependBaseUrl = true;
                return Boot.loadSync(request);
            },
            requestComplete: function(request) {
                var next;
                if (Boot.currentRequest === request) {
                    Boot.currentRequest = null;
                    while (Boot.suspendedQueue.length > 0) {
                        next = Boot.suspendedQueue.shift();
                        if (!next.done) {
                            Boot.load(next);
                            break;
                        }
                    }
                }
                if (!Boot.currentRequest && Boot.suspendedQueue.length == 0) {
                    Boot.fireListeners();
                }
            },
            isLoading: function() {
                return !Boot.currentRequest && Boot.suspendedQueue.length == 0;
            },
            fireListeners: function() {
                var listener;
                while (Boot.isLoading() && (listener = Boot.listeners.shift())) {
                    listener();
                }
            },
            onBootReady: function(listener) {
                if (!Boot.isLoading()) {
                    listener();
                } else {
                    Boot.listeners.push(listener);
                }
            },
            getPathsFromIndexes: function(indexMap, loadOrder) {
                if (!('length' in indexMap)) {
                    var indexArray = [],
                        index;
                    for (index in indexMap) {
                        if (!isNaN(+index)) {
                            indexArray[+index] = indexMap[index];
                        }
                    }
                    indexMap = indexArray;
                }
                return Request.prototype.getPathsFromIndexes(indexMap, loadOrder);
            },
            createLoadOrderMap: function(loadOrder) {
                return Request.prototype.createLoadOrderMap(loadOrder);
            },
            fetch: function(url, complete, scope, async) {
                async = (async === undefined) ? !!complete : async;
                var xhr = new XMLHttpRequest(),
                    result, status, content,
                    exception = false,
                    readyStateChange = function() {
                        if (xhr && xhr.readyState == 4) {
                            status = (xhr.status === 1223) ? 204 : (xhr.status === 0 && ((self.location || {}).protocol === 'file:' || (self.location || {}).protocol === 'ionp:')) ? 200 : xhr.status;
                            content = xhr.responseText;
                            result = {
                                content: content,
                                status: status,
                                exception: exception
                            };
                            if (complete) {
                                complete.call(scope, result);
                            }
                            xhr.onreadystatechange = emptyFn;
                            xhr = null;
                        }
                    };
                if (async) {
                    xhr.onreadystatechange = readyStateChange;
                }
                try {
                    xhr.open('GET', url, async);
                    xhr.send(null);
                } catch (err) {
                    exception = err;
                    readyStateChange();
                    return result;
                }
                if (!async) {
                    readyStateChange();
                }
                return result;
            },
            notifyAll: function(entry) {
                entry.notifyRequests();
            }
        };
    function Request(cfg) {
        if (cfg.$isRequest) {
            return cfg;
        }
        var cfg = cfg.url ? cfg : {
                url: cfg
            },
            url = cfg.url,
            urls = url.charAt ? [
                url
            ] : url,
            charset = cfg.charset || Boot.config.charset;
        _apply(this, cfg);
        delete this.url;
        this.urls = urls;
        this.charset = charset;
    }
    
    Request.prototype = {
        $isRequest: true,
        createLoadOrderMap: function(loadOrder) {
            var len = loadOrder.length,
                loadOrderMap = {},
                i, element;
            for (i = 0; i < len; i++) {
                element = loadOrder[i];
                loadOrderMap[element.path] = element;
            }
            return loadOrderMap;
        },
        getLoadIndexes: function(item, indexMap, loadOrder, includeUses, skipLoaded) {
            var resolved = [],
                queue = [
                    item
                ],
                itemIndex = item.idx,
                queue, entry, dependencies, depIndex, i, len;
            if (indexMap[itemIndex]) {
                return resolved;
            }
            indexMap[itemIndex] = resolved[itemIndex] = true;
            while (item = queue.shift()) {
                if (item.canonicalPath) {
                    entry = Boot.getEntry(item.path, null, true);
                } else {
                    entry = Boot.getEntry(this.prepareUrl(item.path));
                }
                if (!(skipLoaded && entry.done)) {
                    if (includeUses && item.uses && item.uses.length) {
                        dependencies = item.requires.concat(item.uses);
                    } else {
                        dependencies = item.requires;
                    }
                    for (i = 0 , len = dependencies.length; i < len; i++) {
                        depIndex = dependencies[i];
                        if (!indexMap[depIndex]) {
                            indexMap[depIndex] = resolved[depIndex] = true;
                            queue.push(loadOrder[depIndex]);
                        }
                    }
                }
            }
            return resolved;
        },
        getPathsFromIndexes: function(indexes, loadOrder) {
            var paths = [],
                index, len;
            for (index = 0 , len = indexes.length; index < len; index++) {
                if (indexes[index]) {
                    paths.push(loadOrder[index].path);
                }
            }
            return paths;
        },
        expandUrl: function(url, loadOrder, loadOrderMap, indexMap, includeUses, skipLoaded) {
            var item, resolved;
            if (loadOrder) {
                item = loadOrderMap[url];
                if (item) {
                    resolved = this.getLoadIndexes(item, indexMap, loadOrder, includeUses, skipLoaded);
                    if (resolved.length) {
                        return this.getPathsFromIndexes(resolved, loadOrder);
                    }
                }
            }
            return [
                url
            ];
        },
        expandUrls: function(urls, includeUses) {
            var me = this,
                loadOrder = me.loadOrder,
                expanded = [],
                expandMap = {},
                indexMap = [],
                loadOrderMap, tmpExpanded, i, len, t, tlen, tUrl;
            if (typeof urls === "string") {
                urls = [
                    urls
                ];
            }
            if (loadOrder) {
                loadOrderMap = me.loadOrderMap;
                if (!loadOrderMap) {
                    loadOrderMap = me.loadOrderMap = me.createLoadOrderMap(loadOrder);
                }
            }
            for (i = 0 , len = urls.length; i < len; i++) {
                tmpExpanded = this.expandUrl(urls[i], loadOrder, loadOrderMap, indexMap, includeUses, false);
                for (t = 0 , tlen = tmpExpanded.length; t < tlen; t++) {
                    tUrl = tmpExpanded[t];
                    if (!expandMap[tUrl]) {
                        expandMap[tUrl] = true;
                        expanded.push(tUrl);
                    }
                }
            }
            if (expanded.length === 0) {
                expanded = urls;
            }
            return expanded;
        },
        expandLoadOrder: function() {
            var me = this,
                urls = me.urls,
                expanded;
            if (!me.expanded) {
                expanded = this.expandUrls(urls, true);
                me.expanded = true;
            } else {
                expanded = urls;
            }
            me.urls = expanded;
            if (urls.length != expanded.length) {
                me.sequential = true;
            }
            return me;
        },
        getUrls: function() {
            this.expandLoadOrder();
            return this.urls;
        },
        prepareUrl: function(url) {
            if (this.prependBaseUrl) {
                return Boot.baseUrl + url;
            }
            return url;
        },
        getEntries: function() {
            var me = this,
                entries = me.entries,
                loadOrderMap, item, i, entry, urls, url;
            if (!entries) {
                entries = [];
                urls = me.getUrls();
                if (me.loadOrder) {
                    loadOrderMap = me.loadOrderMap;
                }
                for (i = 0; i < urls.length; i++) {
                    url = me.prepareUrl(urls[i]);
                    if (loadOrderMap) {
                        item = loadOrderMap[url];
                    }
                    entry = Boot.getEntry(url, {
                        buster: me.buster,
                        charset: me.charset
                    }, item && item.canonicalPath);
                    entry.requests.push(me);
                    entries.push(entry);
                }
                me.entries = entries;
            }
            return entries;
        },
        loadEntries: function(sync) {
            var me = this,
                entries = me.getEntries(),
                len = entries.length,
                start = me.loadStart || 0,
                continueLoad, entries, entry, i;
            if (sync !== undefined) {
                me.sync = sync;
            }
            me.loaded = me.loaded || 0;
            me.loading = me.loading || len;
            for (i = start; i < len; i++) {
                entry = entries[i];
                if (!entry.loaded) {
                    continueLoad = entries[i].load(me.sync);
                } else {
                    continueLoad = true;
                }
                if (!continueLoad) {
                    me.loadStart = i;
                    entry.onDone(function() {
                        me.loadEntries(sync);
                    });
                    break;
                }
            }
            me.processLoadedEntries();
        },
        processLoadedEntries: function() {
            var me = this,
                entries = me.getEntries(),
                len = entries.length,
                start = me.startIndex || 0,
                i, entry;
            if (!me.done) {
                for (i = start; i < len; i++) {
                    entry = entries[i];
                    if (!entry.loaded) {
                        me.startIndex = i;
                        return;
                    }
                    if (!entry.evaluated) {
                        entry.evaluate();
                    }
                    if (entry.error) {
                        me.error = true;
                    }
                }
                me.notify();
            }
        },
        notify: function() {
            var me = this;
            if (!me.done) {
                var error = me.error,
                    fn = me[error ? 'failure' : 'success'],
                    delay = ('delay' in me) ? me.delay : (error ? 1 : Boot.config.chainDelay),
                    scope = me.scope || me;
                me.done = true;
                if (fn) {
                    if (delay === 0 || delay > 0) {
                        setTimeout(function() {
                            fn.call(scope, me);
                        }, delay);
                    } else {
                        fn.call(scope, me);
                    }
                }
                me.fireListeners();
                Boot.requestComplete(me);
            }
        },
        onDone: function(listener) {
            var me = this,
                listeners = me.listeners || (me.listeners = []);
            if (me.done) {
                listener(me);
            } else {
                listeners.push(listener);
            }
        },
        fireListeners: function() {
            var listeners = this.listeners,
                listener;
            if (listeners) {
                while ((listener = listeners.shift())) {
                    listener(this);
                }
            }
        }
    };
    function Entry(cfg) {
        if (cfg.$isEntry) {
            return cfg;
        }
        var charset = cfg.charset || Boot.config.charset,
            manifest = Ext.manifest,
            loader = manifest && manifest.loader,
            cache = (cfg.cache !== undefined) ? cfg.cache : (loader && loader.cache),
            buster, busterParam;
        if (Boot.config.disableCaching) {
            if (cache === undefined) {
                cache = !Boot.config.disableCaching;
            }
            if (cache === false) {
                buster = +new Date();
            } else if (cache !== true) {
                buster = cache;
            }
            if (buster) {
                busterParam = (loader && loader.cacheParam) || Boot.config.disableCachingParam;
                buster = busterParam + "=" + buster;
            }
        }
        _apply(this, cfg);
        this.charset = charset;
        this.buster = buster;
        this.requests = [];
    }
    
    Entry.prototype = {
        $isEntry: true,
        done: false,
        evaluated: false,
        loaded: false,
        isCrossDomain: function() {
            var me = this;
            if (me.crossDomain === undefined) {
                me.crossDomain = (me.getLoadUrl().indexOf(Boot.origin) !== 0);
            }
            return me.crossDomain;
        },
        isCss: function() {
            var me = this;
            if (me.css === undefined) {
                if (me.url) {
                    var assetConfig = Boot.assetConfig[me.url];
                    me.css = assetConfig ? assetConfig.type === "css" : cssRe.test(me.url);
                } else {
                    me.css = false;
                }
            }
            return this.css;
        },
        getElement: function(tag) {
            var me = this,
                el = me.el;
            if (!el) {
                if (me.isCss()) {
                    tag = tag || "link";
                    el = doc.createElement(tag);
                    if (tag == "link") {
                        el.rel = 'stylesheet';
                        me.prop = 'href';
                    } else {
                        me.prop = "textContent";
                    }
                    el.type = "text/css";
                } else {
                    tag = tag || "script";
                    el = doc.createElement(tag);
                    el.type = 'text/javascript';
                    me.prop = 'src';
                    if (me.charset) {
                        el.charset = me.charset;
                    }
                    if (Boot.hasAsync) {
                        el.async = false;
                    }
                }
                me.el = el;
            }
            return el;
        },
        getLoadUrl: function() {
            var me = this,
                url;
            url = me.canonicalPath ? me.url : Boot.canonicalUrl(me.url);
            if (!me.loadUrl) {
                me.loadUrl = !!me.buster ? (url + (url.indexOf('?') === -1 ? '?' : '&') + me.buster) : url;
            }
            return me.loadUrl;
        },
        fetch: function(req) {
            var url = this.getLoadUrl(),
                async = !!req.async,
                complete = req.complete;
            Boot.fetch(url, complete, this, async);
        },
        onContentLoaded: function(response) {
            var me = this,
                status = response.status,
                content = response.content,
                exception = response.exception,
                url = this.getLoadUrl();
            me.loaded = true;
            if ((exception || status === 0) && !_environment.phantom) {
                me.error = ("Failed loading synchronously via XHR: '" + url + "'. It's likely that the file is either being loaded from a " + "different domain or from the local file system where cross " + "origin requests are not allowed for security reasons. Try " + "asynchronous loading instead.") || true;
                me.evaluated = true;
            } else if ((status >= 200 && status < 300) || status === 304 || _environment.phantom || (status === 0 && content.length > 0)) {
                me.content = content;
            } else {
                me.error = ("Failed loading synchronously via XHR: '" + url + "'. Please verify that the file exists. XHR status code: " + status) || true;
                me.evaluated = true;
            }
        },
        createLoadElement: function(callback) {
            var me = this,
                el = me.getElement();
            me.preserve = true;
            el.onerror = function() {
                me.error = true;
                if (callback) {
                    callback();
                    callback = null;
                }
            };
            if (Boot.isIE10m) {
                el.onreadystatechange = function() {
                    if (this.readyState === 'loaded' || this.readyState === 'complete') {
                        if (callback) {
                            callback();
                            callback = this.onreadystatechange = this.onerror = null;
                        }
                    }
                };
            } else {
                el.onload = function() {
                    callback();
                    callback = this.onload = this.onerror = null;
                };
            }
            el[me.prop] = me.getLoadUrl();
        },
        onLoadElementReady: function() {
            Boot.getHead().appendChild(this.getElement());
            this.evaluated = true;
        },
        inject: function(content, asset) {
            var me = this,
                head = Boot.getHead(),
                url = me.url,
                key = me.key,
                base, el, ieMode, basePath;
            if (me.isCss()) {
                me.preserve = true;
                basePath = key.substring(0, key.lastIndexOf("/") + 1);
                base = doc.createElement('base');
                base.href = basePath;
                if (head.firstChild) {
                    head.insertBefore(base, head.firstChild);
                } else {
                    head.appendChild(base);
                }
                base.href = base.href;
                if (url) {
                    content += "\n/*# sourceURL=" + key + " */";
                }
                el = me.getElement("style");
                ieMode = ('styleSheet' in el);
                head.appendChild(base);
                if (ieMode) {
                    head.appendChild(el);
                    el.styleSheet.cssText = content;
                } else {
                    el.textContent = content;
                    head.appendChild(el);
                }
                head.removeChild(base);
            } else {
                if (url) {
                    content += "\n//# sourceURL=" + key;
                }
                Ext.globalEval(content);
            }
            return me;
        },
        loadCrossDomain: function() {
            var me = this,
                complete = function() {
                    me.el.onerror = me.el.onload = emptyFn;
                    me.el = null;
                    me.loaded = me.evaluated = me.done = true;
                    me.notifyRequests();
                };
            me.createLoadElement(function() {
                complete();
            });
            me.evaluateLoadElement();
            return false;
        },
        loadElement: function() {
            var me = this,
                complete = function() {
                    me.el.onerror = me.el.onload = emptyFn;
                    me.el = null;
                    me.loaded = me.evaluated = me.done = true;
                    me.notifyRequests();
                };
            me.createLoadElement(function() {
                complete();
            });
            me.evaluateLoadElement();
            return true;
        },
        loadSync: function() {
            var me = this;
            me.fetch({
                async: false,
                complete: function(response) {
                    me.onContentLoaded(response);
                }
            });
            me.evaluate();
            me.notifyRequests();
        },
        load: function(sync) {
            var me = this;
            if (!me.loaded) {
                if (me.loading) {
                    return false;
                }
                me.loading = true;
                if (!sync) {
                    if (Boot.isIE10 || me.isCrossDomain()) {
                        return me.loadCrossDomain();
                    }
                    else if (!me.isCss() && Boot.hasReadyState) {
                        me.createLoadElement(function() {
                            me.loaded = true;
                            me.notifyRequests();
                        });
                    } else if (Boot.useElements && !(me.isCss() && _environment.phantom)) {
                        return me.loadElement();
                    } else {
                        me.fetch({
                            async: !sync,
                            complete: function(response) {
                                me.onContentLoaded(response);
                                me.notifyRequests();
                            }
                        });
                    }
                } else {
                    me.loadSync();
                }
            }
            return true;
        },
        evaluateContent: function() {
            this.inject(this.content);
            this.content = null;
        },
        evaluateLoadElement: function() {
            Boot.getHead().appendChild(this.getElement());
        },
        evaluate: function() {
            var me = this;
            if (!me.evaluated) {
                if (me.evaluating) {
                    return;
                }
                me.evaluating = true;
                if (me.content !== undefined) {
                    me.evaluateContent();
                } else if (!me.error) {
                    me.evaluateLoadElement();
                }
                me.evaluated = me.done = true;
                me.cleanup();
            }
        },
        cleanup: function() {
            var me = this,
                el = me.el,
                prop;
            if (!el) {
                return;
            }
            if (!me.preserve) {
                me.el = null;
                el.parentNode.removeChild(el);
                for (prop in el) {
                    try {
                        if (prop !== me.prop) {
                            el[prop] = null;
                        }
                        delete el[prop];
                    } catch (cleanEx) {}
                }
            }
            el.onload = el.onerror = el.onreadystatechange = emptyFn;
        },
        notifyRequests: function() {
            var requests = this.requests,
                len = requests.length,
                i, request;
            for (i = 0; i < len; i++) {
                request = requests[i];
                request.processLoadedEntries();
            }
            if (this.done) {
                this.fireListeners();
            }
        },
        onDone: function(listener) {
            var me = this,
                listeners = me.listeners || (me.listeners = []);
            if (me.done) {
                listener(me);
            } else {
                listeners.push(listener);
            }
        },
        fireListeners: function() {
            var listeners = this.listeners,
                listener;
            if (listeners && listeners.length > 0) {
                while ((listener = listeners.shift())) {
                    listener(this);
                }
            }
        }
    };
    Ext.disableCacheBuster = function(disable, path) {
        var date = new Date();
        date.setTime(date.getTime() + (disable ? 10 * 365 : -1) * 24 * 60 * 60 * 1000);
        date = date.toGMTString();
        doc.cookie = 'ext-cache=1; expires=' + date + '; path=' + (path || '/');
    };
    if (_environment.node) {
        Boot.prototype.load = Boot.prototype.loadSync = function(request) {
            require(filePath);
            onLoad.call(scope);
        };
        Boot.prototype.init = emptyFn;
    }
    Boot.init();
    return Boot;
}(function() {}));
Ext.globalEval = Ext.globalEval || (this.execScript ? function(code) {
    execScript(code);
} : function($$code) {
    eval.call(window, $$code);
});
if (!Function.prototype.bind) {
    (function() {
        var slice = Array.prototype.slice,
            bind = function(me) {
                var args = slice.call(arguments, 1),
                    method = this;
                if (args.length) {
                    return function() {
                        var t = arguments;
                        return method.apply(me, t.length ? args.concat(slice.call(t)) : args);
                    };
                }
                args = null;
                return function() {
                    return method.apply(me, arguments);
                };
            };
        Function.prototype.bind = bind;
        bind.$extjs = true;
    }());
}
Ext.setResourcePath = function(poolName, path) {
    var manifest = Ext.manifest || (Ext.manifest = {}),
        paths = manifest.resources || (manifest.resources = {});
    if (manifest) {
        if (typeof poolName !== 'string') {
            Ext.apply(paths, poolName);
        } else {
            paths[poolName] = path;
        }
        manifest.resources = paths;
    }
};
Ext.getResourcePath = function(path, poolName, packageName) {
    if (typeof path !== 'string') {
        poolName = path.pool;
        packageName = path.packageName;
        path = path.path;
    }
    var manifest = Ext.manifest,
        paths = manifest && manifest.resources,
        poolPath = paths[poolName],
        output = [];
    if (poolPath == null) {
        poolPath = paths.path;
        if (poolPath == null) {
            poolPath = 'resources';
        }
    }
    if (poolPath) {
        output.push(poolPath);
    }
    if (packageName) {
        output.push(packageName);
    }
    output.push(path);
    return output.join('/');
};

var Ext = Ext || {};
(function() {
    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = [
            'valueOf',
            'toLocaleString',
            'toString',
            'constructor'
        ],
        emptyFn = function() {},
        privateFn = function() {},
        identityFn = function(o) {
            return o;
        },
        callOverrideParent = function() {
            var method = callOverrideParent.caller.caller;
            return method.$owner.prototype[method.$name].apply(this, arguments);
        },
        manifest = Ext.manifest || {},
        i,
        iterableRe = /\[object\s*(?:Array|Arguments|\w*Collection|\w*List|HTML\s+document\.all\s+class)\]/,
        MSDateRe = /^\\?\/Date\(([-+])?(\d+)(?:[+-]\d{4})?\)\\?\/$/;
    Ext.global = global;
    Ext.now = Date.now || (Date.now = function() {
        return +new Date();
    });
    Ext.ticks = (global.performance && global.performance.now) ? function() {
        return performance.now();
    } : Ext.now;
    Ext._startTime = Ext.ticks();
    emptyFn.$nullFn = identityFn.$nullFn = emptyFn.$emptyFn = identityFn.$identityFn = privateFn.$nullFn = true;
    privateFn.$privacy = 'framework';
    emptyFn.$noClearOnDestroy = identityFn.$noClearOnDestroy = true;
    privateFn.$noClearOnDestroy = true;
    Ext['suspendLayouts'] = Ext['resumeLayouts'] = emptyFn;
    for (i in {
        toString: 1
    }) {
        enumerables = null;
    }
    Ext.enumerables = enumerables;
    Ext.apply = function(object, config, defaults) {
        if (defaults) {
            Ext.apply(object, defaults);
        }
        if (object && config && typeof config === 'object') {
            var i, j, k;
            for (i in config) {
                object[i] = config[i];
            }
            if (enumerables) {
                for (j = enumerables.length; j--; ) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }
        return object;
    };
    function addInstanceOverrides(target, owner, overrides) {
        var name, value;
        for (name in overrides) {
            if (overrides.hasOwnProperty(name)) {
                value = overrides[name];
                if (typeof value === 'function') {
                    if (owner.$className) {
                        value.name = owner.$className + '#' + name;
                    }
                    value.$name = name;
                    value.$owner = owner;
                    value.$previous = target.hasOwnProperty(name) ? target[name] : callOverrideParent;
                }
                target[name] = value;
            }
        }
    }
    Ext.buildSettings = Ext.apply({
        baseCSSPrefix: 'x-'
    }, Ext.buildSettings || {});
    Ext.apply(Ext, {
        idSeed: 0,
        idPrefix: 'ext-',
        isSecure: /^https/i.test(window.location.protocol),
        enableGarbageCollector: false,
        enableListenerCollection: true,
        name: Ext.sandboxName || 'Ext',
        privateFn: privateFn,
        emptyFn: emptyFn,
        identityFn: identityFn,
        frameStartTime: Ext.now(),
        manifest: manifest,
        debugConfig: Ext.debugConfig || manifest.debug || {
            hooks: {
                '*': true
            }
        },
        enableAria: true,
        startsWithHashRe: /^#/,
        validIdRe: /^[a-z_][a-z0-9\-_]*$/i,
        BLANK_IMAGE_URL: 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        makeIdSelector: function(id) {
            if (!Ext.validIdRe.test(id)) {
                Ext.raise('Invalid id selector: "' + id + '"');
            }
            return '#' + id;
        },
        id: function(o, prefix) {
            if (o && o.id) {
                return o.id;
            }
            var id = (prefix || Ext.idPrefix) + (++Ext.idSeed);
            if (o) {
                o.id = id;
            }
            return id;
        },
        returnId: function(o) {
            return o.getId();
        },
        returnTrue: function() {
            return true;
        },
        emptyString: new String(),
        baseCSSPrefix: Ext.buildSettings.baseCSSPrefix,
        $eventNameMap: {},
        $vendorEventRe: /^(DOMMouse|Moz.+|MS.+|webkit.+)/,
        canonicalEventName: function(name) {
            return Ext.$eventNameMap[name] || (Ext.$eventNameMap[name] = (Ext.$vendorEventRe.test(name) ? name : name.toLowerCase()));
        },
        applyIf: function(object, config) {
            var property;
            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }
            return object;
        },
        destroy: function() {
            var ln = arguments.length,
                i, arg;
            for (i = 0; i < ln; i++) {
                arg = arguments[i];
                if (arg) {
                    if (Ext.isArray(arg)) {
                        this.destroy.apply(this, arg);
                    } else if (Ext.isFunction(arg.destroy)) {
                        arg.destroy();
                    }
                }
            }
            return null;
        },
        destroyMembers: function(object) {
            for (var ref, name,
                i = 1,
                a = arguments,
                len = a.length; i < len; i++) {
                ref = object[name = a[i]];
                if (ref != null) {
                    object[name] = Ext.destroy(ref);
                }
            }
        },
        override: function(target, overrides) {
            if (target.$isClass) {
                target.override(overrides);
            } else if (typeof target === 'function') {
                Ext.apply(target.prototype, overrides);
            } else {
                var owner = target.self,
                    privates;
                if (owner && owner.$isClass) {
                    privates = overrides.privates;
                    if (privates) {
                        overrides = Ext.apply({}, overrides);
                        delete overrides.privates;
                        addInstanceOverrides(target, owner, privates);
                    }
                    addInstanceOverrides(target, owner, overrides);
                } else {
                    Ext.apply(target, overrides);
                }
            }
            return target;
        },
        valueFrom: function(value, defaultValue, allowBlank) {
            return Ext.isEmpty(value, allowBlank) ? defaultValue : value;
        },
        isEmpty: function(value, allowEmptyString) {
            return (value == null) || (!allowEmptyString ? value === '' : false) || (Ext.isArray(value) && value.length === 0);
        },
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        },
        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },
        isMSDate: function(value) {
            if (!Ext.isString(value)) {
                return false;
            }
            return MSDateRe.test(value);
        },
        isObject: (toString.call(null) === '[object Object]') ? function(value) {
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } : function(value) {
            return toString.call(value) === '[object Object]';
        },
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        isPrimitive: function(value) {
            var type = typeof value;
            return type === 'string' || type === 'number' || type === 'boolean';
        },
        isFunction: (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
            return !!value && toString.call(value) === '[object Function]';
        } : function(value) {
            return !!value && typeof value === 'function';
        },
        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
        },
        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },
        isString: function(value) {
            return typeof value === 'string';
        },
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },
        isIterable: function(value) {
            if (!value || typeof value.length !== 'number' || typeof value === 'string' || Ext.isFunction(value)) {
                return false;
            }
            if (!value.propertyIsEnumerable) {
                return !!value.item;
            }
            if (value.hasOwnProperty('length') && !value.propertyIsEnumerable('length')) {
                return true;
            }
            return iterableRe.test(toString.call(value));
        },
        isDebugEnabled: function(className, defaultEnabled) {
            var debugConfig = Ext.debugConfig.hooks;
            if (debugConfig.hasOwnProperty(className)) {
                return debugConfig[className];
            }
            var enabled = debugConfig['*'],
                prefixLength = 0;
            if (defaultEnabled !== undefined) {
                enabled = defaultEnabled;
            }
            if (!className) {
                return enabled;
            }
            for (var prefix in debugConfig) {
                var value = debugConfig[prefix];
                if (className.charAt(prefix.length) === '.') {
                    if (className.substring(0, prefix.length) === prefix) {
                        if (prefixLength < prefix.length) {
                            prefixLength = prefix.length;
                            enabled = value;
                        }
                    }
                }
            }
            return enabled;
        } || emptyFn,
        clone: function(item, cloneDom) {
            if (item === null || item === undefined) {
                return item;
            }
            if (cloneDom !== false && item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }
            var type = toString.call(item),
                i, j, k, clone, key;
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }
            if (type === '[object Array]') {
                i = item.length;
                clone = [];
                while (i--) {
                    clone[i] = Ext.clone(item[i], cloneDom);
                }
            }
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};
                for (key in item) {
                    clone[key] = Ext.clone(item[key], cloneDom);
                }
                if (enumerables) {
                    for (j = enumerables.length; j--; ) {
                        k = enumerables[j];
                        if (item.hasOwnProperty(k)) {
                            clone[k] = item[k];
                        }
                    }
                }
            }
            return clone || item;
        },
        getUniqueGlobalNamespace: function() {
            var uniqueGlobalNamespace = this.uniqueGlobalNamespace,
                i;
            if (uniqueGlobalNamespace === undefined) {
                i = 0;
                do {
                    uniqueGlobalNamespace = 'ExtBox' + (++i);
                } while (global[uniqueGlobalNamespace] !== undefined);
                global[uniqueGlobalNamespace] = Ext;
                this.uniqueGlobalNamespace = uniqueGlobalNamespace;
            }
            return uniqueGlobalNamespace;
        },
        functionFactoryCache: {},
        cacheableFunctionFactory: function() {
            var me = this,
                args = Array.prototype.slice.call(arguments),
                cache = me.functionFactoryCache,
                idx, fn, ln;
            if (Ext.isSandboxed) {
                ln = args.length;
                if (ln > 0) {
                    ln--;
                    args[ln] = 'var Ext=window.' + Ext.name + ';' + args[ln];
                }
            }
            idx = args.join('');
            fn = cache[idx];
            if (!fn) {
                fn = Function.prototype.constructor.apply(Function.prototype, args);
                cache[idx] = fn;
            }
            return fn;
        },
        functionFactory: function() {
            var args = Array.prototype.slice.call(arguments),
                ln;
            if (Ext.isSandboxed) {
                ln = args.length;
                if (ln > 0) {
                    ln--;
                    args[ln] = 'var Ext=window.' + Ext.name + ';' + args[ln];
                }
            }
            return Function.prototype.constructor.apply(Function.prototype, args);
        },
        Logger: {
            log: function(message, priority) {
                if (message && global.console) {
                    if (!priority || !(priority in global.console)) {
                        priority = 'log';
                    }
                    message = '[' + priority.toUpperCase() + '] ' + message;
                    global.console[priority](message);
                }
            },
            verbose: function(message) {
                this.log(message, 'verbose');
            },
            info: function(message) {
                this.log(message, 'info');
            },
            warn: function(message) {
                this.log(message, 'warn');
            },
            error: function(message) {
                throw new Error(message);
            },
            deprecate: function(message) {
                this.log(message, 'warn');
            }
        } || {
            verbose: emptyFn,
            log: emptyFn,
            info: emptyFn,
            warn: emptyFn,
            error: function(message) {
                throw new Error(message);
            },
            deprecate: emptyFn
        },
        ariaWarn: function(target, msg) {
            if (Ext.enableAria && !Ext.slicer) {
                if (!Ext.ariaWarn.first) {
                    Ext.ariaWarn.first = true;
                    Ext.log.warn("WAI-ARIA compatibility warnings can be suppressed " + "by adding the following to application startup code:");
                    Ext.log.warn("    Ext.ariaWarn = Ext.emptyFn;");
                }
                Ext.log.warn({
                    msg: msg,
                    dump: target
                });
            }
        },
        getElementById: function(id) {
            return document.getElementById(id);
        },
        splitAndUnescape: (function() {
            var cache = {};
            return function(origin, delimiter) {
                if (!origin) {
                    return [];
                } else if (!delimiter) {
                    return [
                        origin
                    ];
                }
                var replaceRe = cache[delimiter] || (cache[delimiter] = new RegExp('\\\\' + delimiter, 'g')),
                    result = [],
                    parts, part;
                parts = origin.split(delimiter);
                while ((part = parts.shift()) !== undefined) {
                    while (part.charAt(part.length - 1) === '\\' && parts.length > 0) {
                        part = part + delimiter + parts.shift();
                    }
                    part = part.replace(replaceRe, delimiter);
                    result.push(part);
                }
                return result;
            };
        })()
    });
    Ext.returnTrue.$nullFn = Ext.returnId.$nullFn = true;
}());

(function() {
    function toString() {
        var me = this,
            cls = me.sourceClass,
            method = me.sourceMethod,
            msg = me.msg;
        if (method) {
            if (msg) {
                method += '(): ';
                method += msg;
            } else {
                method += '()';
            }
        }
        if (cls) {
            method = method ? (cls + '.' + method) : cls;
        }
        return method || msg || '';
    }
    Ext.Error = function(config) {
        if (Ext.isString(config)) {
            config = {
                msg: config
            };
        }
        var error = new Error();
        Ext.apply(error, config);
        error.message = error.message || error.msg;
        error.toString = toString;
        return error;
    };
    Ext.apply(Ext.Error, {
        ignore: false,
        raise: function(err) {
            err = err || {};
            if (Ext.isString(err)) {
                err = {
                    msg: err
                };
            }
            var me = this,
                method = me.raise.caller,
                msg, name;
            if (method === Ext.raise) {
                method = method.caller;
            }
            if (method) {
                if (!err.sourceMethod && (name = method.$name)) {
                    err.sourceMethod = name;
                }
                if (!err.sourceClass && (name = method.$owner) && (name = name.$className)) {
                    err.sourceClass = name;
                }
            }
            if (me.handle(err) !== true) {
                msg = toString.call(err);
                Ext.log({
                    msg: msg,
                    level: 'error',
                    dump: err,
                    stack: true
                });
                throw new Ext.Error(err);
            }
        },
        handle: function() {
            return this.ignore;
        }
    });
})();
Ext.deprecated = function(suggestion) {
    if (!suggestion) {
        suggestion = '';
    }
    function fail() {
        Ext.raise('The method "' + fail.$owner.$className + '.' + fail.$name + '" has been removed. ' + suggestion);
    }
    return fail;
    return Ext.emptyFn;
};
Ext.raise = function() {
    Ext.Error.raise.apply(Ext.Error, arguments);
};
(function() {
    if (typeof window === 'undefined') {
        return;
    }
    var last = 0,
        notify = function() {
            var cnt = Ext.log && Ext.log.counters,
                n = cnt && (cnt.error + cnt.warn + cnt.info + cnt.log),
                msg;
            if (n && last !== n) {
                msg = [];
                if (cnt.error) {
                    msg.push('Errors: ' + cnt.error);
                }
                if (cnt.warn) {
                    msg.push('Warnings: ' + cnt.warn);
                }
                if (cnt.info) {
                    msg.push('Info: ' + cnt.info);
                }
                if (cnt.log) {
                    msg.push('Log: ' + cnt.log);
                }
                window.status = '*** ' + msg.join(' -- ');
                last = n;
            }
        };
    setInterval(notify, 1000);
}());

Ext.Array = (function() {
    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = (function() {
            var array = [],
                lengthBefore,
                j = 20;
            if (!array.splice) {
                return false;
            }
            while (j--) {
                array.push("A");
            }
            array.splice(15, 0, "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F");
            lengthBefore = array.length;
            array.splice(13, 0, "XXX");
            if (lengthBefore + 1 !== array.length) {
                return false;
            }
            return true;
        }()),
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsSliceOnNodeList = true;
    function stableSort(array, userComparator) {
        var len = array.length,
            indices = new Array(len),
            i;
        for (i = 0; i < len; i++) {
            indices[i] = i;
        }
        indices.sort(function(index1, index2) {
            return userComparator(array[index1], array[index2]) || (index1 - index2);
        });
        for (i = 0; i < len; i++) {
            indices[i] = array[indices[i]];
        }
        for (i = 0; i < len; i++) {
            array[i] = indices[i];
        }
        return array;
    }
    try {
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }
    var fixArrayIndex = function(array, index) {
            return (index < 0) ? Math.max(0, array.length + index) : Math.min(array.length, index);
        },
        replaceSim = function(array, index, removeCount, insert) {
            var add = insert ? insert.length : 0,
                length = array.length,
                pos = fixArrayIndex(array, index);
            if (pos === length) {
                if (add) {
                    array.push.apply(array, insert);
                }
            } else {
                var remove = Math.min(removeCount, length - pos),
                    tailOldPos = pos + remove,
                    tailNewPos = tailOldPos + add - remove,
                    tailCount = length - tailOldPos,
                    lengthAfterRemove = length - remove,
                    i;
                if (tailNewPos < tailOldPos) {
                    for (i = 0; i < tailCount; ++i) {
                        array[tailNewPos + i] = array[tailOldPos + i];
                    }
                } else if (tailNewPos > tailOldPos) {
                    for (i = tailCount; i--; ) {
                        array[tailNewPos + i] = array[tailOldPos + i];
                    }
                }
                if (add && pos === lengthAfterRemove) {
                    array.length = lengthAfterRemove;
                    array.push.apply(array, insert);
                } else {
                    array.length = lengthAfterRemove + add;
                    for (i = 0; i < add; ++i) {
                        array[pos + i] = insert[i];
                    }
                }
            }
            return array;
        },
        replaceNative = function(array, index, removeCount, insert) {
            if (insert && insert.length) {
                if (index === 0 && !removeCount) {
                    array.unshift.apply(array, insert);
                }
                else if (index < array.length) {
                    array.splice.apply(array, [
                        index,
                        removeCount
                    ].concat(insert));
                } else {
                    array.push.apply(array, insert);
                }
            } else {
                array.splice(index, removeCount);
            }
            return array;
        },
        eraseSim = function(array, index, removeCount) {
            return replaceSim(array, index, removeCount);
        },
        eraseNative = function(array, index, removeCount) {
            array.splice(index, removeCount);
            return array;
        },
        spliceSim = function(array, index, removeCount) {
            var len = arguments.length,
                pos = fixArrayIndex(array, index),
                removed;
            if (len < 3) {
                removeCount = array.length - pos;
            }
            removed = array.slice(index, fixArrayIndex(array, pos + removeCount));
            if (len < 4) {
                replaceSim(array, pos, removeCount);
            } else {
                replaceSim(array, pos, removeCount, slice.call(arguments, 3));
            }
            return removed;
        },
        spliceNative = function(array) {
            return array.splice.apply(array, slice.call(arguments, 1));
        },
        erase = supportsSplice ? eraseNative : eraseSim,
        replace = supportsSplice ? replaceNative : replaceSim,
        splice = supportsSplice ? spliceNative : spliceSim,
        ExtArray = {
            binarySearch: function(array, item, begin, end, compareFn) {
                var length = array.length,
                    middle, comparison;
                if (begin instanceof Function) {
                    compareFn = begin;
                    begin = 0;
                    end = length;
                } else if (end instanceof Function) {
                    compareFn = end;
                    end = length;
                } else {
                    if (begin === undefined) {
                        begin = 0;
                    }
                    if (end === undefined) {
                        end = length;
                    }
                    compareFn = compareFn || ExtArray.lexicalCompare;
                }
                --end;
                while (begin <= end) {
                    middle = (begin + end) >> 1;
                    comparison = compareFn(item, array[middle]);
                    if (comparison >= 0) {
                        begin = middle + 1;
                    } else if (comparison < 0) {
                        end = middle - 1;
                    }
                }
                return begin;
            },
            defaultCompare: function(lhs, rhs) {
                return (lhs < rhs) ? -1 : ((lhs > rhs) ? 1 : 0);
            },
            lexicalCompare: function(lhs, rhs) {
                lhs = String(lhs);
                rhs = String(rhs);
                return (lhs < rhs) ? -1 : ((lhs > rhs) ? 1 : 0);
            },
            each: function(array, fn, scope, reverse) {
                array = ExtArray.from(array);
                var i,
                    ln = array.length;
                if (reverse !== true) {
                    for (i = 0; i < ln; i++) {
                        if (fn.call(scope || array[i], array[i], i, array) === false) {
                            return i;
                        }
                    }
                } else {
                    for (i = ln - 1; i > -1; i--) {
                        if (fn.call(scope || array[i], array[i], i, array) === false) {
                            return i;
                        }
                    }
                }
                return true;
            },
            forEach: ('forEach' in arrayPrototype) ? function(array, fn, scope) {
                return array.forEach(fn, scope);
            } : function(array, fn, scope) {
                for (var i = 0,
                    ln = array.length; i < ln; i++) {
                    fn.call(scope, array[i], i, array);
                }
            },
            indexOf: supportsIndexOf ? function(array, item, from) {
                return array ? arrayPrototype.indexOf.call(array, item, from) : -1;
            } : function(array, item, from) {
                var i,
                    length = array ? array.length : 0;
                for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                    if (array[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
            contains: supportsIndexOf ? function(array, item) {
                return arrayPrototype.indexOf.call(array, item) !== -1;
            } : function(array, item) {
                var i, ln;
                for (i = 0 , ln = array.length; i < ln; i++) {
                    if (array[i] === item) {
                        return true;
                    }
                }
                return false;
            },
            toArray: function(iterable, start, end) {
                if (!iterable || !iterable.length) {
                    return [];
                }
                if (typeof iterable === 'string') {
                    iterable = iterable.split('');
                }
                if (supportsSliceOnNodeList) {
                    return slice.call(iterable, start || 0, end || iterable.length);
                }
                var array = [],
                    i;
                start = start || 0;
                end = end ? ((end < 0) ? iterable.length + end : end) : iterable.length;
                for (i = start; i < end; i++) {
                    array.push(iterable[i]);
                }
                return array;
            },
            pluck: function(array, propertyName) {
                var ret = [],
                    i, ln, item;
                for (i = 0 , ln = array.length; i < ln; i++) {
                    item = array[i];
                    ret.push(item[propertyName]);
                }
                return ret;
            },
            map: ('map' in arrayPrototype) ? function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.map must have a callback function passed as second argument.');
                return array.map(fn, scope);
            } : function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.map must have a callback function passed as second argument.');
                var len = array.length,
                    results = new Array(len),
                    i;
                for (i = 0; i < len; i++) {
                    results[i] = fn.call(scope, array[i], i, array);
                }
                return results;
            },
            every: ('every' in arrayPrototype) ? function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.every must have a callback function passed as second argument.');
                return array.every(fn, scope);
            } : function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.every must have a callback function passed as second argument.');
                var i = 0,
                    ln = array.length;
                for (; i < ln; ++i) {
                    if (!fn.call(scope, array[i], i, array)) {
                        return false;
                    }
                }
                return true;
            },
            some: ('some' in arrayPrototype) ? function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.some must have a callback function passed as second argument.');
                return array.some(fn, scope);
            } : function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.some must have a callback function passed as second argument.');
                var i = 0,
                    ln = array.length;
                for (; i < ln; ++i) {
                    if (fn.call(scope, array[i], i, array)) {
                        return true;
                    }
                }
                return false;
            },
            equals: function(array1, array2) {
                var len1 = array1.length,
                    len2 = array2.length,
                    i;
                if (array1 === array2) {
                    return true;
                }
                if (len1 !== len2) {
                    return false;
                }
                for (i = 0; i < len1; ++i) {
                    if (array1[i] !== array2[i]) {
                        return false;
                    }
                }
                return true;
            },
            clean: function(array) {
                var results = [],
                    i = 0,
                    ln = array.length,
                    item;
                for (; i < ln; i++) {
                    item = array[i];
                    if (!Ext.isEmpty(item)) {
                        results.push(item);
                    }
                }
                return results;
            },
            unique: function(array) {
                var clone = [],
                    i = 0,
                    ln = array.length,
                    item;
                for (; i < ln; i++) {
                    item = array[i];
                    if (ExtArray.indexOf(clone, item) === -1) {
                        clone.push(item);
                    }
                }
                return clone;
            },
            filter: ('filter' in arrayPrototype) ? function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.filter must have a filter function passed as second argument.');
                return array.filter(fn, scope);
            } : function(array, fn, scope) {
                Ext.Assert.isFunction(fn, 'Ext.Array.filter must have a filter function passed as second argument.');
                var results = [],
                    i = 0,
                    ln = array.length;
                for (; i < ln; i++) {
                    if (fn.call(scope, array[i], i, array)) {
                        results.push(array[i]);
                    }
                }
                return results;
            },
            findBy: function(array, fn, scope) {
                var i = 0,
                    len = array.length;
                for (; i < len; i++) {
                    if (fn.call(scope || array, array[i], i)) {
                        return array[i];
                    }
                }
                return null;
            },
            from: function(value, newReference) {
                if (value === undefined || value === null) {
                    return [];
                }
                if (Ext.isArray(value)) {
                    return (newReference) ? slice.call(value) : value;
                }
                var type = typeof value;
                if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                    return ExtArray.toArray(value);
                }
                return [
                    value
                ];
            },
            remove: function(array, item) {
                var index = ExtArray.indexOf(array, item);
                if (index !== -1) {
                    erase(array, index, 1);
                }
                return array;
            },
            removeAt: function(array, index, count) {
                var len = array.length;
                if (index >= 0 && index < len) {
                    count = count || 1;
                    count = Math.min(count, len - index);
                    erase(array, index, count);
                }
                return array;
            },
            include: function(array, item) {
                if (!ExtArray.contains(array, item)) {
                    array.push(item);
                }
            },
            clone: function(array) {
                return slice.call(array);
            },
            merge: function() {
                var args = slice.call(arguments),
                    array = [],
                    i, ln;
                for (i = 0 , ln = args.length; i < ln; i++) {
                    array = array.concat(args[i]);
                }
                return ExtArray.unique(array);
            },
            intersect: function() {
                var intersection = [],
                    arrays = slice.call(arguments),
                    arraysLength, array, arrayLength, minArray, minArrayIndex, minArrayCandidate, minArrayLength, element, elementCandidate, elementCount, i, j, k;
                if (!arrays.length) {
                    return intersection;
                }
                arraysLength = arrays.length;
                for (i = minArrayIndex = 0; i < arraysLength; i++) {
                    minArrayCandidate = arrays[i];
                    if (!minArray || minArrayCandidate.length < minArray.length) {
                        minArray = minArrayCandidate;
                        minArrayIndex = i;
                    }
                }
                minArray = ExtArray.unique(minArray);
                erase(arrays, minArrayIndex, 1);
                minArrayLength = minArray.length;
                arraysLength = arrays.length;
                for (i = 0; i < minArrayLength; i++) {
                    element = minArray[i];
                    elementCount = 0;
                    for (j = 0; j < arraysLength; j++) {
                        array = arrays[j];
                        arrayLength = array.length;
                        for (k = 0; k < arrayLength; k++) {
                            elementCandidate = array[k];
                            if (element === elementCandidate) {
                                elementCount++;
                                break;
                            }
                        }
                    }
                    if (elementCount === arraysLength) {
                        intersection.push(element);
                    }
                }
                return intersection;
            },
            difference: function(arrayA, arrayB) {
                var clone = slice.call(arrayA),
                    ln = clone.length,
                    i, j, lnB;
                for (i = 0 , lnB = arrayB.length; i < lnB; i++) {
                    for (j = 0; j < ln; j++) {
                        if (clone[j] === arrayB[i]) {
                            erase(clone, j, 1);
                            j--;
                            ln--;
                        }
                    }
                }
                return clone;
            },
            reduce: Array.prototype.reduce ? function(array, reduceFn, initialValue) {
                if (arguments.length === 3) {
                    return Array.prototype.reduce.call(array, reduceFn, initialValue);
                }
                return Array.prototype.reduce.call(array, reduceFn);
            } : function(array, reduceFn, initialValue) {
                array = Object(array);
                if (!Ext.isFunction(reduceFn)) {
                    Ext.raise('Invalid parameter: expected a function.');
                }
                var index = 0,
                    length = array.length >>> 0,
                    reduced = initialValue;
                if (arguments.length < 3) {
                    while (true) {
                        if (index in array) {
                            reduced = array[index++];
                            break;
                        }
                        if (++index >= length) {
                            throw new TypeError('Reduce of empty array with no initial value');
                        }
                    }
                }
                for (; index < length; ++index) {
                    if (index in array) {
                        reduced = reduceFn(reduced, array[index], index, array);
                    }
                }
                return reduced;
            },
            slice: ([
                1,
                2
            ].slice(1, undefined).length ? function(array, begin, end) {
                return slice.call(array, begin, end);
            } : function(array, begin, end) {
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }),
            sort: function(array, sortFn) {
                return stableSort(array, sortFn || ExtArray.lexicalCompare);
            },
            flatten: function(array) {
                var worker = [];
                function rFlatten(a) {
                    var i, ln, v;
                    for (i = 0 , ln = a.length; i < ln; i++) {
                        v = a[i];
                        if (Ext.isArray(v)) {
                            rFlatten(v);
                        } else {
                            worker.push(v);
                        }
                    }
                    return worker;
                }
                return rFlatten(array);
            },
            min: function(array, comparisonFn) {
                var min = array[0],
                    i, ln, item;
                for (i = 0 , ln = array.length; i < ln; i++) {
                    item = array[i];
                    if (comparisonFn) {
                        if (comparisonFn(min, item) === 1) {
                            min = item;
                        }
                    } else {
                        if (item < min) {
                            min = item;
                        }
                    }
                }
                return min;
            },
            max: function(array, comparisonFn) {
                var max = array[0],
                    i, ln, item;
                for (i = 0 , ln = array.length; i < ln; i++) {
                    item = array[i];
                    if (comparisonFn) {
                        if (comparisonFn(max, item) === -1) {
                            max = item;
                        }
                    } else {
                        if (item > max) {
                            max = item;
                        }
                    }
                }
                return max;
            },
            mean: function(array) {
                return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
            },
            sum: function(array) {
                var sum = 0,
                    i, ln, item;
                for (i = 0 , ln = array.length; i < ln; i++) {
                    item = array[i];
                    sum += item;
                }
                return sum;
            },
            toMap: function(array, getKey, scope) {
                var map = {},
                    i = array.length;
                if (!getKey) {
                    while (i--) {
                        map[array[i]] = i + 1;
                    }
                } else if (typeof getKey === 'string') {
                    while (i--) {
                        map[array[i][getKey]] = i + 1;
                    }
                } else {
                    while (i--) {
                        map[getKey.call(scope, array[i])] = i + 1;
                    }
                }
                return map;
            },
            toValueMap: function(array, getKey, scope, arrayify) {
                var map = {},
                    i = array.length,
                    autoArray, alwaysArray, entry, fn, key, value;
                if (!getKey) {
                    while (i--) {
                        value = array[i];
                        map[value] = value;
                    }
                } else {
                    if (!(fn = (typeof getKey !== 'string'))) {
                        arrayify = scope;
                    }
                    alwaysArray = arrayify === 1;
                    autoArray = arrayify === 2;
                    while (i--) {
                        value = array[i];
                        key = fn ? getKey.call(scope, value) : value[getKey];
                        if (alwaysArray) {
                            if (key in map) {
                                map[key].push(value);
                            } else {
                                map[key] = [
                                    value
                                ];
                            }
                        } else if (autoArray && (key in map)) {
                            if ((entry = map[key]) instanceof Array) {
                                entry.push(value);
                            } else {
                                map[key] = [
                                    entry,
                                    value
                                ];
                            }
                        } else {
                            map[key] = value;
                        }
                    }
                }
                return map;
            },
            _replaceSim: replaceSim,
            _spliceSim: spliceSim,
            erase: erase,
            insert: function(array, index, items) {
                return replace(array, index, 0, items);
            },
            move: function(array, fromIdx, toIdx) {
                if (toIdx === fromIdx) {
                    return;
                }
                var item = array[fromIdx],
                    incr = toIdx > fromIdx ? 1 : -1,
                    i;
                for (i = fromIdx; i != toIdx; i += incr) {
                    array[i] = array[i + incr];
                }
                array[toIdx] = item;
            },
            replace: replace,
            splice: splice,
            push: function(target) {
                var len = arguments.length,
                    i = 1,
                    newItem;
                if (target === undefined) {
                    target = [];
                } else if (!Ext.isArray(target)) {
                    target = [
                        target
                    ];
                }
                for (; i < len; i++) {
                    newItem = arguments[i];
                    Array.prototype.push[Ext.isIterable(newItem) ? 'apply' : 'call'](target, newItem);
                }
                return target;
            },
            numericSortFn: function(a, b) {
                return a - b;
            }
        };
    Ext.each = ExtArray.each;
    ExtArray.union = ExtArray.merge;
    Ext.min = ExtArray.min;
    Ext.max = ExtArray.max;
    Ext.sum = ExtArray.sum;
    Ext.mean = ExtArray.mean;
    Ext.flatten = ExtArray.flatten;
    Ext.clean = ExtArray.clean;
    Ext.unique = ExtArray.unique;
    Ext.pluck = ExtArray.pluck;
    Ext.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
    return ExtArray;
}());

Ext.Function = (function() {
    var lastTime = 0,
        animFrameId,
        animFrameHandlers = [],
        animFrameNoArgs = [],
        idSource = 0,
        animFrameMap = {},
        win = window,
        global = Ext.global,
        hasImmediate = !!(global.setImmediate && global.clearImmediate),
        requestAnimFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || function(callback) {
            var currTime = Ext.now(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = win.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        },
        fireHandlers = function() {
            var len = animFrameHandlers.length,
                id, i, handler;
            animFrameId = null;
            for (i = 0; i < len; i++) {
                handler = animFrameHandlers[i];
                id = handler[3];
                if (animFrameMap[id]) {
                    handler[0].apply(handler[1] || global, handler[2] || animFrameNoArgs);
                    delete animFrameMap[id];
                }
            }
            animFrameHandlers = animFrameHandlers.slice(len);
        },
        fireElevatedHandlers = function() {
            Ext.elevateFunction(fireHandlers);
        },
        ExtFunction = {
            flexSetter: function(setter) {
                return function(name, value) {
                    var k, i;
                    if (name !== null) {
                        if (typeof name !== 'string') {
                            for (k in name) {
                                if (name.hasOwnProperty(k)) {
                                    setter.call(this, k, name[k]);
                                }
                            }
                            if (Ext.enumerables) {
                                for (i = Ext.enumerables.length; i--; ) {
                                    k = Ext.enumerables[i];
                                    if (name.hasOwnProperty(k)) {
                                        setter.call(this, k, name[k]);
                                    }
                                }
                            }
                        } else {
                            setter.call(this, name, value);
                        }
                    }
                    return this;
                };
            },
            bind: function(fn, scope, args, appendArgs) {
                if (arguments.length === 2) {
                    return function() {
                        return fn.apply(scope, arguments);
                    };
                }
                var method = fn,
                    slice = Array.prototype.slice;
                return function() {
                    var callArgs = args || arguments;
                    if (appendArgs === true) {
                        callArgs = slice.call(arguments, 0);
                        callArgs = callArgs.concat(args);
                    } else if (typeof appendArgs === 'number') {
                        callArgs = slice.call(arguments, 0);
                        Ext.Array.insert(callArgs, appendArgs, args);
                    }
                    return method.apply(scope || global, callArgs);
                };
            },
            bindCallback: function(callback, scope, args, delay, caller) {
                return function() {
                    var a = Ext.Array.slice(arguments);
                    return Ext.callback(callback, scope, args ? args.concat(a) : a, delay, caller);
                };
            },
            pass: function(fn, args, scope) {
                if (!Ext.isArray(args)) {
                    if (Ext.isIterable(args)) {
                        args = Ext.Array.clone(args);
                    } else {
                        args = args !== undefined ? [
                            args
                        ] : [];
                    }
                }
                return function() {
                    var fnArgs = args.slice();
                    fnArgs.push.apply(fnArgs, arguments);
                    return fn.apply(scope || this, fnArgs);
                };
            },
            alias: function(object, methodName) {
                return function() {
                    return object[methodName].apply(object, arguments);
                };
            },
            clone: function(method) {
                return function() {
                    return method.apply(this, arguments);
                };
            },
            createInterceptor: function(origFn, newFn, scope, returnValue) {
                if (!Ext.isFunction(newFn)) {
                    return origFn;
                } else {
                    returnValue = Ext.isDefined(returnValue) ? returnValue : null;
                    return function() {
                        var me = this,
                            args = arguments;
                        return (newFn.apply(scope || me || global, args) !== false) ? origFn.apply(me || global, args) : returnValue;
                    };
                }
            },
            createDelayed: function(fn, delay, scope, args, appendArgs) {
                if (scope || args) {
                    fn = Ext.Function.bind(fn, scope, args, appendArgs);
                }
                return function() {
                    var me = this,
                        args = Array.prototype.slice.call(arguments);
                    setTimeout(function() {
                        if (Ext.elevateFunction) {
                            Ext.elevateFunction(fn, me, args);
                        } else {
                            fn.apply(me, args);
                        }
                    }, delay);
                };
            },
            defer: function(fn, millis, scope, args, appendArgs) {
                fn = Ext.Function.bind(fn, scope, args, appendArgs);
                if (millis > 0) {
                    return setTimeout(function() {
                        if (Ext.elevateFunction) {
                            Ext.elevateFunction(fn);
                        } else {
                            fn();
                        }
                    }, millis);
                }
                fn();
                return 0;
            },
            interval: function(fn, millis, scope, args, appendArgs) {
                fn = Ext.Function.bind(fn, scope, args, appendArgs);
                return setInterval(function() {
                    if (Ext.elevateFunction) {
                        Ext.elevateFunction(fn);
                    } else {
                        fn();
                    }
                }, millis);
            },
            createSequence: function(originalFn, newFn, scope) {
                if (!newFn) {
                    return originalFn;
                } else {
                    return function() {
                        var result = originalFn.apply(this, arguments);
                        newFn.apply(scope || this, arguments);
                        return result;
                    };
                }
            },
            createBuffered: function(fn, buffer, scope, args) {
                var timerId;
                return function() {
                    var callArgs = args || Array.prototype.slice.call(arguments, 0),
                        me = scope || this;
                    if (timerId) {
                        clearTimeout(timerId);
                    }
                    timerId = setTimeout(function() {
                        if (Ext.elevateFunction) {
                            Ext.elevateFunction(fn, me, callArgs);
                        } else {
                            fn.apply(me, callArgs);
                        }
                    }, buffer);
                };
            },
            createAnimationFrame: function(fn, scope, args, queueStrategy) {
                var timerId;
                queueStrategy = queueStrategy || 3;
                return function() {
                    var callArgs = args || Array.prototype.slice.call(arguments, 0);
                    scope = scope || this;
                    if (queueStrategy === 3 && timerId) {
                        ExtFunction.cancelAnimationFrame(timerId);
                    }
                    if ((queueStrategy & 1) || !timerId) {
                        timerId = ExtFunction.requestAnimationFrame(function() {
                            timerId = null;
                            fn.apply(scope, callArgs);
                        });
                    }
                };
            },
            requestAnimationFrame: function(fn, scope, args) {
                var id = ++idSource,
                    handler = Array.prototype.slice.call(arguments, 0);
                handler[3] = id;
                animFrameMap[id] = 1;
                animFrameHandlers.push(handler);
                if (!animFrameId) {
                    animFrameId = requestAnimFrame(Ext.elevateFunction ? fireElevatedHandlers : fireHandlers);
                }
                return id;
            },
            cancelAnimationFrame: function(id) {
                delete animFrameMap[id];
            },
            createThrottled: function(fn, interval, scope) {
                var lastCallTime = 0,
                    elapsed, lastArgs, timer,
                    execute = function() {
                        if (Ext.elevateFunction) {
                            Ext.elevateFunction(fn, scope, lastArgs);
                        } else {
                            fn.apply(scope, lastArgs);
                        }
                        lastCallTime = Ext.now();
                        timer = null;
                    };
                return function() {
                    if (!scope) {
                        scope = this;
                    }
                    elapsed = Ext.now() - lastCallTime;
                    lastArgs = arguments;
                    if (elapsed >= interval) {
                        clearTimeout(timer);
                        execute();
                    }
                    else if (!timer) {
                        timer = Ext.defer(execute, interval - elapsed);
                    }
                };
            },
            createBarrier: function(count, fn, scope) {
                return function() {
                    if (!--count) {
                        fn.apply(scope, arguments);
                    }
                };
            },
            interceptBefore: function(object, methodName, fn, scope) {
                var method = object[methodName] || Ext.emptyFn;
                return (object[methodName] = function() {
                    var ret = fn.apply(scope || this, arguments);
                    method.apply(this, arguments);
                    return ret;
                });
            },
            interceptAfter: function(object, methodName, fn, scope) {
                var method = object[methodName] || Ext.emptyFn;
                return (object[methodName] = function() {
                    method.apply(this, arguments);
                    return fn.apply(scope || this, arguments);
                });
            },
            interceptAfterOnce: function(object, methodName, fn, scope) {
                var origMethod = object[methodName],
                    newMethod;
                newMethod = function() {
                    var ret;
                    if (origMethod) {
                        origMethod.apply(this, arguments);
                    }
                    ret = fn.apply(scope || this, arguments);
                    object[methodName] = origMethod;
                    object = methodName = fn = scope = origMethod = newMethod = null;
                    return ret;
                };
                object[methodName] = newMethod;
                return newMethod;
            },
            makeCallback: function(callback, scope) {
                if (!scope[callback]) {
                    if (scope.$className) {
                        Ext.raise('No method "' + callback + '" on ' + scope.$className);
                    }
                    Ext.raise('No method "' + callback + '"');
                }
                return function() {
                    return scope[callback].apply(scope, arguments);
                };
            },
            memoize: function(fn, scope, hashFn) {
                var memo = {},
                    isFunc = hashFn && Ext.isFunction(hashFn);
                return function(value) {
                    var key = isFunc ? hashFn.apply(scope, arguments) : value;
                    if (!(key in memo)) {
                        memo[key] = fn.apply(scope, arguments);
                    }
                    return memo[key];
                };
            }
        };
    Ext.asap = hasImmediate ? function(fn, scope, parameters) {
        if (scope != null || parameters != null) {
            fn = ExtFunction.bind(fn, scope, parameters);
        }
        return setImmediate(function() {
            if (Ext.elevateFunction) {
                Ext.elevateFunction(fn);
            } else {
                fn();
            }
        });
    } : function(fn, scope, parameters) {
        if (scope != null || parameters != null) {
            fn = ExtFunction.bind(fn, scope, parameters);
        }
        return setTimeout(function() {
            if (Ext.elevateFunction) {
                Ext.elevateFunction(fn);
            } else {
                fn();
            }
        }, 0, true);
    } , Ext.asapCancel = hasImmediate ? function(id) {
        clearImmediate(id);
    } : function(id) {
        clearTimeout(id);
    };
    Ext.defer = ExtFunction.defer;
    Ext.interval = ExtFunction.interval;
    Ext.pass = ExtFunction.pass;
    Ext.bind = ExtFunction.bind;
    Ext.deferCallback = ExtFunction.requestAnimationFrame;
    return ExtFunction;
})();

Ext.String = (function() {
    var trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
        escapeRe = /('|\\)/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        basicTrimRe = /^\s+|\s+$/g,
        whitespaceRe = /\s+/,
        varReplace = /(^[^a-z]*|[^\w])/gi,
        charToEntity, entityToChar, charToEntityRegex, entityToCharRegex,
        htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        },
        htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        },
        boundsCheck = function(s, other) {
            if (s === null || s === undefined || other === null || other === undefined) {
                return false;
            }
            return other.length <= s.length;
        },
        fromCharCode = String.fromCharCode,
        ExtString;
    return ExtString = {
        fromCodePoint: String.fromCodePoint || function() {
            var codePoint,
                result = '',
                codeUnits = [],
                index = -1,
                length = arguments.length;
            while (++index < length) {
                codePoint = Number(arguments[index]);
                if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || Math.floor(codePoint) !== codePoint) {
                    Ext.raise('Invalid code point: ' + codePoint);
                }
                if (codePoint <= 65535) {
                    codeUnits.push(codePoint);
                } else {
                    codePoint -= 65536;
                    codeUnits.push((codePoint >> 10) + 55296, (codePoint % 1024) + 56320);
                }
                if (index + 1 === length) {
                    result += fromCharCode(codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        },
        insert: function(s, value, index) {
            if (!s) {
                return value;
            }
            if (!value) {
                return s;
            }
            var len = s.length;
            if (!index && index !== 0) {
                index = len;
            }
            if (index < 0) {
                index *= -1;
                if (index >= len) {
                    index = 0;
                } else {
                    index = len - index;
                }
            }
            if (index === 0) {
                s = value + s;
            } else if (index >= s.length) {
                s += value;
            } else {
                s = s.substr(0, index) + value + s.substr(index);
            }
            return s;
        },
        startsWith: function(s, start, ignoreCase) {
            var result = boundsCheck(s, start);
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    start = start.toLowerCase();
                }
                result = s.lastIndexOf(start, 0) === 0;
            }
            return result;
        },
        endsWith: function(s, end, ignoreCase) {
            var result = boundsCheck(s, end);
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    end = end.toLowerCase();
                }
                result = s.indexOf(end, s.length - end.length) !== -1;
            }
            return result;
        },
        createVarName: function(s) {
            return s.replace(varReplace, '');
        },
        htmlEncode: function(value) {
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
        },
        htmlDecode: function(value) {
            return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
        },
        hasHtmlCharacters: function(s) {
            return charToEntityRegex.test(s);
        },
        addCharacterEntities: function(newEntities) {
            var charKeys = [],
                entityKeys = [],
                key, echar;
            for (key in newEntities) {
                echar = newEntities[key];
                entityToChar[key] = echar;
                charToEntity[echar] = key;
                charKeys.push(echar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        },
        resetCharacterEntities: function() {
            charToEntity = {};
            entityToChar = {};
            this.addCharacterEntities({
                '&amp;': '&',
                '&gt;': '>',
                '&lt;': '<',
                '&quot;': '"',
                '&#39;': "'"
            });
        },
        urlAppend: function(url, string) {
            if (!Ext.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }
            return url;
        },
        trim: function(string) {
            if (string) {
                string = string.replace(trimRegex, "");
            }
            return string || '';
        },
        capitalize: function(string) {
            if (string) {
                string = string.charAt(0).toUpperCase() + string.substr(1);
            }
            return string || '';
        },
        uncapitalize: function(string) {
            if (string) {
                string = string.charAt(0).toLowerCase() + string.substr(1);
            }
            return string || '';
        },
        ellipsis: function(value, length, word) {
            if (value && value.length > length) {
                if (word) {
                    var vs = value.substr(0, length - 2),
                        index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index !== -1 && index >= (length - 15)) {
                        return vs.substr(0, index) + "...";
                    }
                }
                return value.substr(0, length - 3) + "...";
            }
            return value;
        },
        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },
        createRegex: function(value, startsWith, endsWith, ignoreCase) {
            var ret = value;
            if (value != null && !value.exec) {
                ret = ExtString.escapeRegex(String(value));
                if (startsWith !== false) {
                    ret = '^' + ret;
                }
                if (endsWith !== false) {
                    ret += '$';
                }
                ret = new RegExp(ret, (ignoreCase !== false) ? 'i' : '');
            }
            return ret;
        },
        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },
        toggle: function(string, value, other) {
            return string === value ? other : value;
        },
        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },
        repeat: function(pattern, count, sep) {
            if (count < 1) {
                count = 0;
            }
            for (var buf = [],
                i = count; i--; ) {
                buf.push(pattern);
            }
            return buf.join(sep || '');
        },
        splitWords: function(words) {
            if (words && typeof words == 'string') {
                return words.replace(basicTrimRe, '').split(whitespaceRe);
            }
            return words || [];
        }
    };
}());
Ext.String.resetCharacterEntities();
Ext.htmlEncode = Ext.String.htmlEncode;
Ext.htmlDecode = Ext.String.htmlDecode;
Ext.urlAppend = Ext.String.urlAppend;

Ext.Date = (function() {
    var utilDate,
        nativeDate = Date,
        stripEscapeRe = /(\\.)/g,
        hourInfoRe = /([gGhHisucUOPZ]|MS)/,
        dateInfoRe = /([djzmnYycU]|MS)/,
        slashRe = /\\/gi,
        numberTokenRe = /\{(\d+)\}/g,
        MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
        pad = Ext.String.leftPad,
        code = [
            "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday, daysInMonth, dayMatched,",
            "def = me.defaults,",
            "from = Ext.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);",
            "if(results){",
            "{1}",
            "if(u != null){",
            "v = new Date(u * 1000);",
            "}else{",
            "dt = me.clearTime(new Date);",
            "y = from(y, from(def.y, dt.getFullYear()));",
            "m = from(m, from(def.m - 1, dt.getMonth()));",
            "dayMatched = d !== undefined;",
            "d = from(d, from(def.d, dt.getDate()));",
            "if (!dayMatched) {",
            "dt.setDate(1);",
            "dt.setMonth(m);",
            "dt.setFullYear(y);",
            "daysInMonth = me.getDaysInMonth(dt);",
            "if (d > daysInMonth) {",
            "d = daysInMonth;",
            "}",
            "}",
            "h  = from(h, from(def.h, dt.getHours()));",
            "i  = from(i, from(def.i, dt.getMinutes()));",
            "s  = from(s, from(def.s, dt.getSeconds()));",
            "ms = from(ms, from(def.ms, dt.getMilliseconds()));",
            "if(z >= 0 && y >= 0){",
            "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
            "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
            "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){",
            "v = null;",
            "}else{",
            "if (W) {",
            "year = y || (new Date()).getFullYear();",
            "jan4 = new Date(year, 0, 4, 0, 0, 0);",
            "d = jan4.getDay();",
            "week1monday = new Date(jan4.getTime() - ((d === 0 ? 6 : d - 1) * 86400000));",
            "v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000 + 43200000)));",
            "} else {",
            "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
            "}",
            "}",
            "}",
            "}",
            "if(v){",
            "if(zz != null){",
            "v = me.add(v, me.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            "v = me.add(v, me.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
            "}",
            "return (v != null) ? v : null;"
        ].join('\n');
    if (!Date.prototype.toISOString) {
        Date.prototype.toISOString = function() {
            var me = this;
            return pad(me.getUTCFullYear(), 4, '0') + '-' + pad(me.getUTCMonth() + 1, 2, '0') + '-' + pad(me.getUTCDate(), 2, '0') + 'T' + pad(me.getUTCHours(), 2, '0') + ':' + pad(me.getUTCMinutes(), 2, '0') + ':' + pad(me.getUTCSeconds(), 2, '0') + '.' + pad(me.getUTCMilliseconds(), 3, '0') + 'Z';
        };
    }
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(numberTokenRe, function(m, i) {
            return args[i];
        });
    }
    utilDate = {
        now: nativeDate.now,
        toString: function(date) {
            if (!date) {
                date = new nativeDate();
            }
            return date.getFullYear() + "-" + pad(date.getMonth() + 1, 2, '0') + "-" + pad(date.getDate(), 2, '0') + "T" + pad(date.getHours(), 2, '0') + ":" + pad(date.getMinutes(), 2, '0') + ":" + pad(date.getSeconds(), 2, '0');
        },
        getElapsed: function(dateA, dateB) {
            return Math.abs(dateA - (dateB || utilDate.now()));
        },
        useStrict: false,
        formatCodeToRegex: function(character, currentGroup) {
            var p = utilDate.parseCodes[character];
            if (p) {
                p = typeof p === 'function' ? p() : p;
                utilDate.parseCodes[character] = p;
            }
            return p ? Ext.applyIf({
                c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
            }, p) : {
                g: 0,
                c: null,
                s: Ext.String.escapeRegex(character)
            };
        },
        parseFunctions: {
            "MS": function(input, strict) {
                var r = (input || '').match(MSFormatRe);
                return r ? new nativeDate(((r[1] || '') + r[2]) * 1) : null;
            },
            "time": function(input, strict) {
                var num = parseInt(input, 10);
                if (num || num === 0) {
                    return new nativeDate(num);
                }
                return null;
            },
            "timestamp": function(input, strict) {
                var num = parseInt(input, 10);
                if (num || num === 0) {
                    return new nativeDate(num * 1000);
                }
                return null;
            }
        },
        parseRegexes: [],
        formatFunctions: {
            "MS": function() {
                return '\\/Date(' + this.getTime() + ')\\/';
            },
            "time": function() {
                return this.getTime().toString();
            },
            "timestamp": function() {
                return utilDate.format(this, 'U');
            }
        },
        y2kYear: 50,
        MILLI: "ms",
        SECOND: "s",
        MINUTE: "mi",
        HOUR: "h",
        DAY: "d",
        MONTH: "mo",
        YEAR: "y",
        DAYS_IN_WEEK: 7,
        MONTHS_IN_YEAR: 12,
        MAX_DAYS_IN_MONTH: 31,
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        defaults: {},
        dayNames: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ],
        monthNames: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        monthNumbers: {
            January: 0,
            Jan: 0,
            February: 1,
            Feb: 1,
            March: 2,
            Mar: 2,
            April: 3,
            Apr: 3,
            May: 4,
            June: 5,
            Jun: 5,
            July: 6,
            Jul: 6,
            August: 7,
            Aug: 7,
            September: 8,
            Sep: 8,
            October: 9,
            Oct: 9,
            November: 10,
            Nov: 10,
            December: 11,
            Dec: 11
        },
        defaultFormat: "m/d/Y",
        firstDayOfWeek: 0,
        weekendDays: [
            0,
            6
        ],
        getShortMonthName: function(month) {
            return utilDate.monthNames[month].substring(0, 3);
        },
        getShortDayName: function(day) {
            return utilDate.dayNames[day].substring(0, 3);
        },
        getMonthNumber: function(name) {
            return utilDate.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },
        formatContainsHourInfo: function(format) {
            return hourInfoRe.test(format.replace(stripEscapeRe, ''));
        },
        formatContainsDateInfo: function(format) {
            return dateInfoRe.test(format.replace(stripEscapeRe, ''));
        },
        unescapeFormat: function(format) {
            return format.replace(slashRe, '');
        },
        formatCodes: {
            d: "Ext.String.leftPad(m.getDate(), 2, '0')",
            D: "Ext.Date.getShortDayName(m.getDay())",
            j: "m.getDate()",
            l: "Ext.Date.dayNames[m.getDay()]",
            N: "(m.getDay() ? m.getDay() : 7)",
            S: "Ext.Date.getSuffix(m)",
            w: "m.getDay()",
            z: "Ext.Date.getDayOfYear(m)",
            W: "Ext.String.leftPad(Ext.Date.getWeekOfYear(m), 2, '0')",
            F: "Ext.Date.monthNames[m.getMonth()]",
            m: "Ext.String.leftPad(m.getMonth() + 1, 2, '0')",
            M: "Ext.Date.getShortMonthName(m.getMonth())",
            n: "(m.getMonth() + 1)",
            t: "Ext.Date.getDaysInMonth(m)",
            L: "(Ext.Date.isLeapYear(m) ? 1 : 0)",
            o: "(m.getFullYear() + (Ext.Date.getWeekOfYear(m) == 1 && m.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(m) >= 52 && m.getMonth() < 11 ? -1 : 0)))",
            Y: "Ext.String.leftPad(m.getFullYear(), 4, '0')",
            y: "('' + m.getFullYear()).substring(2, 4)",
            a: "(m.getHours() < 12 ? 'am' : 'pm')",
            A: "(m.getHours() < 12 ? 'AM' : 'PM')",
            g: "((m.getHours() % 12) ? m.getHours() % 12 : 12)",
            G: "m.getHours()",
            h: "Ext.String.leftPad((m.getHours() % 12) ? m.getHours() % 12 : 12, 2, '0')",
            H: "Ext.String.leftPad(m.getHours(), 2, '0')",
            i: "Ext.String.leftPad(m.getMinutes(), 2, '0')",
            s: "Ext.String.leftPad(m.getSeconds(), 2, '0')",
            u: "Ext.String.leftPad(m.getMilliseconds(), 3, '0')",
            O: "Ext.Date.getGMTOffset(m)",
            P: "Ext.Date.getGMTOffset(m, true)",
            T: "Ext.Date.getTimezone(m)",
            Z: "(m.getTimezoneOffset() * -60)",
            c: function() {
                var c = "Y-m-dTH:i:sP",
                    code = [],
                    i,
                    l = c.length,
                    e;
                for (i = 0; i < l; ++i) {
                    e = c.charAt(i);
                    code.push(e === "T" ? "'T'" : utilDate.getFormatCode(e));
                }
                return code.join(" + ");
            },
            C: function() {
                return 'm.toISOString()';
            },
            U: "Math.round(m.getTime() / 1000)"
        },
        isValid: function(year, month, day, hour, minute, second, millisecond) {
            hour = hour || 0;
            minute = minute || 0;
            second = second || 0;
            millisecond = millisecond || 0;
            var dt = utilDate.add(new nativeDate(year < 100 ? 100 : year, month - 1, day, hour, minute, second, millisecond), utilDate.YEAR, year < 100 ? year - 100 : 0);
            return year === dt.getFullYear() && month === dt.getMonth() + 1 && day === dt.getDate() && hour === dt.getHours() && minute === dt.getMinutes() && second === dt.getSeconds() && millisecond === dt.getMilliseconds();
        },
        parse: function(input, format, strict) {
            var p = utilDate.parseFunctions;
            if (p[format] == null) {
                utilDate.createParser(format);
            }
            return p[format].call(utilDate, input, Ext.isDefined(strict) ? strict : utilDate.useStrict);
        },
        parseDate: function(input, format, strict) {
            return utilDate.parse(input, format, strict);
        },
        getFormatCode: function(character) {
            var f = utilDate.formatCodes[character];
            if (f) {
                f = typeof f === 'function' ? f() : f;
                utilDate.formatCodes[character] = f;
            }
            return f || ("'" + Ext.String.escape(character) + "'");
        },
        createFormat: function(format) {
            var code = [],
                special = false,
                ch = '',
                i;
            for (i = 0; i < format.length; ++i) {
                ch = format.charAt(i);
                if (!special && ch === "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    code.push("'" + Ext.String.escape(ch) + "'");
                } else {
                    if (ch === '\n') {
                        code.push("'\\n'");
                    } else {
                        code.push(utilDate.getFormatCode(ch));
                    }
                }
            }
            utilDate.formatFunctions[format] = Ext.functionFactory("var m=this;return " + code.join('+'));
        },
        createParser: function(format) {
            var regexNum = utilDate.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "",
                i = 0,
                len = format.length,
                atEnd = [],
                obj;
            for (; i < len; ++i) {
                ch = format.charAt(i);
                if (!special && ch === "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    regex.push(Ext.String.escape(ch));
                } else {
                    obj = utilDate.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex.push(obj.s);
                    if (obj.g && obj.c) {
                        if (obj.calcAtEnd) {
                            atEnd.push(obj.c);
                        } else {
                            calc.push(obj.c);
                        }
                    }
                }
            }
            calc = calc.concat(atEnd);
            utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
            utilDate.parseFunctions[format] = Ext.functionFactory("input", "strict", xf(code, regexNum, calc.join('')));
        },
        parseCodes: {
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(3[0-1]|[1-2][0-9]|0[1-9])"
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(3[0-1]|[1-2][0-9]|[1-9])"
            },
            D: function() {
                for (var a = [],
                    i = 0; i < 7; a.push(utilDate.getShortDayName(i)) , ++i){}
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.join("|") + ")"
                };
            },
            l: function() {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + utilDate.dayNames.join("|") + ")"
                };
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]"
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
            },
            W: {
                g: 1,
                c: "W = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
            },
            F: function() {
                return {
                    g: 1,
                    c: "m = parseInt(me.getMonthNumber(results[{0}]), 10);\n",
                    s: "(" + utilDate.monthNames.join("|") + ")"
                };
            },
            M: function() {
                for (var a = [],
                    i = 0; i < 12; a.push(utilDate.getShortMonthName(i)) , ++i){}
                return Ext.applyIf({
                    s: "(" + a.join("|") + ")"
                }, utilDate.formatCodeToRegex("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(1[0-2]|0[1-9])"
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(1[0-2]|[1-9])"
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n" + "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n",
                s: "(\\d{2})"
            },
            a: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\n" + "if (!h || h == 12) { h = 0; }\n" + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(am|pm|AM|PM)",
                calcAtEnd: true
            },
            A: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\n" + "if (!h || h == 12) { h = 0; }\n" + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM|am|pm)",
                calcAtEnd: true
            },
            g: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(1[0-2]|[0-9])"
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(2[0-3]|1[0-9]|[0-9])"
            },
            h: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(1[0-2]|0[1-9])"
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(2[0-3]|[0-1][0-9])"
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "([0-5][0-9])"
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "([0-5][0-9])"
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
            },
            O: {
                g: 1,
                c: [
                    "o = results[{0}];",
                    "var sn = o.substring(0,1),",
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),",
                    "mn = o.substring(3,5) % 60;",
                    "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"
                ].join("\n"),
                s: "([+-]\\d{4})"
            },
            P: {
                g: 1,
                c: [
                    "o = results[{0}];",
                    "var sn = o.substring(0,1),",
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),",
                    "mn = o.substring(4,6) % 60;",
                    "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"
                ].join("\n"),
                s: "([+-]\\d{2}:\\d{2})"
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,5}"
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n" + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+-]?\\d{1,5})"
            },
            c: function() {
                var calc = [],
                    arr = [
                        utilDate.formatCodeToRegex("Y", 1),
                        utilDate.formatCodeToRegex("m", 2),
                        utilDate.formatCodeToRegex("d", 3),
                        utilDate.formatCodeToRegex("H", 4),
                        utilDate.formatCodeToRegex("i", 5),
                        utilDate.formatCodeToRegex("s", 6),
                        {
                            c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                        },
                        {
                            c: [
                                "if(results[8]) {",
                                "if(results[8] == 'Z'){",
                                "zz = 0;",
                                "}else if (results[8].indexOf(':') > -1){",
                                utilDate.formatCodeToRegex("P", 8).c,
                                "}else{",
                                utilDate.formatCodeToRegex("O", 8).c,
                                "}",
                                "}"
                            ].join('\n')
                        }
                    ],
                    i, l;
                for (i = 0 , l = arr.length; i < l; ++i) {
                    calc.push(arr[i].c);
                }
                return {
                    g: 1,
                    c: calc.join(""),
                    s: [
                        arr[0].s,
                        "(?:",
                        "-",
                        arr[1].s,
                        "(?:",
                        "-",
                        arr[2].s,
                        "(?:",
                        "(?:T| )?",
                        arr[3].s,
                        ":",
                        arr[4].s,
                        "(?::",
                        arr[5].s,
                        ")?",
                        "(?:(?:\\.|,)(\\d+))?",
                        "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?",
                        ")?",
                        ")?",
                        ")?"
                    ].join("")
                };
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)"
            }
        },
        dateFormat: function(date, format) {
            return utilDate.format(date, format);
        },
        isEqual: function(date1, date2) {
            if (date1 && date2) {
                return (date1.getTime() === date2.getTime());
            }
            return !(date1 || date2);
        },
        format: function(date, format) {
            var formatFunctions = utilDate.formatFunctions;
            if (!Ext.isDate(date)) {
                return '';
            }
            if (formatFunctions[format] == null) {
                utilDate.createFormat(format);
            }
            return formatFunctions[format].call(date) + '';
        },
        getTimezone: function(date) {
            return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
        },
        getGMTOffset: function(date, colon) {
            var offset = date.getTimezoneOffset();
            return (offset > 0 ? "-" : "+") + Ext.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0") + (colon ? ":" : "") + Ext.String.leftPad(Math.abs(offset % 60), 2, "0");
        },
        getDayOfYear: function(date) {
            var num = 0,
                d = utilDate.clone(date),
                m = date.getMonth(),
                i;
            for (i = 0 , d.setDate(1) , d.setMonth(0); i < m; d.setMonth(++i)) {
                num += utilDate.getDaysInMonth(d);
            }
            return num + date.getDate() - 1;
        },
        getWeekOfYear: (function() {
            var ms1d = 86400000,
                ms7d = 7 * ms1d;
            return function(date) {
                var DC3 = nativeDate.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                    AWN = Math.floor(DC3 / 7),
                    Wyr = new nativeDate(AWN * ms7d).getUTCFullYear();
                return AWN - Math.floor(nativeDate.UTC(Wyr, 0, 7) / ms7d) + 1;
            };
        }()),
        isLeapYear: function(date) {
            var year = date.getFullYear();
            return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
        },
        getFirstDayOfMonth: function(date) {
            var day = (date.getDay() - (date.getDate() - 1)) % 7;
            return (day < 0) ? (day + 7) : day;
        },
        getLastDayOfMonth: function(date) {
            return utilDate.getLastDateOfMonth(date).getDay();
        },
        getFirstDateOfMonth: function(date) {
            return new nativeDate(date.getFullYear(), date.getMonth(), 1);
        },
        getLastDateOfMonth: function(date) {
            return new nativeDate(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
        },
        getDaysInMonth: (function() {
            var daysInMonth = [
                    31,
                    28,
                    31,
                    30,
                    31,
                    30,
                    31,
                    31,
                    30,
                    31,
                    30,
                    31
                ];
            return function(date) {
                var m = date.getMonth();
                return m === 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
            };
        }()),
        getSuffix: function(date) {
            switch (date.getDate()) {
                case 1:
                case 21:
                case 31:
                    return "st";
                case 2:
                case 22:
                    return "nd";
                case 3:
                case 23:
                    return "rd";
                default:
                    return "th";
            }
        },
        clone: function(date) {
            return new nativeDate(date.getTime());
        },
        isDST: function(date) {
            return new nativeDate(date.getFullYear(), 0, 1).getTimezoneOffset() !== date.getTimezoneOffset();
        },
        clearTime: function(date, clone) {
            if (isNaN(date.getTime())) {
                return date;
            }
            if (clone) {
                return utilDate.clearTime(utilDate.clone(date));
            }
            var d = date.getDate(),
                hr, c;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (date.getDate() !== d) {
                for (hr = 1 , c = utilDate.add(date, utilDate.HOUR, hr); c.getDate() !== d; hr++ , c = utilDate.add(date, utilDate.HOUR, hr)){}
                date.setDate(d);
                date.setHours(c.getHours());
            }
            return date;
        },
        add: function(date, interval, value) {
            var d = utilDate.clone(date),
                base = 0,
                day, decimalValue;
            if (!interval || value === 0) {
                return d;
            }
            decimalValue = value - parseInt(value, 10);
            value = parseInt(value, 10);
            if (value) {
                switch (interval.toLowerCase()) {
                    case utilDate.MILLI:
                        d.setTime(d.getTime() + value);
                        break;
                    case utilDate.SECOND:
                        d.setTime(d.getTime() + value * 1000);
                        break;
                    case utilDate.MINUTE:
                        d.setTime(d.getTime() + value * 60 * 1000);
                        break;
                    case utilDate.HOUR:
                        d.setTime(d.getTime() + value * 60 * 60 * 1000);
                        break;
                    case utilDate.DAY:
                        d.setTime(d.getTime() + value * 24 * 60 * 60 * 1000);
                        break;
                    case utilDate.MONTH:
                        day = date.getDate();
                        if (day > 28) {
                            day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.MONTH, value)).getDate());
                        };
                        d.setDate(day);
                        d.setMonth(date.getMonth() + value);
                        break;
                    case utilDate.YEAR:
                        day = date.getDate();
                        if (day > 28) {
                            day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.YEAR, value)).getDate());
                        };
                        d.setDate(day);
                        d.setFullYear(date.getFullYear() + value);
                        break;
                }
            }
            if (decimalValue) {
                switch (interval.toLowerCase()) {
                    case utilDate.MILLI:
                        base = 1;
                        break;
                    case utilDate.SECOND:
                        base = 1000;
                        break;
                    case utilDate.MINUTE:
                        base = 1000 * 60;
                        break;
                    case utilDate.HOUR:
                        base = 1000 * 60 * 60;
                        break;
                    case utilDate.DAY:
                        base = 1000 * 60 * 60 * 24;
                        break;
                    case utilDate.MONTH:
                        day = utilDate.getDaysInMonth(d);
                        base = 1000 * 60 * 60 * 24 * day;
                        break;
                    case utilDate.YEAR:
                        day = (utilDate.isLeapYear(d) ? 366 : 365);
                        base = 1000 * 60 * 60 * 24 * day;
                        break;
                }
                if (base) {
                    d.setTime(d.getTime() + base * decimalValue);
                }
            }
            return d;
        },
        subtract: function(date, interval, value) {
            return utilDate.add(date, interval, -value);
        },
        between: function(date, start, end) {
            var t = date.getTime();
            return start.getTime() <= t && t <= end.getTime();
        },
        isWeekend: function(date) {
            return Ext.Array.indexOf(this.weekendDays, date.getDay()) > -1;
        },
        utcToLocal: function(d) {
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        },
        localToUtc: function(d) {
            return utilDate.utc(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
        },
        utc: function(year, month, day, hour, min, s, ms) {
            return new Date(Date.UTC(year, month, day, hour || 0, min || 0, s || 0, ms || 0));
        },
        compat: function() {
            var p,
                statics = [
                    'useStrict',
                    'formatCodeToRegex',
                    'parseFunctions',
                    'parseRegexes',
                    'formatFunctions',
                    'y2kYear',
                    'MILLI',
                    'SECOND',
                    'MINUTE',
                    'HOUR',
                    'DAY',
                    'MONTH',
                    'YEAR',
                    'defaults',
                    'dayNames',
                    'monthNames',
                    'monthNumbers',
                    'getShortMonthName',
                    'getShortDayName',
                    'getMonthNumber',
                    'formatCodes',
                    'isValid',
                    'parseDate',
                    'getFormatCode',
                    'createFormat',
                    'createParser',
                    'parseCodes'
                ],
                proto = [
                    'dateFormat',
                    'format',
                    'getTimezone',
                    'getGMTOffset',
                    'getDayOfYear',
                    'getWeekOfYear',
                    'isLeapYear',
                    'getFirstDayOfMonth',
                    'getLastDayOfMonth',
                    'getDaysInMonth',
                    'getSuffix',
                    'clone',
                    'isDST',
                    'clearTime',
                    'add',
                    'between'
                ],
                sLen = statics.length,
                pLen = proto.length,
                stat, prot, s;
            for (s = 0; s < sLen; s++) {
                stat = statics[s];
                nativeDate[stat] = utilDate[stat];
            }
            for (p = 0; p < pLen; p++) {
                prot = proto[p];
                nativeDate.prototype[prot] = function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(this);
                    return utilDate[prot].apply(utilDate, args);
                };
            }
        },
        diff: function(min, max, unit) {
            var est,
                diff = +max - min;
            switch (unit) {
                case utilDate.MILLI:
                    return diff;
                case utilDate.SECOND:
                    return Math.floor(diff / 1000);
                case utilDate.MINUTE:
                    return Math.floor(diff / 60000);
                case utilDate.HOUR:
                    return Math.floor(diff / 3600000);
                case utilDate.DAY:
                    return Math.floor(diff / 86400000);
                case 'w':
                    return Math.floor(diff / 604800000);
                case utilDate.MONTH:
                    est = (max.getFullYear() * 12 + max.getMonth()) - (min.getFullYear() * 12 + min.getMonth());
                    if (utilDate.add(min, unit, est) > max) {
                        return est - 1;
                    };
                    return est;
                case utilDate.YEAR:
                    est = max.getFullYear() - min.getFullYear();
                    if (utilDate.add(min, unit, est) > max) {
                        return est - 1;
                    } else {
                        return est;
                    };
            }
        },
        align: function(date, unit, step) {
            var num = new nativeDate(+date);
            switch (unit.toLowerCase()) {
                case utilDate.MILLI:
                    return num;
                case utilDate.SECOND:
                    num.setUTCSeconds(num.getUTCSeconds() - num.getUTCSeconds() % step);
                    num.setUTCMilliseconds(0);
                    return num;
                case utilDate.MINUTE:
                    num.setUTCMinutes(num.getUTCMinutes() - num.getUTCMinutes() % step);
                    num.setUTCSeconds(0);
                    num.setUTCMilliseconds(0);
                    return num;
                case utilDate.HOUR:
                    num.setUTCHours(num.getUTCHours() - num.getUTCHours() % step);
                    num.setUTCMinutes(0);
                    num.setUTCSeconds(0);
                    num.setUTCMilliseconds(0);
                    return num;
                case utilDate.DAY:
                    if (step === 7 || step === 14) {
                        num.setUTCDate(num.getUTCDate() - num.getUTCDay() + 1);
                    };
                    num.setUTCHours(0);
                    num.setUTCMinutes(0);
                    num.setUTCSeconds(0);
                    num.setUTCMilliseconds(0);
                    return num;
                case utilDate.MONTH:
                    num.setUTCMonth(num.getUTCMonth() - (num.getUTCMonth() - 1) % step, 1);
                    num.setUTCHours(0);
                    num.setUTCMinutes(0);
                    num.setUTCSeconds(0);
                    num.setUTCMilliseconds(0);
                    return num;
                case utilDate.YEAR:
                    num.setUTCFullYear(num.getUTCFullYear() - num.getUTCFullYear() % step, 1, 1);
                    num.setUTCHours(0);
                    num.setUTCMinutes(0);
                    num.setUTCSeconds(0);
                    num.setUTCMilliseconds(0);
                    return date;
            }
        }
    };
    utilDate.parseCodes.C = utilDate.parseCodes.c;
    return utilDate;
}());

(function() {
    var TemplateClass = function() {},
        queryRe = /^\?/,
        keyRe = /(\[):?([^\]]*)\]/g,
        nameRe = /^([^\[]+)/,
        plusRe = /\+/g,
        ExtObject = Ext.Object = {
            chain: Object.create || function(object) {
                TemplateClass.prototype = object;
                var result = new TemplateClass();
                TemplateClass.prototype = null;
                return result;
            },
            clear: function(object) {
                for (var key in object) {
                    delete object[key];
                }
                return object;
            },
            freeze: Object.freeze ? function(obj, deep) {
                if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
                    Object.freeze(obj);
                    if (deep) {
                        for (var name in obj) {
                            ExtObject.freeze(obj[name], deep);
                        }
                    }
                }
                return obj;
            } : Ext.identityFn,
            toQueryObjects: function(name, value, recursive) {
                var self = ExtObject.toQueryObjects,
                    objects = [],
                    i, ln;
                if (Ext.isArray(value)) {
                    for (i = 0 , ln = value.length; i < ln; i++) {
                        if (recursive) {
                            objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                        } else {
                            objects.push({
                                name: name,
                                value: value[i]
                            });
                        }
                    }
                } else if (Ext.isObject(value)) {
                    for (i in value) {
                        if (value.hasOwnProperty(i)) {
                            if (recursive) {
                                objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                            } else {
                                objects.push({
                                    name: name,
                                    value: value[i]
                                });
                            }
                        }
                    }
                } else {
                    objects.push({
                        name: name,
                        value: value
                    });
                }
                return objects;
            },
            toQueryString: function(object, recursive) {
                var paramObjects = [],
                    params = [],
                    i, j, ln, paramObject, value;
                for (i in object) {
                    if (object.hasOwnProperty(i)) {
                        paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i, object[i], recursive));
                    }
                }
                for (j = 0 , ln = paramObjects.length; j < ln; j++) {
                    paramObject = paramObjects[j];
                    value = paramObject.value;
                    if (Ext.isEmpty(value)) {
                        value = '';
                    } else if (Ext.isDate(value)) {
                        value = Ext.Date.toString(value);
                    }
                    params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
                }
                return params.join('&');
            },
            fromQueryString: function(queryString, recursive) {
                var parts = queryString.replace(queryRe, '').split('&'),
                    object = {},
                    temp, components, name, value, i, ln, part, j, subLn, matchedKeys, matchedName, keys, key, nextKey;
                for (i = 0 , ln = parts.length; i < ln; i++) {
                    part = parts[i];
                    if (part.length > 0) {
                        components = part.split('=');
                        name = components[0];
                        name = name.replace(plusRe, '%20');
                        name = decodeURIComponent(name);
                        value = components[1];
                        if (value !== undefined) {
                            value = value.replace(plusRe, '%20');
                            value = decodeURIComponent(value);
                        } else {
                            value = '';
                        }
                        if (!recursive) {
                            if (object.hasOwnProperty(name)) {
                                if (!Ext.isArray(object[name])) {
                                    object[name] = [
                                        object[name]
                                    ];
                                }
                                object[name].push(value);
                            } else {
                                object[name] = value;
                            }
                        } else {
                            matchedKeys = name.match(keyRe);
                            matchedName = name.match(nameRe);
                            if (!matchedName) {
                                throw new Error('[Ext.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                            }
                            name = matchedName[0];
                            keys = [];
                            if (matchedKeys === null) {
                                object[name] = value;
                                
                                continue;
                            }
                            for (j = 0 , subLn = matchedKeys.length; j < subLn; j++) {
                                key = matchedKeys[j];
                                key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                                keys.push(key);
                            }
                            keys.unshift(name);
                            temp = object;
                            for (j = 0 , subLn = keys.length; j < subLn; j++) {
                                key = keys[j];
                                if (j === subLn - 1) {
                                    if (Ext.isArray(temp) && key === '') {
                                        temp.push(value);
                                    } else {
                                        temp[key] = value;
                                    }
                                } else {
                                    if (temp[key] === undefined || typeof temp[key] === 'string') {
                                        nextKey = keys[j + 1];
                                        temp[key] = (Ext.isNumeric(nextKey) || nextKey === '') ? [] : {};
                                    }
                                    temp = temp[key];
                                }
                            }
                        }
                    }
                }
                return object;
            },
            each: function(object, fn, scope) {
                var enumerables = Ext.enumerables,
                    i, property;
                if (object) {
                    scope = scope || object;
                    for (property in object) {
                        if (object.hasOwnProperty(property)) {
                            if (fn.call(scope, property, object[property], object) === false) {
                                return;
                            }
                        }
                    }
                    if (enumerables) {
                        for (i = enumerables.length; i--; ) {
                            if (object.hasOwnProperty(property = enumerables[i])) {
                                if (fn.call(scope, property, object[property], object) === false) {
                                    return;
                                }
                            }
                        }
                    }
                }
            },
            eachValue: function(object, fn, scope) {
                var enumerables = Ext.enumerables,
                    i, property;
                scope = scope || object;
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        if (fn.call(scope, object[property]) === false) {
                            return;
                        }
                    }
                }
                if (enumerables) {
                    for (i = enumerables.length; i--; ) {
                        if (object.hasOwnProperty(property = enumerables[i])) {
                            if (fn.call(scope, object[property]) === false) {
                                return;
                            }
                        }
                    }
                }
            },
            merge: function(destination) {
                var i = 1,
                    ln = arguments.length,
                    mergeFn = ExtObject.merge,
                    cloneFn = Ext.clone,
                    object, key, value, sourceKey;
                for (; i < ln; i++) {
                    object = arguments[i];
                    for (key in object) {
                        value = object[key];
                        if (value && value.constructor === Object) {
                            sourceKey = destination[key];
                            if (sourceKey && sourceKey.constructor === Object) {
                                mergeFn(sourceKey, value);
                            } else {
                                destination[key] = cloneFn(value);
                            }
                        } else {
                            destination[key] = value;
                        }
                    }
                }
                return destination;
            },
            mergeIf: function(destination) {
                var i = 1,
                    ln = arguments.length,
                    cloneFn = Ext.clone,
                    object, key, value;
                for (; i < ln; i++) {
                    object = arguments[i];
                    for (key in object) {
                        if (!(key in destination)) {
                            value = object[key];
                            if (value && value.constructor === Object) {
                                destination[key] = cloneFn(value);
                            } else {
                                destination[key] = value;
                            }
                        }
                    }
                }
                return destination;
            },
            getAllKeys: function(object) {
                var keys = [],
                    property;
                for (property in object) {
                    keys.push(property);
                }
                return keys;
            },
            getKey: function(object, value) {
                for (var property in object) {
                    if (object.hasOwnProperty(property) && object[property] === value) {
                        return property;
                    }
                }
                return null;
            },
            getValues: function(object) {
                var values = [],
                    property;
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        values.push(object[property]);
                    }
                }
                return values;
            },
            getKeys: (typeof Object.keys == 'function') ? function(object) {
                if (!object) {
                    return [];
                }
                return Object.keys(object);
            } : function(object) {
                var keys = [],
                    property;
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        keys.push(property);
                    }
                }
                return keys;
            },
            getSize: function(object) {
                var size = 0,
                    property;
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        size++;
                    }
                }
                return size;
            },
            isEmpty: function(object) {
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            },
            equals: (function() {
                var check = function(o1, o2) {
                        var key;
                        for (key in o1) {
                            if (o1.hasOwnProperty(key)) {
                                if (o1[key] !== o2[key]) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    };
                return function(object1, object2) {
                    if (object1 === object2) {
                        return true;
                    }
                    if (object1 && object2) {
                        return check(object1, object2) && check(object2, object1);
                    } else if (!object1 && !object2) {
                        return object1 === object2;
                    } else {
                        return false;
                    }
                };
            })(),
            fork: function(obj) {
                var ret, key, value;
                if (obj && obj.constructor === Object) {
                    ret = ExtObject.chain(obj);
                    for (key in obj) {
                        value = obj[key];
                        if (value) {
                            if (value.constructor === Object) {
                                ret[key] = ExtObject.fork(value);
                            } else if (value instanceof Array) {
                                ret[key] = Ext.Array.clone(value);
                            }
                        }
                    }
                } else {
                    ret = obj;
                }
                return ret;
            },
            defineProperty: ('defineProperty' in Object) ? Object.defineProperty : function(object, name, descriptor) {
                if (!Object.prototype.__defineGetter__) {
                    return;
                }
                if (descriptor.get) {
                    object.__defineGetter__(name, descriptor.get);
                }
                if (descriptor.set) {
                    object.__defineSetter__(name, descriptor.set);
                }
            },
            classify: function(object) {
                var prototype = object,
                    objectProperties = [],
                    propertyClassesMap = {},
                    objectClass = function() {
                        var i = 0,
                            ln = objectProperties.length,
                            property;
                        for (; i < ln; i++) {
                            property = objectProperties[i];
                            this[property] = new propertyClassesMap[property]();
                        }
                    },
                    key, value;
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        value = object[key];
                        if (value && value.constructor === Object) {
                            objectProperties.push(key);
                            propertyClassesMap[key] = ExtObject.classify(value);
                        }
                    }
                }
                objectClass.prototype = prototype;
                return objectClass;
            }
        };
    Ext.merge = Ext.Object.merge;
    Ext.mergeIf = Ext.Object.mergeIf;
}());

(function() {
    var checkVerTemp = [
            ''
        ],
        endOfVersionRe = /([^\d\.])/,
        notDigitsRe = /[^\d]/g,
        plusMinusRe = /[\-+]/g,
        stripRe = /\s/g,
        underscoreRe = /_/g,
        toolkitNames = {
            classic: 1,
            modern: 1
        },
        Version;
    Ext.Version = Version = function(version, defaultMode) {
        var me = this,
            padModes = me.padModes,
            ch, i, pad, parts, release, releaseStartIndex, ver;
        if (version.isVersion) {
            version = version.version;
        }
        me.version = ver = String(version).toLowerCase().replace(underscoreRe, '.').replace(plusMinusRe, '');
        ch = ver.charAt(0);
        if (ch in padModes) {
            ver = ver.substring(1);
            pad = padModes[ch];
        } else {
            pad = defaultMode ? padModes[defaultMode] : 0;
        }
        me.pad = pad;
        releaseStartIndex = ver.search(endOfVersionRe);
        me.shortVersion = ver;
        if (releaseStartIndex !== -1) {
            me.release = release = ver.substr(releaseStartIndex, version.length);
            me.shortVersion = ver.substr(0, releaseStartIndex);
            release = Version.releaseValueMap[release] || release;
        }
        me.releaseValue = release || pad;
        me.shortVersion = me.shortVersion.replace(notDigitsRe, '');
        me.parts = parts = ver.split('.');
        for (i = parts.length; i--; ) {
            parts[i] = parseInt(parts[i], 10);
        }
        if (pad === Infinity) {
            parts.push(pad);
        }
        me.major = parts[0] || pad;
        me.minor = parts[1] || pad;
        me.patch = parts[2] || pad;
        me.build = parts[3] || pad;
        return me;
    };
    Version.prototype = {
        isVersion: true,
        padModes: {
            '~': NaN,
            '^': Infinity
        },
        release: '',
        compareTo: function(other) {
            var me = this,
                lhsPad = me.pad,
                lhsParts = me.parts,
                lhsLength = lhsParts.length,
                rhsVersion = other.isVersion ? other : new Version(other),
                rhsPad = rhsVersion.pad,
                rhsParts = rhsVersion.parts,
                rhsLength = rhsParts.length,
                length = Math.max(lhsLength, rhsLength),
                i, lhs, rhs;
            for (i = 0; i < length; i++) {
                lhs = (i < lhsLength) ? lhsParts[i] : lhsPad;
                rhs = (i < rhsLength) ? rhsParts[i] : rhsPad;
                if (lhs < rhs) {
                    return -1;
                }
                if (lhs > rhs) {
                    return 1;
                }
            }
            lhs = me.releaseValue;
            rhs = rhsVersion.releaseValue;
            if (lhs < rhs) {
                return -1;
            }
            if (lhs > rhs) {
                return 1;
            }
            return 0;
        },
        toString: function() {
            return this.version;
        },
        valueOf: function() {
            return this.version;
        },
        getMajor: function() {
            return this.major;
        },
        getMinor: function() {
            return this.minor;
        },
        getPatch: function() {
            return this.patch;
        },
        getBuild: function() {
            return this.build;
        },
        getRelease: function() {
            return this.release;
        },
        getReleaseValue: function() {
            return this.releaseValue;
        },
        isGreaterThan: function(target) {
            return this.compareTo(target) > 0;
        },
        isGreaterThanOrEqual: function(target) {
            return this.compareTo(target) >= 0;
        },
        isLessThan: function(target) {
            return this.compareTo(target) < 0;
        },
        isLessThanOrEqual: function(target) {
            return this.compareTo(target) <= 0;
        },
        equals: function(target) {
            return this.compareTo(target) === 0;
        },
        match: function(target) {
            target = String(target);
            return this.version.substr(0, target.length) === target;
        },
        toArray: function() {
            var me = this;
            return [
                me.getMajor(),
                me.getMinor(),
                me.getPatch(),
                me.getBuild(),
                me.getRelease()
            ];
        },
        getShortVersion: function() {
            return this.shortVersion;
        },
        gt: function(target) {
            return this.compareTo(target) > 0;
        },
        lt: function(target) {
            return this.compareTo(target) < 0;
        },
        gtEq: function(target) {
            return this.compareTo(target) >= 0;
        },
        ltEq: function(target) {
            return this.compareTo(target) <= 0;
        }
    };
    Ext.apply(Version, {
        aliases: {
            from: {
                extjs: 'ext',
                core: 'core',
                touch: 'modern'
            },
            to: {
                ext: [
                    'extjs'
                ],
                'core': [
                    'core'
                ],
                modern: [
                    'touch'
                ]
            }
        },
        releaseValueMap: {
            dev: -6,
            alpha: -5,
            a: -5,
            beta: -4,
            b: -4,
            rc: -3,
            '#': -2,
            p: -1,
            pl: -1
        },
        getComponentValue: function(value) {
            return !value ? 0 : (isNaN(value) ? this.releaseValueMap[value] || value : parseInt(value, 10));
        },
        compare: function(current, target) {
            var ver = current.isVersion ? current : new Version(current);
            return ver.compareTo(target);
        },
        set: function(collection, packageName, version) {
            var aliases = Version.aliases.to[packageName],
                ver = version.isVersion ? version : new Version(version),
                i;
            collection[packageName] = ver;
            if (aliases) {
                for (i = aliases.length; i-- > 0; ) {
                    collection[aliases[i]] = ver;
                }
            }
            return ver;
        }
    });
    Ext.apply(Ext, {
        compatVersions: {},
        versions: {},
        lastRegisteredVersion: null,
        getCompatVersion: function(packageName) {
            var versions = Ext.compatVersions,
                compat;
            if (!packageName) {
                compat = versions.ext || versions.touch || versions.core;
            } else {
                compat = versions[Version.aliases.from[packageName] || packageName];
            }
            return compat || Ext.getVersion(packageName);
        },
        setCompatVersion: function(packageName, version) {
            Version.set(Ext.compatVersions, packageName, version);
        },
        setVersion: function(packageName, version) {
            if (packageName in toolkitNames) {
                Ext.toolkit = packageName;
            }
            Ext.lastRegisteredVersion = Version.set(Ext.versions, packageName, version);
            return this;
        },
        getVersion: function(packageName) {
            var versions = Ext.versions;
            if (!packageName) {
                return versions.ext || versions.touch || versions.core;
            }
            return versions[Version.aliases.from[packageName] || packageName];
        },
        checkVersion: function(specs, matchAll) {
            var isArray = Ext.isArray(specs),
                aliases = Version.aliases.from,
                compat = isArray ? specs : checkVerTemp,
                length = compat.length,
                versions = Ext.versions,
                frameworkVer = versions.ext || versions.touch,
                i, index, matches, minVer, maxVer, packageName, spec, range, ver;
            if (!isArray) {
                checkVerTemp[0] = specs;
            }
            for (i = 0; i < length; ++i) {
                if (!Ext.isString(spec = compat[i])) {
                    matches = Ext.checkVersion(spec.and || spec.or, !spec.or);
                    if (spec.not) {
                        matches = !matches;
                    }
                } else {
                    if (spec.indexOf(' ') >= 0) {
                        spec = spec.replace(stripRe, '');
                    }
                    index = spec.indexOf('@');
                    if (index < 0) {
                        range = spec;
                        ver = frameworkVer;
                    } else {
                        packageName = spec.substring(0, index);
                        if (!(ver = versions[aliases[packageName] || packageName])) {
                            if (matchAll) {
                                return false;
                            }
                            
                            continue;
                        }
                        range = spec.substring(index + 1);
                    }
                    index = range.indexOf('-');
                    if (index < 0) {
                        if (range.charAt(index = range.length - 1) === '+') {
                            minVer = range.substring(0, index);
                            maxVer = null;
                        } else {
                            minVer = maxVer = range;
                        }
                    } else if (index > 0) {
                        minVer = range.substring(0, index);
                        maxVer = range.substring(index + 1);
                    } else {
                        minVer = null;
                        maxVer = range.substring(index + 1);
                    }
                    matches = true;
                    if (minVer) {
                        minVer = new Version(minVer, '~');
                        matches = minVer.ltEq(ver);
                    }
                    if (matches && maxVer) {
                        maxVer = new Version(maxVer, '~');
                        matches = maxVer.gtEq(ver);
                    }
                }
                if (matches) {
                    if (!matchAll) {
                        return true;
                    }
                } else if (matchAll) {
                    return false;
                }
            }
            return !!matchAll;
        },
        deprecate: function(packageName, since, closure, scope) {
            if (Version.compare(Ext.getVersion(packageName), since) < 1) {
                closure.call(scope);
            }
        }
    });
}());
(function(manifest) {
    var packages = (manifest && manifest.packages) || {},
        compat = manifest && manifest.compatibility,
        name, pkg;
    for (name in packages) {
        pkg = packages[name];
        Ext.setVersion(name, pkg.version);
    }
    if (compat) {
        if (Ext.isString(compat)) {
            Ext.setCompatVersion('core', compat);
        } else {
            for (name in compat) {
                Ext.setCompatVersion(name, compat[name]);
            }
        }
    }
    if (!packages.ext && !packages.touch) {
        Ext.setVersion('ext', '6.2.0.981');
        Ext.setVersion('core', '6.2.0.981');
    }
})(Ext.manifest);

(Ext.env || (Ext.env = {})).Browser = function(userAgent, publish) {
    var me = this,
        browserPrefixes = Ext.Boot.browserPrefixes,
        browserNames = Ext.Boot.browserNames,
        enginePrefixes = me.enginePrefixes,
        engineNames = me.engineNames,
        browserMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(browserPrefixes).join(')|(?:') + '))([\\w\\._]+)')),
        engineMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(enginePrefixes).join(')|(?:') + '))([\\w\\._]+)')),
        browserName = browserNames.other,
        engineName = engineNames.other,
        browserVersion = '',
        engineVersion = '',
        majorVer = '',
        isWebView = false,
        i, prefix, mode, name, maxIEVersion;
    me.userAgent = userAgent;
    this.is = function(name) {
        return !!this.is[name];
    };
    if (/Edge\//.test(userAgent)) {
        browserMatch = userAgent.match(/(Edge\/)([\w.]+)/);
    }
    if (browserMatch) {
        browserName = browserNames[Ext.Object.getKey(browserPrefixes, browserMatch[1])];
        if (browserName === 'Safari' && /^Opera/.test(userAgent)) {
            browserName = 'Opera';
        }
        browserVersion = new Ext.Version(browserMatch[2]);
    }
    if (engineMatch) {
        engineName = engineNames[Ext.Object.getKey(enginePrefixes, engineMatch[1])];
        engineVersion = new Ext.Version(engineMatch[2]);
    }
    if (engineName === 'Trident' && browserName !== 'IE') {
        browserName = 'IE';
        var version = userAgent.match(/.*rv:(\d+.\d+)/);
        if (version && version.length) {
            version = version[1];
            browserVersion = new Ext.Version(version);
        }
    }
    if (browserName && browserVersion) {
        Ext.setVersion(browserName, browserVersion);
    }
    if (userAgent.match(/FB/) && browserName === "Other") {
        browserName = browserNames.safari;
        engineName = engineNames.webkit;
    }
    if (userAgent.match(/Android.*Chrome/g)) {
        browserName = 'ChromeMobile';
    }
    if (userAgent.match(/OPR/)) {
        browserName = 'Opera';
        browserMatch = userAgent.match(/OPR\/(\d+.\d+)/);
        browserVersion = new Ext.Version(browserMatch[1]);
    }
    Ext.apply(this, {
        engineName: engineName,
        engineVersion: engineVersion,
        name: browserName,
        version: browserVersion
    });
    this.setFlag(browserName, true, publish);
    if (browserVersion) {
        majorVer = browserVersion.getMajor() || '';
        if (me.is.IE) {
            majorVer = parseInt(majorVer, 10);
            mode = document.documentMode;
            if (mode === 7 || (majorVer === 7 && mode !== 8 && mode !== 9 && mode !== 10)) {
                majorVer = 7;
            } else if (mode === 8 || (majorVer === 8 && mode !== 8 && mode !== 9 && mode !== 10)) {
                majorVer = 8;
            } else if (mode === 9 || (majorVer === 9 && mode !== 7 && mode !== 8 && mode !== 10)) {
                majorVer = 9;
            } else if (mode === 10 || (majorVer === 10 && mode !== 7 && mode !== 8 && mode !== 9)) {
                majorVer = 10;
            } else if (mode === 11 || (majorVer === 11 && mode !== 7 && mode !== 8 && mode !== 9 && mode !== 10)) {
                majorVer = 11;
            }
            maxIEVersion = Math.max(majorVer, Ext.Boot.maxIEVersion);
            for (i = 7; i <= maxIEVersion; ++i) {
                prefix = 'isIE' + i;
                if (majorVer <= i) {
                    Ext[prefix + 'm'] = true;
                }
                if (majorVer === i) {
                    Ext[prefix] = true;
                }
                if (majorVer >= i) {
                    Ext[prefix + 'p'] = true;
                }
            }
        }
        if (me.is.Opera && parseInt(majorVer, 10) <= 12) {
            Ext.isOpera12m = true;
        }
        Ext.chromeVersion = Ext.isChrome ? majorVer : 0;
        Ext.firefoxVersion = Ext.isFirefox ? majorVer : 0;
        Ext.ieVersion = Ext.isIE ? majorVer : 0;
        Ext.operaVersion = Ext.isOpera ? majorVer : 0;
        Ext.safariVersion = Ext.isSafari ? majorVer : 0;
        Ext.webKitVersion = Ext.isWebKit ? majorVer : 0;
        this.setFlag(browserName + majorVer, true, publish);
        this.setFlag(browserName + browserVersion.getShortVersion());
    }
    for (i in browserNames) {
        if (browserNames.hasOwnProperty(i)) {
            name = browserNames[i];
            this.setFlag(name, browserName === name);
        }
    }
    this.setFlag(name);
    if (engineVersion) {
        this.setFlag(engineName + (engineVersion.getMajor() || ''));
        this.setFlag(engineName + engineVersion.getShortVersion());
    }
    for (i in engineNames) {
        if (engineNames.hasOwnProperty(i)) {
            name = engineNames[i];
            this.setFlag(name, engineName === name, publish);
        }
    }
    this.setFlag('Standalone', !!navigator.standalone);
    this.setFlag('Ripple', !!document.getElementById("tinyhippos-injected") && !Ext.isEmpty(window.top.ripple));
    this.setFlag('WebWorks', !!window.blackberry);
    if (window.PhoneGap !== undefined || window.Cordova !== undefined || window.cordova !== undefined) {
        isWebView = true;
        this.setFlag('PhoneGap');
        this.setFlag('Cordova');
    }
    if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)(?!.*FBAN)/i.test(userAgent)) {
        isWebView = true;
    }
    this.setFlag('WebView', isWebView);
    this.isStrict = Ext.isStrict = document.compatMode === "CSS1Compat";
    this.isSecure = Ext.isSecure;
    this.identity = browserName + majorVer + (this.isStrict ? 'Strict' : 'Quirks');
};
Ext.env.Browser.prototype = {
    constructor: Ext.env.Browser,
    engineNames: {
        webkit: 'WebKit',
        gecko: 'Gecko',
        presto: 'Presto',
        trident: 'Trident',
        other: 'Other'
    },
    enginePrefixes: {
        webkit: 'AppleWebKit/',
        gecko: 'Gecko/',
        presto: 'Presto/',
        trident: 'Trident/'
    },
    styleDashPrefixes: {
        WebKit: '-webkit-',
        Gecko: '-moz-',
        Trident: '-ms-',
        Presto: '-o-',
        Other: ''
    },
    stylePrefixes: {
        WebKit: 'Webkit',
        Gecko: 'Moz',
        Trident: 'ms',
        Presto: 'O',
        Other: ''
    },
    propertyPrefixes: {
        WebKit: 'webkit',
        Gecko: 'moz',
        Trident: 'ms',
        Presto: 'o',
        Other: ''
    },
    name: null,
    version: null,
    engineName: null,
    engineVersion: null,
    setFlag: function(name, value, publish) {
        if (value === undefined) {
            value = true;
        }
        this.is[name] = value;
        this.is[name.toLowerCase()] = value;
        if (publish) {
            Ext['is' + name] = value;
        }
        return this;
    },
    getStyleDashPrefix: function() {
        return this.styleDashPrefixes[this.engineName];
    },
    getStylePrefix: function() {
        return this.stylePrefixes[this.engineName];
    },
    getVendorProperyName: function(name) {
        var prefix = this.propertyPrefixes[this.engineName];
        if (prefix.length > 0) {
            return prefix + Ext.String.capitalize(name);
        }
        return name;
    },
    getPreferredTranslationMethod: function(config) {
        if (typeof config === 'object' && 'translationMethod' in config && config.translationMethod !== 'auto') {
            return config.translationMethod;
        } else {
            return 'csstransform';
        }
    }
};
(function(userAgent) {
    Ext.browser = new Ext.env.Browser(userAgent, true);
    Ext.userAgent = userAgent.toLowerCase();
    Ext.SSL_SECURE_URL = Ext.isSecure && Ext.isIE ? 'javascript:\'\'' : 'about:blank';
}(Ext.global.navigator.userAgent));

Ext.env.OS = function(userAgent, platform, browserScope) {
    var me = this,
        names = Ext.Boot.osNames,
        prefixes = Ext.Boot.osPrefixes,
        name,
        version = '',
        is = me.is,
        i, prefix, match, item, match1;
    browserScope = browserScope || Ext.browser;
    for (i in prefixes) {
        if (prefixes.hasOwnProperty(i)) {
            prefix = prefixes[i];
            match = userAgent.match(new RegExp('(?:' + prefix + ')([^\\s;]+)'));
            if (match) {
                name = names[i];
                match1 = match[1];
                if (match1 && match1 === "HTC_") {
                    version = new Ext.Version("2.3");
                } else if (match1 && match1 === "Silk/") {
                    version = new Ext.Version("2.3");
                } else {
                    version = new Ext.Version(match[match.length - 1]);
                }
                break;
            }
        }
    }
    if (!name) {
        name = names[(userAgent.toLowerCase().match(/mac|win|linux/) || [
            'other'
        ])[0]];
        version = new Ext.Version('');
    }
    this.name = name;
    this.version = version;
    if (userAgent.match(/ipad/i)) {
        platform = 'iPad';
    }
    if (platform) {
        this.setFlag(platform.replace(/ simulator$/i, ''));
    }
    this.setFlag(name);
    if (version) {
        this.setFlag(name + (version.getMajor() || ''));
        this.setFlag(name + version.getShortVersion());
    }
    for (i in names) {
        if (names.hasOwnProperty(i)) {
            item = names[i];
            if (!is.hasOwnProperty(name)) {
                this.setFlag(item, (name === item));
            }
        }
    }
    if (this.name === "iOS" && window.screen.height === 568) {
        this.setFlag('iPhone5');
    }
    if (browserScope.is.Safari || browserScope.is.Silk) {
        if (this.is.Android2 || this.is.Android3 || browserScope.version.shortVersion === 501) {
            browserScope.setFlag("AndroidStock");
        }
        if (this.is.Android4) {
            browserScope.setFlag("AndroidStock");
            browserScope.setFlag("AndroidStock4");
        }
    }
};
Ext.env.OS.prototype = {
    constructor: Ext.env.OS,
    is: function(name) {
        return !!this[name];
    },
    name: null,
    version: null,
    setFlag: function(name, value) {
        if (value === undefined) {
            value = true;
        }
        if (this.flags) {
            this.flags[name] = value;
        }
        this.is[name] = value;
        this.is[name.toLowerCase()] = value;
        return this;
    }
};
(function() {
    var navigation = Ext.global.navigator,
        userAgent = navigation.userAgent,
        OS = Ext.env.OS,
        is = (Ext.is || (Ext.is = {})),
        osEnv, osName, deviceType;
    OS.prototype.flags = is;
    Ext.os = osEnv = new OS(userAgent, navigation.platform);
    osName = osEnv.name;
    Ext['is' + osName] = true;
    Ext.isMac = is.Mac = is.MacOS;
    var search = window.location.search.match(/deviceType=(Tablet|Phone)/),
        nativeDeviceType = window.deviceType;
    if (search && search[1]) {
        deviceType = search[1];
    } else if (nativeDeviceType === 'iPhone') {
        deviceType = 'Phone';
    } else if (nativeDeviceType === 'iPad') {
        deviceType = 'Tablet';
    } else {
        if (!osEnv.is.Android && !osEnv.is.iOS && !osEnv.is.WindowsPhone && /Windows|Linux|MacOS/.test(osName)) {
            deviceType = 'Desktop';
            Ext.browser.is.WebView = !!Ext.browser.is.Ripple;
        } else if (osEnv.is.iPad || osEnv.is.RIMTablet || osEnv.is.Android3 || Ext.browser.is.Silk || (osEnv.is.Android && userAgent.search(/mobile/i) === -1)) {
            deviceType = 'Tablet';
        } else {
            deviceType = 'Phone';
        }
    }
    osEnv.setFlag(deviceType, true);
    osEnv.deviceType = deviceType;
    delete OS.prototype.flags;
}());

Ext.feature = {
    has: function(name) {
        return !!this.has[name];
    },
    testElements: {},
    getTestElement: function(tag, createNew) {
        if (tag === undefined) {
            tag = 'div';
        } else if (typeof tag !== 'string') {
            return tag;
        }
        if (createNew) {
            return document.createElement(tag);
        }
        if (!this.testElements[tag]) {
            this.testElements[tag] = document.createElement(tag);
        }
        return this.testElements[tag];
    },
    isStyleSupported: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style,
            cName = Ext.String.capitalize(name);
        if (typeof elementStyle[name] !== 'undefined' || typeof elementStyle[Ext.browser.getStylePrefix(name) + cName] !== 'undefined') {
            return true;
        }
        return false;
    },
    isStyleSupportedWithoutPrefix: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style;
        if (typeof elementStyle[name] !== 'undefined') {
            return true;
        }
        return false;
    },
    isEventSupported: function(name, tag) {
        if (tag === undefined) {
            tag = window;
        }
        var element = this.getTestElement(tag),
            eventName = 'on' + name.toLowerCase(),
            isSupported = (eventName in element);
        if (!isSupported) {
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';
                if (typeof element[eventName] !== 'undefined') {
                    element[eventName] = undefined;
                }
                element.removeAttribute(eventName);
            }
        }
        return isSupported;
    },
    getStyle: function(element, styleName) {
        var view = element.ownerDocument.defaultView,
            style = (view ? view.getComputedStyle(element, null) : element.currentStyle);
        return (style || element.style)[styleName];
    },
    getSupportedPropertyName: function(object, name) {
        var vendorName = Ext.browser.getVendorProperyName(name);
        if (vendorName in object) {
            return vendorName;
        } else if (name in object) {
            return name;
        }
        return null;
    },
    detect: function(isReady) {
        var me = this,
            doc = document,
            toRun = me.toRun || me.tests,
            n = toRun.length,
            div = doc.createElement('div'),
            notRun = [],
            supports = Ext.supports,
            has = me.has,
            name, names, test, vector, value;
        div.innerHTML = '<div style="height:30px;width:50px;">' + '<div style="height:20px;width:20px;"></div>' + '</div>' + '<div style="width: 200px; height: 200px; position: relative; padding: 5px;">' + '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>' + '</div>' + '<div style="position: absolute; left: 10%; top: 10%;"></div>' + '<div style="float:left; background-color:transparent;"></div>';
        if (isReady) {
            doc.body.appendChild(div);
        }
        vector = me.preDetected[Ext.browser.identity] || [];
        while (n--) {
            test = toRun[n];
            value = vector[n];
            name = test.name;
            names = test.names;
            if (value === undefined) {
                if (!isReady && test.ready) {
                    notRun.push(test);
                    
                    continue;
                }
                value = test.fn.call(me, doc, div);
            }
            if (name) {
                supports[name] = has[name] = value;
            } else if (names) {
                while (names.length) {
                    name = names.pop();
                    supports[name] = has[name] = value;
                }
            }
        }
        if (isReady) {
            doc.body.removeChild(div);
        }
        me.toRun = notRun;
    },
    report: function() {
        var values = [],
            len = this.tests.length,
            i;
        for (i = 0; i < len; ++i) {
            values.push(this.has[this.tests[i].name] ? 1 : 0);
        }
        Ext.log(Ext.browser.identity + ': [' + values.join(',') + ']');
    },
    preDetected: {},
    tests: [
        {
            name: 'CloneNodeCopiesExpando',
            fn: function() {
                var el = document.createElement('div');
                el.expandoProp = {};
                return el.cloneNode().expandoProp === el.expandoProp;
            }
        },
        {
            name: 'CSSPointerEvents',
            fn: function(doc) {
                return 'pointerEvents' in doc.documentElement.style;
            }
        },
        {
            name: 'CSS3BoxShadow',
            fn: function(doc) {
                return 'boxShadow' in doc.documentElement.style || 'WebkitBoxShadow' in doc.documentElement.style || 'MozBoxShadow' in doc.documentElement.style;
            }
        },
        {
            name: 'CSS3NegationSelector',
            fn: function(doc) {
                try {
                    doc.querySelectorAll("foo:not(bar)");
                } catch (e) {
                    return false;
                }
                return true;
            }
        },
        {
            name: 'ClassList',
            fn: function(doc) {
                return !!doc.documentElement.classList;
            }
        },
        {
            name: 'Canvas',
            fn: function() {
                var element = this.getTestElement('canvas');
                return !!(element && element.getContext && element.getContext('2d'));
            }
        },
        {
            name: 'Svg',
            fn: function(doc) {
                return !!(doc.createElementNS && !!doc.createElementNS("http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect);
            }
        },
        {
            name: 'Vml',
            fn: function() {
                var element = this.getTestElement(),
                    ret = false;
                element.innerHTML = "<!--[if vml]><br><![endif]-->";
                ret = (element.childNodes.length === 1);
                element.innerHTML = "";
                return ret;
            }
        },
        {
            name: 'Touch',
            fn: function() {
                var maxTouchPoints = navigator.msMaxTouchPoints || navigator.maxTouchPoints;
                if (Ext.browser.is.Chrome && Ext.browser.version.isLessThanOrEqual(39)) {
                    return (Ext.supports.TouchEvents && maxTouchPoints !== 1) || maxTouchPoints > 1;
                } else {
                    return Ext.supports.TouchEvents || maxTouchPoints > 0;
                }
            }
        },
        {
            name: 'TouchEvents',
            fn: function() {
                return this.isEventSupported('touchend');
            }
        },
        {
            name: 'PointerEvents',
            fn: function() {
                return navigator.pointerEnabled;
            }
        },
        {
            name: 'MSPointerEvents',
            fn: function() {
                return navigator.msPointerEnabled;
            }
        },
        {
            name: 'Orientation',
            fn: function() {
                return ('orientation' in window) && this.isEventSupported('orientationchange');
            }
        },
        {
            name: 'OrientationChange',
            fn: function() {
                return this.isEventSupported('orientationchange');
            }
        },
        {
            name: 'DeviceMotion',
            fn: function() {
                return this.isEventSupported('devicemotion');
            }
        },
        {
            names: [
                'Geolocation',
                'GeoLocation'
            ],
            fn: function() {
                return 'geolocation' in window.navigator;
            }
        },
        {
            name: 'SqlDatabase',
            fn: function() {
                return 'openDatabase' in window;
            }
        },
        {
            name: 'WebSockets',
            fn: function() {
                return 'WebSocket' in window;
            }
        },
        {
            name: 'Range',
            fn: function() {
                return !!document.createRange;
            }
        },
        {
            name: 'CreateContextualFragment',
            fn: function() {
                var range = !!document.createRange ? document.createRange() : false;
                return range && !!range.createContextualFragment;
            }
        },
        {
            name: 'History',
            fn: function() {
                return ('history' in window && 'pushState' in window.history);
            }
        },
        {
            name: 'Css3dTransforms',
            fn: function() {
                return this.has('CssTransforms') && this.isStyleSupported('perspective');
            }
        },
        {
            name: 'CssTransforms',
            fn: function() {
                return this.isStyleSupported('transform');
            }
        },
        {
            name: 'CssTransformNoPrefix',
            fn: function() {
                return this.isStyleSupportedWithoutPrefix('transform');
            }
        },
        {
            name: 'CssAnimations',
            fn: function() {
                return this.isStyleSupported('animationName');
            }
        },
        {
            names: [
                'CssTransitions',
                'Transitions'
            ],
            fn: function() {
                return this.isStyleSupported('transitionProperty');
            }
        },
        {
            names: [
                'Audio',
                'AudioTag'
            ],
            fn: function() {
                return !!this.getTestElement('audio').canPlayType;
            }
        },
        {
            name: 'Video',
            fn: function() {
                return !!this.getTestElement('video').canPlayType;
            }
        },
        {
            name: 'LocalStorage',
            fn: function() {
                try {
                    if ('localStorage' in window && window['localStorage'] !== null) {
                        localStorage.setItem('sencha-localstorage-test', 'test success');
                        localStorage.removeItem('sencha-localstorage-test');
                        return true;
                    }
                } catch (e) {}
                return false;
            }
        },
        {
            name: 'XHR2',
            fn: function() {
                return window.ProgressEvent && window.FormData && window.XMLHttpRequest && ('withCredentials' in new XMLHttpRequest());
            }
        },
        {
            name: 'XHRUploadProgress',
            fn: function() {
                if (window.XMLHttpRequest && !Ext.browser.is.AndroidStock) {
                    var xhr = new XMLHttpRequest();
                    return xhr && ('upload' in xhr) && ('onprogress' in xhr.upload);
                }
                return false;
            }
        },
        {
            name: 'NumericInputPlaceHolder',
            fn: function() {
                return !(Ext.browser.is.AndroidStock4 && Ext.os.version.getMinor() < 2);
            }
        },
        {
            name: 'matchesSelector',
            fn: function() {
                var el = document.documentElement,
                    w3 = 'matches',
                    wk = 'webkitMatchesSelector',
                    ms = 'msMatchesSelector',
                    mz = 'mozMatchesSelector';
                return el[w3] ? w3 : el[wk] ? wk : el[ms] ? ms : el[mz] ? mz : null;
            }
        },
        {
            name: 'RightMargin',
            ready: true,
            fn: function(doc, div) {
                var view = doc.defaultView;
                return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight !== '0px');
            }
        },
        {
            name: 'DisplayChangeInputSelectionBug',
            fn: function() {
                var webKitVersion = Ext.webKitVersion;
                return 0 < webKitVersion && webKitVersion < 533;
            }
        },
        {
            name: 'DisplayChangeTextAreaSelectionBug',
            fn: function() {
                var webKitVersion = Ext.webKitVersion;
                return 0 < webKitVersion && webKitVersion < 534.24;
            }
        },
        {
            name: 'TransparentColor',
            ready: true,
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor !== 'transparent');
            }
        },
        {
            name: 'ComputedStyle',
            ready: true,
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return view && view.getComputedStyle;
            }
        },
        {
            name: 'Float',
            fn: function(doc) {
                return 'cssFloat' in doc.documentElement.style;
            }
        },
        {
            name: 'CSS3BorderRadius',
            ready: true,
            fn: function(doc) {
                var domPrefixes = [
                        'borderRadius',
                        'BorderRadius',
                        'MozBorderRadius',
                        'WebkitBorderRadius',
                        'OBorderRadius',
                        'KhtmlBorderRadius'
                    ],
                    pass = false,
                    i;
                for (i = 0; i < domPrefixes.length; i++) {
                    if (doc.documentElement.style[domPrefixes[i]] !== undefined) {
                        pass = true;
                    }
                }
                return pass && !Ext.isIE9;
            }
        },
        {
            name: 'CSS3LinearGradient',
            fn: function(doc, div) {
                var property = 'background-image:',
                    webkit = '-webkit-gradient(linear, left top, right bottom, from(black), to(white))',
                    w3c = 'linear-gradient(left top, black, white)',
                    moz = '-moz-' + w3c,
                    ms = '-ms-' + w3c,
                    opera = '-o-' + w3c,
                    options = [
                        property + webkit,
                        property + w3c,
                        property + moz,
                        property + ms,
                        property + opera
                    ];
                div.style.cssText = options.join(';');
                return (("" + div.style.backgroundImage).indexOf('gradient') !== -1) && !Ext.isIE9;
            }
        },
        {
            name: 'MouseEnterLeave',
            fn: function(doc) {
                return ('onmouseenter' in doc.documentElement && 'onmouseleave' in doc.documentElement);
            }
        },
        {
            name: 'MouseWheel',
            fn: function(doc) {
                return ('onmousewheel' in doc.documentElement);
            }
        },
        {
            name: 'Opacity',
            fn: function(doc, div) {
                if (Ext.isIE8) {
                    return false;
                }
                div.firstChild.style.cssText = 'opacity:0.73';
                return div.firstChild.style.opacity == '0.73';
            }
        },
        {
            name: 'Placeholder',
            fn: function(doc) {
                return 'placeholder' in doc.createElement('input');
            }
        },
        {
            name: 'Direct2DBug',
            fn: function(doc) {
                return Ext.isString(doc.documentElement.style.msTransformOrigin) && Ext.isIE9m;
            }
        },
        {
            name: 'BoundingClientRect',
            fn: function(doc) {
                return 'getBoundingClientRect' in doc.documentElement;
            }
        },
        {
            name: 'RotatedBoundingClientRect',
            ready: true,
            fn: function(doc) {
                var body = doc.body,
                    supports = false,
                    el = doc.createElement('div'),
                    style = el.style;
                if (el.getBoundingClientRect) {
                    style.position = 'absolute';
                    style.top = "0";
                    style.WebkitTransform = style.MozTransform = style.msTransform = style.OTransform = style.transform = 'rotate(90deg)';
                    style.width = '100px';
                    style.height = '30px';
                    body.appendChild(el);
                    supports = el.getBoundingClientRect().height !== 100;
                    body.removeChild(el);
                }
                return supports;
            }
        },
        {
            name: 'ChildContentClearedWhenSettingInnerHTML',
            ready: true,
            fn: function() {
                var el = this.getTestElement(),
                    child;
                el.innerHTML = '<div>a</div>';
                child = el.firstChild;
                el.innerHTML = '<div>b</div>';
                return child.innerHTML !== 'a';
            }
        },
        {
            name: 'IncludePaddingInWidthCalculation',
            ready: true,
            fn: function(doc, div) {
                return div.childNodes[1].firstChild.offsetWidth === 210;
            }
        },
        {
            name: 'IncludePaddingInHeightCalculation',
            ready: true,
            fn: function(doc, div) {
                return div.childNodes[1].firstChild.offsetHeight === 210;
            }
        },
        {
            name: 'TextAreaMaxLength',
            fn: function(doc) {
                return ('maxlength' in doc.createElement('textarea'));
            }
        },
        {
            name: 'GetPositionPercentage',
            ready: true,
            fn: function(doc, div) {
                return Ext.feature.getStyle(div.childNodes[2], 'left') === '10%';
            }
        },
        {
            name: 'PercentageHeightOverflowBug',
            ready: true,
            fn: function(doc) {
                var hasBug = false,
                    style, el;
                if (Ext.getScrollbarSize().height) {
                    el = this.getTestElement();
                    style = el.style;
                    style.height = '50px';
                    style.width = '50px';
                    style.overflow = 'auto';
                    style.position = 'absolute';
                    el.innerHTML = [
                        '<div style="display:table;height:100%;">',
                        '<div style="width:51px;"></div>',
                        '</div>'
                    ].join('');
                    doc.body.appendChild(el);
                    if (el.firstChild.offsetHeight === 50) {
                        hasBug = true;
                    }
                    doc.body.removeChild(el);
                }
                return hasBug;
            }
        },
        {
            name: 'xOriginBug',
            ready: true,
            fn: function(doc, div) {
                div.innerHTML = '<div id="b1" style="height:100px;width:100px;direction:rtl;position:relative;overflow:scroll">' + '<div id="b2" style="position:relative;width:100%;height:20px;"></div>' + '<div id="b3" style="position:absolute;width:20px;height:20px;top:0px;right:0px"></div>' + '</div>';
                var outerBox = document.getElementById('b1').getBoundingClientRect(),
                    b2 = document.getElementById('b2').getBoundingClientRect(),
                    b3 = document.getElementById('b3').getBoundingClientRect();
                return (b2.left !== outerBox.left && b3.right !== outerBox.right);
            }
        },
        {
            name: 'ScrollWidthInlinePaddingBug',
            ready: true,
            fn: function(doc) {
                var hasBug = false,
                    style, el;
                el = doc.createElement('div');
                style = el.style;
                style.height = '50px';
                style.width = '50px';
                style.padding = '10px';
                style.overflow = 'hidden';
                style.position = 'absolute';
                el.innerHTML = '<span style="display:inline-block;zoom:1;height:60px;width:60px;"></span>';
                doc.body.appendChild(el);
                if (el.scrollWidth === 70) {
                    hasBug = true;
                }
                doc.body.removeChild(el);
                return hasBug;
            }
        },
        {
            name: 'rtlVertScrollbarOnRight',
            ready: true,
            fn: function(doc, div) {
                div.innerHTML = '<div style="height:100px;width:100px;direction:rtl;overflow:scroll">' + '<div style="width:20px;height:200px;"></div>' + '</div>';
                var outerBox = div.firstChild,
                    innerBox = outerBox.firstChild;
                return (innerBox.offsetLeft + innerBox.offsetWidth !== outerBox.offsetLeft + outerBox.offsetWidth);
            }
        },
        {
            name: 'rtlVertScrollbarOverflowBug',
            ready: true,
            fn: function(doc, div) {
                div.innerHTML = '<div style="height:100px;width:100px;direction:rtl;overflow:auto">' + '<div style="width:95px;height:200px;"></div>' + '</div>';
                var outerBox = div.firstChild;
                return outerBox.clientHeight === outerBox.offsetHeight;
            }
        },
        {
            identity: 'defineProperty',
            fn: function() {
                if (Ext.isIE8m) {
                    Ext.Object.defineProperty = Ext.emptyFn;
                    return false;
                }
                return true;
            }
        },
        {
            identify: 'nativeXhr',
            fn: function() {
                if (typeof XMLHttpRequest !== 'undefined') {
                    return true;
                }
                XMLHttpRequest = function() {
                    try {
                        return new ActiveXObject('MSXML2.XMLHTTP.3.0');
                    } catch (ex) {
                        return null;
                    }
                };
                return false;
            }
        },
        {
            name: 'SpecialKeyDownRepeat',
            fn: function() {
                return Ext.isWebKit ? parseInt(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1], 10) >= 525 : !(!(Ext.isGecko || Ext.isIE) || (Ext.isOpera && Ext.operaVersion < 12));
            }
        },
        {
            name: 'EmulatedMouseOver',
            fn: function() {
                return Ext.os.is.iOS;
            }
        },
        {
            name: 'Hashchange',
            fn: function() {
                var docMode = document.documentMode;
                return 'onhashchange' in window && (docMode === undefined || docMode > 7);
            }
        },
        {
            name: 'FixedTableWidthBug',
            ready: true,
            fn: function() {
                if (Ext.isIE8) {
                    return false;
                }
                var outer = document.createElement('div'),
                    inner = document.createElement('div'),
                    width;
                outer.setAttribute('style', 'display:table;table-layout:fixed;');
                inner.setAttribute('style', 'display:table-cell;min-width:50px;');
                outer.appendChild(inner);
                document.body.appendChild(outer);
                outer.offsetWidth;
                outer.style.width = '25px';
                width = outer.offsetWidth;
                document.body.removeChild(outer);
                return width === 50;
            }
        },
        {
            name: 'FocusinFocusoutEvents',
            fn: function() {
                return !Ext.isGecko;
            }
        },
        {
            name: 'AsyncFocusEvents',
            fn: function() {
                return Ext.asyncFocus = !!Ext.isIE;
            }
        },
        {
            name: 'accessibility',
            ready: true,
            fn: function(doc) {
                var body = doc.body,
                    div, img, style, supports, bgImg;
                function getColor(colorTxt) {
                    var values = [],
                        colorValue = 0,
                        regex, match;
                    if (colorTxt.indexOf('rgb(') !== -1) {
                        values = colorTxt.replace('rgb(', '').replace(')', '').split(', ');
                    } else if (colorTxt.indexOf('#') !== -1) {
                        regex = colorTxt.length === 7 ? /^#(\S\S)(\S\S)(\S\S)$/ : /^#(\S)(\S)(\S)$/;
                        match = colorTxt.match(regex);
                        if (match) {
                            values = [
                                '0x' + match[1],
                                '0x' + match[2],
                                '0x' + match[3]
                            ];
                        }
                    }
                    for (var i = 0; i < values.length; i++) {
                        colorValue += parseInt(values[i]);
                    }
                    return colorValue;
                }
                div = doc.createElement('div');
                img = doc.createElement('img');
                style = div.style;
                Ext.apply(style, {
                    width: '2px',
                    position: 'absolute',
                    clip: 'rect(1px,1px,1px,1px)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderTopTolor: '#f00',
                    borderRightColor: '#ff0',
                    backgroundColor: '#fff',
                    backgroundImage: 'url(' + Ext.BLANK_IMAGE_URL + ')'
                });
                img.alt = '';
                img.src = Ext.BLANK_IMAGE_URL;
                div.appendChild(img);
                body.appendChild(div);
                style = div.currentStyle || div.style;
                bgImg = style.backgroundImage;
                supports = {
                    Images: img.offsetWidth === 1 && img.readyState !== 'uninitialized',
                    BackgroundImages: !(bgImg !== null && (bgImg === "none" || bgImg === "url(invalid-url:)")),
                    BorderColors: style.borderTopColor !== style.borderRightColor,
                    LightOnDark: getColor(style.color) - getColor(style.backgroundColor) > 0
                };
                Ext.supports.HighContrastMode = !supports.BackgroundImages;
                body.removeChild(div);
                div = img = null;
                return supports;
            }
        },
        {
            name: 'ViewportUnits',
            ready: true,
            fn: function(doc) {
                if (Ext.isIE8) {
                    return false;
                }
                var body = doc.body,
                    div = document.createElement('div'),
                    style = div.currentStyle || div.style,
                    width, divWidth;
                body.appendChild(div);
                Ext.apply(style, {
                    width: '50vw'
                });
                width = parseInt(window.innerWidth / 2, 10);
                divWidth = parseInt((window.getComputedStyle ? getComputedStyle(div, null) : div.currentStyle).width, 10);
                body.removeChild(div);
                div = null;
                return width === divWidth;
            }
        },
        {
            name: 'CSSVariables',
            ready: false,
            fn: function(doc) {
                if (!window.getComputedStyle) {
                    return false;
                }
                var style = window.getComputedStyle(doc.documentElement);
                return style.getPropertyValue && !!style.getPropertyValue('--x-supports-variables');
            }
        },
        {
            name: 'Selectors2',
            ready: false,
            fn: function(doc) {
                try {
                    return !!doc.querySelectorAll(':scope');
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: 'CSSScrollSnap',
            ready: false,
            fn: function(doc) {
                var style = doc.documentElement.style;
                return 'scrollSnapType' in style || 'webkitScrollSnapType' in style || 'msScrollSnapType' in style;
            }
        },
        0
    ]
};
Ext.feature.tests.pop();
Ext.supports = {};
Ext.feature.detect();

Ext.Number = (new function() {
    var ExtNumber = this,
        isToFixedBroken = (0.9).toFixed() !== '1',
        math = Math,
        ClipDefault = {
            count: false,
            inclusive: false,
            wrap: true
        };
    Ext.apply(ExtNumber, {
        MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER || -(math.pow(2, 53) - 1),
        MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER || math.pow(2, 53) - 1,
        Clip: {
            DEFAULT: ClipDefault,
            COUNT: Ext.applyIf({
                count: true
            }, ClipDefault),
            INCLUSIVE: Ext.applyIf({
                inclusive: true
            }, ClipDefault),
            NOWRAP: Ext.applyIf({
                wrap: false
            }, ClipDefault)
        },
        clipIndices: function(length, indices, options) {
            options = options || ClipDefault;
            var defaultValue = 0,
                wrap = options.wrap,
                begin, end, i;
            indices = indices || [];
            for (i = 0; i < 2; ++i) {
                begin = end;
                end = indices[i];
                if (end == null) {
                    end = defaultValue;
                } else if (i && options.count) {
                    end += begin;
                    end = (end > length) ? length : end;
                } else {
                    if (wrap) {
                        end = (end < 0) ? (length + end) : end;
                    }
                    if (i && options.inclusive) {
                        ++end;
                    }
                    end = (end < 0) ? 0 : ((end > length) ? length : end);
                }
                defaultValue = length;
            }
            indices[0] = begin;
            indices[1] = (end < begin) ? begin : end;
            return indices;
        },
        constrain: function(number, min, max) {
            var x = parseFloat(number);
            if (min === null) {
                min = number;
            }
            if (max === null) {
                max = number;
            }
            return (x < min) ? min : ((x > max) ? max : x);
        },
        snap: function(value, increment, minValue, maxValue) {
            var m;
            if (value === undefined || value < minValue) {
                return minValue || 0;
            }
            if (increment) {
                m = value % increment;
                if (m !== 0) {
                    value -= m;
                    if (m * 2 >= increment) {
                        value += increment;
                    } else if (m * 2 < -increment) {
                        value -= increment;
                    }
                }
            }
            return ExtNumber.constrain(value, minValue, maxValue);
        },
        snapInRange: function(value, increment, minValue, maxValue) {
            var tween;
            minValue = (minValue || 0);
            if (value === undefined || value < minValue) {
                return minValue;
            }
            if (increment && (tween = ((value - minValue) % increment))) {
                value -= tween;
                tween *= 2;
                if (tween >= increment) {
                    value += increment;
                }
            }
            if (maxValue !== undefined) {
                if (value > (maxValue = ExtNumber.snapInRange(maxValue, increment, minValue))) {
                    value = maxValue;
                }
            }
            return value;
        },
        roundToNearest: function(value, interval) {
            interval = interval || 1;
            return interval * math.round(value / interval);
        },
        sign: math.sign || function(x) {
            x = +x;
            if (x === 0 || isNaN(x)) {
                return x;
            }
            return (x > 0) ? 1 : -1;
        },
        log10: math.log10 || function(x) {
            return math.log(x) * math.LOG10E;
        },
        isEqual: function(n1, n2, epsilon) {
            if (!(typeof n1 === 'number' && typeof n2 === 'number' && typeof epsilon === 'number')) {
                Ext.raise("All parameters should be valid numbers.");
            }
            return math.abs(n1 - n2) < epsilon;
        },
        isFinite: Number.isFinite || function(value) {
            return typeof value === 'number' && isFinite(value);
        },
        toFixed: isToFixedBroken ? function(value, precision) {
            precision = precision || 0;
            var pow = math.pow(10, precision);
            return (math.round(value * pow) / pow).toFixed(precision);
        } : function(value, precision) {
            return value.toFixed(precision);
        },
        from: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }
            return !isNaN(value) ? value : defaultValue;
        },
        randomInt: function(from, to) {
            return math.floor(math.random() * (to - from + 1) + from);
        },
        correctFloat: function(n) {
            return parseFloat(n.toPrecision(14));
        }
    });
    Ext.num = function() {
        return ExtNumber.from.apply(this, arguments);
    };
}());

Ext.Assert = {
    falsey: function(b, msg) {
        if (b) {
            Ext.raise(msg || ('Expected a falsey value but was ' + b));
        }
    },
    falseyProp: function(object, property) {
        Ext.Assert.truthy(object);
        var b = object[property];
        if (b) {
            if (object.$className) {
                property = object.$className + '#' + property;
            }
            Ext.raise('Expected a falsey value for ' + property + ' but was ' + b);
        }
    },
    truthy: function(b, msg) {
        if (!b) {
            Ext.raise(msg || ('Expected a truthy value but was ' + typeof b));
        }
    },
    truthyProp: function(object, property) {
        Ext.Assert.truthy(object);
        var b = object[property];
        if (!b) {
            if (object.$className) {
                property = object.$className + '#' + property;
            }
            Ext.raise('Expected a truthy value for ' + property + ' but was ' + typeof b);
        }
    }
};
(function() {
    function makeAssert(name, kind) {
        var testFn = Ext[name],
            def;
        return function(value, msg) {
            if (!testFn(value)) {
                Ext.raise(msg || def || (def = 'Expected value to be ' + kind));
            }
        };
    }
    function makeAssertProp(name, kind) {
        var testFn = Ext[name],
            def;
        return function(object, prop) {
            Ext.Assert.truthy(object);
            if (!testFn(object[prop])) {
                Ext.raise(def || (def = 'Expected ' + (object.$className ? object.$className + '#' : '') + prop + ' to be ' + kind));
            }
        };
    }
    function makeNotAssert(name, kind) {
        var testFn = Ext[name],
            def;
        return function(value, msg) {
            if (testFn(value)) {
                Ext.raise(msg || def || (def = 'Expected value to NOT be ' + kind));
            }
        };
    }
    function makeNotAssertProp(name, kind) {
        var testFn = Ext[name],
            def;
        return function(object, prop) {
            Ext.Assert.truthy(object);
            if (testFn(object[prop])) {
                Ext.raise(def || (def = 'Expected ' + (object.$className ? object.$className + '#' : '') + prop + ' to NOT be ' + kind));
            }
        };
    }
    for (var name in Ext) {
        if (name.substring(0, 2) == "is" && Ext.isFunction(Ext[name])) {
            var kind = name.substring(2);
            Ext.Assert[name] = makeAssert(name, kind);
            Ext.Assert[name + 'Prop'] = makeAssertProp(name, kind);
            Ext.Assert['isNot' + kind] = makeNotAssert(name, kind);
            Ext.Assert['isNot' + kind + 'Prop'] = makeNotAssertProp(name, kind);
        }
    }
}());

Ext.apply(Ext, {
    _namedScopes: {
        'this': {
            isThis: 1
        },
        controller: {
            isController: 1
        },
        self: {
            isSelf: 1
        },
        'self.controller': {
            isSelf: 1,
            isController: 1
        }
    },
    escapeId: (function() {
        var validIdRe = /^[a-zA-Z_][a-zA-Z0-9_\-]*$/i,
            escapeRx = /([\W]{1})/g,
            leadingNumRx = /^(\d)/g,
            escapeFn = function(match, capture) {
                return "\\" + capture;
            },
            numEscapeFn = function(match, capture) {
                return '\\00' + capture.charCodeAt(0).toString(16) + ' ';
            };
        return function(id) {
            return validIdRe.test(id) ? id : id.replace(escapeRx, escapeFn).replace(leadingNumRx, numEscapeFn);
        };
    }()),
    callback: function(callback, scope, args, delay, caller, defaultScope) {
        if (!callback) {
            return;
        }
        var namedScope = (scope in Ext._namedScopes);
        if (callback.charAt) {
            if ((!scope || namedScope) && caller) {
                scope = caller.resolveListenerScope(namedScope ? scope : defaultScope);
            }
            if (!scope || !Ext.isObject(scope)) {
                Ext.raise('Named method "' + callback + '" requires a scope object');
            }
            if (!Ext.isFunction(scope[callback])) {
                Ext.raise('No method named "' + callback + '" on ' + (scope.$className || 'scope object'));
            }
            callback = scope[callback];
        } else if (namedScope) {
            scope = defaultScope || caller;
        } else if (!scope) {
            scope = caller;
        }
        var ret;
        if (callback && Ext.isFunction(callback)) {
            scope = scope || Ext.global;
            if (delay) {
                Ext.defer(callback, delay, scope, args);
            } else if (Ext.elevateFunction) {
                ret = Ext.elevateFunction(callback, scope, args);
            } else if (args) {
                ret = callback.apply(scope, args);
            } else {
                ret = callback.call(scope);
            }
        }
        return ret;
    },
    coerce: function(from, to) {
        var fromType = Ext.typeOf(from),
            toType = Ext.typeOf(to),
            isString = typeof from === 'string';
        if (fromType !== toType) {
            switch (toType) {
                case 'string':
                    return String(from);
                case 'number':
                    return Number(from);
                case 'boolean':
                    return isString && (!from || from === 'false' || from === '0') ? false : Boolean(from);
                case 'null':
                    return isString && (!from || from === 'null') ? null : false;
                case 'undefined':
                    return isString && (!from || from === 'undefined') ? undefined : false;
                case 'date':
                    return isString && isNaN(from) ? Ext.Date.parse(from, Ext.Date.defaultFormat) : Date(Number(from));
            }
        }
        return from;
    },
    copyTo: function(dest, source, names, usePrototypeKeys) {
        if (typeof names === 'string') {
            names = names.split(Ext.propertyNameSplitRe);
        }
        for (var name,
            i = 0,
            n = names ? names.length : 0; i < n; i++) {
            name = names[i];
            if (usePrototypeKeys || source.hasOwnProperty(name)) {
                dest[name] = source[name];
            }
        }
        return dest;
    },
    copy: function(dest, source, names, usePrototypeKeys) {
        if (typeof names === 'string') {
            names = names.split(Ext.propertyNameSplitRe);
        }
        for (var name,
            i = 0,
            n = names ? names.length : 0; i < n; i++) {
            name = names[i];
            if (source.hasOwnProperty(name) || (usePrototypeKeys && name in source)) {
                dest[name] = source[name];
            }
        }
        return dest;
    },
    propertyNameSplitRe: /[,;\s]+/,
    copyToIf: function(destination, source, names) {
        if (typeof names === 'string') {
            names = names.split(Ext.propertyNameSplitRe);
        }
        for (var name,
            i = 0,
            n = names ? names.length : 0; i < n; i++) {
            name = names[i];
            if (destination[name] === undefined) {
                destination[name] = source[name];
            }
        }
        return destination;
    },
    copyIf: function(destination, source, names) {
        if (typeof names === 'string') {
            names = names.split(Ext.propertyNameSplitRe);
        }
        for (var name,
            i = 0,
            n = names ? names.length : 0; i < n; i++) {
            name = names[i];
            if (!(name in destination) && (name in source)) {
                destination[name] = source[name];
            }
        }
        return destination;
    },
    extend: (function() {
        var objectConstructor = Object.prototype.constructor,
            inlineOverrides = function(o) {
                var m;
                for (m in o) {
                    if (!o.hasOwnProperty(m)) {
                        
                        continue;
                    }
                    this[m] = o[m];
                }
            };
        return function(subclass, superclass, overrides) {
            if (Ext.isObject(superclass)) {
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor !== objectConstructor ? overrides.constructor : function() {
                    superclass.apply(this, arguments);
                };
            }
            if (!superclass) {
                Ext.raise({
                    sourceClass: 'Ext',
                    sourceMethod: 'extend',
                    msg: 'Attempting to extend from a class which has not been loaded on the page.'
                });
            }
            var F = function() {},
                subclassProto,
                superclassProto = superclass.prototype;
            F.prototype = superclassProto;
            subclassProto = subclass.prototype = new F();
            subclassProto.constructor = subclass;
            subclass.superclass = superclassProto;
            if (superclassProto.constructor === objectConstructor) {
                superclassProto.constructor = superclass;
            }
            subclass.override = function(overrides) {
                Ext.override(subclass, overrides);
            };
            subclassProto.override = inlineOverrides;
            subclassProto.proto = subclassProto;
            subclass.override(overrides);
            subclass.extend = function(o) {
                return Ext.extend(subclass, o);
            };
            return subclass;
        };
    }()),
    iterate: function(object, fn, scope) {
        if (Ext.isEmpty(object)) {
            return;
        }
        if (scope === undefined) {
            scope = object;
        }
        if (Ext.isIterable(object)) {
            Ext.Array.each.call(Ext.Array, object, fn, scope);
        } else {
            Ext.Object.each.call(Ext.Object, object, fn, scope);
        }
    },
    _resourcePoolRe: /^[<]([^<>@:]*)(?:[@]([^<>@:]+))?[>](.+)$/,
    resolveResource: function(url) {
        var ret = url,
            m;
        if (url && url.charAt(0) === '<') {
            m = Ext._resourcePoolRe.exec(url);
            if (m) {
                ret = Ext.getResourcePath(m[3], m[1], m[2]);
            }
        }
        return ret;
    },
    urlEncode: function() {
        var args = Ext.Array.from(arguments),
            prefix = '';
        if (Ext.isString(args[1])) {
            prefix = args[1] + '&';
            args[1] = false;
        }
        return prefix + Ext.Object.toQueryString.apply(Ext.Object, args);
    },
    urlDecode: function() {
        return Ext.Object.fromQueryString.apply(Ext.Object, arguments);
    },
    getScrollbarSize: function(force) {
        if (!Ext.isDomReady) {
            Ext.raise("getScrollbarSize called before DomReady");
        }
        var scrollbarSize = Ext._scrollbarSize;
        if (force || !scrollbarSize) {
            var db = document.body,
                div = document.createElement('div');
            div.style.width = div.style.height = '100px';
            div.style.overflow = 'scroll';
            div.style.position = 'absolute';
            db.appendChild(div);
            Ext._scrollbarSize = scrollbarSize = {
                width: div.offsetWidth - div.clientWidth,
                height: div.offsetHeight - div.clientHeight
            };
            db.removeChild(div);
        }
        return scrollbarSize;
    },
    typeOf: (function() {
        var nonWhitespaceRe = /\S/,
            toString = Object.prototype.toString,
            typeofTypes = {
                number: 1,
                string: 1,
                'boolean': 1,
                'undefined': 1
            },
            toStringTypes = {
                '[object Array]': 'array',
                '[object Date]': 'date',
                '[object Boolean]': 'boolean',
                '[object Number]': 'number',
                '[object RegExp]': 'regexp'
            };
        return function(value) {
            if (value === null) {
                return 'null';
            }
            var type = typeof value,
                ret, typeToString;
            if (typeofTypes[type]) {
                return type;
            }
            ret = toStringTypes[typeToString = toString.call(value)];
            if (ret) {
                return ret;
            }
            if (type === 'function') {
                return 'function';
            }
            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return nonWhitespaceRe.test(value.nodeValue) ? 'textnode' : 'whitespace';
                    } else {
                        return 'element';
                    }
                }
                return 'object';
            }
            Ext.raise({
                sourceClass: 'Ext',
                sourceMethod: 'typeOf',
                msg: 'Failed to determine the type of "' + value + '".'
            });
            return typeToString;
        };
    }()),
    factory: function(config, classReference, instance, aliasNamespace) {
        var manager = Ext.ClassManager,
            newInstance;
        if (!config || config.isInstance) {
            if (instance && instance !== config) {
                instance.destroy();
            }
            return config;
        }
        if (aliasNamespace) {
            if (typeof config === 'string') {
                return manager.instantiateByAlias(aliasNamespace + '.' + config);
            }
            else if (Ext.isObject(config) && 'type' in config) {
                return manager.instantiateByAlias(aliasNamespace + '.' + config.type, config);
            }
        }
        if (config === true) {
            if (!instance && !classReference) {
                Ext.raise('[Ext.factory] Cannot determine type of class to create');
            }
            return instance || Ext.create(classReference);
        }
        if (!Ext.isObject(config)) {
            Ext.raise("Invalid config, must be a valid config object");
        }
        if ('xtype' in config) {
            newInstance = manager.instantiateByAlias('widget.' + config.xtype, config);
        } else if ('xclass' in config) {
            newInstance = Ext.create(config.xclass, config);
        }
        if (newInstance) {
            if (instance) {
                instance.destroy();
            }
            return newInstance;
        }
        if (instance) {
            return instance.setConfig(config);
        }
        return Ext.create(classReference, config);
    },
    log: (function() {
        var primitiveRe = /string|number|boolean/;
        function dumpObject(object, level, maxLevel, withFunctions) {
            var member, type, value, name, prefix, suffix,
                members = [];
            if (Ext.isArray(object)) {
                prefix = '[';
                suffix = ']';
            } else if (Ext.isObject(object)) {
                prefix = '{';
                suffix = '}';
            }
            if (!maxLevel) {
                maxLevel = 3;
            }
            if (level > maxLevel) {
                return prefix + '...' + suffix;
            }
            level = level || 1;
            var spacer = (new Array(level)).join('    ');
            for (name in object) {
                if (object.hasOwnProperty(name)) {
                    value = object[name];
                    type = typeof value;
                    if (type === 'function') {
                        if (!withFunctions) {
                            
                            continue;
                        }
                        member = type;
                    } else if (type === 'undefined') {
                        member = type;
                    } else if (value === null || primitiveRe.test(type) || Ext.isDate(value)) {
                        member = Ext.encode(value);
                    } else if (Ext.isArray(value)) {
                        member = dumpObject(value, level + 1, maxLevel, withFunctions);
                    } else if (Ext.isObject(value)) {
                        member = dumpObject(value, level + 1, maxLevel, withFunctions);
                    } else {
                        member = type;
                    }
                    members.push(spacer + name + ': ' + member);
                }
            }
            if (members.length) {
                return prefix + '\n    ' + members.join(',\n    ') + '\n' + spacer + suffix;
            }
            return prefix + suffix;
        }
        function log(message) {
            var options, dump,
                con = Ext.global.console,
                level = 'log',
                indent = log.indent || 0,
                prefix, stack, fn, out, max;
            log.indent = indent;
            if (typeof message !== 'string') {
                options = message;
                message = options.msg || '';
                level = options.level || level;
                dump = options.dump;
                stack = options.stack;
                prefix = options.prefix;
                fn = options.fn;
                if (options.indent) {
                    ++log.indent;
                } else if (options.outdent) {
                    log.indent = indent = Math.max(indent - 1, 0);
                }
                if (dump && !(con && con.dir)) {
                    message += dumpObject(dump);
                    dump = null;
                }
            }
            if (arguments.length > 1) {
                message += Array.prototype.slice.call(arguments, 1).join('');
            }
            if (prefix) {
                message = prefix + ' - ' + message;
            }
            message = indent ? Ext.String.repeat(' ', log.indentSize * indent) + message : message;
            if (level !== 'log') {
                message = '[' + level.charAt(0).toUpperCase() + '] ' + message;
            }
            if (fn) {
                message += '\nCaller: ' + fn.toString();
            }
            if (con) {
                if (con[level]) {
                    con[level](message);
                } else {
                    con.log(message);
                }
                if (dump) {
                    con.dir(dump);
                }
                if (stack && con.trace) {
                    if (!con.firebug || level !== 'error') {
                        con.trace();
                    }
                }
            } else if (Ext.isOpera) {
                opera.postError(message);
            } else {
                out = log.out;
                max = log.max;
                if (out.length >= max) {
                    Ext.Array.erase(out, 0, out.length - 3 * Math.floor(max / 4));
                }
                out.push(message);
            }
            ++log.count;
            ++log.counters[level];
        }
        function logx(level, args) {
            if (typeof args[0] === 'string') {
                args.unshift({});
            }
            args[0].level = level;
            log.apply(this, args);
        }
        log.error = function() {
            logx('error', Array.prototype.slice.call(arguments));
        };
        log.info = function() {
            logx('info', Array.prototype.slice.call(arguments));
        };
        log.warn = function() {
            logx('warn', Array.prototype.slice.call(arguments));
        };
        log.count = 0;
        log.counters = {
            error: 0,
            warn: 0,
            info: 0,
            log: 0
        };
        log.indentSize = 2;
        log.out = [];
        log.max = 750;
        return log;
    }()) || (function() {
        var nullLog = function() {};
        nullLog.info = nullLog.warn = nullLog.error = Ext.emptyFn;
        return nullLog;
    }())
});

Ext.Inventory = function() {
    var me = this;
    me.names = [];
    me.paths = {};
    me.alternateToName = {};
    me.aliasToName = {};
    me.nameToAliases = {};
    me.nameToAlternates = {};
    me.nameToPrefix = {};
};
Ext.Inventory.prototype = {
    _array1: [
        0
    ],
    prefixes: null,
    dotRe: /\./g,
    wildcardRe: /\*/g,
    addAlias: function(className, alias, update) {
        return this.addMapping(className, alias, this.aliasToName, this.nameToAliases, update);
    },
    addAlternate: function(className, alternate) {
        return this.addMapping(className, alternate, this.alternateToName, this.nameToAlternates);
    },
    addMapping: function(className, alternate, toName, nameTo, update) {
        var name = className.$className || className,
            mappings = name,
            array = this._array1,
            a, aliases, cls, i, length, nameMapping;
        if (Ext.isString(name)) {
            mappings = {};
            mappings[name] = alternate;
        }
        for (cls in mappings) {
            aliases = mappings[cls];
            if (Ext.isString(aliases)) {
                array[0] = aliases;
                aliases = array;
            }
            length = aliases.length;
            nameMapping = nameTo[cls] || (nameTo[cls] = []);
            for (i = 0; i < length; ++i) {
                if (!(a = aliases[i])) {
                    
                    continue;
                }
                if (toName[a] !== cls) {
                    if (!update && toName[a]) {
                        Ext.log.warn("Overriding existing mapping: '" + a + "' From '" + toName[a] + "' to '" + cls + "'. Is this intentional?");
                    }
                    toName[a] = cls;
                    nameMapping.push(a);
                }
            }
        }
    },
    getAliasesByName: function(name) {
        return this.nameToAliases[name] || null;
    },
    getAlternatesByName: function(name) {
        return this.nameToAlternates[name] || null;
    },
    getNameByAlias: function(alias) {
        return this.aliasToName[alias] || '';
    },
    getNameByAlternate: function(alternate) {
        return this.alternateToName[alternate] || '';
    },
    getNamesByExpression: function(expression, exclude, accumulate) {
        var me = this,
            aliasToName = me.aliasToName,
            alternateToName = me.alternateToName,
            nameToAliases = me.nameToAliases,
            nameToAlternates = me.nameToAlternates,
            map = accumulate ? exclude : {},
            names = [],
            expressions = Ext.isString(expression) ? [
                expression
            ] : expression,
            length = expressions.length,
            wildcardRe = me.wildcardRe,
            expr, i, list, match, n, name, regex;
        for (i = 0; i < length; ++i) {
            if ((expr = expressions[i]).indexOf('*') < 0) {
                if (!(name = aliasToName[expr])) {
                    if (!(name = alternateToName[expr])) {
                        name = expr;
                    }
                }
                if (!(name in map) && !(exclude && (name in exclude))) {
                    map[name] = 1;
                    names.push(name);
                }
            } else {
                regex = new RegExp('^' + expr.replace(wildcardRe, '(.*?)') + '$');
                for (name in nameToAliases) {
                    if (!(name in map) && !(exclude && (name in exclude))) {
                        if (!(match = regex.test(name))) {
                            n = (list = nameToAliases[name]).length;
                            while (!match && n-- > 0) {
                                match = regex.test(list[n]);
                            }
                            list = nameToAlternates[name];
                            if (list && !match) {
                                n = list.length;
                                while (!match && n-- > 0) {
                                    match = regex.test(list[n]);
                                }
                            }
                        }
                        if (match) {
                            map[name] = 1;
                            names.push(name);
                        }
                    }
                }
            }
        }
        return names;
    },
    getPath: function(className) {
        var me = this,
            paths = me.paths,
            ret = '',
            prefix;
        if (className in paths) {
            ret = paths[className];
        } else {
            prefix = me.nameToPrefix[className] || (me.nameToPrefix[className] = me.getPrefix(className));
            if (prefix) {
                className = className.substring(prefix.length + 1);
                ret = paths[prefix];
                if (ret) {
                    ret += '/';
                }
            }
            ret += className.replace(me.dotRe, '/') + '.js';
        }
        return ret;
    },
    getPrefix: function(className) {
        if (className in this.paths) {
            return className;
        } else if (className in this.nameToPrefix) {
            return this.nameToPrefix[className];
        }
        var prefixes = this.getPrefixes(),
            length = className.length,
            items, currChar, currSubstr, prefix, j, jlen;
        while (length-- > 0) {
            items = prefixes[length];
            if (items) {
                currChar = className.charAt(length);
                if (currChar !== '.') {
                    
                    continue;
                }
                currSubstr = className.substring(0, length);
                for (j = 0 , jlen = items.length; j < jlen; j++) {
                    prefix = items[j];
                    if (prefix === className.substring(0, length)) {
                        return prefix;
                    }
                }
            }
        }
        return '';
    },
    getPrefixes: function() {
        var me = this,
            prefixes = me.prefixes,
            names, name, nameLength, items, i, len;
        if (!prefixes) {
            names = me.names.slice(0);
            me.prefixes = prefixes = [];
            for (i = 0 , len = names.length; i < len; i++) {
                name = names[i];
                nameLength = name.length;
                items = prefixes[nameLength] || (prefixes[nameLength] = []);
                items.push(name);
            }
        }
        return prefixes;
    },
    removeName: function(name) {
        var me = this,
            aliasToName = me.aliasToName,
            alternateToName = me.alternateToName,
            nameToAliases = me.nameToAliases,
            nameToAlternates = me.nameToAlternates,
            aliases = nameToAliases[name],
            alternates = nameToAlternates[name],
            i, a;
        delete nameToAliases[name];
        delete nameToAlternates[name];
        delete me.nameToPrefix[name];
        if (aliases) {
            for (i = aliases.length; i--; ) {
                if (name === (a = aliases[i])) {
                    delete aliasToName[a];
                }
            }
        }
        if (alternates) {
            for (i = alternates.length; i--; ) {
                if (name === (a = alternates[i])) {
                    delete alternateToName[a];
                }
            }
        }
    },
    resolveName: function(name) {
        var me = this,
            trueName;
        if (!(name in me.nameToAliases)) {
            if (!(trueName = me.aliasToName[name])) {
                trueName = me.alternateToName[name];
            }
        }
        return trueName || name;
    },
    select: function(receiver, scope) {
        var me = this,
            excludes = {},
            ret = {
                excludes: excludes,
                exclude: function() {
                    me.getNamesByExpression(arguments, excludes, true);
                    return this;
                }
            },
            name;
        for (name in receiver) {
            ret[name] = me.selectMethod(excludes, receiver[name], scope || receiver);
        }
        return ret;
    },
    selectMethod: function(excludes, fn, scope) {
        var me = this;
        return function(include) {
            var args = Ext.Array.slice(arguments, 1);
            args.unshift(me.getNamesByExpression(include, excludes));
            return fn.apply(scope, args);
        };
    },
    setPath: Ext.Function.flexSetter(function(name, path) {
        var me = this;
        me.paths[name] = path;
        me.names.push(name);
        me.prefixes = null;
        me.nameToPrefix = {};
        return me;
    })
};

Ext.Config = function(name) {
    var me = this,
        capitalizedName = name.charAt(0).toUpperCase() + name.substr(1);
    me.name = name;
    me.names = {
        internal: '_' + name,
        initializing: 'is' + capitalizedName + 'Initializing',
        apply: 'apply' + capitalizedName,
        update: 'update' + capitalizedName,
        get: 'get' + capitalizedName,
        set: 'set' + capitalizedName,
        initGet: 'initGet' + capitalizedName,
        changeEvent: name.toLowerCase() + 'change'
    };
    me.root = me;
};
Ext.Config.map = {};
Ext.Config.get = function(name) {
    var map = Ext.Config.map,
        ret = map[name] || (map[name] = new Ext.Config(name));
    return ret;
};
Ext.Config.prototype = {
    self: Ext.Config,
    isConfig: true,
    getGetter: function() {
        return this.getter || (this.root.getter = this.makeGetter());
    },
    getInitGetter: function() {
        return this.initGetter || (this.root.initGetter = this.makeInitGetter());
    },
    getSetter: function() {
        return this.setter || (this.root.setter = this.makeSetter());
    },
    getEventedSetter: function() {
        return this.eventedSetter || (this.root.eventedSetter = this.makeEventedSetter());
    },
    getInternalName: function(target) {
        return target.$configPrefixed ? this.names.internal : this.name;
    },
    mergeNew: function(newValue, oldValue, target, mixinClass) {
        var ret, key;
        if (!oldValue) {
            ret = newValue;
        } else if (!newValue) {
            ret = oldValue;
        } else {
            ret = Ext.Object.chain(oldValue);
            for (key in newValue) {
                if (!mixinClass || !(key in ret)) {
                    ret[key] = newValue[key];
                }
            }
        }
        return ret;
    },
    mergeSets: function(newValue, oldValue, preserveExisting) {
        var ret = oldValue ? Ext.Object.chain(oldValue) : {},
            i, val;
        if (newValue instanceof Array) {
            for (i = newValue.length; i--; ) {
                val = newValue[i];
                if (!preserveExisting || !(val in ret)) {
                    ret[val] = true;
                }
            }
        } else if (newValue) {
            if (newValue.constructor === Object) {
                for (i in newValue) {
                    val = newValue[i];
                    if (!preserveExisting || !(i in ret)) {
                        ret[i] = val;
                    }
                }
            } else if (!preserveExisting || !(newValue in ret)) {
                ret[newValue] = true;
            }
        }
        return ret;
    },
    makeGetter: function() {
        var name = this.name,
            prefixedName = this.names.internal;
        return function() {
            var internalName = this.$configPrefixed ? prefixedName : name;
            return this[internalName];
        };
    },
    makeInitGetter: function() {
        var name = this.name,
            names = this.names,
            setName = names.set,
            getName = names.get,
            initializingName = names.initializing;
        return function() {
            var me = this;
            me[initializingName] = true;
            delete me[getName];
            me[setName](me.config[name]);
            delete me[initializingName];
            return me[getName].apply(me, arguments);
        };
    },
    makeSetter: function() {
        var name = this.name,
            names = this.names,
            prefixedName = names.internal,
            getName = names.get,
            applyName = names.apply,
            updateName = names.update,
            setter;
        setter = function(value) {
            var me = this,
                internalName = me.$configPrefixed ? prefixedName : name,
                oldValue = me[internalName];
            delete me[getName];
            if (!me[applyName] || (value = me[applyName](value, oldValue)) !== undefined) {
                if (value !== (oldValue = me[internalName])) {
                    me[internalName] = value;
                    if (me[updateName]) {
                        me[updateName](value, oldValue);
                    }
                }
            }
            return me;
        };
        setter.$isDefault = true;
        return setter;
    },
    makeEventedSetter: function() {
        var name = this.name,
            names = this.names,
            prefixedName = names.internal,
            getName = names.get,
            applyName = names.apply,
            updateName = names.update,
            changeEventName = names.changeEvent,
            updateFn = function(me, value, oldValue, internalName) {
                me[internalName] = value;
                if (me[updateName]) {
                    me[updateName](value, oldValue);
                }
            },
            setter;
        setter = function(value) {
            var me = this,
                internalName = me.$configPrefixed ? prefixedName : name,
                oldValue = me[internalName];
            delete me[getName];
            if (!me[applyName] || (value = me[applyName](value, oldValue)) !== undefined) {
                if (value !== (oldValue = me[internalName])) {
                    if (me.isConfiguring) {
                        me[internalName] = value;
                        if (me[updateName]) {
                            me[updateName](value, oldValue);
                        }
                    } else {
                        me.fireEventedAction(changeEventName, [
                            me,
                            value,
                            oldValue
                        ], updateFn, me, [
                            me,
                            value,
                            oldValue,
                            internalName
                        ]);
                    }
                }
            }
            return me;
        };
        setter.$isDefault = true;
        return setter;
    }
};

(function() {
    var ExtConfig = Ext.Config,
        configPropMap = ExtConfig.map,
        ExtObject = Ext.Object;
    Ext.Configurator = function(cls) {
        var me = this,
            prototype = cls.prototype,
            superCfg = cls.superclass ? cls.superclass.self.$config : null;
        me.cls = cls;
        me.superCfg = superCfg;
        if (superCfg) {
            me.configs = ExtObject.chain(superCfg.configs);
            me.cachedConfigs = ExtObject.chain(superCfg.cachedConfigs);
            me.initMap = ExtObject.chain(superCfg.initMap);
            me.values = ExtObject.chain(superCfg.values);
            me.needsFork = superCfg.needsFork;
            me.deprecations = ExtObject.chain(superCfg.deprecations);
        } else {
            me.configs = {};
            me.cachedConfigs = {};
            me.initMap = {};
            me.values = {};
            me.deprecations = {};
        }
        prototype.config = prototype.defaultConfig = me.values;
        cls.$config = me;
    };
    Ext.Configurator.prototype = {
        self: Ext.Configurator,
        needsFork: false,
        initList: null,
        add: function(config, mixinClass) {
            var me = this,
                Cls = me.cls,
                configs = me.configs,
                cachedConfigs = me.cachedConfigs,
                initMap = me.initMap,
                prototype = Cls.prototype,
                mixinConfigs = mixinClass && mixinClass.$config.configs,
                values = me.values,
                isObject, meta, isCached, merge, cfg, currentValue, name, names, s, value;
            for (name in config) {
                value = config[name];
                isObject = value && value.constructor === Object;
                meta = isObject && '$value' in value ? value : null;
                isCached = false;
                if (meta) {
                    isCached = !!meta.cached;
                    value = meta.$value;
                    isObject = value && value.constructor === Object;
                }
                merge = meta && meta.merge;
                cfg = configs[name];
                if (cfg) {
                    if (mixinClass) {
                        merge = cfg.merge;
                        if (!merge) {
                            
                            continue;
                        }
                        meta = null;
                    } else {
                        merge = merge || cfg.merge;
                    }
                    if (!mixinClass && isCached && !cachedConfigs[name]) {
                        Ext.raise('Redefining config as cached: ' + name + ' in class: ' + Cls.$className);
                    }
                    currentValue = values[name];
                    if (merge) {
                        value = merge.call(cfg, value, currentValue, Cls, mixinClass);
                    } else if (isObject) {
                        if (currentValue && currentValue.constructor === Object) {
                            value = ExtObject.merge({}, currentValue, value);
                        }
                    }
                } else {
                    if (mixinConfigs) {
                        cfg = mixinConfigs[name];
                        meta = null;
                    } else {
                        cfg = ExtConfig.get(name);
                    }
                    configs[name] = cfg;
                    if (cfg.cached || isCached) {
                        cachedConfigs[name] = true;
                    }
                    names = cfg.names;
                    if (!prototype[s = names.get]) {
                        prototype[s] = cfg.getter || cfg.getGetter();
                    }
                    if (!prototype[s = names.set]) {
                        prototype[s] = (meta && meta.evented) ? (cfg.eventedSetter || cfg.getEventedSetter()) : (cfg.setter || cfg.getSetter());
                    }
                }
                if (meta) {
                    if (cfg.owner !== Cls) {
                        configs[name] = cfg = Ext.Object.chain(cfg);
                        cfg.owner = Cls;
                    }
                    Ext.apply(cfg, meta);
                    delete cfg.$value;
                }
                if (!me.needsFork && value && (value.constructor === Object || value instanceof Array)) {
                    me.needsFork = true;
                }
                if (value !== null) {
                    initMap[name] = true;
                } else {
                    if (prototype.$configPrefixed) {
                        prototype[configs[name].names.internal] = null;
                    } else {
                        prototype[configs[name].name] = null;
                    }
                    if (name in initMap) {
                        initMap[name] = false;
                    }
                }
                values[name] = value;
            }
        },
        addDeprecations: function(configs) {
            var me = this,
                deprecations = me.deprecations,
                className = (me.cls.$className || '') + '#',
                message, newName, oldName;
            for (oldName in configs) {
                newName = configs[oldName];
                if (!newName) {
                    message = 'This config has been removed.';
                } else if (!(message = newName.message)) {
                    message = 'This config has been renamed to "' + newName + '"';
                }
                deprecations[oldName] = className + oldName + ': ' + message;
            }
        },
        configure: function(instance, instanceConfig) {
            var me = this,
                configs = me.configs,
                deprecations = me.deprecations,
                initMap = me.initMap,
                initListMap = me.initListMap,
                initList = me.initList,
                prototype = me.cls.prototype,
                values = me.values,
                remaining = 0,
                firstInstance = !initList,
                cachedInitList, cfg, getter, i, internalName, ln, names, name, value, isCached, valuesKey, field;
            values = me.needsFork ? ExtObject.fork(values) : ExtObject.chain(values);
            instance.isConfiguring = true;
            if (firstInstance) {
                me.initList = initList = [];
                me.initListMap = initListMap = {};
                instance.isFirstInstance = true;
                for (name in initMap) {
                    cfg = configs[name];
                    isCached = cfg.cached;
                    if (initMap[name]) {
                        names = cfg.names;
                        value = values[name];
                        if (!prototype[names.set].$isDefault || prototype[names.apply] || prototype[names.update] || typeof value === 'object') {
                            if (isCached) {
                                (cachedInitList || (cachedInitList = [])).push(cfg);
                            } else {
                                initList.push(cfg);
                                initListMap[name] = true;
                            }
                            instance[names.get] = cfg.initGetter || cfg.getInitGetter();
                        } else {
                            prototype[cfg.getInternalName(prototype)] = value;
                        }
                    } else if (isCached) {
                        prototype[cfg.getInternalName(prototype)] = undefined;
                    }
                }
            }
            ln = cachedInitList && cachedInitList.length;
            if (ln) {
                for (i = 0; i < ln; ++i) {
                    internalName = cachedInitList[i].getInternalName(prototype);
                    instance[internalName] = null;
                }
                for (i = 0; i < ln; ++i) {
                    names = (cfg = cachedInitList[i]).names;
                    getter = names.get;
                    if (instance.hasOwnProperty(getter)) {
                        instance[names.set](values[cfg.name]);
                        delete instance[getter];
                    }
                }
                for (i = 0; i < ln; ++i) {
                    internalName = cachedInitList[i].getInternalName(prototype);
                    prototype[internalName] = instance[internalName];
                    delete instance[internalName];
                }
            }
            if (instanceConfig && instanceConfig.platformConfig) {
                instanceConfig = me.resolvePlatformConfig(instance, instanceConfig);
            }
            if (firstInstance) {
                if (instance.afterCachedConfig && !instance.afterCachedConfig.$nullFn) {
                    instance.afterCachedConfig(instanceConfig);
                }
            }
            instance.config = values;
            for (i = 0 , ln = initList.length; i < ln; ++i) {
                cfg = initList[i];
                instance[cfg.names.get] = cfg.initGetter || cfg.getInitGetter();
            }
            if (instance.transformInstanceConfig) {
                instanceConfig = instance.transformInstanceConfig(instanceConfig);
            }
            if (instanceConfig) {
                for (name in instanceConfig) {
                    value = instanceConfig[name];
                    cfg = configs[name];
                    if (deprecations[name]) {
                        Ext.log.warn(deprecations[name]);
                        if (!cfg) {
                            
                            continue;
                        }
                    }
                    if (!cfg) {
                        field = instance.self.prototype[name];
                        if (instance.$configStrict && (typeof field === 'function') && !field.$nullFn) {
                            Ext.raise('Cannot override method ' + name + ' on ' + instance.$className + ' instance.');
                        }
                        instance[name] = value;
                    } else {
                        if (!cfg.lazy) {
                            ++remaining;
                        }
                        if (!initListMap[name]) {
                            instance[cfg.names.get] = cfg.initGetter || cfg.getInitGetter();
                        }
                        if (cfg.merge) {
                            value = cfg.merge(value, values[name], instance);
                        } else if (value && value.constructor === Object) {
                            valuesKey = values[name];
                            if (valuesKey && valuesKey.constructor === Object) {
                                value = ExtObject.merge(values[name], value);
                            } else {
                                value = Ext.clone(value, false);
                            }
                        }
                    }
                    values[name] = value;
                }
            }
            if (instance.beforeInitConfig && !instance.beforeInitConfig.$nullFn) {
                if (instance.beforeInitConfig(instanceConfig) === false) {
                    return;
                }
            }
            if (instanceConfig) {
                for (name in instanceConfig) {
                    if (!remaining) {
                        break;
                    }
                    cfg = configs[name];
                    if (cfg && !cfg.lazy) {
                        --remaining;
                        names = cfg.names;
                        getter = names.get;
                        if (instance.hasOwnProperty(getter)) {
                            instance[names.set](values[name]);
                            delete instance[names.get];
                        }
                    }
                }
            }
            for (i = 0 , ln = initList.length; i < ln; ++i) {
                cfg = initList[i];
                names = cfg.names;
                getter = names.get;
                if (!cfg.lazy && instance.hasOwnProperty(getter)) {
                    instance[names.set](values[cfg.name]);
                    delete instance[getter];
                }
            }
            delete instance.isConfiguring;
        },
        getCurrentConfig: function(instance) {
            var defaultConfig = instance.defaultConfig,
                config = {},
                name;
            for (name in defaultConfig) {
                config[name] = instance[configPropMap[name].names.get]();
            }
            return config;
        },
        merge: function(instance, baseConfig, config) {
            var configs = this.configs,
                name, value, baseValue, cfg;
            for (name in config) {
                value = config[name];
                cfg = configs[name];
                if (cfg) {
                    if (cfg.merge) {
                        value = cfg.merge(value, baseConfig[name], instance);
                    } else if (value && value.constructor === Object) {
                        baseValue = baseConfig[name];
                        if (baseValue && baseValue.constructor === Object) {
                            value = Ext.Object.merge(baseValue, value);
                        } else {
                            value = Ext.clone(value, false);
                        }
                    }
                }
                baseConfig[name] = value;
            }
            return baseConfig;
        },
        reconfigure: function(instance, instanceConfig, options) {
            var currentConfig = instance.config,
                configList = [],
                strict = instance.$configStrict && !(options && options.strict === false),
                configs = this.configs,
                defaults = options && options.defaults,
                cfg, getter, i, len, name, names, prop;
            for (name in instanceConfig) {
                if (defaults && instance.hasOwnProperty(name)) {
                    
                    continue;
                }
                currentConfig[name] = instanceConfig[name];
                cfg = configs[name];
                if (this.deprecations[name]) {
                    Ext.log.warn(this.deprecations[name]);
                    if (!cfg) {
                        
                        continue;
                    }
                }
                if (cfg) {
                    instance[cfg.names.get] = cfg.initGetter || cfg.getInitGetter();
                } else {
                    prop = instance.self.prototype[name];
                    if (strict) {
                        if ((typeof prop === 'function') && !prop.$nullFn) {
                            Ext.Error.raise("Cannot override method " + name + " on " + instance.$className + " instance.");
                            
                            continue;
                        } else {
                            if (name !== 'type') {
                                Ext.log.warn('No such config "' + name + '" for class ' + instance.$className);
                            }
                        }
                    }
                }
                configList.push(name);
            }
            for (i = 0 , len = configList.length; i < len; i++) {
                name = configList[i];
                cfg = configs[name];
                if (cfg) {
                    names = cfg.names;
                    getter = names.get;
                    if (instance.hasOwnProperty(getter)) {
                        instance[names.set](instanceConfig[name]);
                        delete instance[getter];
                    }
                } else {
                    cfg = configPropMap[name] || Ext.Config.get(name);
                    names = cfg.names;
                    if (instance[names.set]) {
                        instance[names.set](instanceConfig[name]);
                    } else {
                        instance[name] = instanceConfig[name];
                    }
                }
            }
        },
        resolvePlatformConfig: function(instance, instanceConfig) {
            var platformConfig = instanceConfig && instanceConfig.platformConfig,
                ret = instanceConfig,
                i, keys, n;
            if (platformConfig) {
                keys = Ext.getPlatformConfigKeys(platformConfig);
                n = keys.length;
                if (n) {
                    ret = Ext.merge({}, ret);
                    for (i = 0 , n = keys.length; i < n; ++i) {
                        this.merge(instance, ret, platformConfig[keys[i]]);
                    }
                }
            }
            return ret;
        }
    };
}());

Ext.Base = (function(flexSetter) {
    var noArgs = [],
        baseStaticMember,
        baseStaticMembers = [],
        getConfig = function(name, peek) {
            var me = this,
                ret, cfg, getterName;
            if (name) {
                cfg = Ext.Config.map[name];
                if (!cfg) {
                    Ext.Logger.error("Invalid property name for getter: '" + name + "' for '" + me.$className + "'.");
                }
                getterName = cfg.names.get;
                if (peek && me.hasOwnProperty(getterName)) {
                    ret = me.config[name];
                } else {
                    ret = me[getterName]();
                }
            } else {
                ret = me.getCurrentConfig();
            }
            return ret;
        },
        makeDeprecatedMethod = function(oldName, newName, msg) {
            var message = '"' + oldName + '" is deprecated.';
            if (msg) {
                message += ' ' + msg;
            } else if (newName) {
                message += ' Please use "' + newName + '" instead.';
            }
            return function() {
                Ext.raise(message);
            };
        },
        addDeprecatedProperty = function(object, oldName, newName, message) {
            if (!message) {
                message = '"' + oldName + '" is deprecated.';
            }
            if (newName) {
                message += ' Please use "' + newName + '" instead.';
            }
            if (message) {
                Ext.Object.defineProperty(object, oldName, {
                    get: function() {
                        Ext.raise(message);
                    },
                    set: function(value) {
                        Ext.raise(message);
                    },
                    configurable: true
                });
            }
        },
        makeAliasFn = function(name) {
            return function() {
                return this[name].apply(this, arguments);
            };
        },
        Version = Ext.Version,
        leadingDigitRe = /^\d/,
        oneMember = {},
        aliasOneMember = {},
        Base = function() {},
        BasePrototype = Base.prototype,
        Reaper;
    Ext.Reaper = Reaper = {
        delay: 100,
        queue: [],
        timer: null,
        add: function(obj) {
            if (!Reaper.timer) {
                Reaper.timer = Ext.defer(Reaper.tick, Reaper.delay);
            }
            Reaper.queue.push(obj);
        },
        flush: function() {
            if (Reaper.timer) {
                clearTimeout(Reaper.timer);
                Reaper.timer = null;
            }
            var queue = Reaper.queue,
                n = queue.length,
                i, obj;
            Reaper.queue = [];
            for (i = 0; i < n; ++i) {
                obj = queue[i];
                if (obj && obj.$reap) {
                    obj.$reap();
                }
            }
        },
        tick: function() {
            Reaper.timer = null;
            Reaper.flush();
        }
    };
    Ext.apply(Base, {
        $className: 'Ext.Base',
        $isClass: true,
        create: function() {
            return Ext.create.apply(Ext, [
                this
            ].concat(Array.prototype.slice.call(arguments, 0)));
        },
        addDeprecations: function(deprecations) {
            var me = this,
                all = [],
                compatVersion = Ext.getCompatVersion(deprecations.name),
                configurator = me.getConfigurator(),
                displayName = (me.$className || '') + '#',
                deprecate, versionSpec, index, message, target, enabled, existing, fn, names, oldName, newName, member, statics, version;
            for (versionSpec in deprecations) {
                if (leadingDigitRe.test(versionSpec)) {
                    version = new Ext.Version(versionSpec);
                    version.deprecations = deprecations[versionSpec];
                    all.push(version);
                }
            }
            all.sort(Version.compare);
            for (index = all.length; index--; ) {
                deprecate = (version = all[index]).deprecations;
                target = me.prototype;
                statics = deprecate.statics;
                enabled = compatVersion && compatVersion.lt(version);
                if (!enabled) {}
                else if (!enabled) {
                    break;
                }
                while (deprecate) {
                    names = deprecate.methods;
                    if (names) {
                        for (oldName in names) {
                            member = names[oldName];
                            fn = null;
                            if (!member) {
                                Ext.Assert.isNotDefinedProp(target, oldName);
                                fn = makeDeprecatedMethod(displayName + oldName);
                            }
                            else if (Ext.isString(member)) {
                                Ext.Assert.isNotDefinedProp(target, oldName);
                                Ext.Assert.isDefinedProp(target, member);
                                if (enabled) {
                                    fn = makeAliasFn(member);
                                } else {
                                    fn = makeDeprecatedMethod(displayName + oldName, member);
                                }
                            } else {
                                message = '';
                                if (member.message || member.fn) {
                                    message = member.message;
                                    member = member.fn;
                                }
                                existing = target.hasOwnProperty(oldName) && target[oldName];
                                if (enabled && member) {
                                    member.$owner = me;
                                    member.$name = oldName;
                                    member.name = displayName + oldName;
                                    if (existing) {
                                        member.$previous = existing;
                                    }
                                    fn = member;
                                }
                                else if (!existing) {
                                    fn = makeDeprecatedMethod(displayName + oldName, null, message);
                                }
                            }
                            if (fn) {
                                target[oldName] = fn;
                            }
                        }
                    }
                    names = deprecate.configs;
                    if (names) {
                        configurator.addDeprecations(names);
                    }
                    names = deprecate.properties;
                    if (names && !enabled) {
                        for (oldName in names) {
                            newName = names[oldName];
                            if (Ext.isString(newName)) {
                                addDeprecatedProperty(target, displayName + oldName, newName);
                            } else if (newName && newName.message) {
                                addDeprecatedProperty(target, displayName + oldName, null, newName.message);
                            } else {
                                addDeprecatedProperty(target, displayName + oldName);
                            }
                        }
                    }
                    deprecate = statics;
                    statics = null;
                    target = me;
                }
            }
        },
        extend: function(parent) {
            var me = this,
                parentPrototype = parent.prototype,
                prototype, name, statics;
            prototype = me.prototype = Ext.Object.chain(parentPrototype);
            prototype.self = me;
            me.superclass = prototype.superclass = parentPrototype;
            if (!parent.$isClass) {
                for (name in BasePrototype) {
                    if (name in prototype) {
                        prototype[name] = BasePrototype[name];
                    }
                }
            }
            statics = parentPrototype.$inheritableStatics;
            if (statics) {
                for (name in statics) {
                    if (!me.hasOwnProperty(name)) {
                        me[name] = parent[name];
                    }
                }
            }
            if (parent.$onExtended) {
                me.$onExtended = parent.$onExtended.slice();
            }
            me.getConfigurator();
        },
        $onExtended: [],
        triggerExtended: function() {
            Ext.classSystemMonitor && Ext.classSystemMonitor(this, 'Ext.Base#triggerExtended', arguments);
            var callbacks = this.$onExtended,
                ln = callbacks.length,
                i, callback;
            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    callback = callbacks[i];
                    callback.fn.apply(callback.scope || this, arguments);
                }
            }
        },
        onExtended: function(fn, scope) {
            this.$onExtended.push({
                fn: fn,
                scope: scope
            });
            return this;
        },
        addStatics: function(members) {
            this.addMembers(members, true);
            return this;
        },
        addInheritableStatics: function(members) {
            var me = this,
                proto = me.prototype,
                inheritableStatics = me.$inheritableStatics,
                name, member, current;
            if (!inheritableStatics) {
                inheritableStatics = Ext.apply({}, proto.$inheritableStatics);
                me.$inheritableStatics = proto.$inheritableStatics = inheritableStatics;
            }
            var className = Ext.getClassName(me) + '.';
            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    current = me[name];
                    if (typeof member == 'function') {
                        member.name = className + name;
                    }
                    if (typeof current === 'function' && !current.$isClass && !current.$nullFn) {
                        member.$previous = current;
                    }
                    me[name] = member;
                    inheritableStatics[name] = true;
                }
            }
            return me;
        },
        addMembers: function(members, isStatic, privacy) {
            var me = this,
                cloneFunction = Ext.Function.clone,
                target = isStatic ? me : me.prototype,
                defaultConfig = !isStatic && target.defaultConfig,
                enumerables = Ext.enumerables,
                privates = members.privates,
                configs, i, ln, member, name, subPrivacy, privateStatics;
            var displayName = (me.$className || '') + '#';
            if (privates) {
                delete members.privates;
                if (!isStatic) {
                    privateStatics = privates.statics;
                    delete privates.statics;
                }
                subPrivacy = privates.privacy || privacy || 'framework';
                me.addMembers(privates, isStatic, subPrivacy);
                if (privateStatics) {
                    me.addMembers(privateStatics, true, subPrivacy);
                }
            }
            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    if (privacy === true) {
                        privacy = 'framework';
                    }
                    if (member && member.$nullFn && privacy !== member.$privacy) {
                        Ext.raise('Cannot use stock function for private method ' + (me.$className ? me.$className + '#' : '') + name);
                    }
                    if (typeof member === 'function' && !member.$isClass && !member.$nullFn) {
                        if (member.$owner) {
                            member = cloneFunction(member);
                        }
                        if (target.hasOwnProperty(name)) {
                            member.$previous = target[name];
                        }
                        member.$owner = me;
                        member.$name = name;
                        member.name = displayName + name;
                        var existing = target[name];
                        if (privacy) {
                            member.$privacy = privacy;
                            if (existing && existing.$privacy && existing.$privacy !== privacy) {
                                Ext.privacyViolation(me, existing, member, isStatic);
                            }
                        } else if (existing && existing.$privacy) {
                            Ext.privacyViolation(me, existing, member, isStatic);
                        }
                    }
                    else if (defaultConfig && (name in defaultConfig) && !target.config.hasOwnProperty(name)) {
                        (configs || (configs = {}))[name] = member;
                        
                        continue;
                    }
                    target[name] = member;
                }
            }
            if (configs) {
                me.addConfig(configs);
            }
            if (enumerables) {
                for (i = 0 , ln = enumerables.length; i < ln; ++i) {
                    if (members.hasOwnProperty(name = enumerables[i])) {
                        member = members[name];
                        if (member && !member.$nullFn) {
                            if (member.$owner) {
                                member = cloneFunction(member);
                            }
                            member.$owner = me;
                            member.$name = name;
                            member.name = displayName + name;
                            if (target.hasOwnProperty(name)) {
                                member.$previous = target[name];
                            }
                        }
                        target[name] = member;
                    }
                }
            }
            return this;
        },
        addMember: function(name, member) {
            oneMember[name] = member;
            this.addMembers(oneMember);
            delete oneMember[name];
            return this;
        },
        borrow: function(fromClass, members) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(this, 'Ext.Base#borrow', arguments);
            var prototype = fromClass.prototype,
                membersObj = {},
                i, ln, name;
            members = Ext.Array.from(members);
            for (i = 0 , ln = members.length; i < ln; i++) {
                name = members[i];
                membersObj[name] = prototype[name];
            }
            return this.addMembers(membersObj);
        },
        override: function(members) {
            var me = this,
                statics = members.statics,
                inheritableStatics = members.inheritableStatics,
                config = members.config,
                mixins = members.mixins,
                cachedConfig = members.cachedConfig;
            if (statics || inheritableStatics || config) {
                members = Ext.apply({}, members);
            }
            if (statics) {
                me.addMembers(statics, true);
                delete members.statics;
            }
            if (inheritableStatics) {
                me.addInheritableStatics(inheritableStatics);
                delete members.inheritableStatics;
            }
            if (members.platformConfig) {
                me.addPlatformConfig(members);
            }
            if (config) {
                me.addConfig(config);
                delete members.config;
            }
            if (cachedConfig) {
                me.addCachedConfig(cachedConfig);
                delete members.cachedConfig;
            }
            delete members.mixins;
            me.addMembers(members);
            if (mixins) {
                me.mixin(mixins);
            }
            return me;
        },
        addPlatformConfig: function(data) {
            var me = this,
                platformConfigs = data.platformConfig,
                config = data.config,
                added, classConfigs, configs, configurator, hoisted, keys, name, value, i, ln;
            delete data.platformConfig;
            if (platformConfigs instanceof Array) {
                throw new Error('platformConfigs must be specified as an object.');
            }
            configurator = me.getConfigurator();
            classConfigs = configurator.configs;
            keys = Ext.getPlatformConfigKeys(platformConfigs);
            for (i = 0 , ln = keys.length; i < ln; ++i) {
                configs = platformConfigs[keys[i]];
                hoisted = added = null;
                for (name in configs) {
                    value = configs[name];
                    if (config && name in config) {
                        (added || (added = {}))[name] = value;
                        (hoisted || (hoisted = {}))[name] = config[name];
                        delete config[name];
                    } else if (name in classConfigs) {
                        (added || (added = {}))[name] = value;
                    } else {
                        data[name] = value;
                    }
                }
                if (hoisted) {
                    configurator.add(hoisted);
                }
                if (added) {
                    configurator.add(added);
                }
            }
        },
        callParent: function(args) {
            var method;
            return (method = this.callParent.caller) && (method.$previous || ((method = method.$owner ? method : method.caller) && method.$owner.superclass.self[method.$name])).apply(this, args || noArgs);
        },
        callSuper: function(args) {
            var method;
            return (method = this.callSuper.caller) && ((method = method.$owner ? method : method.caller) && method.$owner.superclass.self[method.$name]).apply(this, args || noArgs);
        },
        mixin: function(name, mixinClass) {
            var me = this,
                mixin, prototype, key, statics, i, ln, mixinName, name, mixinValue, mixins, mixinStatics;
            if (typeof name !== 'string') {
                mixins = name;
                if (mixins instanceof Array) {
                    for (i = 0 , ln = mixins.length; i < ln; i++) {
                        mixin = mixins[i];
                        me.mixin(mixin.prototype.mixinId || mixin.$className, mixin);
                    }
                } else {
                    for (mixinName in mixins) {
                        me.mixin(mixinName, mixins[mixinName]);
                    }
                }
                return;
            }
            mixin = mixinClass.prototype;
            prototype = me.prototype;
            if (mixin.onClassMixedIn) {
                mixin.onClassMixedIn.call(mixinClass, me);
            }
            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = Ext.Object.chain(prototype.mixins);
                } else {
                    prototype.mixins = {};
                }
            }
            for (key in mixin) {
                mixinValue = mixin[key];
                if (key === 'mixins') {
                    Ext.applyIf(prototype.mixins, mixinValue);
                } else if (!(key === 'mixinId' || key === 'config' || key === '$inheritableStatics') && (prototype[key] === undefined)) {
                    prototype[key] = mixinValue;
                }
            }
            statics = mixin.$inheritableStatics;
            if (statics) {
                mixinStatics = {};
                for (name in statics) {
                    if (!me.hasOwnProperty(name)) {
                        mixinStatics[name] = mixinClass[name];
                    }
                }
                me.addInheritableStatics(mixinStatics);
            }
            if ('config' in mixin) {
                me.addConfig(mixin.config, mixinClass);
            }
            prototype.mixins[name] = mixin;
            if (mixin.afterClassMixedIn) {
                mixin.afterClassMixedIn.call(mixinClass, me);
            }
            return me;
        },
        addConfig: function(config, mixinClass) {
            var cfg = this.$config || this.getConfigurator();
            cfg.add(config, mixinClass);
        },
        addCachedConfig: function(config, isMixin) {
            var cached = {},
                key;
            for (key in config) {
                cached[key] = {
                    cached: true,
                    $value: config[key]
                };
            }
            this.addConfig(cached, isMixin);
        },
        getConfigurator: function() {
            return this.$config || new Ext.Configurator(this);
        },
        getName: function() {
            return Ext.getClassName(this);
        },
        createAlias: flexSetter(function(alias, origin) {
            aliasOneMember[alias] = function() {
                return this[origin].apply(this, arguments);
            };
            this.override(aliasOneMember);
            delete aliasOneMember[alias];
        })
    });
    for (baseStaticMember in Base) {
        if (Base.hasOwnProperty(baseStaticMember)) {
            baseStaticMembers.push(baseStaticMember);
        }
    }
    Base.$staticMembers = baseStaticMembers;
    Base.getConfigurator();
    Base.addMembers({
        $className: 'Ext.Base',
        isInstance: true,
        $configPrefixed: true,
        $configStrict: true,
        isConfiguring: false,
        isFirstInstance: false,
        destroyed: false,
        clearPropertiesOnDestroy: true,
        clearPrototypeOnDestroy: false,
        statics: function() {
            var method = this.statics.caller,
                self = this.self;
            if (!method) {
                return self;
            }
            return method.$owner;
        },
        callParent: function(args) {
            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous || ((method = method.$owner ? method : method.caller) && method.$owner.superclass[method.$name]));
            if (!superMethod) {
                method = this.callParent.caller;
                var parentClass, methodName;
                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }
                    method = method.caller;
                }
                parentClass = method.$owner.superclass;
                methodName = method.$name;
                if (!(methodName in parentClass)) {
                    throw new Error("this.callParent() was called but there's no such method (" + methodName + ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }
            return superMethod.apply(this, args || noArgs);
        },
        callSuper: function(args) {
            var method,
                superMethod = (method = this.callSuper.caller) && ((method = method.$owner ? method : method.caller) && method.$owner.superclass[method.$name]);
            if (!superMethod) {
                method = this.callSuper.caller;
                var parentClass, methodName;
                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }
                    method = method.caller;
                }
                parentClass = method.$owner.superclass;
                methodName = method.$name;
                if (!(methodName in parentClass)) {
                    throw new Error("this.callSuper() was called but there's no such method (" + methodName + ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }
            return superMethod.apply(this, args || noArgs);
        },
        self: Base,
        constructor: function() {
            return this;
        },
        initConfig: function(instanceConfig) {
            var me = this,
                cfg = me.self.getConfigurator();
            me.initConfig = Ext.emptyFn;
            me.initialConfig = instanceConfig || {};
            cfg.configure(me, instanceConfig);
            return me;
        },
        beforeInitConfig: Ext.emptyFn,
        getConfig: getConfig,
        setConfig: function(name, value, options) {
            var me = this,
                config;
            if (name) {
                if (typeof name === 'string') {
                    config = {};
                    config[name] = value;
                } else {
                    config = name;
                }
                me.self.getConfigurator().reconfigure(me, config, options);
            }
            return me;
        },
        getCurrentConfig: function() {
            var cfg = this.self.getConfigurator();
            return cfg.getCurrentConfig(this);
        },
        hasConfig: function(name) {
            return name in this.defaultConfig;
        },
        getInitialConfig: function(name) {
            var config = this.config;
            if (!name) {
                return config;
            }
            return config[name];
        },
        $links: null,
        link: function(name, value) {
            var me = this,
                links = me.$links || (me.$links = {});
            links[name] = true;
            me[name] = value;
            return value;
        },
        unlink: function(names) {
            var me = this,
                i, ln, link, value;
            if (!Ext.isArray(names)) {
                Ext.raise('Invalid argument - expected array of strings');
            }
            for (i = 0 , ln = names.length; i < ln; i++) {
                link = names[i];
                value = me[link];
                if (value) {
                    if (value.isInstance && !value.destroyed) {
                        value.destroy();
                    } else if (value.parentNode && 'nodeType' in value) {
                        value.parentNode.removeChild(value);
                    }
                }
                me[link] = null;
            }
            return me;
        },
        $reap: function() {
            var me = this,
                protectedProps = me.$noClearOnDestroy,
                prop, value, type;
            for (prop in me) {
                if ((!protectedProps || !protectedProps[prop]) && me.hasOwnProperty(prop)) {
                    value = me[prop];
                    type = typeof value;
                    if (type === 'object' || (type === 'function' && !value.$noClearOnDestroy)) {
                        me[prop] = null;
                    }
                }
            }
            if (me.clearPrototypeOnDestroy && !me.$vetoClearingPrototypeOnDestroy && Object.setPrototypeOf) {
                Object.setPrototypeOf(me, null);
            }
        },
        destroy: function() {
            var me = this,
                links = me.$links,
                clearPropertiesOnDestroy = me.clearPropertiesOnDestroy;
            if (links) {
                me.$links = null;
                me.unlink(Ext.Object.getKeys(links));
            }
            me.destroy = Ext.emptyFn;
            me.isDestroyed = me.destroyed = true;
            if (clearPropertiesOnDestroy === true) {
                me.$reap();
            } else if (clearPropertiesOnDestroy) {
                if (clearPropertiesOnDestroy !== 'async') {
                    Ext.raise('Invalid value for clearPropertiesOnDestroy');
                }
                Reaper.add(me);
            }
        }
    });
    BasePrototype.callOverridden = BasePrototype.callParent;
    Ext.privacyViolation = function(cls, existing, member, isStatic) {
        var name = member.$name,
            conflictCls = existing.$owner && existing.$owner.$className,
            s = isStatic ? 'static ' : '',
            msg = member.$privacy ? 'Private ' + s + member.$privacy + ' method "' + name + '"' : 'Public ' + s + 'method "' + name + '"';
        if (cls.$className) {
            msg = cls.$className + ': ' + msg;
        }
        if (!existing.$privacy) {
            msg += conflictCls ? ' hides public method inherited from ' + conflictCls : ' hides inherited public method.';
        } else {
            msg += conflictCls ? ' conflicts with private ' + existing.$privacy + ' method declared by ' + conflictCls : ' conflicts with inherited private ' + existing.$privacy + ' method.';
        }
        var compat = Ext.getCompatVersion();
        var ver = Ext.getVersion();
        if (ver && compat && compat.lt(ver)) {
            Ext.log.error(msg);
        } else {
            Ext.raise(msg);
        }
    };
    return Base;
}(Ext.Function.flexSetter));

(function(Cache, prototype) {
    (Ext.util || (Ext.util = {})).Cache = Cache = function(config) {
        var me = this,
            head;
        if (config) {
            Ext.apply(me, config);
        }
        me.head = head = {
            id: (me.seed = 0),
            key: null,
            value: null
        };
        me.map = {};
        head.next = head.prev = head;
    };
    Cache.prototype = prototype = {
        maxSize: 100,
        count: 0,
        clear: function() {
            var me = this,
                head = me.head,
                entry = head.next;
            head.next = head.prev = head;
            if (!me.evict.$nullFn) {
                for (; entry !== head; entry = entry.next) {
                    me.evict(entry.key, entry.value);
                }
            }
            me.count = 0;
        },
        each: function(fn, scope) {
            scope = scope || this;
            for (var head = this.head,
                ent = head.next; ent !== head; ent = ent.next) {
                if (fn.call(scope, ent.key, ent.value)) {
                    break;
                }
            }
        },
        get: function(key) {
            var me = this,
                head = me.head,
                map = me.map,
                entry = map[key];
            if (entry) {
                if (entry.prev !== head) {
                    me.unlinkEntry(entry);
                    me.linkEntry(entry);
                }
            } else {
                map[key] = entry = {
                    id: ++me.seed,
                    key: key,
                    value: me.miss.apply(me, arguments)
                };
                me.linkEntry(entry);
                ++me.count;
                while (me.count > me.maxSize) {
                    me.unlinkEntry(head.prev, true);
                    --me.count;
                }
            }
            return entry.value;
        },
        evict: Ext.emptyFn,
        linkEntry: function(entry) {
            var head = this.head,
                first = head.next;
            entry.next = first;
            entry.prev = head;
            head.next = entry;
            first.prev = entry;
        },
        unlinkEntry: function(entry, evicted) {
            var next = entry.next,
                prev = entry.prev;
            prev.next = next;
            next.prev = prev;
            if (evicted) {
                this.evict(entry.key, entry.value);
            }
        }
    };
    prototype.destroy = prototype.clear;
}());

(function() {
    var ExtClass,
        Base = Ext.Base,
        baseStaticMembers = Base.$staticMembers,
        ruleKeySortFn = function(a, b) {
            return (a.length - b.length) || ((a < b) ? -1 : ((a > b) ? 1 : 0));
        };
    function makeCtor(className) {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        if (className) {
            constructor.name = className;
        }
        return constructor;
    }
    Ext.Class = ExtClass = function(Class, data, onCreated) {
        if (typeof Class != 'function') {
            onCreated = data;
            data = Class;
            Class = null;
        }
        if (!data) {
            data = {};
        }
        Class = ExtClass.create(Class, data);
        ExtClass.process(Class, data, onCreated);
        return Class;
    };
    Ext.apply(ExtClass, {
        makeCtor: makeCtor,
        onBeforeCreated: function(Class, data, hooks) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '>> Ext.Class#onBeforeCreated', arguments);
            Class.addMembers(data);
            hooks.onCreated.call(Class, Class);
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '<< Ext.Class#onBeforeCreated', arguments);
        },
        create: function(Class, data) {
            var i = baseStaticMembers.length,
                name;
            if (!Class) {
                Class = makeCtor(data.$className);
            }
            while (i--) {
                name = baseStaticMembers[i];
                Class[name] = Base[name];
            }
            return Class;
        },
        process: function(Class, data, onCreated) {
            var preprocessorStack = data.preprocessors || ExtClass.defaultPreprocessors,
                registeredPreprocessors = this.preprocessors,
                hooks = {
                    onBeforeCreated: this.onBeforeCreated
                },
                preprocessors = [],
                preprocessor, preprocessorsProperties, i, ln, j, subLn, preprocessorProperty;
            delete data.preprocessors;
            Class._classHooks = hooks;
            for (i = 0 , ln = preprocessorStack.length; i < ln; i++) {
                preprocessor = preprocessorStack[i];
                if (typeof preprocessor == 'string') {
                    preprocessor = registeredPreprocessors[preprocessor];
                    preprocessorsProperties = preprocessor.properties;
                    if (preprocessorsProperties === true) {
                        preprocessors.push(preprocessor.fn);
                    } else if (preprocessorsProperties) {
                        for (j = 0 , subLn = preprocessorsProperties.length; j < subLn; j++) {
                            preprocessorProperty = preprocessorsProperties[j];
                            if (data.hasOwnProperty(preprocessorProperty)) {
                                preprocessors.push(preprocessor.fn);
                                break;
                            }
                        }
                    }
                } else {
                    preprocessors.push(preprocessor);
                }
            }
            hooks.onCreated = onCreated ? onCreated : Ext.emptyFn;
            hooks.preprocessors = preprocessors;
            this.doProcess(Class, data, hooks);
        },
        doProcess: function(Class, data, hooks) {
            var me = this,
                preprocessors = hooks.preprocessors,
                preprocessor = preprocessors.shift(),
                doProcess = me.doProcess;
            for (; preprocessor; preprocessor = preprocessors.shift()) {
                if (preprocessor.call(me, Class, data, hooks, doProcess) === false) {
                    return;
                }
            }
            hooks.onBeforeCreated.apply(me, arguments);
        },
        preprocessors: {},
        registerPreprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }
            if (!properties) {
                properties = [
                    name
                ];
            }
            this.preprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };
            this.setDefaultPreprocessorPosition(name, position, relativeTo);
            return this;
        },
        getPreprocessor: function(name) {
            return this.preprocessors[name];
        },
        getPreprocessors: function() {
            return this.preprocessors;
        },
        defaultPreprocessors: [],
        getDefaultPreprocessors: function() {
            return this.defaultPreprocessors;
        },
        setDefaultPreprocessors: function(preprocessors) {
            this.defaultPreprocessors = Ext.Array.from(preprocessors);
            return this;
        },
        setDefaultPreprocessorPosition: function(name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;
            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);
                    return this;
                } else if (offset === 'last') {
                    defaultPreprocessors.push(name);
                    return this;
                }
                offset = (offset === 'after') ? 1 : -1;
            }
            index = Ext.Array.indexOf(defaultPreprocessors, relativeName);
            if (index !== -1) {
                Ext.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }
            return this;
        }
    });
    ExtClass.registerPreprocessor('extend', function(Class, data, hooks) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#extendPreProcessor', arguments);
        var Base = Ext.Base,
            basePrototype = Base.prototype,
            extend = data.extend,
            Parent, parentPrototype, i;
        delete data.extend;
        if (extend && extend !== Object) {
            Parent = extend;
        } else {
            Parent = Base;
        }
        parentPrototype = Parent.prototype;
        if (!Parent.$isClass) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }
        Class.extend(Parent);
        Class.triggerExtended.apply(Class, arguments);
        if (data.onClassExtended) {
            Class.onExtended(data.onClassExtended, Class);
            delete data.onClassExtended;
        }
    }, true);
    ExtClass.registerPreprocessor('privates', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#privatePreprocessor', arguments);
        var privates = data.privates,
            statics = privates.statics,
            privacy = privates.privacy || true;
        delete data.privates;
        delete privates.statics;
        Class.addMembers(privates, false, privacy);
        if (statics) {
            Class.addMembers(statics, true, privacy);
        }
    });
    ExtClass.registerPreprocessor('statics', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#staticsPreprocessor', arguments);
        Class.addStatics(data.statics);
        delete data.statics;
    });
    ExtClass.registerPreprocessor('inheritableStatics', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#inheritableStaticsPreprocessor', arguments);
        Class.addInheritableStatics(data.inheritableStatics);
        delete data.inheritableStatics;
    });
    Ext.createRuleFn = function(code) {
        return new Function('$c', 'with($c) { try { return (' + code + '); } catch(e) { return false;}}');
    };
    Ext.expressionCache = new Ext.util.Cache({
        miss: Ext.createRuleFn
    });
    Ext.ruleKeySortFn = ruleKeySortFn;
    Ext.getPlatformConfigKeys = function(platformConfig) {
        var ret = [],
            platform, rule;
        for (platform in platformConfig) {
            rule = Ext.expressionCache.get(platform);
            if (rule(Ext.platformTags)) {
                ret.push(platform);
            }
        }
        ret.sort(ruleKeySortFn);
        return ret;
    };
    ExtClass.registerPreprocessor('platformConfig', function(Class, data, hooks) {
        Class.addPlatformConfig(data);
    });
    ExtClass.registerPreprocessor('config', function(Class, data) {
        if (data.hasOwnProperty('$configPrefixed')) {
            Class.prototype.$configPrefixed = data.$configPrefixed;
        }
        Class.addConfig(data.config);
        delete data.config;
    });
    ExtClass.registerPreprocessor('cachedConfig', function(Class, data) {
        if (data.hasOwnProperty('$configPrefixed')) {
            Class.prototype.$configPrefixed = data.$configPrefixed;
        }
        Class.addCachedConfig(data.cachedConfig);
        delete data.cachedConfig;
    });
    ExtClass.registerPreprocessor('mixins', function(Class, data, hooks) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor', arguments);
        var mixins = data.mixins,
            onCreated = hooks.onCreated;
        delete data.mixins;
        hooks.onCreated = function() {
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor#beforeCreated', arguments);
            hooks.onCreated = onCreated;
            Class.mixin(mixins);
            return hooks.onCreated.apply(this, arguments);
        };
    });
    Ext.extend = function(Class, Parent, members) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#extend-backwards-compatible', arguments);
        if (arguments.length === 2 && Ext.isObject(Parent)) {
            members = Parent;
            Parent = Class;
            Class = null;
        }
        var cls;
        if (!Parent) {
            throw new Error("[Ext.extend] Attempting to extend from a class which has not been loaded on the page.");
        }
        members.extend = Parent;
        members.preprocessors = [
            'extend',
            'statics',
            'inheritableStatics',
            'mixins',
            'platformConfig',
            'config'
        ];
        if (Class) {
            cls = new ExtClass(Class, members);
            cls.prototype.constructor = Class;
        } else {
            cls = new ExtClass(members);
        }
        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };
        return cls;
    };
}());

Ext.ClassManager = (function(Class, alias, arraySlice, arrayFrom, global) {
    var makeCtor = Ext.Class.makeCtor,
        isNonBrowser = typeof window === 'undefined',
        nameLookupStack = [],
        namespaceCache = {
            Ext: {
                name: 'Ext',
                value: Ext
            }
        },
        Manager = Ext.apply(new Ext.Inventory(), {
            classes: {},
            classState: {},
            existCache: {},
            instantiators: [],
            isCreated: function(className) {
                if (typeof className !== 'string' || className.length < 1) {
                    throw new Error("[Ext.ClassManager] Invalid classname, must be a string and must not be empty");
                }
                if (Manager.classes[className] || Manager.existCache[className]) {
                    return true;
                }
                if (!Manager.lookupName(className, false)) {
                    return false;
                }
                Manager.triggerCreated(className);
                return true;
            },
            createdListeners: [],
            nameCreatedListeners: {},
            existsListeners: [],
            nameExistsListeners: {},
            overrideMap: {},
            triggerCreated: function(className, state) {
                Manager.existCache[className] = state || 1;
                Manager.classState[className] += 40;
                Manager.notify(className, Manager.createdListeners, Manager.nameCreatedListeners);
            },
            onCreated: function(fn, scope, className) {
                Manager.addListener(fn, scope, className, Manager.createdListeners, Manager.nameCreatedListeners);
            },
            notify: function(className, listeners, nameListeners) {
                var alternateNames = Manager.getAlternatesByName(className),
                    names = [
                        className
                    ],
                    i, ln, j, subLn, listener, name;
                for (i = 0 , ln = listeners.length; i < ln; i++) {
                    listener = listeners[i];
                    listener.fn.call(listener.scope, className);
                }
                while (names) {
                    for (i = 0 , ln = names.length; i < ln; i++) {
                        name = names[i];
                        listeners = nameListeners[name];
                        if (listeners) {
                            for (j = 0 , subLn = listeners.length; j < subLn; j++) {
                                listener = listeners[j];
                                listener.fn.call(listener.scope, name);
                            }
                            delete nameListeners[name];
                        }
                    }
                    names = alternateNames;
                    alternateNames = null;
                }
            },
            addListener: function(fn, scope, className, listeners, nameListeners) {
                if (Ext.isArray(className)) {
                    fn = Ext.Function.createBarrier(className.length, fn, scope);
                    for (i = 0; i < className.length; i++) {
                        this.addListener(fn, null, className[i], listeners, nameListeners);
                    }
                    return;
                }
                var i,
                    listener = {
                        fn: fn,
                        scope: scope
                    };
                if (className) {
                    if (this.isCreated(className)) {
                        fn.call(scope, className);
                        return;
                    }
                    if (!nameListeners[className]) {
                        nameListeners[className] = [];
                    }
                    nameListeners[className].push(listener);
                } else {
                    listeners.push(listener);
                }
            },
            $namespaceCache: namespaceCache,
            addRootNamespaces: function(namespaces) {
                for (var name in namespaces) {
                    namespaceCache[name] = {
                        name: name,
                        value: namespaces[name]
                    };
                }
            },
            clearNamespaceCache: function() {
                nameLookupStack.length = 0;
                for (var name in namespaceCache) {
                    if (!namespaceCache[name].value) {
                        delete namespaceCache[name];
                    }
                }
            },
            getNamespaceEntry: function(namespace) {
                if (typeof namespace !== 'string') {
                    return namespace;
                }
                var entry = namespaceCache[namespace],
                    i;
                if (!entry) {
                    i = namespace.lastIndexOf('.');
                    if (i < 0) {
                        entry = {
                            name: namespace
                        };
                    } else {
                        entry = {
                            name: namespace.substring(i + 1),
                            parent: Manager.getNamespaceEntry(namespace.substring(0, i))
                        };
                    }
                    namespaceCache[namespace] = entry;
                }
                return entry;
            },
            lookupName: function(namespace, autoCreate) {
                var entry = Manager.getNamespaceEntry(namespace),
                    scope = Ext.global,
                    i = 0,
                    e, parent;
                for (e = entry; e; e = e.parent) {
                    nameLookupStack[i++] = e;
                }
                while (scope && i-- > 0) {
                    e = nameLookupStack[i];
                    parent = scope;
                    scope = e.value || scope[e.name];
                    if (!scope && autoCreate) {
                        parent[e.name] = scope = {};
                    }
                }
                return scope;
            },
            setNamespace: function(namespace, value) {
                var entry = Manager.getNamespaceEntry(namespace),
                    scope = Ext.global;
                if (entry.parent) {
                    scope = Manager.lookupName(entry.parent, true);
                }
                scope[entry.name] = value;
                return value;
            },
            setXType: function(cls, xtype) {
                var className = cls.$className,
                    C = className ? cls : Manager.get(className = cls),
                    proto = C.prototype,
                    xtypes = proto.xtypes,
                    xtypesChain = proto.xtypesChain,
                    xtypesMap = proto.xtypesMap;
                if (!proto.hasOwnProperty('xtypes')) {
                    proto.xtypes = xtypes = [];
                    proto.xtypesChain = xtypesChain = xtypesChain ? xtypesChain.slice(0) : [];
                    proto.xtypesMap = xtypesMap = Ext.apply({}, xtypesMap);
                }
                Manager.addAlias(className, 'widget.' + xtype, true);
                xtypes.push(xtype);
                xtypesChain.push(xtype);
                xtypesMap[xtype] = true;
            },
            set: function(name, value) {
                var targetName = Manager.getName(value);
                Manager.classes[name] = Manager.setNamespace(name, value);
                if (targetName && targetName !== name) {
                    Manager.addAlternate(targetName, name);
                }
                return Manager;
            },
            get: function(name) {
                return Manager.classes[name] || Manager.lookupName(name, false);
            },
            addNameAliasMappings: function(aliases) {
                Manager.addAlias(aliases);
            },
            addNameAlternateMappings: function(alternates) {
                Manager.addAlternate(alternates);
            },
            getByAlias: function(alias) {
                return Manager.get(Manager.getNameByAlias(alias));
            },
            getByConfig: function(config, aliasPrefix) {
                var xclass = config.xclass,
                    name;
                if (xclass) {
                    name = xclass;
                } else {
                    name = config.xtype;
                    if (name) {
                        aliasPrefix = 'widget.';
                    } else {
                        name = config.type;
                    }
                    name = Manager.getNameByAlias(aliasPrefix + name);
                }
                return Manager.get(name);
            },
            getName: function(object) {
                return object && object.$className || '';
            },
            getClass: function(object) {
                return object && object.self || null;
            },
            create: function(className, data, createdFn) {
                if (className != null && typeof className !== 'string') {
                    throw new Error("[Ext.define] Invalid class name '" + className + "' specified, must be a non-empty string");
                }
                var ctor = makeCtor(className);
                if (typeof data === 'function') {
                    data = data(ctor);
                }
                if (className) {
                    if (Manager.classes[className]) {
                        Ext.log.warn("[Ext.define] Duplicate class name '" + className + "' specified, must be a non-empty string");
                    }
                    ctor.name = className;
                }
                data.$className = className;
                return new Class(ctor, data, function() {
                    var postprocessorStack = data.postprocessors || Manager.defaultPostprocessors,
                        registeredPostprocessors = Manager.postprocessors,
                        postprocessors = [],
                        postprocessor, i, ln, j, subLn, postprocessorProperties, postprocessorProperty;
                    delete data.postprocessors;
                    for (i = 0 , ln = postprocessorStack.length; i < ln; i++) {
                        postprocessor = postprocessorStack[i];
                        if (typeof postprocessor === 'string') {
                            postprocessor = registeredPostprocessors[postprocessor];
                            postprocessorProperties = postprocessor.properties;
                            if (postprocessorProperties === true) {
                                postprocessors.push(postprocessor.fn);
                            } else if (postprocessorProperties) {
                                for (j = 0 , subLn = postprocessorProperties.length; j < subLn; j++) {
                                    postprocessorProperty = postprocessorProperties[j];
                                    if (data.hasOwnProperty(postprocessorProperty)) {
                                        postprocessors.push(postprocessor.fn);
                                        break;
                                    }
                                }
                            }
                        } else {
                            postprocessors.push(postprocessor);
                        }
                    }
                    data.postprocessors = postprocessors;
                    data.createdFn = createdFn;
                    Manager.processCreate(className, this, data);
                });
            },
            processCreate: function(className, cls, clsData) {
                var me = this,
                    postprocessor = clsData.postprocessors.shift(),
                    createdFn = clsData.createdFn;
                if (!postprocessor) {
                    Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'Ext.ClassManager#classCreated', arguments);
                    if (className) {
                        me.set(className, cls);
                    }
                    delete cls._classHooks;
                    if (createdFn) {
                        createdFn.call(cls, cls);
                    }
                    if (className) {
                        me.triggerCreated(className);
                    }
                    return;
                }
                if (postprocessor.call(me, className, cls, clsData, me.processCreate) !== false) {
                    me.processCreate(className, cls, clsData);
                }
            },
            createOverride: function(className, data, createdFn) {
                var me = this,
                    overriddenClassName = data.override,
                    requires = data.requires,
                    uses = data.uses,
                    mixins = data.mixins,
                    mixinsIsArray,
                    compat = 1,
                    dependenciesLoaded,
                    classReady = function() {
                        var cls, dependencies, i, key, temp;
                        if (!dependenciesLoaded) {
                            dependencies = requires ? requires.slice(0) : [];
                            if (mixins) {
                                if (!(mixinsIsArray = mixins instanceof Array)) {
                                    for (key in mixins) {
                                        if (Ext.isString(cls = mixins[key])) {
                                            dependencies.push(cls);
                                        }
                                    }
                                } else {
                                    for (i = 0 , temp = mixins.length; i < temp; ++i) {
                                        if (Ext.isString(cls = mixins[i])) {
                                            dependencies.push(cls);
                                        }
                                    }
                                }
                            }
                            dependenciesLoaded = true;
                            if (dependencies.length) {
                                Ext.require(dependencies, classReady);
                                return;
                            }
                        }
                        if (mixinsIsArray) {
                            for (i = 0 , temp = mixins.length; i < temp; ++i) {
                                if (Ext.isString(cls = mixins[i])) {
                                    mixins[i] = Ext.ClassManager.get(cls);
                                }
                            }
                        } else if (mixins) {
                            for (key in mixins) {
                                if (Ext.isString(cls = mixins[key])) {
                                    mixins[key] = Ext.ClassManager.get(cls);
                                }
                            }
                        }
                        cls = overriddenClassName.$isClass ? overriddenClassName : me.get(overriddenClassName);
                        delete data.override;
                        delete data.compatibility;
                        delete data.requires;
                        delete data.uses;
                        Ext.override(cls, data);
                        Ext.Loader.history.push(className);
                        if (uses) {
                            Ext['Loader'].addUsedClasses(uses);
                        }
                        if (createdFn) {
                            createdFn.call(cls, cls);
                        }
                    };
                if (className) {
                    Manager.overrideMap[className] = true;
                }
                if ('compatibility' in data) {
                    compat = data.compatibility;
                    if (!compat) {
                        compat = false;
                    } else if (typeof compat === 'number') {
                        compat = true;
                    } else if (typeof compat !== 'boolean') {
                        compat = Ext.checkVersion(compat);
                    }
                }
                if (compat) {
                    if (overriddenClassName.$isClass) {
                        classReady();
                    } else {
                        me.onCreated(classReady, me, overriddenClassName);
                    }
                }
                me.triggerCreated(className, 2);
                return me;
            },
            instantiateByAlias: function() {
                var alias = arguments[0],
                    args = arraySlice.call(arguments),
                    className = this.getNameByAlias(alias);
                if (!className) {
                    throw new Error("[Ext.createByAlias] Unrecognized alias: " + alias);
                }
                args[0] = className;
                return Ext.create.apply(Ext, args);
            },
            instantiate: function() {
                Ext.log.warn('Ext.ClassManager.instantiate() is deprecated.  Use Ext.create() instead.');
                return Ext.create.apply(Ext, arguments);
            },
            dynInstantiate: function(name, args) {
                args = arrayFrom(args, true);
                args.unshift(name);
                return Ext.create.apply(Ext, args);
            },
            getInstantiator: function(length) {
                var instantiators = this.instantiators,
                    instantiator, i, args;
                instantiator = instantiators[length];
                if (!instantiator) {
                    i = length;
                    args = [];
                    for (i = 0; i < length; i++) {
                        args.push('a[' + i + ']');
                    }
                    instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
                    instantiator.name = "Ext.create" + length;
                }
                return instantiator;
            },
            postprocessors: {},
            defaultPostprocessors: [],
            registerPostprocessor: function(name, fn, properties, position, relativeTo) {
                if (!position) {
                    position = 'last';
                }
                if (!properties) {
                    properties = [
                        name
                    ];
                }
                this.postprocessors[name] = {
                    name: name,
                    properties: properties || false,
                    fn: fn
                };
                this.setDefaultPostprocessorPosition(name, position, relativeTo);
                return this;
            },
            setDefaultPostprocessors: function(postprocessors) {
                this.defaultPostprocessors = arrayFrom(postprocessors);
                return this;
            },
            setDefaultPostprocessorPosition: function(name, offset, relativeName) {
                var defaultPostprocessors = this.defaultPostprocessors,
                    index;
                if (typeof offset === 'string') {
                    if (offset === 'first') {
                        defaultPostprocessors.unshift(name);
                        return this;
                    } else if (offset === 'last') {
                        defaultPostprocessors.push(name);
                        return this;
                    }
                    offset = (offset === 'after') ? 1 : -1;
                }
                index = Ext.Array.indexOf(defaultPostprocessors, relativeName);
                if (index !== -1) {
                    Ext.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
                }
                return this;
            }
        });
    Manager.registerPostprocessor('alias', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#aliasPostProcessor', arguments);
        var aliases = Ext.Array.from(data.alias),
            i, ln;
        for (i = 0 , ln = aliases.length; i < ln; i++) {
            alias = aliases[i];
            this.addAlias(cls, alias);
        }
    }, [
        'xtype',
        'alias'
    ]);
    Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#singletonPostProcessor', arguments);
        if (data.singleton) {
            fn.call(this, name, new cls(), data);
        } else {
            return true;
        }
        return false;
    });
    Manager.registerPostprocessor('alternateClassName', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#alternateClassNamePostprocessor', arguments);
        var alternates = data.alternateClassName,
            i, ln, alternate;
        if (!(alternates instanceof Array)) {
            alternates = [
                alternates
            ];
        }
        for (i = 0 , ln = alternates.length; i < ln; i++) {
            alternate = alternates[i];
            if (typeof alternate !== 'string') {
                throw new Error("[Ext.define] Invalid alternate of: '" + alternate + "' for class: '" + name + "'; must be a valid string");
            }
            this.set(alternate, cls);
        }
    });
    Manager.registerPostprocessor('debugHooks', function(name, Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#debugHooks', arguments);
        if (Ext.isDebugEnabled(Class.$className, data.debugHooks.$enabled)) {
            delete data.debugHooks.$enabled;
            Ext.override(Class, data.debugHooks);
        }
        var target = Class.isInstance ? Class.self : Class;
        delete target.prototype.debugHooks;
    });
    Manager.registerPostprocessor('deprecated', function(name, Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#deprecated', arguments);
        var target = Class.isInstance ? Class.self : Class;
        target.addDeprecations(data.deprecated);
        delete target.prototype.deprecated;
    });
    Ext.apply(Ext, {
        create: function() {
            var name = arguments[0],
                nameType = typeof name,
                args = arraySlice.call(arguments, 1),
                cls;
            if (nameType === 'function') {
                cls = name;
            } else {
                if (nameType !== 'string' && args.length === 0) {
                    args = [
                        name
                    ];
                    if (!(name = name.xclass)) {
                        name = args[0].xtype;
                        if (name) {
                            name = 'widget.' + name;
                        }
                    }
                }
                if (typeof name !== 'string' || name.length < 1) {
                    throw new Error("[Ext.create] Invalid class name or alias '" + name + "' specified, must be a non-empty string");
                }
                name = Manager.resolveName(name);
                cls = Manager.get(name);
            }
            if (!cls) {
                !isNonBrowser && Ext.log.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding " + "Ext.require('" + name + "') above Ext.onReady");
                Ext.syncRequire(name);
                cls = Manager.get(name);
            }
            if (!cls) {
                throw new Error("[Ext.create] Unrecognized class name / alias: " + name);
            }
            if (typeof cls !== 'function') {
                throw new Error("[Ext.create] Singleton '" + name + "' cannot be instantiated.");
            }
            return Manager.getInstantiator(args.length)(cls, args);
        },
        widget: function(name, config) {
            var xtype = name,
                alias, className, T;
            if (typeof xtype !== 'string') {
                config = name;
                xtype = config.xtype;
                className = config.xclass;
            } else {
                config = config || {};
            }
            if (config.isComponent) {
                return config;
            }
            if (!className) {
                alias = 'widget.' + xtype;
                className = Manager.getNameByAlias(alias);
            }
            if (className) {
                T = Manager.get(className);
            }
            if (!T) {
                return Ext.create(className || alias, config);
            }
            return new T(config);
        },
        createByAlias: alias(Manager, 'instantiateByAlias'),
        define: function(className, data, createdFn) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'ClassManager#define', arguments);
            if (data.override) {
                Manager.classState[className] = 20;
                return Manager.createOverride.apply(Manager, arguments);
            }
            Manager.classState[className] = 10;
            return Manager.create.apply(Manager, arguments);
        },
        undefine: function(className) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'Ext.ClassManager#undefine', arguments);
            var classes = Manager.classes;
            delete classes[className];
            delete Manager.existCache[className];
            delete Manager.classState[className];
            Manager.removeName(className);
            var entry = Manager.getNamespaceEntry(className),
                scope = entry.parent ? Manager.lookupName(entry.parent, false) : Ext.global;
            if (scope) {
                try {
                    delete scope[entry.name];
                } catch (e) {
                    scope[entry.name] = undefined;
                }
            }
        },
        getClassName: alias(Manager, 'getName'),
        getDisplayName: function(object) {
            if (object) {
                if (object.displayName) {
                    return object.displayName;
                }
                if (object.$name && object.$class) {
                    return Ext.getClassName(object.$class) + '#' + object.$name;
                }
                if (object.$className) {
                    return object.$className;
                }
            }
            return 'Anonymous';
        },
        getClass: alias(Manager, 'getClass'),
        namespace: function() {
            var root = global,
                i;
            for (i = arguments.length; i-- > 0; ) {
                root = Manager.lookupName(arguments[i], true);
            }
            return root;
        }
    });
    Ext.addRootNamespaces = Manager.addRootNamespaces;
    Ext.createWidget = Ext.widget;
    Ext.ns = Ext.namespace;
    Class.registerPreprocessor('className', function(cls, data) {
        if ('$className' in data) {
            cls.$className = data.$className;
            cls.displayName = cls.$className;
        }
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#classNamePreprocessor', arguments);
    }, true, 'first');
    Class.registerPreprocessor('alias', function(cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#aliasPreprocessor', arguments);
        var prototype = cls.prototype,
            xtypes = arrayFrom(data.xtype),
            aliases = arrayFrom(data.alias),
            widgetPrefix = 'widget.',
            widgetPrefixLength = widgetPrefix.length,
            xtypesChain = Array.prototype.slice.call(prototype.xtypesChain || []),
            xtypesMap = Ext.merge({}, prototype.xtypesMap || {}),
            i, ln, alias, xtype;
        for (i = 0 , ln = aliases.length; i < ln; i++) {
            alias = aliases[i];
            if (typeof alias !== 'string' || alias.length < 1) {
                throw new Error("[Ext.define] Invalid alias of: '" + alias + "' for class: '" + name + "'; must be a valid string");
            }
            if (alias.substring(0, widgetPrefixLength) === widgetPrefix) {
                xtype = alias.substring(widgetPrefixLength);
                Ext.Array.include(xtypes, xtype);
            }
        }
        cls.xtype = data.xtype = xtypes[0];
        data.xtypes = xtypes;
        for (i = 0 , ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];
            if (!xtypesMap[xtype]) {
                xtypesMap[xtype] = true;
                xtypesChain.push(xtype);
            }
        }
        data.xtypesChain = xtypesChain;
        data.xtypesMap = xtypesMap;
        Ext.Function.interceptAfterOnce(cls, 'onClassCreated', function() {
            var cls = this,
                prototype = cls.prototype,
                mixins = prototype.mixins,
                key, mixin;
            Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#aliasPreprocessor#afterClassCreated', arguments);
            for (key in mixins) {
                if (mixins.hasOwnProperty(key)) {
                    mixin = mixins[key];
                    xtypes = mixin.xtypes;
                    if (xtypes) {
                        for (i = 0 , ln = xtypes.length; i < ln; i++) {
                            xtype = xtypes[i];
                            if (!xtypesMap[xtype]) {
                                xtypesMap[xtype] = true;
                                xtypesChain.push(xtype);
                            }
                        }
                    }
                }
            }
        });
        for (i = 0 , ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];
            if (typeof xtype !== 'string' || xtype.length < 1) {
                throw new Error("[Ext.define] Invalid xtype of: '" + xtype + "' for class: '" + name + "'; must be a valid non-empty string");
            }
            Ext.Array.include(aliases, widgetPrefix + xtype);
        }
        data.alias = aliases;
    }, [
        'xtype',
        'alias'
    ]);
    if (Ext.manifest) {
        var manifest = Ext.manifest,
            classes = manifest.classes,
            paths = manifest.paths,
            aliases = {},
            alternates = {},
            className, obj, name, path, baseUrl;
        if (paths) {
            if (manifest.bootRelative) {
                baseUrl = Ext.Boot.baseUrl;
                for (path in paths) {
                    if (paths.hasOwnProperty(path)) {
                        paths[path] = baseUrl + paths[path];
                    }
                }
            }
            Manager.setPath(paths);
        }
        if (classes) {
            for (className in classes) {
                alternates[className] = [];
                aliases[className] = [];
                obj = classes[className];
                if (obj.alias) {
                    aliases[className] = obj.alias;
                }
                if (obj.alternates) {
                    alternates[className] = obj.alternates;
                }
            }
        }
        Manager.addAlias(aliases);
        Manager.addAlternate(alternates);
    }
    return Manager;
}(Ext.Class, Ext.Function.alias, Array.prototype.slice, Ext.Array.from, Ext.global));

Ext.env.Ready = {
    blocks: (location.search || '').indexOf('ext-pauseReadyFire') > 0 ? 1 : 0,
    bound: 0,
    delay: 1,
    events: [],
    firing: false,
    generation: 0,
    listeners: [],
    nextId: 0,
    sortGeneration: 0,
    state: 0,
    timer: null,
    bind: function() {
        var me = Ext.env.Ready,
            doc = document;
        if (!me.bound) {
            if (doc.readyState === 'complete') {
                me.onReadyEvent({
                    type: doc.readyState || 'body'
                });
            } else {
                me.bound = 1;
                if (Ext.browser.is.PhoneGap && !Ext.os.is.Desktop) {
                    me.bound = 2;
                    doc.addEventListener('deviceready', me.onReadyEvent, false);
                }
                doc.addEventListener('DOMContentLoaded', me.onReadyEvent, false);
                window.addEventListener('load', me.onReadyEvent, false);
            }
        }
    },
    block: function() {
        ++this.blocks;
        Ext.isReady = false;
    },
    fireReady: function() {
        var me = Ext.env.Ready;
        if (!me.state) {
            Ext._readyTime = Ext.ticks();
            Ext.isDomReady = true;
            me.state = 1;
            Ext.feature.detect(true);
            if (!me.delay) {
                me.handleReady();
            } else if (navigator.standalone) {
                me.timer = Ext.defer(function() {
                    me.timer = null;
                    me.handleReadySoon();
                }, 1);
            } else {
                me.handleReadySoon();
            }
        }
    },
    handleReady: function() {
        var me = this;
        if (me.state === 1) {
            me.state = 2;
            Ext._beforeReadyTime = Ext.ticks();
            me.invokeAll();
            Ext._afterReadyTime = Ext.ticks();
        }
    },
    handleReadySoon: function(delay) {
        var me = this;
        if (!me.timer) {
            me.timer = Ext.defer(function() {
                me.timer = null;
                me.handleReady();
            }, delay || me.delay);
        }
    },
    invoke: function(listener) {
        var delay = listener.delay;
        if (delay) {
            Ext.defer(listener.fn, delay, listener.scope);
        } else {
            if (Ext.elevateFunction) {
                Ext.elevateFunction(listener.fn, listener.scope);
            } else {
                listener.fn.call(listener.scope);
            }
        }
    },
    invokeAll: function() {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doInvokeAll, this);
        } else {
            this.doInvokeAll();
        }
    },
    doInvokeAll: function() {
        var me = this,
            listeners = me.listeners,
            listener;
        if (!me.blocks) {
            Ext.isReady = true;
        }
        me.firing = true;
        while (listeners.length) {
            if (me.sortGeneration !== me.generation) {
                me.sortGeneration = me.generation;
                listeners.sort(me.sortFn);
            }
            listener = listeners.pop();
            if (me.blocks && !listener.dom) {
                listeners.push(listener);
                break;
            }
            me.invoke(listener);
        }
        me.firing = false;
    },
    makeListener: function(fn, scope, options) {
        var ret = {
                fn: fn,
                id: ++this.nextId,
                scope: scope,
                dom: false,
                priority: 0
            };
        if (options) {
            Ext.apply(ret, options);
        }
        ret.phase = ret.dom ? 0 : 1;
        return ret;
    },
    on: function(fn, scope, options) {
        var me = Ext.env.Ready,
            listener = me.makeListener(fn, scope, options);
        if (me.state === 2 && !me.firing && (listener.dom || !me.blocks)) {
            me.invoke(listener);
        } else {
            me.listeners.push(listener);
            ++me.generation;
            if (!me.bound) {
                me.bind();
            }
        }
    },
    onReadyEvent: function(ev) {
        var me = Ext.env.Ready;
        if (Ext.elevateFunction) {
            Ext.elevateFunction(me.doReadyEvent, me, arguments);
        } else {
            me.doReadyEvent(ev);
        }
    },
    doReadyEvent: function(ev) {
        var me = this;
        if (ev && ev.type) {
            me.events.push(ev);
        }
        if (me.bound > 0) {
            me.unbind();
            me.bound = -1;
        }
        if (!me.state) {
            me.fireReady();
        }
    },
    sortFn: function(a, b) {
        return -((a.phase - b.phase) || (b.priority - a.priority) || (a.id - b.id));
    },
    unblock: function() {
        var me = this;
        if (me.blocks) {
            if (!--me.blocks) {
                if (me.state === 2 && !me.firing) {
                    me.invokeAll();
                }
            }
        }
    },
    unbind: function() {
        var me = this,
            doc = document;
        if (me.bound > 1) {
            doc.removeEventListener('deviceready', me.onReadyEvent, false);
        }
        doc.removeEventListener('DOMContentLoaded', me.onReadyEvent, false);
        window.removeEventListener('load', me.onReadyEvent, false);
    }
};
(function() {
    var Ready = Ext.env.Ready;
    if (Ext.isIE9m) {
        Ext.apply(Ready, {
            scrollTimer: null,
            readyStatesRe: /complete/i,
            pollScroll: function() {
                var scrollable = true;
                try {
                    document.documentElement.doScroll('left');
                } catch (e) {
                    scrollable = false;
                }
                if (scrollable && document.body) {
                    Ready.onReadyEvent({
                        type: 'doScroll'
                    });
                } else {
                    Ready.scrollTimer = Ext.defer(Ready.pollScroll, 20);
                }
                return scrollable;
            },
            bind: function() {
                if (Ready.bound) {
                    return;
                }
                var doc = document,
                    topContext;
                try {
                    topContext = window.frameElement === undefined;
                } catch (e) {}
                if (!topContext || !doc.documentElement.doScroll) {
                    Ready.pollScroll = Ext.emptyFn;
                }
                else if (Ready.pollScroll()) {
                    return;
                }
                if (doc.readyState === 'complete') {
                    Ready.onReadyEvent({
                        type: 'already ' + (doc.readyState || 'body')
                    });
                } else {
                    doc.attachEvent('onreadystatechange', Ready.onReadyStateChange);
                    window.attachEvent('onload', Ready.onReadyEvent);
                    Ready.bound = 1;
                }
            },
            unbind: function() {
                document.detachEvent('onreadystatechange', Ready.onReadyStateChange);
                window.detachEvent('onload', Ready.onReadyEvent);
                if (Ext.isNumber(Ready.scrollTimer)) {
                    clearTimeout(Ready.scrollTimer);
                    Ready.scrollTimer = null;
                }
            },
            onReadyStateChange: function() {
                var state = document.readyState;
                if (Ready.readyStatesRe.test(state)) {
                    Ready.onReadyEvent({
                        type: state
                    });
                }
            }
        });
    }
    Ext.onDocumentReady = function(fn, scope, options) {
        var opt = {
                dom: true
            };
        if (options) {
            Ext.apply(opt, options);
        }
        Ready.on(fn, scope, opt);
    };
    Ext.onReady = function(fn, scope, options) {
        Ready.on(fn, scope, options);
    };
    Ext.onInternalReady = function(fn, scope, options) {
        Ready.on(fn, scope, Ext.apply({
            priority: 1000
        }, options));
    };
    Ready.bind();
}());

Ext.Loader = (new function() {
    var Loader = this,
        Manager = Ext.ClassManager,
        Boot = Ext.Boot,
        Class = Ext.Class,
        Ready = Ext.env.Ready,
        alias = Ext.Function.alias,
        dependencyProperties = [
            'extend',
            'mixins',
            'requires'
        ],
        isInHistory = {},
        history = [],
        readyListeners = [],
        usedClasses = [],
        _requiresMap = {},
        _config = {
            enabled: true,
            scriptChainDelay: false,
            disableCaching: true,
            disableCachingParam: '_dc',
            paths: Manager.paths,
            preserveScripts: true,
            scriptCharset: undefined
        },
        delegatedConfigs = {
            disableCaching: true,
            disableCachingParam: true,
            preserveScripts: true,
            scriptChainDelay: 'loadDelay'
        };
    Ext.apply(Loader, {
        isInHistory: isInHistory,
        isLoading: false,
        history: history,
        config: _config,
        readyListeners: readyListeners,
        optionalRequires: usedClasses,
        requiresMap: _requiresMap,
        hasFileLoadError: false,
        scriptsLoading: 0,
        classesLoading: {},
        missingCount: 0,
        missingQueue: {},
        syncModeEnabled: false,
        init: function() {
            var scripts = document.getElementsByTagName('script'),
                src = scripts[scripts.length - 1].src,
                path = src.substring(0, src.lastIndexOf('/') + 1),
                meta = Ext._classPathMetadata,
                microloader = Ext.Microloader,
                manifest = Ext.manifest,
                loadOrder, classes, className, idx, baseUrl, loadlen, l, loadItem;
            if (src.indexOf("packages/core/src/") !== -1) {
                path = path + "../../";
            } else if (src.indexOf("/core/src/class/") !== -1) {
                path = path + "../../../";
            }
            if (!Manager.getPath("Ext")) {
                Manager.setPath('Ext', path + 'src');
            }
            if (meta) {
                Ext._classPathMetadata = null;
                Loader.addClassPathMappings(meta);
            }
            if (manifest) {
                loadOrder = manifest.loadOrder;
                baseUrl = Ext.Boot.baseUrl;
                if (loadOrder && manifest.bootRelative) {
                    for (loadlen = loadOrder.length , l = 0; l < loadlen; l++) {
                        loadItem = loadOrder[l];
                        loadItem.path = baseUrl + loadItem.path;
                        loadItem.canonicalPath = true;
                    }
                }
            }
            if (microloader) {
                Ready.block();
                microloader.onMicroloaderReady(function() {
                    Ready.unblock();
                });
            }
        },
        setConfig: Ext.Function.flexSetter(function(name, value) {
            if (name === 'paths') {
                Loader.setPath(value);
            } else {
                _config[name] = value;
                var delegated = delegatedConfigs[name];
                if (delegated) {
                    Boot.setConfig((delegated === true) ? name : delegated, value);
                }
            }
            return Loader;
        }),
        getConfig: function(name) {
            return name ? _config[name] : _config;
        },
        setPath: function() {
            Manager.setPath.apply(Manager, arguments);
            return Loader;
        },
        addClassPathMappings: function(paths) {
            Manager.setPath(paths);
            return Loader;
        },
        addBaseUrlClassPathMappings: function(pathConfig) {
            for (var name in pathConfig) {
                pathConfig[name] = Boot.baseUrl + pathConfig[name];
            }
            Ext.Loader.addClassPathMappings(pathConfig);
        },
        getPath: function(className) {
            return Manager.getPath(className);
        },
        require: function(expressions, fn, scope, excludes) {
            if (excludes) {
                return Loader.exclude(excludes).require(expressions, fn, scope);
            }
            var classNames = Manager.getNamesByExpression(expressions);
            return Loader.load(classNames, fn, scope);
        },
        syncRequire: function() {
            var wasEnabled = Loader.syncModeEnabled;
            Loader.syncModeEnabled = true;
            var ret = Loader.require.apply(Loader, arguments);
            Loader.syncModeEnabled = wasEnabled;
            return ret;
        },
        exclude: function(excludes) {
            var selector = Manager.select({
                    require: function(classNames, fn, scope) {
                        return Loader.load(classNames, fn, scope);
                    },
                    syncRequire: function(classNames, fn, scope) {
                        var wasEnabled = Loader.syncModeEnabled;
                        Loader.syncModeEnabled = true;
                        var ret = Loader.load(classNames, fn, scope);
                        Loader.syncModeEnabled = wasEnabled;
                        return ret;
                    }
                });
            selector.exclude(excludes);
            return selector;
        },
        load: function(classNames, callback, scope) {
            if (callback) {
                if (callback.length) {
                    callback = Loader.makeLoadCallback(classNames, callback);
                }
                callback = callback.bind(scope || Ext.global);
            }
            var state = Manager.classState,
                missingClassNames = [],
                urls = [],
                urlByClass = {},
                numClasses = classNames.length,
                url, className, i, numMissing;
            for (i = 0; i < numClasses; ++i) {
                className = Manager.resolveName(classNames[i]);
                if (!Manager.isCreated(className)) {
                    missingClassNames.push(className);
                    if (!state[className]) {
                        urlByClass[className] = Loader.getPath(className);
                        urls.push(urlByClass[className]);
                    }
                }
            }
            numMissing = missingClassNames.length;
            if (numMissing) {
                Loader.missingCount += numMissing;
                Manager.onCreated(function() {
                    if (callback) {
                        Ext.callback(callback, scope, arguments);
                    }
                    Loader.checkReady();
                }, Loader, missingClassNames);
                if (!_config.enabled) {
                    Ext.raise("Ext.Loader is not enabled, so dependencies cannot be resolved dynamically. " + "Missing required class" + ((missingClassNames.length > 1) ? "es" : "") + ": " + missingClassNames.join(', '));
                }
                if (urls.length) {
                    Loader.loadScripts({
                        url: urls,
                        _classNames: missingClassNames,
                        _urlByClass: urlByClass
                    });
                } else {
                    Loader.checkReady();
                }
            } else {
                if (callback) {
                    callback.call(scope);
                }
                Loader.checkReady();
            }
            if (Loader.syncModeEnabled) {
                if (numClasses === 1) {
                    return Manager.get(classNames[0]);
                }
            }
            return Loader;
        },
        makeLoadCallback: function(classNames, callback) {
            return function() {
                var classes = [],
                    i = classNames.length;
                while (i-- > 0) {
                    classes[i] = Manager.get(classNames[i]);
                }
                return callback.apply(this, classes);
            };
        },
        onLoadFailure: function() {
            var options = this,
                onError = options.onError;
            Loader.hasFileLoadError = true;
            --Loader.scriptsLoading;
            if (onError) {
                onError.call(options.userScope, options);
            } else {
                Ext.log.error("[Ext.Loader] Some requested files failed to load.");
            }
            Loader.checkReady();
        },
        onLoadSuccess: function() {
            var options = this,
                onLoad = options.onLoad,
                classNames = options._classNames,
                urlByClass = options._urlByClass,
                state = Manager.classState,
                missingQueue = Loader.missingQueue,
                className, i, len;
            --Loader.scriptsLoading;
            if (onLoad) {
                onLoad.call(options.userScope, options);
            }
            for (i = 0 , len = classNames.length; i < len; i++) {
                className = classNames[i];
                if (!state[className]) {
                    missingQueue[className] = urlByClass[className];
                }
            }
            Loader.checkReady();
        },
        reportMissingClasses: function() {
            if (!Loader.syncModeEnabled && !Loader.scriptsLoading && Loader.isLoading && !Loader.hasFileLoadError) {
                var missingQueue = Loader.missingQueue,
                    missingClasses = [],
                    missingPaths = [];
                for (var missingClassName in missingQueue) {
                    missingClasses.push(missingClassName);
                    missingPaths.push(missingQueue[missingClassName]);
                }
                if (missingClasses.length) {
                    throw new Error("The following classes are not declared even if their files have been " + "loaded: '" + missingClasses.join("', '") + "'. Please check the source code of their " + "corresponding files for possible typos: '" + missingPaths.join("', '"));
                }
            }
        },
        onReady: function(fn, scope, withDomReady, options) {
            if (withDomReady) {
                Ready.on(fn, scope, options);
            } else {
                var listener = Ready.makeListener(fn, scope, options);
                if (Loader.isLoading) {
                    readyListeners.push(listener);
                } else {
                    Ready.invoke(listener);
                }
            }
        },
        addUsedClasses: function(classes) {
            var cls, i, ln;
            if (classes) {
                classes = (typeof classes === 'string') ? [
                    classes
                ] : classes;
                for (i = 0 , ln = classes.length; i < ln; i++) {
                    cls = classes[i];
                    if (typeof cls === 'string' && !Ext.Array.contains(usedClasses, cls)) {
                        usedClasses.push(cls);
                    }
                }
            }
            return Loader;
        },
        triggerReady: function() {
            var listener,
                refClasses = usedClasses;
            if (Loader.isLoading && refClasses.length) {
                usedClasses = [];
                Loader.require(refClasses);
            } else {
                Loader.isLoading = false;
                readyListeners.sort(Ready.sortFn);
                while (readyListeners.length && !Loader.isLoading) {
                    listener = readyListeners.pop();
                    Ready.invoke(listener);
                }
                Ready.unblock();
            }
        },
        historyPush: function(className) {
            if (className && !isInHistory[className] && !Manager.overrideMap[className]) {
                isInHistory[className] = true;
                history.push(className);
            }
            return Loader;
        },
        loadScripts: function(params) {
            var manifest = Ext.manifest,
                loadOrder = manifest && manifest.loadOrder,
                loadOrderMap = manifest && manifest.loadOrderMap,
                options;
            ++Loader.scriptsLoading;
            if (loadOrder && !loadOrderMap) {
                manifest.loadOrderMap = loadOrderMap = Boot.createLoadOrderMap(loadOrder);
            }
            Loader.checkReady();
            options = Ext.apply({
                loadOrder: loadOrder,
                loadOrderMap: loadOrderMap,
                charset: _config.scriptCharset,
                success: Loader.onLoadSuccess,
                failure: Loader.onLoadFailure,
                sync: Loader.syncModeEnabled,
                _classNames: []
            }, params);
            options.userScope = options.scope;
            options.scope = options;
            Boot.load(options);
        },
        loadScriptsSync: function(urls) {
            var syncwas = Loader.syncModeEnabled;
            Loader.syncModeEnabled = true;
            Loader.loadScripts({
                url: urls
            });
            Loader.syncModeEnabled = syncwas;
        },
        loadScriptsSyncBasePrefix: function(urls) {
            var syncwas = Loader.syncModeEnabled;
            Loader.syncModeEnabled = true;
            Loader.loadScripts({
                url: urls,
                prependBaseUrl: true
            });
            Loader.syncModeEnabled = syncwas;
        },
        loadScript: function(options) {
            var isString = typeof options === 'string',
                isArray = options instanceof Array,
                isObject = !isArray && !isString,
                url = isObject ? options.url : options,
                onError = isObject && options.onError,
                onLoad = isObject && options.onLoad,
                scope = isObject && options.scope,
                request = {
                    url: url,
                    scope: scope,
                    onLoad: onLoad,
                    onError: onError,
                    _classNames: []
                };
            Loader.loadScripts(request);
        },
        checkMissingQueue: function() {
            var missingQueue = Loader.missingQueue,
                newQueue = {},
                name,
                missing = 0;
            for (name in missingQueue) {
                if (!(Manager.classState[name] || Manager.isCreated(name))) {
                    newQueue[name] = missingQueue[name];
                    missing++;
                }
            }
            Loader.missingCount = missing;
            Loader.missingQueue = newQueue;
        },
        checkReady: function() {
            var wasLoading = Loader.isLoading,
                isLoading;
            Loader.checkMissingQueue();
            isLoading = Loader.missingCount + Loader.scriptsLoading;
            if (isLoading && !wasLoading) {
                Ready.block();
                Loader.isLoading = !!isLoading;
            } else if (!isLoading && wasLoading) {
                Loader.triggerReady();
            }
            if (!Loader.scriptsLoading && Loader.missingCount) {
                Ext.defer(function() {
                    if (!Loader.scriptsLoading && Loader.missingCount) {
                        Ext.log.error('[Loader] The following classes failed to load:');
                        for (var name in Loader.missingQueue) {
                            Ext.log.error('[Loader] ' + name + ' from ' + Loader.missingQueue[name]);
                        }
                    }
                }, 1000);
            }
        }
    });
    Ext.require = alias(Loader, 'require');
    Ext.syncRequire = alias(Loader, 'syncRequire');
    Ext.exclude = alias(Loader, 'exclude');
    Class.registerPreprocessor('loader', function(cls, data, hooks, continueFn) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.Loader#loaderPreprocessor', arguments);
        var me = this,
            dependencies = [],
            dependency,
            className = Manager.getName(cls),
            i, j, ln, subLn, value, propertyName, propertyValue, requiredMap;
        for (i = 0 , ln = dependencyProperties.length; i < ln; i++) {
            propertyName = dependencyProperties[i];
            if (data.hasOwnProperty(propertyName)) {
                propertyValue = data[propertyName];
                if (typeof propertyValue === 'string') {
                    dependencies.push(propertyValue);
                } else if (propertyValue instanceof Array) {
                    for (j = 0 , subLn = propertyValue.length; j < subLn; j++) {
                        value = propertyValue[j];
                        if (typeof value === 'string') {
                            dependencies.push(value);
                        }
                    }
                } else if (typeof propertyValue !== 'function') {
                    for (j in propertyValue) {
                        if (propertyValue.hasOwnProperty(j)) {
                            value = propertyValue[j];
                            if (typeof value === 'string') {
                                dependencies.push(value);
                            }
                        }
                    }
                }
            }
        }
        if (dependencies.length === 0) {
            return;
        }
        if (className) {
            _requiresMap[className] = dependencies;
        }
        var manifestClasses = Ext.manifest && Ext.manifest.classes,
            deadlockPath = [],
            detectDeadlock;
        if (className && (!manifestClasses || !manifestClasses[className])) {
            requiredMap = Loader.requiredByMap || (Loader.requiredByMap = {});
            for (i = 0 , ln = dependencies.length; i < ln; i++) {
                dependency = dependencies[i];
                (requiredMap[dependency] || (requiredMap[dependency] = [])).push(className);
            }
            detectDeadlock = function(cls) {
                deadlockPath.push(cls);
                var requires = _requiresMap[cls],
                    dep, i, ln;
                if (requires) {
                    if (Ext.Array.contains(requires, className)) {
                        Ext.Error.raise("Circular requirement detected! '" + className + "' and '" + deadlockPath[1] + "' mutually require each other. Path: " + deadlockPath.join(' -> ') + " -> " + deadlockPath[0]);
                    }
                    for (i = 0 , ln = requires.length; i < ln; i++) {
                        dep = requires[i];
                        if (!isInHistory[dep]) {
                            detectDeadlock(requires[i]);
                        }
                    }
                }
            };
            detectDeadlock(className);
        }
        (className ? Loader.exclude(className) : Loader).require(dependencies, function() {
            for (i = 0 , ln = dependencyProperties.length; i < ln; i++) {
                propertyName = dependencyProperties[i];
                if (data.hasOwnProperty(propertyName)) {
                    propertyValue = data[propertyName];
                    if (typeof propertyValue === 'string') {
                        data[propertyName] = Manager.get(propertyValue);
                    } else if (propertyValue instanceof Array) {
                        for (j = 0 , subLn = propertyValue.length; j < subLn; j++) {
                            value = propertyValue[j];
                            if (typeof value === 'string') {
                                data[propertyName][j] = Manager.get(value);
                            }
                        }
                    } else if (typeof propertyValue !== 'function') {
                        for (var k in propertyValue) {
                            if (propertyValue.hasOwnProperty(k)) {
                                value = propertyValue[k];
                                if (typeof value === 'string') {
                                    data[propertyName][k] = Manager.get(value);
                                }
                            }
                        }
                    }
                }
            }
            continueFn.call(me, cls, data, hooks);
        });
        return false;
    }, true, 'after', 'className');
    Manager.registerPostprocessor('uses', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.Loader#usesPostprocessor', arguments);
        var uses = data.uses,
            classNames;
        if (uses) {
            classNames = Manager.getNamesByExpression(data.uses);
            Loader.addUsedClasses(classNames);
        }
    });
    Manager.onCreated(Loader.historyPush);
    Loader.init();
}());
Ext._endTime = Ext.ticks();
if (Ext._beforereadyhandler) {
    Ext._beforereadyhandler();
}

Ext.define('Ext.Mixin', function(Mixin) {
    return {
        statics: {
            addHook: function(hookFn, targetClass, methodName, mixinClassPrototype) {
                var isFunc = Ext.isFunction(hookFn),
                    hook = function() {
                        var a = arguments,
                            fn = isFunc ? hookFn : mixinClassPrototype[hookFn],
                            result = this.callParent(a);
                        fn.apply(this, a);
                        return result;
                    },
                    existingFn = targetClass.hasOwnProperty(methodName) && targetClass[methodName];
                if (isFunc) {
                    hookFn.$previous = Ext.emptyFn;
                }
                hook.$name = methodName;
                hook.$owner = targetClass.self;
                if (existingFn) {
                    hook.$previous = existingFn.$previous;
                    existingFn.$previous = hook;
                } else {
                    targetClass[methodName] = hook;
                }
            }
        },
        onClassExtended: function(cls, data) {
            var mixinConfig = data.mixinConfig,
                hooks = data.xhooks,
                superclass = cls.superclass,
                onClassMixedIn = data.onClassMixedIn,
                parentMixinConfig, befores, afters, extended;
            if (hooks) {
                delete data.xhooks;
                (mixinConfig || (data.mixinConfig = mixinConfig = {})).on = hooks;
            }
            if (mixinConfig) {
                parentMixinConfig = superclass.mixinConfig;
                if (parentMixinConfig) {
                    data.mixinConfig = mixinConfig = Ext.merge({}, parentMixinConfig, mixinConfig);
                }
                data.mixinId = mixinConfig.id;
                if (mixinConfig.beforeHooks) {
                    Ext.raise('Use of "beforeHooks" is deprecated - use "before" instead');
                }
                if (mixinConfig.hooks) {
                    Ext.raise('Use of "hooks" is deprecated - use "after" instead');
                }
                if (mixinConfig.afterHooks) {
                    Ext.raise('Use of "afterHooks" is deprecated - use "after" instead');
                }
                befores = mixinConfig.before;
                afters = mixinConfig.after;
                hooks = mixinConfig.on;
                extended = mixinConfig.extended;
            }
            if (befores || afters || hooks || extended) {
                data.onClassMixedIn = function(targetClass) {
                    var mixin = this.prototype,
                        targetProto = targetClass.prototype,
                        key;
                    if (befores) {
                        Ext.Object.each(befores, function(key, value) {
                            targetClass.addMember(key, function() {
                                if (mixin[value].apply(this, arguments) !== false) {
                                    return this.callParent(arguments);
                                }
                            });
                        });
                    }
                    if (afters) {
                        Ext.Object.each(afters, function(key, value) {
                            targetClass.addMember(key, function() {
                                var ret = this.callParent(arguments);
                                mixin[value].apply(this, arguments);
                                return ret;
                            });
                        });
                    }
                    if (hooks) {
                        for (key in hooks) {
                            Mixin.addHook(hooks[key], targetProto, key, mixin);
                        }
                    }
                    if (extended) {
                        targetClass.onExtended(function() {
                            var args = Ext.Array.slice(arguments, 0);
                            args.unshift(targetClass);
                            return extended.apply(this, args);
                        }, this);
                    }
                    if (onClassMixedIn) {
                        onClassMixedIn.apply(this, arguments);
                    }
                };
            }
        }
    };
});

Ext.util = Ext.util || {};
Ext.util.DelayedTask = function(fn, scope, args, cancelOnDelay, fireIdleEvent) {
    var me = this,
        delay,
        call = function() {
            var globalEvents = Ext.GlobalEvents;
            clearInterval(me.id);
            me.id = null;
            fn.apply(scope, args || []);
            if (fireIdleEvent !== false && globalEvents.hasListeners.idle) {
                globalEvents.fireEvent('idle');
            }
        };
    cancelOnDelay = typeof cancelOnDelay === 'boolean' ? cancelOnDelay : true;
    me.id = null;
    me.delay = function(newDelay, newFn, newScope, newArgs) {
        if (cancelOnDelay) {
            me.cancel();
        }
        if (typeof newDelay === 'number') {
            delay = newDelay;
        }
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        if (!me.id) {
            me.id = Ext.interval(call, delay);
        }
    };
    me.cancel = function() {
        if (me.id) {
            clearInterval(me.id);
            me.id = null;
        }
    };
};

Ext.define('Ext.util.Event', function() {
    var arraySlice = Array.prototype.slice,
        arrayInsert = Ext.Array.insert,
        toArray = Ext.Array.toArray,
        fireArgs = {};
    return {
        isEvent: true,
        suspended: 0,
        noOptions: {},
        constructor: function(observable, name) {
            this.name = name;
            this.observable = observable;
            this.listeners = [];
        },
        addListener: function(fn, scope, options, caller, manager) {
            var me = this,
                added = false,
                observable = me.observable,
                eventName = me.name,
                listeners, listener, priority, isNegativePriority, highestNegativePriorityIndex, hasNegativePriorityIndex, length, index, i, listenerPriority, managedListeners;
            if (scope && !Ext._namedScopes[scope] && (typeof fn === 'string') && (typeof scope[fn] !== 'function')) {
                Ext.raise("No method named '" + fn + "' found on scope object");
            }
            if (me.findListener(fn, scope) === -1) {
                listener = me.createListener(fn, scope, options, caller, manager);
                if (me.firing) {
                    me.listeners = me.listeners.slice(0);
                }
                listeners = me.listeners;
                index = length = listeners.length;
                priority = options && options.priority;
                highestNegativePriorityIndex = me._highestNegativePriorityIndex;
                hasNegativePriorityIndex = highestNegativePriorityIndex !== undefined;
                if (priority) {
                    isNegativePriority = (priority < 0);
                    if (!isNegativePriority || hasNegativePriorityIndex) {
                        for (i = (isNegativePriority ? highestNegativePriorityIndex : 0); i < length; i++) {
                            listenerPriority = listeners[i].o ? listeners[i].o.priority || 0 : 0;
                            if (listenerPriority < priority) {
                                index = i;
                                break;
                            }
                        }
                    } else {
                        me._highestNegativePriorityIndex = index;
                    }
                } else if (hasNegativePriorityIndex) {
                    index = highestNegativePriorityIndex;
                }
                if (!isNegativePriority && index <= highestNegativePriorityIndex) {
                    me._highestNegativePriorityIndex++;
                }
                if (index === length) {
                    listeners[length] = listener;
                } else {
                    arrayInsert(listeners, index, [
                        listener
                    ]);
                }
                if (observable.isElement) {
                    observable._getPublisher(eventName).subscribe(observable, eventName, options.delegated !== false, options.capture);
                }
                if (manager) {
                    managedListeners = manager.managedListeners || (manager.managedListeners = []);
                    managedListeners.push({
                        item: me.observable,
                        ename: (options && options.managedName) || me.name,
                        fn: fn,
                        scope: scope,
                        options: options
                    });
                }
                added = true;
            }
            return added;
        },
        createListener: function(fn, scope, o, caller, manager) {
            var me = this,
                namedScope = Ext._namedScopes[scope],
                listener = {
                    fn: fn,
                    scope: scope,
                    ev: me,
                    caller: caller,
                    manager: manager,
                    namedScope: namedScope,
                    defaultScope: namedScope ? (scope || me.observable) : undefined,
                    lateBound: typeof fn === 'string'
                },
                handler = fn,
                wrapped = false,
                type;
            if (o) {
                listener.o = o;
                if (o.single) {
                    handler = me.createSingle(handler, listener, o, scope);
                    wrapped = true;
                }
                if (o.target) {
                    handler = me.createTargeted(handler, listener, o, scope, wrapped);
                    wrapped = true;
                }
                if (o.onFrame) {
                    handler = me.createAnimFrame(handler, listener, o, scope, wrapped);
                    wrapped = true;
                }
                if (o.delay) {
                    handler = me.createDelayed(handler, listener, o, scope, wrapped);
                    wrapped = true;
                }
                if (o.buffer) {
                    handler = me.createBuffered(handler, listener, o, scope, wrapped);
                    wrapped = true;
                }
                if (me.observable.isElement) {
                    type = o.type;
                    if (type) {
                        listener.type = type;
                    }
                }
            }
            listener.fireFn = handler;
            listener.wrapped = wrapped;
            return listener;
        },
        findListener: function(fn, scope) {
            var listeners = this.listeners,
                i = listeners.length,
                listener;
            while (i--) {
                listener = listeners[i];
                if (listener) {
                    if (listener.fn === fn && listener.scope == scope) {
                        return i;
                    }
                }
            }
            return -1;
        },
        removeListener: function(fn, scope, index) {
            var me = this,
                removed = false,
                observable = me.observable,
                eventName = me.name,
                listener, options, manager, managedListeners, managedListener, i;
            index = index != null ? index : me.findListener(fn, scope);
            if (index !== -1) {
                listener = me.listeners[index];
                if (me.firing) {
                    me.listeners = me.listeners.slice(0);
                }
                me.listeners.splice(index, 1);
                if (me._highestNegativePriorityIndex) {
                    if (index < me._highestNegativePriorityIndex) {
                        me._highestNegativePriorityIndex--;
                    } else if (index === me._highestNegativePriorityIndex && index === me.listeners.length) {
                        delete me._highestNegativePriorityIndex;
                    }
                }
                if (listener) {
                    options = listener.o;
                    if (listener.task) {
                        listener.task.cancel();
                        delete listener.task;
                    }
                    i = listener.tasks && listener.tasks.length;
                    if (i) {
                        while (i--) {
                            listener.tasks[i].cancel();
                        }
                        delete listener.tasks;
                    }
                    manager = listener.manager;
                    if (manager) {
                        managedListeners = manager.managedListeners;
                        if (managedListeners) {
                            for (i = managedListeners.length; i--; ) {
                                managedListener = managedListeners[i];
                                if (managedListener.item === me.observable && managedListener.ename === eventName && managedListener.fn === fn && managedListener.scope === scope) {
                                    managedListeners.splice(i, 1);
                                }
                            }
                        }
                    }
                    if (observable.isElement) {
                        observable._getPublisher(eventName).unsubscribe(observable, eventName, options.delegated !== false, options.capture);
                    }
                }
                removed = true;
            }
            return removed;
        },
        clearListeners: function() {
            var listeners = this.listeners,
                i = listeners.length,
                listener;
            while (i--) {
                listener = listeners[i];
                this.removeListener(listener.fn, listener.scope);
            }
        },
        suspend: function() {
            ++this.suspended;
        },
        resume: function() {
            if (this.suspended) {
                --this.suspended;
            }
        },
        isSuspended: function() {
            return this.suspended > 0;
        },
        fireDelegated: function(firingObservable, args) {
            this.firingObservable = firingObservable;
            return this.fire.apply(this, args);
        },
        fire: function() {
            var me = this,
                CQ = Ext.ComponentQuery,
                listeners = me.listeners,
                count = listeners.length,
                observable = me.observable,
                isElement = observable.isElement,
                isComponent = observable.isComponent,
                firingObservable = me.firingObservable,
                options, delegate, fireInfo, i, args, listener, len, delegateEl, currentTarget, type, chained, firingArgs, e, fireFn, fireScope;
            if (!me.suspended && count > 0) {
                me.firing = true;
                args = arguments.length ? arraySlice.call(arguments, 0) : [];
                len = args.length;
                if (isElement) {
                    e = args[0];
                }
                for (i = 0; i < count; i++) {
                    listener = listeners[i];
                    if (!listener) {
                        
                        continue;
                    }
                    options = listener.o;
                    if (isElement) {
                        if (currentTarget) {
                            e.setCurrentTarget(currentTarget);
                        }
                        type = listener.type;
                        if (type) {
                            chained = e;
                            e = args[0] = chained.chain({
                                type: type
                            });
                        }
                        Ext.EventObject = e;
                    }
                    firingArgs = args;
                    if (options) {
                        delegate = options.delegate;
                        if (delegate) {
                            if (isElement) {
                                delegateEl = e.getTarget('#' + e.currentTarget.id + ' ' + delegate);
                                if (delegateEl) {
                                    args[1] = delegateEl;
                                    currentTarget = e.currentTarget;
                                    e.setCurrentTarget(delegateEl);
                                } else {
                                    
                                    continue;
                                }
                            } else if (isComponent && !CQ.is(firingObservable, delegate, observable)) {
                                
                                continue;
                            }
                        }
                        if (isElement) {
                            if (options.preventDefault) {
                                e.preventDefault();
                            }
                            if (options.stopPropagation) {
                                e.stopPropagation();
                            }
                            if (options.stopEvent) {
                                e.stopEvent();
                            }
                        }
                        args[len] = options;
                        if (options.args) {
                            firingArgs = options.args.concat(args);
                        }
                    }
                    fireInfo = me.getFireInfo(listener);
                    fireFn = fireInfo.fn;
                    fireScope = fireInfo.scope;
                    fireInfo.fn = fireInfo.scope = null;
                    if (fireScope && fireScope.destroyed) {
                        if (fireScope.$className !== 'Ext.container.Monitor') {
                            Ext.raise({
                                msg: 'Attempting to fire "' + me.name + '" event on destroyed ' + (fireScope.$className || 'object') + ' instance with id: ' + (fireScope.id || 'unknown'),
                                instance: fireScope
                            });
                        }
                        me.removeListener(fireFn, fireScope, i);
                        fireFn = null;
                    }
                    if (fireFn && fireFn.apply(fireScope, firingArgs) === false) {
                        Ext.EventObject = null;
                        return (me.firing = false);
                    }
                    if (options) {
                        args.length--;
                    }
                    if (chained) {
                        e = args[0] = chained;
                        chained = null;
                    }
                    Ext.EventObject = null;
                }
            }
            me.firing = false;
            return true;
        },
        getFireInfo: function(listener, fromWrapped) {
            var observable = this.observable,
                fireFn = listener.fireFn,
                scope = listener.scope,
                namedScope = listener.namedScope,
                fn;
            if (!fromWrapped && listener.wrapped) {
                fireArgs.fn = fireFn;
                return fireArgs;
            }
            fn = fromWrapped ? listener.fn : fireFn;
            var name = fn;
            if (listener.lateBound) {
                if (!scope || namedScope) {
                    scope = (listener.caller || observable).resolveListenerScope(listener.defaultScope);
                }
                if (!scope) {
                    Ext.raise('Unable to dynamically resolve scope for "' + listener.ev.name + '" listener on ' + this.observable.id);
                }
                if (!Ext.isFunction(scope[fn])) {
                    Ext.raise('No method named "' + fn + '" on ' + (scope.$className || 'scope object.'));
                }
                fn = scope[fn];
            } else if (namedScope && namedScope.isController) {
                scope = (listener.caller || observable).resolveListenerScope(listener.defaultScope);
                if (!scope) {
                    Ext.raise('Unable to dynamically resolve scope for "' + listener.ev.name + '" listener on ' + this.observable.id);
                }
            }
            else if (!scope || namedScope) {
                scope = observable;
            }
            fireArgs.fn = fn;
            fireArgs.scope = scope;
            if (!fn) {
                Ext.raise('Unable to dynamically resolve method "' + name + '" on ' + this.observable.$className);
            }
            return fireArgs;
        },
        createAnimFrame: function(handler, listener, o, scope, wrapped) {
            var fireInfo;
            if (!wrapped) {
                fireInfo = listener.ev.getFireInfo(listener, true);
                handler = fireInfo.fn;
                scope = fireInfo.scope;
                fireInfo.fn = fireInfo.scope = null;
            }
            return Ext.Function.createAnimationFrame(handler, scope, o.args);
        },
        createTargeted: function(handler, listener, o, scope, wrapped) {
            return function() {
                if (o.target === arguments[0]) {
                    var fireInfo;
                    if (!wrapped) {
                        fireInfo = listener.ev.getFireInfo(listener, true);
                        handler = fireInfo.fn;
                        scope = fireInfo.scope;
                        fireInfo.fn = fireInfo.scope = null;
                    }
                    return handler.apply(scope, arguments);
                }
            };
        },
        createBuffered: function(handler, listener, o, scope, wrapped) {
            listener.task = new Ext.util.DelayedTask();
            return function() {
                if (listener.task) {
                    var fireInfo;
                    if (!wrapped) {
                        fireInfo = listener.ev.getFireInfo(listener, true);
                        handler = fireInfo.fn;
                        scope = fireInfo.scope;
                        fireInfo.fn = fireInfo.scope = null;
                    }
                    listener.task.delay(o.buffer, handler, scope, toArray(arguments));
                }
            };
        },
        createDelayed: function(handler, listener, o, scope, wrapped) {
            return function() {
                var task = new Ext.util.DelayedTask(),
                    fireInfo;
                if (!wrapped) {
                    fireInfo = listener.ev.getFireInfo(listener, true);
                    handler = fireInfo.fn;
                    scope = fireInfo.scope;
                    fireInfo.fn = fireInfo.scope = null;
                }
                if (!listener.tasks) {
                    listener.tasks = [];
                }
                listener.tasks.push(task);
                task.delay(o.delay || 10, handler, scope, toArray(arguments));
            };
        },
        createSingle: function(handler, listener, o, scope, wrapped) {
            return function() {
                var event = listener.ev,
                    observable = event.observable,
                    fn = listener.fn,
                    fireInfo;
                if (observable) {
                    observable.removeListener(event.name, fn, scope);
                } else {
                    event.removeListener(fn, scope);
                }
                if (!wrapped) {
                    fireInfo = event.getFireInfo(listener, true);
                    handler = fireInfo.fn;
                    scope = fireInfo.scope;
                    fireInfo.fn = fireInfo.scope = null;
                }
                return handler.apply(scope, arguments);
            };
        }
    };
});

Ext.define('Ext.mixin.Identifiable', {
    statics: {
        uniqueIds: {}
    },
    isIdentifiable: true,
    mixinId: 'identifiable',
    idCleanRegex: /\.|[^\w\-]/g,
    defaultIdPrefix: 'ext-',
    defaultIdSeparator: '-',
    getOptimizedId: function() {
        return this.id;
    },
    getUniqueId: function() {
        var id = this.id,
            prototype, separator, xtype, uniqueIds, prefix;
        if (!(id || id === 0)) {
            prototype = this.self.prototype;
            separator = this.defaultIdSeparator;
            uniqueIds = Ext.mixin.Identifiable.uniqueIds;
            if (!prototype.hasOwnProperty('identifiablePrefix')) {
                xtype = this.xtype;
                if (xtype) {
                    prefix = this.defaultIdPrefix + xtype.replace(this.idCleanRegex, separator) + separator;
                } else if (!(prefix = prototype.$className)) {
                    prefix = this.defaultIdPrefix + 'anonymous' + separator;
                } else {
                    prefix = prefix.replace(this.idCleanRegex, separator).toLowerCase() + separator;
                }
                prototype.identifiablePrefix = prefix;
            }
            prefix = this.identifiablePrefix;
            if (!uniqueIds.hasOwnProperty(prefix)) {
                uniqueIds[prefix] = 0;
            }
            id = this.id = this.id = prefix + (++uniqueIds[prefix]);
        }
        this.getUniqueId = this.getOptimizedId;
        return id;
    },
    setId: function(id) {
        this.id = this.id = id;
    },
    getId: function() {
        var id = this.id;
        if (!id) {
            id = this.getUniqueId();
        }
        this.getId = this.getOptimizedId;
        return id;
    }
});

Ext.define('Ext.mixin.Observable', function(Observable) {
    var emptyFn = Ext.emptyFn,
        emptyArray = [],
        arrayProto = Array.prototype,
        arraySlice = arrayProto.slice,
        ListenerRemover = function(observable) {
            if (observable instanceof ListenerRemover) {
                return observable;
            }
            this.observable = observable;
            if (arguments[1].isObservable) {
                this.managedListeners = true;
            }
            this.args = arraySlice.call(arguments, 1);
        },
        protectedProps = [
            'events',
            'hasListeners',
            'managedListeners',
            'eventedBeforeEventNames'
        ];
    ListenerRemover.prototype.destroy = function() {
        this.destroy = Ext.emptyFn;
        var observable = this.observable;
        if (!observable.destroyed) {
            observable[this.managedListeners ? 'mun' : 'un'].apply(observable, this.args);
        }
    };
    return {
        extend: Ext.Mixin,
        mixinConfig: {
            id: 'observable',
            after: {
                destroy: 'destroyObservable'
            }
        },
        mixins: [
            Ext.mixin.Identifiable
        ],
        statics: {
            releaseCapture: function(o) {
                o.fireEventArgs = this.prototype.fireEventArgs;
            },
            capture: function(o, fn, scope) {
                var newFn = function(eventName, args) {
                        return fn.apply(scope, [
                            eventName
                        ].concat(args));
                    };
                this.captureArgs(o, newFn, scope);
            },
            captureArgs: function(o, fn, scope) {
                o.fireEventArgs = Ext.Function.createInterceptor(o.fireEventArgs, fn, scope);
            },
            observe: function(cls, listeners) {
                if (cls) {
                    if (!cls.isObservable) {
                        Ext.applyIf(cls, new this());
                        this.captureArgs(cls.prototype, cls.fireEventArgs, cls);
                    }
                    if (Ext.isObject(listeners)) {
                        cls.on(listeners);
                    }
                }
                return cls;
            },
            prepareClass: function(T, mixin, data) {
                var listeners = T.listeners = [],
                    target = data || T.prototype,
                    targetListeners = target.listeners,
                    superListeners = mixin ? mixin.listeners : T.superclass.self.listeners,
                    name, scope, namedScope, i, len;
                if (superListeners) {
                    listeners.push(superListeners);
                }
                if (targetListeners) {
                    scope = targetListeners.scope;
                    if (!scope) {
                        targetListeners.scope = 'self';
                    } else {
                        namedScope = Ext._namedScopes[scope];
                        if (namedScope && namedScope.isController) {
                            targetListeners.scope = 'self.controller';
                        }
                    }
                    listeners.push(targetListeners);
                    target.listeners = null;
                }
                if (!T.HasListeners) {
                    var HasListeners = function() {},
                        SuperHL = T.superclass.HasListeners || (mixin && mixin.HasListeners) || Observable.HasListeners;
                    T.prototype.HasListeners = T.HasListeners = HasListeners;
                    HasListeners.prototype = T.hasListeners = new SuperHL();
                }
                scope = T.prototype.$noClearOnDestroy || {};
                for (i = 0 , len = protectedProps.length; i < len; i++) {
                    scope[protectedProps[i]] = true;
                }
                T.prototype.$noClearOnDestroy = scope;
            }
        },
        isObservable: true,
        $vetoClearingPrototypeOnDestroy: true,
        eventsSuspended: 0,
        constructor: function(config) {
            var me = this,
                self = me.self,
                declaredListeners, listeners, bubbleEvents, len, i;
            if (me.$observableInitialized) {
                return;
            }
            me.$observableInitialized = true;
            me.hasListeners = me.hasListeners = new me.HasListeners();
            me.eventedBeforeEventNames = {};
            me.events = me.events || {};
            declaredListeners = self.listeners;
            if (declaredListeners && !me._addDeclaredListeners(declaredListeners)) {
                self.listeners = null;
            }
            listeners = (config && config.listeners) || me.listeners;
            if (listeners) {
                if (listeners instanceof Array) {
                    for (i = 0 , len = listeners.length; i < len; ++i) {
                        me.addListener(listeners[i]);
                    }
                } else {
                    me.addListener(listeners);
                }
            }
            bubbleEvents = (config && config.bubbleEvents) || me.bubbleEvents;
            if (bubbleEvents) {
                me.enableBubble(bubbleEvents);
            }
            if (me.$applyConfigs) {
                if (config) {
                    Ext.apply(me, config);
                }
            } else {
                me.initConfig(config);
            }
            if (listeners) {
                me.listeners = null;
            }
        },
        onClassExtended: function(T, data) {
            if (!T.HasListeners) {
                Observable.prepareClass(T, T.prototype.$observableMixedIn ? undefined : data);
            }
        },
        $eventOptions: {
            scope: 1,
            delay: 1,
            buffer: 1,
            onFrame: 1,
            single: 1,
            args: 1,
            destroyable: 1,
            priority: 1,
            order: 1
        },
        $orderToPriority: {
            before: 100,
            current: 0,
            after: -100
        },
        _addDeclaredListeners: function(listeners) {
            var me = this;
            if (listeners instanceof Array) {
                Ext.each(listeners, me._addDeclaredListeners, me);
            } else {
                me._addedDeclaredListeners = true;
                me.addListener(listeners);
            }
            return me._addedDeclaredListeners;
        },
        addManagedListener: function(item, ename, fn, scope, options, noDestroy) {
            var me = this,
                managedListeners = me.managedListeners = me.managedListeners || [],
                config, passedOptions;
            if (typeof ename !== 'string') {
                passedOptions = arguments.length > 4 ? options : ename;
                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!item.$eventOptions[ename]) {
                            me.addManagedListener(item, ename, config.fn || config, config.scope || options.scope || scope, config.fn ? config : passedOptions, true);
                        }
                    }
                }
                if (options && options.destroyable) {
                    return new ListenerRemover(me, item, options);
                }
            } else {
                if (fn !== emptyFn) {
                    item.doAddListener(ename, fn, scope, options, null, me, me);
                    if (!noDestroy && options && options.destroyable) {
                        return new ListenerRemover(me, item, ename, fn, scope);
                    }
                }
            }
        },
        removeManagedListener: function(item, ename, fn, scope) {
            var me = this,
                options, config, managedListeners, length, i;
            if (item.$observableDestroyed) {
                return;
            }
            if (typeof ename !== 'string') {
                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!item.$eventOptions[ename]) {
                            me.removeManagedListener(item, ename, config.fn || config, config.scope || options.scope || scope);
                        }
                    }
                }
            } else {
                managedListeners = me.managedListeners ? me.managedListeners.slice() : [];
                ename = Ext.canonicalEventName(ename);
                for (i = 0 , length = managedListeners.length; i < length; i++) {
                    me.removeManagedListenerItem(false, managedListeners[i], item, ename, fn, scope);
                }
            }
        },
        fireEvent: function(eventName) {
            return this.fireEventArgs(eventName, arraySlice.call(arguments, 1));
        },
        resolveListenerScope: function(defaultScope) {
            var namedScope = Ext._namedScopes[defaultScope];
            if (namedScope) {
                if (namedScope.isController) {
                    Ext.raise('scope: "controller" can only be specified on classes that derive from Ext.Component or Ext.Widget');
                }
                if (namedScope.isSelf || namedScope.isThis) {
                    defaultScope = null;
                }
            }
            return defaultScope || this;
        },
        fireEventArgs: function(eventName, args) {
            eventName = Ext.canonicalEventName(eventName);
            var me = this,
                events = me.events,
                event = events && events[eventName],
                ret = true;
            if (me.hasListeners[eventName]) {
                ret = me.doFireEvent(eventName, args || emptyArray, event ? event.bubble : false);
            }
            return ret;
        },
        fireAction: function(eventName, args, fn, scope, options, order) {
            if (typeof fn === 'string' && !scope) {
                fn = this[fn];
            }
            options = options ? Ext.Object.chain(options) : {};
            options.single = true;
            options.priority = ((order === 'after') ? -99.5 : 99.5);
            this.doAddListener(eventName, fn, scope, options);
            this.fireEventArgs(eventName, args);
        },
        $eventedController: {
            _paused: 1,
            pause: function() {
                ++this._paused;
            },
            resume: function() {
                var me = this,
                    fn = me.fn,
                    scope = me.scope,
                    fnArgs = me.fnArgs,
                    owner = me.owner,
                    args, ret;
                if (!--me._paused) {
                    if (fn) {
                        args = Ext.Array.slice(fnArgs || me.args);
                        if (fnArgs === false) {
                            args.shift();
                        }
                        me.fn = null;
                        args.push(me);
                        if (Ext.isFunction(fn)) {
                            ret = fn.apply(scope, args);
                        } else if (scope && Ext.isString(fn) && Ext.isFunction(scope[fn])) {
                            ret = scope[fn].apply(scope, args);
                        }
                        if (ret === false) {
                            return false;
                        }
                    }
                    if (!me._paused) {
                        return me.owner.fireEventArgs(me.eventName, me.args);
                    }
                }
            }
        },
        fireEventedAction: function(eventName, args, fn, scope, fnArgs) {
            var me = this,
                eventedBeforeEventNames = me.eventedBeforeEventNames,
                beforeEventName = eventedBeforeEventNames[eventName] || (eventedBeforeEventNames[eventName] = 'before' + eventName),
                controller = Ext.apply({
                    owner: me,
                    eventName: eventName,
                    fn: fn,
                    scope: scope,
                    fnArgs: fnArgs,
                    args: args
                }, me.$eventedController),
                value;
            args.push(controller);
            value = me.fireEventArgs(beforeEventName, args);
            args.pop();
            if (value === false) {
                return false;
            }
            return controller.resume();
        },
        doFireEvent: function(eventName, args, bubbles) {
            var target = this,
                queue, event,
                ret = true;
            do {
                if (target.eventsSuspended) {
                    if ((queue = target.eventQueue)) {
                        queue.push([
                            eventName,
                            args
                        ]);
                    }
                    return ret;
                } else {
                    event = target.events && target.events[eventName];
                    if (event && event !== true) {
                        if ((ret = event.fire.apply(event, args)) === false) {
                            break;
                        }
                    }
                }
            } while (bubbles && (target = target.getBubbleParent()));
            return ret;
        },
        getBubbleParent: function() {
            var me = this,
                parent = me.getBubbleTarget && me.getBubbleTarget();
            if (parent && parent.isObservable) {
                return parent;
            }
            return null;
        },
        addListener: function(ename, fn, scope, options, order, caller) {
            var me = this,
                namedScopes = Ext._namedScopes,
                config, namedScope, isClassListener, innerScope, eventOptions;
            if (typeof ename !== 'string') {
                options = ename;
                scope = options.scope;
                namedScope = scope && namedScopes[scope];
                isClassListener = namedScope && namedScope.isSelf;
                eventOptions = ((me.isComponent || me.isWidget) && options.element) ? me.$elementEventOptions : me.$eventOptions;
                for (ename in options) {
                    config = options[ename];
                    if (!eventOptions[ename]) {
                        innerScope = config.scope;
                        if (innerScope && isClassListener) {
                            namedScope = namedScopes[innerScope];
                            if (namedScope && namedScope.isController) {
                                innerScope = 'self.controller';
                            }
                        }
                        me.doAddListener(ename, config.fn || config, innerScope || scope, config.fn ? config : options, order, caller);
                    }
                }
                if (options && options.destroyable) {
                    return new ListenerRemover(me, options);
                }
            } else {
                me.doAddListener(ename, fn, scope, options, order, caller);
                if (options && options.destroyable) {
                    return new ListenerRemover(me, ename, fn, scope, options);
                }
            }
            return me;
        },
        removeListener: function(ename, fn, scope, eventOptions) {
            var me = this,
                config, options;
            if (typeof ename !== 'string') {
                options = ename;
                eventOptions = eventOptions || me.$eventOptions;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!me.$eventOptions[ename]) {
                            me.doRemoveListener(ename, config.fn || config, config.scope || options.scope);
                        }
                    }
                }
            } else {
                me.doRemoveListener(ename, fn, scope);
            }
            return me;
        },
        onBefore: function(eventName, fn, scope, options) {
            return this.addListener(eventName, fn, scope, options, 'before');
        },
        onAfter: function(eventName, fn, scope, options) {
            return this.addListener(eventName, fn, scope, options, 'after');
        },
        unBefore: function(eventName, fn, scope, options) {
            return this.removeListener(eventName, fn, scope, options, 'before');
        },
        unAfter: function(eventName, fn, scope, options) {
            return this.removeListener(eventName, fn, scope, options, 'after');
        },
        addBeforeListener: function() {
            return this.onBefore.apply(this, arguments);
        },
        addAfterListener: function() {
            return this.onAfter.apply(this, arguments);
        },
        removeBeforeListener: function() {
            return this.unBefore.apply(this, arguments);
        },
        removeAfterListener: function() {
            return this.unAfter.apply(this, arguments);
        },
        clearListeners: function() {
            var me = this,
                events = me.events,
                hasListeners = me.hasListeners,
                event, key;
            if (events) {
                for (key in events) {
                    if (events.hasOwnProperty(key)) {
                        event = events[key];
                        if (event.isEvent) {
                            delete hasListeners[key];
                            event.clearListeners();
                        }
                    }
                }
                me.events = null;
            }
            me.clearManagedListeners();
        },
        purgeListeners: function() {
            if (Ext.global.console) {
                Ext.global.console.warn('Observable: purgeListeners has been deprecated. Please use clearListeners.');
            }
            return this.clearListeners.apply(this, arguments);
        },
        clearManagedListeners: function() {
            var me = this,
                managedListeners = me.managedListeners ? me.managedListeners.slice() : [],
                i = 0,
                len = managedListeners.length;
            for (; i < len; i++) {
                me.removeManagedListenerItem(true, managedListeners[i]);
            }
            me.managedListeners = [];
        },
        removeManagedListenerItem: function(isClear, managedListener, item, ename, fn, scope) {
            if (isClear || (managedListener.item === item && managedListener.ename === ename && (!fn || managedListener.fn === fn) && (!scope || managedListener.scope === scope))) {
                if (!managedListener.item.destroyed) {
                    managedListener.item.doRemoveListener(managedListener.ename, managedListener.fn, managedListener.scope, managedListener.options);
                }
                if (!isClear) {
                    Ext.Array.remove(this.managedListeners, managedListener);
                }
            }
        },
        purgeManagedListeners: function() {
            if (Ext.global.console) {
                Ext.global.console.warn('Observable: purgeManagedListeners has been deprecated. Please use clearManagedListeners.');
            }
            return this.clearManagedListeners.apply(this, arguments);
        },
        hasListener: function(ename) {
            ename = Ext.canonicalEventName(ename);
            return !!this.hasListeners[ename];
        },
        isSuspended: function(event) {
            var suspended = this.eventsSuspended > 0,
                events = this.events;
            if (!suspended && event && events) {
                event = events[event];
                if (event && event.isEvent) {
                    return event.isSuspended();
                }
            }
            return suspended;
        },
        suspendEvents: function(queueSuspended) {
            ++this.eventsSuspended;
            if (queueSuspended && !this.eventQueue) {
                this.eventQueue = [];
            }
        },
        suspendEvent: function() {
            var me = this,
                events = me.events,
                len = arguments.length,
                i, event, ename;
            for (i = 0; i < len; i++) {
                ename = arguments[i];
                ename = Ext.canonicalEventName(ename);
                event = events[ename];
                if (!event || !event.isEvent) {
                    event = me._initEvent(ename);
                }
                event.suspend();
            }
        },
        resumeEvent: function() {
            var events = this.events || 0,
                len = events && arguments.length,
                i, event, ename;
            for (i = 0; i < len; i++) {
                ename = Ext.canonicalEventName(arguments[i]);
                event = events[ename];
                if (event && event.resume) {
                    event.resume();
                }
            }
        },
        resumeEvents: function(discardQueue) {
            var me = this,
                queued = me.eventQueue,
                qLen, q;
            if (me.eventsSuspended && !--me.eventsSuspended) {
                delete me.eventQueue;
                if (!discardQueue && queued) {
                    qLen = queued.length;
                    for (q = 0; q < qLen; q++) {
                        me.fireEventArgs.apply(me, queued[q]);
                    }
                }
            }
        },
        relayEvents: function(origin, events, prefix) {
            var me = this,
                len = events.length,
                i = 0,
                oldName, newName,
                relayers = {};
            if (Ext.isObject(events)) {
                for (i in events) {
                    newName = events[i];
                    relayers[i] = me.createRelayer(newName);
                }
            } else {
                for (; i < len; i++) {
                    oldName = events[i];
                    relayers[oldName] = me.createRelayer(prefix ? prefix + oldName : oldName);
                }
            }
            me.mon(origin, relayers, null, null, undefined);
            return new ListenerRemover(me, origin, relayers);
        },
        createRelayer: function(newName, beginEnd) {
            var me = this;
            return function() {
                return me.fireEventArgs.call(me, newName, beginEnd ? arraySlice.apply(arguments, beginEnd) : arguments);
            };
        },
        enableBubble: function(eventNames) {
            if (eventNames) {
                var me = this,
                    names = (typeof eventNames == 'string') ? arguments : eventNames,
                    events = me.events,
                    length = events && names.length,
                    ename, event, i;
                for (i = 0; i < length; ++i) {
                    ename = names[i];
                    ename = Ext.canonicalEventName(ename);
                    event = events[ename];
                    if (!event || !event.isEvent) {
                        event = me._initEvent(ename);
                    }
                    me.hasListeners._incr_(ename);
                    event.bubble = true;
                }
            }
        },
        destroy: function() {
            this.clearListeners();
            this.callParent();
            this.destroyObservable(true);
        },
        destroyObservable: function(skipClearListeners) {
            var me = this;
            if (me.$observableDestroyed) {
                return;
            }
            if (!skipClearListeners) {
                me.clearListeners();
            }
            if (me.destroyed) {
                if (me.clearPropertiesOnDestroy) {
                    if (!me.clearPrototypeOnDestroy) {
                        me.fireEvent = me.fireEventArgs = me.fireAction = me.fireEventedAction = Ext.emptyFn;
                    }
                    me.events = me.managedListeners = me.eventedBeforeEventNames = null;
                    me.$observableDestroyed = true;
                }
                if (me.clearPrototypeOnDestroy && Object.setPrototypeOf && !me.$alreadyNulled) {
                    Object.setPrototypeOf(me, null);
                    me.$alreadyNulled = true;
                }
            }
        },
        privates: {
            doAddListener: function(ename, fn, scope, options, order, caller, manager) {
                var me = this,
                    ret = false,
                    event, priority;
                order = order || (options && options.order);
                if (order) {
                    priority = (options && options.priority);
                    if (!priority) {
                        options = options ? Ext.Object.chain(options) : {};
                        options.priority = me.$orderToPriority[order];
                    }
                }
                ename = Ext.canonicalEventName(ename);
                if (!fn) {
                    Ext.raise("Cannot add '" + ename + "' listener to " + me.$className + " instance.  No function specified.");
                }
                event = (me.events || (me.events = {}))[ename];
                if (!event || !event.isEvent) {
                    event = me._initEvent(ename);
                }
                if (fn !== emptyFn) {
                    if (!manager && (scope && scope.isObservable && (scope !== me))) {
                        manager = scope;
                    }
                    if (event.addListener(fn, scope, options, caller, manager)) {
                        me.hasListeners._incr_(ename);
                        ret = true;
                    }
                }
                return ret;
            },
            doRemoveListener: function(ename, fn, scope) {
                var me = this,
                    ret = false,
                    events = me.events,
                    event;
                ename = Ext.canonicalEventName(ename);
                event = events && events[ename];
                if (!fn) {
                    Ext.raise("Cannot remove '" + ename + "' listener to " + me.$className + " instance.  No function specified.");
                }
                if (event && event.isEvent) {
                    if (event.removeListener(fn, scope)) {
                        me.hasListeners._decr_(ename);
                        ret = true;
                    }
                }
                return ret;
            },
            _initEvent: function(eventName) {
                return (this.events[eventName] = new Ext.util.Event(this, eventName));
            }
        },
        deprecated: {
            '5.0': {
                methods: {
                    addEvents: null
                }
            }
        }
    };
}, function() {
    var Observable = this,
        proto = Observable.prototype,
        HasListeners = function() {},
        prepareMixin = function(T) {
            if (!T.HasListeners) {
                var proto = T.prototype;
                proto.$observableMixedIn = 1;
                Observable.prepareClass(T, this);
                T.onExtended(function(U, data) {
                    Ext.classSystemMonitor && Ext.classSystemMonitor('extend mixin', arguments);
                    Observable.prepareClass(U, null, data);
                });
                if (proto.onClassMixedIn) {
                    Ext.override(T, {
                        onClassMixedIn: function(U) {
                            prepareMixin.call(this, U);
                            this.callParent(arguments);
                        }
                    });
                } else {
                    proto.onClassMixedIn = function(U) {
                        prepareMixin.call(this, U);
                    };
                }
            }
            superOnClassMixedIn.call(this, T);
        },
        superOnClassMixedIn = proto.onClassMixedIn;
    HasListeners.prototype = {
        _decr_: function(ev, count) {
            if (count == null) {
                count = 1;
            }
            if (!(this[ev] -= count)) {
                delete this[ev];
            }
        },
        _incr_: function(ev) {
            if (this.hasOwnProperty(ev)) {
                ++this[ev];
            } else {
                this[ev] = 1;
            }
        }
    };
    proto.HasListeners = Observable.HasListeners = HasListeners;
    Observable.createAlias({
        on: 'addListener',
        un: 'removeListener',
        mon: 'addManagedListener',
        mun: 'removeManagedListener',
        setListeners: 'addListener'
    });
    Observable.observeClass = Observable.observe;
    function getMethodEvent(method) {
        var e = (this.methodEvents = this.methodEvents || {})[method],
            returnValue, v, cancel,
            obj = this,
            makeCall;
        if (!e) {
            this.methodEvents[method] = e = {};
            e.originalFn = this[method];
            e.methodName = method;
            e.before = [];
            e.after = [];
            makeCall = function(fn, scope, args) {
                if ((v = fn.apply(scope || obj, args)) !== undefined) {
                    if (typeof v == 'object') {
                        if (v.returnValue !== undefined) {
                            returnValue = v.returnValue;
                        } else {
                            returnValue = v;
                        }
                        cancel = !!v.cancel;
                    } else if (v === false) {
                        cancel = true;
                    } else {
                        returnValue = v;
                    }
                }
            };
            this[method] = function() {
                var args = Array.prototype.slice.call(arguments, 0),
                    b, i, len;
                returnValue = v = undefined;
                cancel = false;
                for (i = 0 , len = e.before.length; i < len; i++) {
                    b = e.before[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }
                if ((v = e.originalFn.apply(obj, args)) !== undefined) {
                    returnValue = v;
                }
                for (i = 0 , len = e.after.length; i < len; i++) {
                    b = e.after[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }
                return returnValue;
            };
        }
        return e;
    }
    Ext.apply(proto, {
        onClassMixedIn: prepareMixin,
        beforeMethod: function(method, fn, scope) {
            getMethodEvent.call(this, method).before.push({
                fn: fn,
                scope: scope
            });
        },
        afterMethod: function(method, fn, scope) {
            getMethodEvent.call(this, method).after.push({
                fn: fn,
                scope: scope
            });
        },
        removeMethodListener: function(method, fn, scope) {
            var e = this.getMethodEvent(method),
                i, len;
            for (i = 0 , len = e.before.length; i < len; i++) {
                if (e.before[i].fn == fn && e.before[i].scope == scope) {
                    Ext.Array.erase(e.before, i, 1);
                    return;
                }
            }
            for (i = 0 , len = e.after.length; i < len; i++) {
                if (e.after[i].fn == fn && e.after[i].scope == scope) {
                    Ext.Array.erase(e.after, i, 1);
                    return;
                }
            }
        },
        toggleEventLogging: function(toggle) {
            Ext.util.Observable[toggle ? 'capture' : 'releaseCapture'](this, function(en) {
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.log(en, arguments);
                }
            });
        }
    });
});

Ext.define('Ext.util.HashMap', {
    mixins: [
        Ext.mixin.Observable
    ],
    generation: 0,
    config: {
        keyFn: null
    },
    constructor: function(config) {
        var me = this,
            fn;
        me.mixins.observable.constructor.call(me, config);
        me.clear(true);
        fn = me.getKeyFn();
        if (fn) {
            me.getKey = fn;
        }
    },
    getCount: function() {
        return this.length;
    },
    getData: function(key, value) {
        if (value === undefined) {
            value = key;
            key = this.getKey(value);
        }
        return [
            key,
            value
        ];
    },
    getKey: function(o) {
        return o.id;
    },
    add: function(key, value) {
        var me = this;
        if (arguments.length === 1) {
            value = key;
            key = me.getKey(value);
        }
        if (me.containsKey(key)) {
            return me.replace(key, value);
        }
        me.map[key] = value;
        ++me.length;
        me.generation++;
        if (me.hasListeners.add) {
            me.fireEvent('add', me, key, value);
        }
        return value;
    },
    replace: function(key, value) {
        var me = this,
            map = me.map,
            old;
        if (arguments.length === 1) {
            value = key;
            key = me.getKey(value);
        }
        if (!me.containsKey(key)) {
            me.add(key, value);
        }
        old = map[key];
        map[key] = value;
        me.generation++;
        if (me.hasListeners.replace) {
            me.fireEvent('replace', me, key, value, old);
        }
        return value;
    },
    remove: function(o) {
        var key = this.findKey(o);
        if (key !== undefined) {
            return this.removeAtKey(key);
        }
        return false;
    },
    removeAtKey: function(key) {
        var me = this,
            value;
        if (me.containsKey(key)) {
            value = me.map[key];
            delete me.map[key];
            --me.length;
            me.generation++;
            if (me.hasListeners.remove) {
                me.fireEvent('remove', me, key, value);
            }
            return true;
        }
        return false;
    },
    get: function(key) {
        var map = this.map;
        return map.hasOwnProperty(key) ? map[key] : undefined;
    },
    clear: function(initial) {
        var me = this;
        if (initial || me.generation) {
            me.map = {};
            me.length = 0;
            me.generation = initial ? 0 : me.generation + 1;
        }
        if (initial !== true && me.hasListeners.clear) {
            me.fireEvent('clear', me);
        }
        return me;
    },
    containsKey: function(key) {
        var map = this.map;
        return map.hasOwnProperty(key) && map[key] !== undefined;
    },
    contains: function(value) {
        return this.containsKey(this.findKey(value));
    },
    getKeys: function() {
        return this.getArray(true);
    },
    getValues: function() {
        return this.getArray(false);
    },
    getArray: function(isKey) {
        var arr = [],
            key,
            map = this.map;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                arr.push(isKey ? key : map[key]);
            }
        }
        return arr;
    },
    each: function(fn, scope) {
        var items = Ext.apply({}, this.map),
            key,
            length = this.length;
        scope = scope || this;
        for (key in items) {
            if (items.hasOwnProperty(key)) {
                if (fn.call(scope, key, items[key], length) === false) {
                    break;
                }
            }
        }
        return this;
    },
    clone: function() {
        var hash = new this.self(this.initialConfig),
            map = this.map,
            key;
        hash.suspendEvents();
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                hash.add(key, map[key]);
            }
        }
        hash.resumeEvents();
        return hash;
    },
    findKey: function(value) {
        var key,
            map = this.map;
        for (key in map) {
            if (map.hasOwnProperty(key) && map[key] === value) {
                return key;
            }
        }
        return undefined;
    }
}, function(HashMap) {
    var prototype = HashMap.prototype;
    prototype.removeByKey = prototype.removeAtKey;
});

Ext.define('Ext.promise.Consequence', function(Consequence) {
    return {
        promise: null,
        deferred: null,
        onFulfilled: null,
        onRejected: null,
        onProgress: null,
        constructor: function(onFulfilled, onRejected, onProgress) {
            var me = this;
            me.onFulfilled = onFulfilled;
            me.onRejected = onRejected;
            me.onProgress = onProgress;
            me.deferred = new Ext.promise.Deferred();
            me.promise = me.deferred.promise;
        },
        trigger: function(action, value) {
            var me = this,
                deferred = me.deferred;
            switch (action) {
                case 'fulfill':
                    me.propagate(value, me.onFulfilled, deferred, deferred.resolve);
                    break;
                case 'reject':
                    me.propagate(value, me.onRejected, deferred, deferred.reject);
                    break;
            }
        },
        update: function(progress) {
            if (Ext.isFunction(this.onProgress)) {
                progress = this.onProgress(progress);
            }
            this.deferred.update(progress);
        },
        propagate: function(value, callback, deferred, deferredMethod) {
            if (Ext.isFunction(callback)) {
                this.schedule(function() {
                    try {
                        deferred.resolve(callback(value));
                    } catch (e) {
                        deferred.reject(e);
                    }
                });
            } else {
                deferredMethod.call(this.deferred, value);
            }
        },
        schedule: function(callback) {
            var n = Consequence.queueSize++;
            Consequence.queue[n] = callback;
            if (!n) {
                Ext.asap(Consequence.dispatch);
            }
        },
        statics: {
            queue: new Array(10000),
            queueSize: 0,
            dispatch: function() {
                var queue = Consequence.queue,
                    fn, i;
                for (i = 0; i < Consequence.queueSize; ++i) {
                    fn = queue[i];
                    queue[i] = null;
                    fn();
                }
                Consequence.queueSize = 0;
            }
        }
    };
});

Ext.define('Ext.promise.Deferred', {
    promise: null,
    consequences: [],
    completed: false,
    completionAction: null,
    completionValue: null,
    constructor: function() {
        var me = this;
        me.promise = new Ext.promise.Promise(me);
        me.consequences = [];
        me.completed = false;
        me.completionAction = null;
        me.completionValue = null;
    },
    then: function(onFulfilled, onRejected, onProgress) {
        var me = this,
            consequence = new Ext.promise.Consequence(onFulfilled, onRejected, onProgress);
        if (me.completed) {
            consequence.trigger(me.completionAction, me.completionValue);
        } else {
            me.consequences.push(consequence);
        }
        return consequence.promise;
    },
    resolve: function(value) {
        var me = this,
            isHandled, thenFn;
        if (me.completed) {
            return;
        }
        try {
            if (value === me.promise) {
                throw new TypeError('A Promise cannot be resolved with itself.');
            }
            if (value != null && (typeof value === 'object' || Ext.isFunction(value)) && Ext.isFunction(thenFn = value.then)) {
                isHandled = false;
                try {
                    thenFn.call(value, function(value) {
                        if (!isHandled) {
                            isHandled = true;
                            me.resolve(value);
                        }
                    }, function(error) {
                        if (!isHandled) {
                            isHandled = true;
                            me.reject(error);
                        }
                    });
                } catch (e1) {
                    if (!isHandled) {
                        me.reject(e1);
                    }
                }
            } else {
                me.complete('fulfill', value);
            }
        } catch (e2) {
            me.reject(e2);
        }
    },
    reject: function(reason) {
        if (this.completed) {
            return;
        }
        this.complete('reject', reason);
    },
    update: function(progress) {
        var consequences = this.consequences,
            consequence, i, len;
        if (this.completed) {
            return;
        }
        for (i = 0 , len = consequences.length; i < len; i++) {
            consequence = consequences[i];
            consequence.update(progress);
        }
    },
    complete: function(action, value) {
        var me = this,
            consequences = me.consequences,
            consequence, i, len;
        me.completionAction = action;
        me.completionValue = value;
        me.completed = true;
        for (i = 0 , len = consequences.length; i < len; i++) {
            consequence = consequences[i];
            consequence.trigger(me.completionAction, me.completionValue);
        }
        me.consequences = null;
    }
});

Ext.define('Ext.promise.Promise', function(ExtPromise) {
    var Deferred;
    return {
        statics: {
            CancellationError: Ext.global.CancellationError || Error,
            _ready: function() {
                Deferred = Ext.promise.Deferred;
            },
            all: function(promisesOrValues) {
                if (!(Ext.isArray(promisesOrValues) || ExtPromise.is(promisesOrValues))) {
                    Ext.raise('Invalid parameter: expected an Array or Promise of an Array.');
                }
                return ExtPromise.when(promisesOrValues).then(function(promisesOrValues) {
                    var deferred = new Deferred(),
                        remainingToResolve = promisesOrValues.length,
                        results = new Array(remainingToResolve),
                        index, promiseOrValue, resolve, i, len;
                    if (!remainingToResolve) {
                        deferred.resolve(results);
                    } else {
                        resolve = function(item, index) {
                            return ExtPromise.when(item).then(function(value) {
                                results[index] = value;
                                if (!--remainingToResolve) {
                                    deferred.resolve(results);
                                }
                                return value;
                            }, function(reason) {
                                return deferred.reject(reason);
                            });
                        };
                        for (index = i = 0 , len = promisesOrValues.length; i < len; index = ++i) {
                            promiseOrValue = promisesOrValues[index];
                            if (index in promisesOrValues) {
                                resolve(promiseOrValue, index);
                            } else {
                                remainingToResolve--;
                            }
                        }
                    }
                    return deferred.promise;
                });
            },
            is: function(value) {
                return value != null && (typeof value === 'object' || Ext.isFunction(value)) && Ext.isFunction(value.then);
            },
            rethrowError: function(error) {
                Ext.asap(function() {
                    throw error;
                });
            },
            when: function(value) {
                var deferred = new Ext.promise.Deferred();
                deferred.resolve(value);
                return deferred.promise;
            }
        },
        owner: null,
        constructor: function(owner) {
            this.owner = owner;
        },
        then: function(onFulfilled, onRejected, onProgress, scope) {
            var ref;
            if (arguments.length === 1 && Ext.isObject(arguments[0])) {
                ref = arguments[0];
                onFulfilled = ref.success;
                onRejected = ref.failure;
                onProgress = ref.progress;
                scope = ref.scope;
            }
            if (scope) {
                if (onFulfilled) {
                    onFulfilled = Ext.Function.bind(onFulfilled, scope);
                }
                if (onRejected) {
                    onRejected = Ext.Function.bind(onRejected, scope);
                }
                if (onProgress) {
                    onProgress = Ext.Function.bind(onProgress, scope);
                }
            }
            return this.owner.then(onFulfilled, onRejected, onProgress);
        },
        otherwise: function(onRejected, scope) {
            var ref;
            if (arguments.length === 1 && Ext.isObject(arguments[0])) {
                ref = arguments[0];
                onRejected = ref.fn;
                scope = ref.scope;
            }
            if (scope != null) {
                onRejected = Ext.Function.bind(onRejected, scope);
            }
            return this.owner.then(null, onRejected);
        },
        always: function(onCompleted, scope) {
            var ref;
            if (arguments.length === 1 && Ext.isObject(arguments[0])) {
                ref = arguments[0];
                onCompleted = ref.fn;
                scope = ref.scope;
            }
            if (scope != null) {
                onCompleted = Ext.Function.bind(onCompleted, scope);
            }
            return this.owner.then(function(value) {
                try {
                    onCompleted();
                } catch (e) {
                    ExtPromise.rethrowError(e);
                }
                return value;
            }, function(reason) {
                try {
                    onCompleted();
                } catch (e) {
                    ExtPromise.rethrowError(e);
                }
                throw reason;
            });
        },
        done: function() {
            this.owner.then(null, ExtPromise.rethrowError);
        },
        cancel: function(reason) {
            if (reason == null) {
                reason = null;
            }
            this.owner.reject(new this.self.CancellationError(reason));
        },
        log: function(identifier) {
            if (identifier == null) {
                identifier = '';
            }
            return this.owner.then(function(value) {
                Ext.log("" + (identifier || 'Promise') + " resolved with value: " + value);
                return value;
            }, function(reason) {
                Ext.log("" + (identifier || 'Promise') + " rejected with reason: " + reason);
                throw reason;
            });
        }
    };
}, function(ExtPromise) {
    ExtPromise._ready();
});

Ext.define('Ext.Promise', function() {
    var Polyfiller;
    return {
        statics: {
            _ready: function() {
                Polyfiller = Ext.promise.Promise;
            },
            all: function() {
                return Polyfiller.all.apply(Polyfiller, arguments);
            },
            race: function() {
                Ext.raise("Not implemented");
            },
            reject: function(reason) {
                var deferred = new Ext.promise.Deferred();
                deferred.reject(reason);
                return deferred.promise;
            },
            resolve: function(value) {
                var deferred = new Ext.promise.Deferred();
                deferred.resolve(value);
                return deferred.promise;
            }
        },
        constructor: function(action) {
            var deferred = new Ext.promise.Deferred();
            action(deferred.resolve.bind(deferred), deferred.reject.bind(deferred));
            return deferred.promise;
        }
    };
}, function(ExtPromise) {
    var P = Ext.global.Promise;
    if (P && P.resolve) {
        Ext.Promise = P;
    } else {
        ExtPromise._ready();
    }
});

Ext.define('Ext.Deferred', function(Deferred) {
    var ExtPromise, when;
    return {
        extend: Ext.promise.Deferred,
        statics: {
            _ready: function() {
                ExtPromise = Ext.promise.Promise;
                when = Ext.Promise.resolve;
            },
            all: function() {
                return ExtPromise.all.apply(ExtPromise, arguments);
            },
            any: function(promisesOrValues) {
                if (!(Ext.isArray(promisesOrValues) || ExtPromise.is(promisesOrValues))) {
                    Ext.raise('Invalid parameter: expected an Array or Promise of an Array.');
                }
                return Deferred.some(promisesOrValues, 1).then(function(array) {
                    return array[0];
                }, function(error) {
                    if (error instanceof Error && error.message === 'Too few Promises were resolved.') {
                        Ext.raise('No Promises were resolved.');
                    } else {
                        throw error;
                    }
                });
            },
            delay: function(promiseOrValue, milliseconds) {
                var deferred;
                if (arguments.length === 1) {
                    milliseconds = promiseOrValue;
                    promiseOrValue = undefined;
                }
                milliseconds = Math.max(milliseconds, 0);
                deferred = new Deferred();
                setTimeout(function() {
                    deferred.resolve(promiseOrValue);
                }, milliseconds);
                return deferred.promise;
            },
            map: function(promisesOrValues, mapFn) {
                if (!(Ext.isArray(promisesOrValues) || ExtPromise.is(promisesOrValues))) {
                    Ext.raise('Invalid parameter: expected an Array or Promise of an Array.');
                }
                if (!Ext.isFunction(mapFn)) {
                    Ext.raise('Invalid parameter: expected a function.');
                }
                return Deferred.resolved(promisesOrValues).then(function(promisesOrValues) {
                    var deferred, index, promiseOrValue, remainingToResolve, resolve, results, i, len;
                    remainingToResolve = promisesOrValues.length;
                    results = new Array(promisesOrValues.length);
                    deferred = new Deferred();
                    if (!remainingToResolve) {
                        deferred.resolve(results);
                    } else {
                        resolve = function(item, index) {
                            return Deferred.resolved(item).then(function(value) {
                                return mapFn(value, index, results);
                            }).then(function(value) {
                                results[index] = value;
                                if (!--remainingToResolve) {
                                    deferred.resolve(results);
                                }
                                return value;
                            }, function(reason) {
                                return deferred.reject(reason);
                            });
                        };
                        for (index = i = 0 , len = promisesOrValues.length; i < len; index = ++i) {
                            promiseOrValue = promisesOrValues[index];
                            if (index in promisesOrValues) {
                                resolve(promiseOrValue, index);
                            } else {
                                remainingToResolve--;
                            }
                        }
                    }
                    return deferred.promise;
                });
            },
            memoize: function(fn, scope, hashFn) {
                var memoizedFn = Ext.Function.memoize(fn, scope, hashFn);
                return function() {
                    return Deferred.all(Ext.Array.slice(arguments)).then(function(values) {
                        return memoizedFn.apply(scope, values);
                    });
                };
            },
            parallel: function(fns, scope) {
                if (scope == null) {
                    scope = null;
                }
                var args = Ext.Array.slice(arguments, 2);
                return Deferred.map(fns, function(fn) {
                    if (!Ext.isFunction(fn)) {
                        throw new Error('Invalid parameter: expected a function.');
                    }
                    return fn.apply(scope, args);
                });
            },
            pipeline: function(fns, initialValue, scope) {
                if (scope == null) {
                    scope = null;
                }
                return Deferred.reduce(fns, function(value, fn) {
                    if (!Ext.isFunction(fn)) {
                        throw new Error('Invalid parameter: expected a function.');
                    }
                    return fn.call(scope, value);
                }, initialValue);
            },
            reduce: function(values, reduceFn, initialValue) {
                if (!(Ext.isArray(values) || ExtPromise.is(values))) {
                    Ext.raise('Invalid parameter: expected an Array or Promise of an Array.');
                }
                if (!Ext.isFunction(reduceFn)) {
                    Ext.raise('Invalid parameter: expected a function.');
                }
                var initialValueSpecified = arguments.length === 3;
                return Deferred.resolved(values).then(function(promisesOrValues) {
                    var reduceArguments = [
                            promisesOrValues,
                            function(previousValueOrPromise, currentValueOrPromise, currentIndex) {
                                return Deferred.resolved(previousValueOrPromise).then(function(previousValue) {
                                    return Deferred.resolved(currentValueOrPromise).then(function(currentValue) {
                                        return reduceFn(previousValue, currentValue, currentIndex, promisesOrValues);
                                    });
                                });
                            }
                        ];
                    if (initialValueSpecified) {
                        reduceArguments.push(initialValue);
                    }
                    return Ext.Array.reduce.apply(Ext.Array, reduceArguments);
                });
            },
            rejected: function(reason) {
                var deferred = new Ext.Deferred();
                deferred.reject(reason);
                return deferred.promise;
            },
            resolved: function(value) {
                var deferred = new Ext.Deferred();
                deferred.resolve(value);
                return deferred.promise;
            },
            sequence: function(fns, scope) {
                if (scope == null) {
                    scope = null;
                }
                var args = Ext.Array.slice(arguments, 2);
                return Deferred.reduce(fns, function(results, fn) {
                    if (!Ext.isFunction(fn)) {
                        throw new Error('Invalid parameter: expected a function.');
                    }
                    return Deferred.resolved(fn.apply(scope, args)).then(function(result) {
                        results.push(result);
                        return results;
                    });
                }, []);
            },
            some: function(promisesOrValues, howMany) {
                if (!(Ext.isArray(promisesOrValues) || ExtPromise.is(promisesOrValues))) {
                    Ext.raise('Invalid parameter: expected an Array or Promise of an Array.');
                }
                if (!Ext.isNumeric(howMany) || howMany <= 0) {
                    Ext.raise('Invalid parameter: expected a positive integer.');
                }
                return Deferred.resolved(promisesOrValues).then(function(promisesOrValues) {
                    var deferred, index, onReject, onResolve, promiseOrValue, remainingToReject, remainingToResolve, values, i, len;
                    values = [];
                    remainingToResolve = howMany;
                    remainingToReject = (promisesOrValues.length - remainingToResolve) + 1;
                    deferred = new Deferred();
                    if (promisesOrValues.length < howMany) {
                        deferred.reject(new Error('Too few Promises were resolved.'));
                    } else {
                        onResolve = function(value) {
                            if (remainingToResolve > 0) {
                                values.push(value);
                            }
                            remainingToResolve--;
                            if (remainingToResolve === 0) {
                                deferred.resolve(values);
                            }
                            return value;
                        };
                        onReject = function(reason) {
                            remainingToReject--;
                            if (remainingToReject === 0) {
                                deferred.reject(new Error('Too few Promises were resolved.'));
                            }
                            return reason;
                        };
                        for (index = i = 0 , len = promisesOrValues.length; i < len; index = ++i) {
                            promiseOrValue = promisesOrValues[index];
                            if (index in promisesOrValues) {
                                Deferred.resolved(promiseOrValue).then(onResolve, onReject);
                            }
                        }
                    }
                    return deferred.promise;
                });
            },
            timeout: function(promiseOrValue, milliseconds) {
                var deferred = new Deferred(),
                    timeoutId;
                timeoutId = setTimeout(function() {
                    if (timeoutId) {
                        deferred.reject(new Error('Promise timed out.'));
                    }
                }, milliseconds);
                Deferred.resolved(promiseOrValue).then(function(value) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                    deferred.resolve(value);
                }, function(reason) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                    deferred.reject(reason);
                });
                return deferred.promise;
            }
        }
    };
}, function(Deferred) {
    Deferred._ready();
});

Ext.Factory = function(type) {
    var me = this;
    me.aliasPrefix = type + '.';
    me.cache = {};
    me.name = type.replace(me.fixNameRe, me.fixNameFn);
    me.type = type;
};
Ext.Factory.prototype = {
    defaultProperty: 'type',
    instanceProp: 'isInstance',
    create: function(config, defaultType) {
        var me = this,
            Manager = Ext.ClassManager,
            cache = me.cache,
            alias, className, klass, suffix;
        if (config) {
            if (config[me.instanceProp]) {
                return config;
            }
            if (typeof config === 'string') {
                suffix = config;
                config = {};
                config[me.defaultProperty] = suffix;
            }
            className = config.xclass;
            suffix = config.type;
        }
        if (defaultType && defaultType.constructor === Object) {
            config = Ext.apply({}, config, defaultType);
            defaultType = defaultType.type;
        }
        if (className) {
            if (!(klass = Manager.get(className))) {
                return Manager.instantiate(className, config);
            }
        } else {
            if (!(suffix = suffix || defaultType || me.defaultType)) {
                klass = me.defaultClass;
            }
            if (!suffix && !klass) {
                Ext.raise('No type specified for ' + me.type + '.create');
            }
            if (!klass && !(klass = cache[suffix])) {
                alias = me.aliasPrefix + suffix;
                className = Manager.getNameByAlias(alias);
                if (!(klass = className && Manager.get(className))) {
                    return Manager.instantiateByAlias(alias, config);
                }
                cache[suffix] = klass;
            }
        }
        return klass.isInstance ? klass : new klass(config);
    },
    fixNameRe: /\.[a-z]/ig,
    fixNameFn: function(match) {
        return match.substring(1).toUpperCase();
    },
    clearCache: function() {
        this.cache = {};
    }
};
Ext.Factory.define = function(type, config) {
    var Factory = Ext.Factory,
        defaultClass, factory, fn;
    if (type.constructor === Object) {
        Ext.Object.each(type, Factory.define, Factory);
    } else {
        factory = new Ext.Factory(type);
        if (config) {
            if (config.constructor === Object) {
                Ext.apply(factory, config);
                if (typeof (defaultClass = factory.xclass) === 'string') {
                    factory.defaultClass = Ext.ClassManager.get(defaultClass);
                }
            } else {
                factory.defaultType = config;
            }
        }
        Factory[factory.name] = fn = factory.create.bind(factory);
        fn.instance = factory;
    }
    return fn;
};
Ext.define('Ext.mixin.Factoryable', {
    mixinId: 'factoryable',
    onClassMixedIn: function(targetClass) {
        var proto = targetClass.prototype,
            factoryConfig = proto.factoryConfig,
            alias = proto.alias,
            config = {},
            dot, createFn;
        alias = alias && alias.length && alias[0];
        if (alias && (dot = alias.lastIndexOf('.')) > 0) {
            config.type = alias.substring(0, dot);
            config.defaultType = alias.substring(dot + 1);
        }
        if (factoryConfig) {
            delete proto.factoryConfig;
            Ext.apply(config, factoryConfig);
        }
        createFn = Ext.Factory.define(config.type, config);
        if (targetClass.create === Ext.Base.create) {
            targetClass.create = createFn;
        }
    }
});

Ext.define('Ext.data.request.Base', {
    mixins: [
        Ext.mixin.Factoryable
    ],
    factoryConfig: {
        type: 'request',
        defaultType: 'ajax'
    },
    result: null,
    success: null,
    timer: null,
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config.options || {}, config.ownerConfig);
        me.id = ++Ext.data.Connection.requestId;
        me.owner = config.owner;
        me.options = config.options;
        me.requestOptions = config.requestOptions;
    },
    start: function() {
        var me = this,
            timeout = me.getTimeout();
        if (timeout && me.async) {
            me.timer = Ext.defer(me.onTimeout, timeout, me);
        }
    },
    abort: function() {
        var me = this;
        me.clearTimer();
        if (!me.timedout) {
            me.aborted = true;
        }
        me.abort = Ext.emptyFn;
    },
    createDeferred: function() {
        return (this.deferred = new Ext.Deferred());
    },
    getDeferred: function() {
        return this.deferred || this.createDeferred();
    },
    getPromise: function() {
        return this.getDeferred().promise;
    },
    then: function() {
        var promise = this.getPromise();
        return promise.then.apply(promise, arguments);
    },
    onComplete: function() {
        var me = this,
            deferred = me.deferred,
            result = me.result;
        me.clearTimer();
        if (deferred) {
            if (me.success) {
                deferred.resolve(result);
            } else {
                deferred.reject(result);
            }
        }
    },
    onTimeout: function() {
        var me = this;
        me.timedout = true;
        me.timer = null;
        me.abort(true);
    },
    getTimeout: function() {
        return this.timeout;
    },
    clearTimer: function() {
        var timer = this.timer;
        if (timer) {
            clearTimeout(timer);
            this.timer = null;
        }
    },
    destroy: function() {
        var me = this;
        me.abort();
        me.owner = me.options = me.requestOptions = me.result = null;
        me.callParent();
    },
    privates: {
        createException: function() {
            var me = this,
                result;
            result = {
                request: me,
                requestId: me.id,
                status: me.aborted ? -1 : 0,
                statusText: me.aborted ? 'transaction aborted' : 'communication failure',
                getResponseHeader: me._getHeader,
                getAllResponseHeaders: me._getHeaders
            };
            if (me.aborted) {
                result.aborted = true;
            }
            if (me.timedout) {
                result.timedout = true;
            }
            return result;
        },
        _getHeader: function(name) {
            var headers = this.headers;
            return headers && headers[name.toLowerCase()];
        },
        _getHeaders: function() {
            return this.headers;
        }
    }
});

Ext.define('Ext.data.flash.BinaryXhr', {
    statics: {
        flashPluginActivated: function() {
            Ext.data.flash.BinaryXhr.flashPluginActive = true;
            Ext.data.flash.BinaryXhr.flashPlugin = document.getElementById("ext-flash-polyfill");
            Ext.GlobalEvents.fireEvent("flashready");
        },
        flashPluginActive: false,
        flashPluginInjected: false,
        connectionIndex: 1,
        liveConnections: {},
        flashPlugin: null,
        onFlashStateChange: function(javascriptId, state, data) {
            var connection;
            connection = this.liveConnections[Number(javascriptId)];
            if (connection) {
                connection.onFlashStateChange(state, data);
            } else {
                Ext.warn.log("onFlashStateChange for unknown connection ID: " + javascriptId);
            }
        },
        registerConnection: function(conn) {
            var i = this.connectionIndex;
            this.conectionIndex = this.connectionIndex + 1;
            this.liveConnections[i] = conn;
            return i;
        },
        injectFlashPlugin: function() {
            var me = this,
                flashLoaderPath, flashObjectPath;
            me.flashPolyfillEl = Ext.getBody().appendChild({
                id: 'ext-flash-polyfill',
                cn: [
                    {
                        tag: 'p',
                        html: 'To view this page ensure that Adobe Flash Player version 11.1.0 or greater is installed.'
                    },
                    {
                        tag: 'a',
                        href: 'http://www.adobe.com/go/getflashplayer',
                        cn: [
                            {
                                tag: 'img',
                                src: window.location.protocol + '//www.adobe.com/images/shared/download_buttons/get_flash_player.gif',
                                alt: 'Get Adobe Flash player'
                            }
                        ]
                    }
                ]
            });
            flashLoaderPath = [
                Ext.Loader.getPath('Ext.data.Connection'),
                '../../../plugins/flash/swfobject.js'
            ].join('/');
            flashObjectPath = "/plugins/flash/FlashPlugin.swf";
            flashObjectPath = [
                Ext.Loader.getPath('Ext.data.Connection'),
                '../../plugins/flash/FlashPlugin.swf'
            ].join('/');
            if (Ext.flashPluginPath) {
                flashObjectPath = Ext.flashPluginPath;
            }
            Ext.Loader.loadScript({
                url: flashLoaderPath,
                onLoad: function() {
                    var swfVersionStr = "11.4.0";
                    var xiSwfUrlStr = "playerProductInstall.swf";
                    var flashvars = {};
                    var params = {};
                    params.quality = "high";
                    params.bgcolor = "#ffffff";
                    params.allowscriptaccess = "sameDomain";
                    params.allowfullscreen = "true";
                    var attributes = {};
                    attributes.id = "ext-flash-polyfill";
                    attributes.name = "polyfill";
                    attributes.align = "middle";
                    swfobject.embedSWF(flashObjectPath, "ext-flash-polyfill", "0", "0", swfVersionStr, xiSwfUrlStr, flashvars, params, attributes);
                },
                onError: function() {
                    Ext.raise("Could not load flash-loader file swfobject.js from " + flashLoader);
                },
                scope: me
            });
            Ext.data.flash.BinaryXhr.flashPluginInjected = true;
        }
    },
    readyState: 0,
    status: 0,
    statusText: "",
    responseBytes: null,
    javascriptId: null,
    constructor: function(config) {
        if (!Ext.data.flash.BinaryXhr.flashPluginInjected) {
            Ext.data.flash.BinaryXhr.injectFlashPlugin();
        }
        var me = this;
        Ext.apply(me, config);
        me.requestHeaders = {};
    },
    abort: function() {
        var me = this;
        if (me.readyState == 4) {
            Ext.warn.log("Aborting a connection that's completed its transfer: " + this.url);
            return;
        }
        me.aborted = true;
        if (!Ext.data.flash.BinaryXhr.flashPluginActive) {
            Ext.GlobalEvents.removeListener("flashready", me.onFlashReady, me);
            return;
        }
        Ext.data.flash.BinaryXhr.flashPlugin.abortRequest(me.javascriptId);
        delete Ext.data.flash.BinaryXhr.liveConnections[me.javascriptId];
    },
    getAllResponseHeaders: function() {
        var headers = [];
        Ext.Object.each(this.responseHeaders, function(name, value) {
            headers.push(name + ': ' + value);
        });
        return headers.join('\r\n');
    },
    getResponseHeader: function(header) {
        var headers = this.responseHeaders;
        return (headers && headers[header]) || null;
    },
    open: function(method, url, async, user, password) {
        var me = this;
        me.method = method;
        me.url = url;
        me.async = async !== false;
        me.user = user;
        me.password = password;
        if (!me.async) {
            Ext.raise("Binary posts are only supported in async mode: " + url);
        }
        if (me.method != "POST") {
            Ext.log.warn("Binary data can only be sent as a POST request: " + url);
        }
    },
    overrideMimeType: function(mimeType) {
        this.mimeType = mimeType;
    },
    send: function(body) {
        var me = this;
        me.body = body;
        if (!Ext.data.flash.BinaryXhr.flashPluginActive) {
            Ext.GlobalEvents.addListener("flashready", me.onFlashReady, me);
        } else {
            this.onFlashReady();
        }
    },
    onFlashReady: function() {
        var me = this,
            req, status;
        me.javascriptId = Ext.data.flash.BinaryXhr.registerConnection(me);
        req = {
            method: me.method,
            url: me.url,
            user: me.user,
            password: me.password,
            mimeType: me.mimeType,
            requestHeaders: me.requestHeaders,
            body: me.body,
            javascriptId: me.javascriptId
        };
        status = Ext.data.flash.BinaryXhr.flashPlugin.postBinary(req);
    },
    setReadyState: function(state) {
        var me = this;
        if (me.readyState != state) {
            me.readyState = state;
            me.onreadystatechange();
        }
    },
    setRequestHeader: function(header, value) {
        this.requestHeaders[header] = value;
    },
    onreadystatechange: Ext.emptyFn,
    parseData: function(data) {
        var me = this;
        this.status = data.status || 0;
        me.responseHeaders = {};
        if (me.mimeType) {
            me.responseHeaders["content-type"] = me.mimeType;
        }
        if (data.reason == "complete") {
            this.responseBytes = data.data;
            me.responseHeaders["content-length"] = data.data.length;
        } else if (data.reason == "error" || data.reason == "securityError") {
            this.statusText = data.text;
            me.responseHeaders["content-length"] = 0;
        } else {
            Ext.raise("Unkown reason code in data: " + data.reason);
        }
    },
    onFlashStateChange: function(state, data) {
        var me = this;
        if (state == 4) {
            me.parseData(data);
            delete Ext.data.flash.BinaryXhr.liveConnections[me.javascriptId];
        }
        me.setReadyState(state);
    }
});

Ext.define('Ext.data.request.Ajax', {
    extend: Ext.data.request.Base,
    alias: 'request.ajax',
    statics: {
        parseStatus: function(status, response) {
            var len;
            if (response) {
                if (response.responseType === 'arraybuffer') {
                    len = response.byteLength;
                } else if (response.responseText) {
                    len = response.responseText.length;
                }
            }
            status = status == 1223 ? 204 : status;
            var success = (status >= 200 && status < 300) || status == 304 || (status == 0 && Ext.isNumber(len)),
                isException = false;
            if (!success) {
                switch (status) {
                    case 12002:
                    case 12029:
                    case 12030:
                    case 12031:
                    case 12152:
                    case 13030:
                        isException = true;
                        break;
                }
            }
            return {
                success: success,
                isException: isException
            };
        }
    },
    start: function(data) {
        var me = this,
            options = me.options,
            requestOptions = me.requestOptions,
            isXdr = me.isXdr,
            xhr, headers;
        xhr = me.xhr = me.openRequest(options, requestOptions, me.async, me.username, me.password);
        if (!isXdr) {
            headers = me.setupHeaders(xhr, options, requestOptions.data, requestOptions.params);
        }
        if (me.async) {
            if (!isXdr) {
                xhr.onreadystatechange = Ext.Function.bind(me.onStateChange, me);
            }
        }
        if (isXdr) {
            me.processXdrRequest(me, xhr);
        }
        me.callParent([
            data
        ]);
        xhr.send(data);
        if (!me.async) {
            return me.onComplete();
        }
        return me;
    },
    abort: function(force) {
        var me = this,
            xhr = me.xhr;
        if (force || me.isLoading()) {
            try {
                xhr.onreadystatechange = null;
            } catch (e) {
                xhr.onreadystatechange = Ext.emptyFn;
            }
            xhr.abort();
            me.callParent([
                force
            ]);
            me.onComplete();
            me.cleanup();
        }
    },
    cleanup: function() {
        this.xhr = null;
        delete this.xhr;
    },
    isLoading: function() {
        var me = this,
            xhr = me.xhr,
            state = xhr && xhr.readyState,
            C = Ext.data.flash && Ext.data.flash.BinaryXhr;
        if (!xhr || me.aborted || me.timedout) {
            return false;
        }
        if (C && xhr instanceof C) {
            return state !== 4;
        }
        return state !== 0 && state !== 4;
    },
    openRequest: function(options, requestOptions, async, username, password) {
        var me = this,
            xhr = me.newRequest(options);
        if (username) {
            xhr.open(requestOptions.method, requestOptions.url, async, username, password);
        } else {
            if (me.isXdr) {
                xhr.open(requestOptions.method, requestOptions.url);
            } else {
                xhr.open(requestOptions.method, requestOptions.url, async);
            }
        }
        if (options.binary || me.binary) {
            if (window.Uint8Array) {
                xhr.responseType = 'arraybuffer';
            } else if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            else if (!Ext.isIE) {
                Ext.log.warn("Your browser does not support loading binary data using Ajax.");
            }
        }
        if (options.withCredentials || me.withCredentials) {
            xhr.withCredentials = true;
        }
        return xhr;
    },
    newRequest: function(options) {
        var me = this,
            xhr;
        if (options.binaryData) {
            if (window.Uint8Array) {
                xhr = me.getXhrInstance();
            } else {
                xhr = new Ext.data.flash.BinaryXhr();
            }
        } else if (me.cors && Ext.isIE9m) {
            xhr = me.getXdrInstance();
            me.isXdr = true;
        } else {
            xhr = me.getXhrInstance();
            me.isXdr = false;
        }
        return xhr;
    },
    setupHeaders: function(xhr, options, data, params) {
        var me = this,
            headers = Ext.apply({}, options.headers || {}, me.defaultHeaders),
            contentType = me.defaultPostHeader,
            jsonData = options.jsonData,
            xmlData = options.xmlData,
            type = 'Content-Type',
            useHeader = me.useDefaultXhrHeader,
            key, header;
        if (!headers.hasOwnProperty(type) && (data || params)) {
            if (data) {
                if (options.rawData) {
                    contentType = 'text/plain';
                } else {
                    if (xmlData && Ext.isDefined(xmlData)) {
                        contentType = 'text/xml';
                    } else if (jsonData && Ext.isDefined(jsonData)) {
                        contentType = 'application/json';
                    }
                }
            }
            headers[type] = contentType;
        }
        if (useHeader && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = me.defaultXhrHeader;
        }
        if (headers[type] === undefined || headers[type] === null) {
            delete headers[type];
        }
        try {
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    header = headers[key];
                    xhr.setRequestHeader(key, header);
                }
            }
        } catch (e) {
            me.owner.fireEvent('exception', key, header);
        }
        return headers;
    },
    getXdrInstance: function() {
        var xdr;
        if (Ext.ieVersion >= 8) {
            xdr = new XDomainRequest();
        } else {
            Ext.raise({
                msg: 'Your browser does not support CORS'
            });
        }
        return xdr;
    },
    getXhrInstance: (function() {
        var options = [
                function() {
                    return new XMLHttpRequest();
                },
                function() {
                    return new ActiveXObject('MSXML2.XMLHTTP.3.0');
                },
                function() {
                    return new ActiveXObject('MSXML2.XMLHTTP');
                },
                function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ],
            i = 0,
            len = options.length,
            xhr;
        for (; i < len; ++i) {
            try {
                xhr = options[i];
                xhr();
                break;
            } catch (e) {}
        }
        return xhr;
    }()),
    processXdrRequest: function(request, xhr) {
        var me = this;
        delete request.headers;
        request.contentType = request.options.contentType || me.defaultXdrContentType;
        xhr.onload = Ext.Function.bind(me.onStateChange, me, [
            true
        ]);
        xhr.onerror = xhr.ontimeout = Ext.Function.bind(me.onStateChange, me, [
            false
        ]);
    },
    processXdrResponse: function(response, xhr) {
        response.getAllResponseHeaders = function() {
            return [];
        };
        response.getResponseHeader = function() {
            return '';
        };
        response.contentType = xhr.contentType || this.defaultXdrContentType;
    },
    onStateChange: function(xdrResult) {
        var me = this,
            xhr = me.xhr,
            globalEvents = Ext.GlobalEvents;
        if ((xhr && xhr.readyState == 4) || me.isXdr) {
            me.clearTimer();
            me.onComplete(xdrResult);
            me.cleanup();
            if (globalEvents.hasListeners.idle) {
                globalEvents.fireEvent('idle');
            }
        }
    },
    onComplete: function(xdrResult) {
        var me = this,
            owner = me.owner,
            options = me.options,
            xhr = me.xhr,
            failure = {
                success: false,
                isException: false
            },
            result, success, response;
        if (!xhr || me.destroyed) {
            return me.result = failure;
        }
        try {
            result = Ext.data.request.Ajax.parseStatus(xhr.status, xhr);
            if (result.success) {
                result.success = xhr.readyState === 4;
            }
        } catch (e) {
            result = failure;
        }
        success = me.success = me.isXdr ? xdrResult : result.success;
        if (success) {
            response = me.createResponse(xhr);
            if (owner.hasListeners.requestcomplete) {
                owner.fireEvent('requestcomplete', owner, response, options);
            }
            if (options.success) {
                Ext.callback(options.success, options.scope, [
                    response,
                    options
                ]);
            }
        } else {
            if (result.isException || me.aborted || me.timedout) {
                response = me.createException(xhr);
            } else {
                response = me.createResponse(xhr);
            }
            if (owner.hasListeners.requestexception) {
                owner.fireEvent('requestexception', owner, response, options);
            }
            if (options.failure) {
                Ext.callback(options.failure, options.scope, [
                    response,
                    options
                ]);
            }
        }
        me.result = response;
        if (options.callback) {
            Ext.callback(options.callback, options.scope, [
                options,
                success,
                response
            ]);
        }
        owner.onRequestComplete(me);
        me.callParent([
            xdrResult
        ]);
        return response;
    },
    createResponse: function(xhr) {
        var me = this,
            isXdr = me.isXdr,
            headers = {},
            lines = isXdr ? [] : xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, response, byteArray;
        while (count--) {
            line = lines[count];
            index = line.indexOf(':');
            if (index >= 0) {
                key = line.substr(0, index).toLowerCase();
                if (line.charAt(index + 1) == ' ') {
                    ++index;
                }
                headers[key] = line.substr(index + 1);
            }
        }
        response = {
            request: me,
            requestId: me.id,
            status: xhr.status,
            statusText: xhr.statusText,
            getResponseHeader: function(header) {
                return headers[header.toLowerCase()];
            },
            getAllResponseHeaders: function() {
                return headers;
            }
        };
        if (isXdr) {
            me.processXdrResponse(response, xhr);
        }
        if (me.binary) {
            response.responseBytes = me.getByteArray(xhr);
        } else {
            response.responseText = xhr.responseText;
            response.responseXML = xhr.responseXML;
        }
        return response;
    },
    destroy: function() {
        this.xhr = null;
        this.callParent();
    },
    privates: {
        getByteArray: function(xhr) {
            var response = xhr.response,
                responseBody = xhr.responseBody,
                Cls = Ext.data.flash && Ext.data.flash.BinaryXhr,
                byteArray, responseText, len, i;
            if (xhr instanceof Cls) {
                byteArray = xhr.responseBytes;
            } else if (window.Uint8Array) {
                byteArray = response ? new Uint8Array(response) : [];
            } else if (Ext.isIE9p) {
                try {
                    byteArray = new VBArray(responseBody).toArray();
                } catch (e) {
                    byteArray = [];
                }
            } else if (Ext.isIE) {
                if (!this.self.vbScriptInjected) {
                    this.injectVBScript();
                }
                getIEByteArray(xhr.responseBody, byteArray = []);
            } else {
                byteArray = [];
                responseText = xhr.responseText;
                len = responseText.length;
                for (i = 0; i < len; i++) {
                    byteArray.push(responseText.charCodeAt(i) & 255);
                }
            }
            return byteArray;
        },
        injectVBScript: function() {
            var scriptTag = document.createElement('script');
            scriptTag.type = 'text/vbscript';
            scriptTag.text = [
                'Function getIEByteArray(byteArray, out)',
                'Dim len, i',
                'len = LenB(byteArray)',
                'For i = 1 to len',
                'out.push(AscB(MidB(byteArray, i, 1)))',
                'Next',
                'End Function'
            ].join('\n');
            Ext.getHead().dom.appendChild(scriptTag);
            this.self.vbScriptInjected = true;
        }
    }
});

Ext.define('Ext.data.request.Form', {
    extend: Ext.data.request.Base,
    alias: 'request.form',
    start: function(data) {
        var me = this,
            options = me.options,
            requestOptions = me.requestOptions;
        me.callParent([
            data
        ]);
        me.form = me.upload(options.form, requestOptions.url, requestOptions.data, options);
        return me;
    },
    abort: function(force) {
        var me = this,
            frame;
        if (me.isLoading()) {
            try {
                frame = me.frame.dom;
                if (frame.stop) {
                    frame.stop();
                } else {
                    frame.document.execCommand('Stop');
                }
            } catch (e) {}
        }
        me.callParent([
            force
        ]);
        me.onComplete();
        me.cleanup();
    },
    cleanup: function() {
        var me = this,
            frame = me.frame;
        if (frame) {
            frame.un('load', me.onComplete, me);
            Ext.removeNode(frame);
        }
        me.frame = me.form = null;
    },
    isLoading: function() {
        return !!this.frame;
    },
    upload: function(form, url, params, options) {
        form = Ext.getDom(form);
        options = options || {};
        var frameDom = document.createElement('iframe'),
            frame = Ext.get(frameDom),
            id = frame.id,
            hiddens = [],
            encoding = 'multipart/form-data',
            buf = {
                target: form.target,
                method: form.method,
                encoding: form.encoding,
                enctype: form.enctype,
                action: form.action
            },
            addField = function(name, value) {
                hiddenItem = document.createElement('input');
                Ext.fly(hiddenItem).set({
                    type: 'hidden',
                    value: value,
                    name: name
                });
                form.appendChild(hiddenItem);
                hiddens.push(hiddenItem);
            },
            hiddenItem, obj, value, name, vLen, v, hLen, h, request;
        frame.set({
            name: id,
            cls: Ext.baseCSSPrefix + 'hidden-display',
            src: Ext.SSL_SECURE_URL,
            tabIndex: -1
        });
        document.body.appendChild(frameDom);
        if (document.frames) {
            document.frames[id].name = id;
        }
        Ext.fly(form).set({
            target: id,
            method: 'POST',
            enctype: encoding,
            encoding: encoding,
            action: url || buf.action
        });
        if (params) {
            obj = Ext.Object.fromQueryString(params) || {};
            for (name in obj) {
                if (obj.hasOwnProperty(name)) {
                    value = obj[name];
                    if (Ext.isArray(value)) {
                        vLen = value.length;
                        for (v = 0; v < vLen; v++) {
                            addField(name, value[v]);
                        }
                    } else {
                        addField(name, value);
                    }
                }
            }
        }
        this.frame = frame;
        frame.on({
            load: this.onComplete,
            scope: this,
            single: !Ext.isOpera
        });
        form.submit();
        Ext.fly(form).set(buf);
        for (hLen = hiddens.length , h = 0; h < hLen; h++) {
            Ext.removeNode(hiddens[h]);
        }
        return form;
    },
    getDoc: function() {
        var frame = this.frame.dom;
        return (frame && (frame.contentWindow.document || frame.contentDocument)) || (window.frames[frame.id] || {}).document;
    },
    getTimeout: function() {
        return this.options.timeout;
    },
    onComplete: function() {
        var me = this,
            frame = me.frame,
            owner = me.owner,
            options = me.options,
            callback, doc, success, contentNode, response;
        if (!frame) {
            return;
        }
        if (me.aborted || me.timedout) {
            me.result = response = me.createException();
            response.responseXML = null;
            response.responseText = '{success:false,message:"' + Ext.String.trim(response.statusText) + '"}';
            response.request = me;
            callback = options.failure;
            success = false;
        } else {
            try {
                doc = me.getDoc();
                me.result = response = {
                    responseText: '',
                    responseXML: null,
                    request: me
                };
                if (doc) {
                    if (Ext.isOpera && doc.location == Ext.SSL_SECURE_URL) {
                        return;
                    }
                    if (doc.body) {
                        if ((contentNode = doc.body.firstChild) && /pre/i.test(contentNode.tagName)) {
                            response.responseText = contentNode.textContent || contentNode.innerText;
                        }
                        else if ((contentNode = doc.getElementsByTagName('textarea')[0])) {
                            response.responseText = contentNode.value;
                        } else {
                            response.responseText = doc.body.textContent || doc.body.innerText;
                        }
                    }
                    response.responseXML = doc.XMLDocument || doc;
                    callback = options.success;
                    success = true;
                    response.status = 200;
                } else {
                    Ext.raise("Could not acquire a suitable connection for the file upload service.");
                }
            } catch (e) {
                me.result = response = me.createException();
                response.status = 400;
                response.statusText = (e.message || e.description) + '';
                response.responseText = '{success:false,message:"' + Ext.String.trim(response.statusText) + '"}';
                response.responseXML = null;
                callback = options.failure;
                success = false;
            }
        }
        me.frame = null;
        me.success = success;
        owner.fireEvent(success ? 'requestcomplete' : 'requestexception', owner, response, options);
        Ext.callback(callback, options.scope, [
            response,
            options
        ]);
        Ext.callback(options.callback, options.scope, [
            options,
            success,
            response
        ]);
        owner.onRequestComplete(me);
        Ext.asap(frame.destroy, frame);
        me.callParent();
    },
    destroy: function() {
        this.cleanup();
        this.callParent();
    }
});

Ext.define('Ext.data.Connection', {
    mixins: {
        observable: Ext.mixin.Observable
    },
    statics: {
        requestId: 0
    },
    enctypeRe: /multipart\/form-data/i,
    config: {
        url: null,
        async: true,
        username: '',
        password: '',
        disableCaching: true,
        withCredentials: false,
        binary: false,
        cors: false,
        isXdr: false,
        defaultXdrContentType: 'text/plain',
        disableCachingParam: '_dc',
        timeout: 30000,
        extraParams: null,
        autoAbort: false,
        method: null,
        defaultHeaders: null,
        defaultPostHeader: 'application/x-www-form-urlencoded; charset=UTF-8',
        useDefaultXhrHeader: true,
        defaultXhrHeader: 'XMLHttpRequest'
    },
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.requests = {};
    },
    request: function(options) {
        options = options || {};
        var me = this,
            requestOptions, request;
        if (me.fireEvent('beforerequest', me, options) !== false) {
            requestOptions = me.setOptions(options, options.scope || Ext.global);
            request = me.createRequest(options, requestOptions);
            return request.start(requestOptions.data);
        }
        Ext.callback(options.callback, options.scope, [
            options,
            undefined,
            undefined
        ]);
        return Ext.Deferred.rejected([
            options,
            undefined,
            undefined
        ]);
    },
    createRequest: function(options, requestOptions) {
        var me = this,
            type = options.type || requestOptions.type,
            request;
        if (!type) {
            type = me.isFormUpload(options) ? 'form' : 'ajax';
        }
        if (options.autoAbort || me.getAutoAbort()) {
            me.abort();
        }
        request = Ext.Factory.request({
            type: type,
            owner: me,
            options: options,
            requestOptions: requestOptions,
            ownerConfig: me.getConfig()
        });
        me.requests[request.id] = request;
        me.latestId = request.id;
        return request;
    },
    isFormUpload: function(options) {
        var form = this.getForm(options);
        if (form) {
            return options.isUpload || this.enctypeRe.test(form.getAttribute('enctype'));
        }
        return false;
    },
    getForm: function(options) {
        return Ext.getDom(options.form);
    },
    setOptions: function(options, scope) {
        var me = this,
            params = options.params || {},
            extraParams = me.getExtraParams(),
            urlParams = options.urlParams,
            url = options.url || me.getUrl(),
            cors = options.cors,
            jsonData = options.jsonData,
            method, disableCache, data;
        if (cors !== undefined) {
            me.setCors(cors);
        }
        if (Ext.isFunction(params)) {
            params = params.call(scope, options);
        }
        if (Ext.isFunction(url)) {
            url = url.call(scope, options);
        }
        url = this.setupUrl(options, url);
        if (!url) {
            Ext.raise({
                options: options,
                msg: 'No URL specified'
            });
        }
        data = options.rawData || options.binaryData || options.xmlData || jsonData || null;
        if (jsonData && !Ext.isPrimitive(jsonData)) {
            data = Ext.encode(data);
        }
        if (options.binaryData) {
            if (!Ext.isArray(options.binaryData)) {
                Ext.log.warn("Binary submission data must be an array of byte values! Instead got " + typeof (options.binaryData));
            }
            if (me.nativeBinaryPostSupport()) {
                data = (new Uint8Array(options.binaryData));
                if ((Ext.isChrome && Ext.chromeVersion < 22) || Ext.isSafari || Ext.isGecko) {
                    data = data.buffer;
                }
            }
        }
        if (Ext.isObject(params)) {
            params = Ext.Object.toQueryString(params);
        }
        if (Ext.isObject(extraParams)) {
            extraParams = Ext.Object.toQueryString(extraParams);
        }
        params = params + ((extraParams) ? ((params) ? '&' : '') + extraParams : '');
        urlParams = Ext.isObject(urlParams) ? Ext.Object.toQueryString(urlParams) : urlParams;
        params = this.setupParams(options, params);
        method = (options.method || me.getMethod() || ((params || data) ? 'POST' : 'GET')).toUpperCase();
        this.setupMethod(options, method);
        disableCache = options.disableCaching !== false ? (options.disableCaching || me.getDisableCaching()) : false;
        if (method === 'GET' && disableCache) {
            url = Ext.urlAppend(url, (options.disableCachingParam || me.getDisableCachingParam()) + '=' + (new Date().getTime()));
        }
        if ((method == 'GET' || data) && params) {
            url = Ext.urlAppend(url, params);
            params = null;
        }
        if (urlParams) {
            url = Ext.urlAppend(url, urlParams);
        }
        return {
            url: url,
            method: method,
            data: data || params || null
        };
    },
    setupUrl: function(options, url) {
        var form = this.getForm(options);
        if (form) {
            url = url || form.action;
        }
        return url;
    },
    setupParams: function(options, params) {
        var form = this.getForm(options),
            serializedForm;
        if (form && !this.isFormUpload(options)) {
            serializedForm = Ext.Element.serializeForm(form);
            params = params ? (params + '&' + serializedForm) : serializedForm;
        }
        return params;
    },
    setupMethod: function(options, method) {
        if (this.isFormUpload(options)) {
            return 'POST';
        }
        return method;
    },
    isLoading: function(request) {
        if (!request) {
            request = this.getLatest();
        }
        return request ? request.isLoading() : false;
    },
    abort: function(request) {
        if (!request) {
            request = this.getLatest();
        }
        if (request && request.isLoading()) {
            request.abort();
        }
    },
    abortAll: function() {
        var requests = this.requests,
            id;
        for (id in requests) {
            this.abort(requests[id]);
        }
    },
    getLatest: function() {
        var id = this.latestId,
            request;
        if (id) {
            request = this.requests[id];
        }
        return request || null;
    },
    clearTimeout: function(request) {
        if (!request) {
            request = this.getLatest();
        }
        if (request) {
            request.clearTimer();
        }
    },
    onRequestComplete: function(request) {
        delete this.requests[request.id];
    },
    nativeBinaryPostSupport: function() {
        return Ext.isChrome || (Ext.isSafari && Ext.isDefined(window.Uint8Array)) || (Ext.isGecko && Ext.isDefined(window.Uint8Array));
    }
});

Ext.define('Ext.Ajax', {
    extend: Ext.data.Connection,
    singleton: true,
    autoAbort: false
});

Ext.define('Ext.AnimationQueue', {
    singleton: true,
    constructor: function() {
        var me = this;
        me.queue = [];
        me.taskQueue = [];
        me.runningQueue = [];
        me.idleQueue = [];
        me.isRunning = false;
        me.isIdle = true;
        me.run = Ext.Function.bind(me.run, me);
        if (Ext.os.is.iOS) {
            Ext.interval(me.watch, 500, me);
        }
    },
    start: function(fn, scope, args) {
        var me = this;
        me.queue.push(arguments);
        if (!me.isRunning) {
            if (me.hasOwnProperty('idleTimer')) {
                clearTimeout(me.idleTimer);
                delete me.idleTimer;
            }
            if (me.hasOwnProperty('idleQueueTimer')) {
                clearTimeout(me.idleQueueTimer);
                delete me.idleQueueTimer;
            }
            me.isIdle = false;
            me.isRunning = true;
            me.startCountTime = Ext.now();
            me.count = 0;
            me.doStart();
        }
    },
    watch: function() {
        if (this.isRunning && Ext.now() - this.lastRunTime >= 500) {
            this.run();
        }
    },
    run: function() {
        var me = this;
        if (!me.isRunning) {
            return;
        }
        var queue = me.runningQueue,
            now = Ext.now(),
            i, ln;
        me.lastRunTime = now;
        me.frameStartTime = now;
        queue.push.apply(queue, me.queue);
        for (i = 0 , ln = queue.length; i < ln; i++) {
            me.invoke(queue[i]);
        }
        queue.length = 0;
        var elapse = me.frameStartTime - me.startCountTime,
            count = ++me.count;
        if (elapse >= 200) {
            me.onFpsChanged(count * 1000 / elapse, count, elapse);
            me.startCountTime = me.frameStartTime;
            me.count = 0;
        }
        me.doIterate();
    },
    onFpsChanged: Ext.emptyFn,
    onStop: Ext.emptyFn,
    doStart: function() {
        this.animationFrameId = Ext.Function.requestAnimationFrame(this.run);
        this.lastRunTime = Ext.now();
    },
    doIterate: function() {
        this.animationFrameId = Ext.Function.requestAnimationFrame(this.run);
    },
    doStop: function() {
        Ext.Function.cancelAnimationFrame(this.animationFrameId);
    },
    stop: function(fn, scope, args) {
        var me = this;
        if (!me.isRunning) {
            return;
        }
        var queue = me.queue,
            ln = queue.length,
            i, item;
        for (i = 0; i < ln; i++) {
            item = queue[i];
            if (item[0] === fn && item[1] === scope && item[2] === args) {
                queue.splice(i, 1);
                i--;
                ln--;
            }
        }
        if (ln === 0) {
            me.doStop();
            me.onStop();
            me.isRunning = false;
            me.idleTimer = Ext.defer(me.whenIdle, 100, me);
        }
    },
    onIdle: function(fn, scope, args) {
        var listeners = this.idleQueue,
            i, ln, listener;
        for (i = 0 , ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                return;
            }
        }
        listeners.push(arguments);
        if (this.isIdle) {
            this.processIdleQueue();
        }
    },
    unIdle: function(fn, scope, args) {
        var listeners = this.idleQueue,
            i, ln, listener;
        for (i = 0 , ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                listeners.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    queueTask: function(fn, scope, args) {
        this.taskQueue.push(arguments);
        this.processTaskQueue();
    },
    dequeueTask: function(fn, scope, args) {
        var listeners = this.taskQueue,
            i, ln, listener;
        for (i = 0 , ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                listeners.splice(i, 1);
                i--;
                ln--;
            }
        }
    },
    invoke: function(listener) {
        var fn = listener[0],
            scope = listener[1],
            args = listener[2];
        fn = (typeof fn == 'string' ? scope[fn] : fn);
        if (Ext.isArray(args)) {
            fn.apply(scope, args);
        } else {
            fn.call(scope, args);
        }
    },
    whenIdle: function() {
        this.isIdle = true;
        this.processIdleQueue();
    },
    processIdleQueue: function() {
        if (!this.hasOwnProperty('idleQueueTimer')) {
            this.idleQueueTimer = Ext.defer(this.processIdleQueueItem, 1, this);
        }
    },
    processIdleQueueItem: function() {
        delete this.idleQueueTimer;
        if (!this.isIdle) {
            return;
        }
        var listeners = this.idleQueue,
            listener;
        if (listeners.length > 0) {
            listener = listeners.shift();
            this.invoke(listener);
            this.processIdleQueue();
        }
    },
    processTaskQueue: function() {
        if (!this.hasOwnProperty('taskQueueTimer')) {
            this.taskQueueTimer = Ext.defer(this.processTaskQueueItem, 15, this);
        }
    },
    processTaskQueueItem: function() {
        delete this.taskQueueTimer;
        var listeners = this.taskQueue,
            listener;
        if (listeners.length > 0) {
            listener = listeners.shift();
            this.invoke(listener);
            this.processTaskQueue();
        }
    },
    showFps: function() {
        var styleTpl = {
                color: 'white',
                'background-color': 'black',
                'text-align': 'center',
                'font-family': 'sans-serif',
                'font-size': '8px',
                'font-weight': 'normal',
                'font-style': 'normal',
                'line-height': '20px',
                '-webkit-font-smoothing': 'antialiased',
                'zIndex': 100000,
                position: 'absolute'
            };
        Ext.getBody().append([
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: 0,
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Average'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'red',
                    'font-size': '18px',
                    'line-height': '50px',
                    bottom: 0,
                    left: 0,
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__averageFps',
                html: '0'
            },
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '50px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Min (Last 1k)'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'orange',
                    'font-size': '18px',
                    'line-height': '50px',
                    bottom: 0,
                    left: '50px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__minFps',
                html: '0'
            },
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '100px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Max (Last 1k)'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'maroon',
                    'font-size': '18px',
                    'line-height': '50px',
                    bottom: 0,
                    left: '100px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__maxFps',
                html: '0'
            },
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '150px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Current'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'green',
                    'font-size': '18px',
                    'line-height': '50px',
                    bottom: 0,
                    left: '150px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__currentFps',
                html: '0'
            }
        ]);
        Ext.AnimationQueue.resetFps();
    },
    resetFps: function() {
        var currentFps = Ext.get('__currentFps'),
            averageFps = Ext.get('__averageFps'),
            minFps = Ext.get('__minFps'),
            maxFps = Ext.get('__maxFps'),
            min = 1000,
            max = 0,
            count = 0,
            sum = 0;
        if (!currentFps) {
            return;
        }
        Ext.AnimationQueue.onFpsChanged = function(fps) {
            count++;
            if (!(count % 10)) {
                min = 1000;
                max = 0;
            }
            sum += fps;
            min = Math.min(min, fps);
            max = Math.max(max, fps);
            currentFps.setHtml(Math.round(fps));
            averageFps.setHtml(Math.round(sum / count));
            minFps.setHtml(Math.round(min));
            maxFps.setHtml(Math.round(max));
        };
    }
}, function() {
    var paramsString = window.location.search.substr(1),
        paramsArray = paramsString.split("&");
    if (Ext.Array.contains(paramsArray, "showfps")) {
        Ext.onReady(Ext.Function.bind(this.showFps, this));
    }
});

Ext.define('Ext.ComponentManager', {
    alternateClassName: 'Ext.ComponentMgr',
    singleton: true,
    count: 0,
    typeName: 'xtype',
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config || {});
        me.all = {};
        me.references = {};
        me.onAvailableCallbacks = {};
    },
    create: function(config, defaultType) {
        if (typeof config === 'string') {
            return Ext.widget(config);
        }
        if (config.isComponent) {
            return config;
        }
        if ('xclass' in config) {
            return Ext.create(config.xclass, config);
        }
        return Ext.widget(config.xtype || defaultType, config);
    },
    get: function(id) {
        return this.all[id];
    },
    register: function(component) {
        var me = this,
            all = me.all,
            key = component.getId(),
            onAvailableCallbacks = me.onAvailableCallbacks;
        if (key === undefined) {
            Ext.raise('Component id is undefined. Please ensure the component has an id.');
        }
        if (key in all) {
            Ext.raise('Registering duplicate component id "' + key + '"');
        }
        all[key] = component;
        if (component.getReference && component.getReference()) {
            me.references[key] = component;
        }
        ++me.count;
        if (!me.hasFocusListener) {
            Ext.on('focus', me.onGlobalFocus, me);
            me.hasFocusListener = true;
        }
        onAvailableCallbacks = onAvailableCallbacks && onAvailableCallbacks[key];
        if (onAvailableCallbacks && onAvailableCallbacks.length) {
            me.notifyAvailable(component);
        }
    },
    unregister: function(component) {
        var id = component.getId();
        if (component.getReference && component.getReference()) {
            this.references[id] = null;
            delete this.references[id];
        }
        this.all[id] = null;
        delete this.all[id];
        this.count--;
    },
    markReferencesDirty: function() {
        this.referencesDirty = true;
    },
    fixReferences: function() {
        var me = this,
            references = me.references,
            key;
        if (me.referencesDirty) {
            for (key in references) {
                if (references.hasOwnProperty(key)) {
                    references[key].fixReference();
                }
            }
            me.referencesDirty = false;
        }
    },
    onAvailable: function(id, fn, scope) {
        var me = this,
            callbacks = me.onAvailableCallbacks,
            all = me.all,
            item;
        if (id in all) {
            item = all[id];
            fn.call(scope || item, item);
        } else if (id) {
            if (!Ext.isArray(callbacks[id])) {
                callbacks[id] = [];
            }
            callbacks[id].push(function(item) {
                fn.call(scope || item, item);
            });
        }
    },
    notifyAvailable: function(item) {
        var callbacks = this.onAvailableCallbacks[item && item.getId()] || [];
        while (callbacks.length) {
            (callbacks.shift())(item);
        }
    },
    each: function(fn, scope) {
        return Ext.Object.each(this.all, fn, scope);
    },
    getCount: function() {
        return this.count;
    },
    getAll: function() {
        return Ext.Object.getValues(this.all);
    },
    getActiveComponent: function() {
        return Ext.Component.fromElement(Ext.dom.Element.getActiveElement());
    },
    onGlobalFocus: function(e) {
        var me = this,
            toElement = e.toElement,
            fromElement = e.fromElement,
            toComponent = Ext.Component.fromElement(toElement),
            fromComponent = Ext.Component.fromElement(fromElement),
            commonAncestor, targetComponent;
        if (toComponent === fromComponent) {
            return;
        }
        commonAncestor = me.getCommonAncestor(fromComponent, toComponent);
        if (fromComponent && !(fromComponent.destroyed || fromComponent.destroying)) {
            if (fromComponent.handleBlurEvent) {
                fromComponent.handleBlurEvent(e);
            }
            for (targetComponent = fromComponent; targetComponent && targetComponent !== commonAncestor; targetComponent = targetComponent.getRefOwner()) {
                if (!(targetComponent.destroyed || targetComponent.destroying)) {
                    targetComponent.onFocusLeave({
                        event: e.event,
                        type: 'focusleave',
                        target: fromElement,
                        relatedTarget: toElement,
                        fromComponent: fromComponent,
                        toComponent: toComponent
                    });
                }
            }
        }
        if (toComponent && !(toComponent.destroyed || toComponent.destroying)) {
            if (toComponent.handleFocusEvent) {
                toComponent.handleFocusEvent(e);
            }
            for (targetComponent = toComponent; targetComponent && targetComponent !== commonAncestor; targetComponent = targetComponent.getRefOwner()) {
                targetComponent.onFocusEnter({
                    event: e.event,
                    type: 'focusenter',
                    relatedTarget: fromElement,
                    target: toElement,
                    fromComponent: fromComponent,
                    toComponent: toComponent
                });
            }
        }
    },
    getCommonAncestor: function(compA, compB) {
        if (compA === compB) {
            return compA;
        }
        while (compA && !(compA.isAncestor(compB) || compA === compB)) {
            compA = compA.getRefOwner();
        }
        return compA;
    },
    privates: {
        clearAll: function() {
            this.all = {};
            this.references = {};
            this.onAvailableCallbacks = {};
        },
        fromElement: function(node, limit, selector) {
            var target = Ext.getDom(node),
                cache = this.all,
                depth = 0,
                topmost, cmpId, cmp;
            if (typeof limit !== 'number') {
                topmost = Ext.getDom(limit);
                limit = Number.MAX_VALUE;
            }
            while (target && target.nodeType === 1 && depth < limit && target !== topmost) {
                cmpId = target.getAttribute('data-componentid') || target.id;
                if (cmpId) {
                    cmp = cache[cmpId];
                    if (cmp && (!selector || Ext.ComponentQuery.is(cmp, selector))) {
                        return cmp;
                    }
                    depth++;
                }
                target = target.parentNode;
            }
            return null;
        }
    },
    deprecated: {
        5: {
            methods: {
                isRegistered: null,
                registerType: null
            }
        }
    }
}, function() {
    Ext.getCmp = function(id) {
        return Ext.ComponentManager.get(id);
    };
});

Ext.ns('Ext.util').Operators = {
    "=": function(a, v) {
        return a == v;
    },
    "!=": function(a, v) {
        return a != v;
    },
    "^=": function(a, v) {
        return a && a.substr(0, v.length) == v;
    },
    "$=": function(a, v) {
        return a && a.substr(a.length - v.length) == v;
    },
    "*=": function(a, v) {
        return a && a.indexOf(v) !== -1;
    },
    "%=": function(a, v) {
        return (a % v) === 0;
    },
    "|=": function(a, v) {
        return a && (a == v || a.substr(0, v.length + 1) == v + '-');
    },
    "~=": function(a, v) {
        return a && (' ' + a + ' ').indexOf(' ' + v + ' ') != -1;
    }
};

Ext.define('Ext.util.LruCache', {
    extend: Ext.util.HashMap,
    config: {
        maxSize: null
    },
    add: function(key, newValue) {
        var me = this,
            entry, last;
        me.removeAtKey(key);
        last = me.last;
        entry = {
            prev: last,
            next: null,
            key: key,
            value: newValue
        };
        if (last) {
            last.next = entry;
        } else {
            me.first = entry;
        }
        me.last = entry;
        me.callParent([
            key,
            entry
        ]);
        me.prune();
        return newValue;
    },
    insertBefore: function(key, newValue, sibling) {
        var me = this,
            existingKey, entry;
        if (sibling = this.map[this.findKey(sibling)]) {
            existingKey = me.findKey(newValue);
            if (existingKey) {
                me.unlinkEntry(entry = me.map[existingKey]);
            } else {
                entry = {
                    prev: sibling.prev,
                    next: sibling,
                    key: key,
                    value: newValue
                };
            }
            if (sibling.prev) {
                entry.prev.next = entry;
            } else {
                me.first = entry;
            }
            entry.next = sibling;
            sibling.prev = entry;
            me.prune();
            return newValue;
        } else {
            return me.add(key, newValue);
        }
    },
    get: function(key) {
        var entry = this.map[key];
        if (entry) {
            if (entry.next) {
                this.moveToEnd(entry);
            }
            return entry.value;
        }
    },
    removeAtKey: function(key) {
        this.unlinkEntry(this.map[key]);
        return this.callParent(arguments);
    },
    clear: function(initial) {
        this.first = this.last = null;
        return this.callParent([
            initial
        ]);
    },
    unlinkEntry: function(entry) {
        if (entry) {
            if (entry.next) {
                entry.next.prev = entry.prev;
            } else {
                this.last = entry.prev;
            }
            if (entry.prev) {
                entry.prev.next = entry.next;
            } else {
                this.first = entry.next;
            }
            entry.prev = entry.next = null;
        }
    },
    moveToEnd: function(entry) {
        this.unlinkEntry(entry);
        if (entry.prev = this.last) {
            this.last.next = entry;
        } else {
            this.first = entry;
        }
        this.last = entry;
    },
    getArray: function(isKey) {
        var arr = [],
            entry = this.first;
        while (entry) {
            arr.push(isKey ? entry.key : entry.value);
            entry = entry.next;
        }
        return arr;
    },
    each: function(fn, scope, reverse) {
        var me = this,
            entry = reverse ? me.last : me.first,
            length = me.length;
        scope = scope || me;
        while (entry) {
            if (fn.call(scope, entry.key, entry.value, length) === false) {
                break;
            }
            entry = reverse ? entry.prev : entry.next;
        }
        return me;
    },
    findKey: function(value) {
        var key,
            map = this.map;
        for (key in map) {
            if (map.hasOwnProperty(key) && map[key].value === value) {
                return key;
            }
        }
        return undefined;
    },
    clone: function() {
        var newCache = new this.self(this.initialConfig),
            map = this.map,
            key;
        newCache.suspendEvents();
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                newCache.add(key, map[key].value);
            }
        }
        newCache.resumeEvents();
        return newCache;
    },
    prune: function() {
        var me = this,
            max = me.getMaxSize(),
            purgeCount = max ? (me.length - max) : 0;
        if (purgeCount > 0) {
            for (; me.first && purgeCount; purgeCount--) {
                me.removeAtKey(me.first.key);
            }
        }
    }
});

Ext.define('Ext.ComponentQuery', {
    singleton: true
}, function() {
    var cq = this,
        queryOperators = Ext.util.Operators,
        nthRe = /(\d*)n\+?(\d*)/,
        nthRe2 = /\D/,
        stripLeadingSpaceRe = /^(\s)+/,
        unescapeRe = /\\(.)/g,
        regexCache = new Ext.util.LruCache({
            maxSize: 100
        }),
        filterFnPattern = [
            'var r = [],',
            'i = 0,',
            'it = items,',
            'l = it.length,',
            'c;',
            'for (; i < l; i++) {',
            'c = it[i];',
            'if (c.{0}) {',
            'r.push(c);',
            '}',
            '}',
            'return r;'
        ].join(''),
        filterItems = function(items, operation) {
            return operation.method.apply(this, [
                items
            ].concat(operation.args));
        },
        getItems = function(items, mode) {
            var result = [],
                i = 0,
                length = items.length,
                candidate,
                deep = mode !== '>';
            for (; i < length; i++) {
                candidate = items[i];
                if (candidate.getRefItems) {
                    result = result.concat(candidate.getRefItems(deep));
                }
            }
            return result;
        },
        getAncestors = function(items) {
            var result = [],
                i = 0,
                length = items.length,
                candidate;
            for (; i < length; i++) {
                candidate = items[i];
                while (!!(candidate = candidate.getRefOwner())) {
                    result.push(candidate);
                }
            }
            return result;
        },
        filterByXType = function(items, xtype, shallow) {
            if (xtype === '*') {
                return items.slice();
            } else {
                var result = [],
                    i = 0,
                    length = items.length,
                    candidate;
                for (; i < length; i++) {
                    candidate = items[i];
                    if (candidate.isXType(xtype, shallow)) {
                        result.push(candidate);
                    }
                }
                return result;
            }
        },
        filterByAttribute = function(items, property, operator, compareTo) {
            var result = [],
                i = 0,
                length = items.length,
                mustBeOwnProperty, presenceOnly, candidate, propValue, j, propLen, config;
            if (property.charAt(0) === '@') {
                mustBeOwnProperty = true;
                property = property.substr(1);
            }
            if (property.charAt(0) === '?') {
                mustBeOwnProperty = true;
                presenceOnly = true;
                property = property.substr(1);
            }
            for (; i < length; i++) {
                candidate = items[i];
                config = candidate.self && candidate.self.getConfigurator && candidate.self.$config.configs[property];
                if (config) {
                    propValue = candidate[config.names.get]();
                } else if (mustBeOwnProperty && !candidate.hasOwnProperty(property)) {
                    
                    continue;
                } else {
                    propValue = candidate[property];
                }
                if (presenceOnly) {
                    result.push(candidate);
                }
                else if (operator === '~=') {
                    if (propValue) {
                        if (!Ext.isArray(propValue)) {
                            propValue = propValue.split(' ');
                        }
                        for (j = 0 , propLen = propValue.length; j < propLen; j++) {
                            if (queryOperators[operator](Ext.coerce(propValue[j], compareTo), compareTo)) {
                                result.push(candidate);
                                break;
                            }
                        }
                    }
                } else if (operator === '/=') {
                    if (propValue != null && compareTo.test(propValue)) {
                        result.push(candidate);
                    }
                } else if (!compareTo ? !!candidate[property] : queryOperators[operator](Ext.coerce(propValue, compareTo), compareTo)) {
                    result.push(candidate);
                }
            }
            return result;
        },
        filterById = function(items, id, idOnly) {
            var result = [],
                i = 0,
                length = items.length,
                candidate, check;
            for (; i < length; i++) {
                candidate = items[i];
                check = idOnly ? candidate.id : candidate.getItemId();
                if (check === id) {
                    result.push(candidate);
                }
            }
            return result;
        },
        filterByPseudo = function(items, name, value) {
            return cq.pseudos[name](items, value);
        },
        modeRe = /^(\s?([>\^])\s?|\s|$)/,
        tokenRe = /^(#)?((?:\\\.|[\w\-])+|\*)(?:\((true|false)\))?/,
        matchers = [
            {
                re: /^\.((?:\\\.|[\w\-])+)(?:\((true|false)\))?/,
                method: filterByXType,
                argTransform: function(args) {
                    var selector = args[0];
                    Ext.log.warn('"' + selector + '" ComponentQuery selector style is deprecated,' + ' use "' + selector.replace(/^\./, '') + '" without the leading dot instead');
                    if (args[1] !== undefined) {
                        args[1] = args[1].replace(unescapeRe, '$1');
                    }
                    return args.slice(1);
                }
            },
            {
                re: /^(?:\[((?:[@?$])?[\w\-]*)\s*(?:([\^$*~%!\/]?=)\s*(['"])?((?:\\\]|.)*?)\3)?(?!\\)\])/,
                method: filterByAttribute,
                argTransform: function(args) {
                    var selector = args[0],
                        property = args[1],
                        operator = args[2],
                        compareTo = args[4],
                        compareRe;
                    if (compareTo !== undefined) {
                        compareTo = compareTo.replace(unescapeRe, '$1');
                        var format = Ext.String.format,
                            msg = "ComponentQuery selector '{0}' has an unescaped ({1}) character at the {2} " + "of the attribute value pattern. Usually that indicates an error " + "where the opening quote is not followed by the closing quote. " + "If you need to match a ({1}) character at the {2} of the attribute " + "value, escape the quote character in your pattern: (\\{1})",
                            match;
                        if (match = /^(['"]).*?[^'"]$/.exec(compareTo)) {
                            Ext.log.warn(format(msg, selector, match[1], 'beginning'));
                        } else if (match = /^[^'"].*?(['"])$/.exec(compareTo)) {
                            Ext.log.warn(format(msg, selector, match[1], 'end'));
                        }
                    }
                    if (operator === '/=') {
                        compareRe = regexCache.get(compareTo);
                        if (compareRe) {
                            compareTo = compareRe;
                        } else {
                            compareTo = regexCache.add(compareTo, new RegExp(compareTo));
                        }
                    }
                    return [
                        property,
                        operator,
                        compareTo
                    ];
                }
            },
            {
                re: /^#((?:\\\.|[\w\-])+)/,
                method: filterById
            },
            {
                re: /^\:([\w\-]+)(?:\(((?:\{[^\}]+\})|(?:(?!\{)[^\s>\/]*?(?!\})))\))?/,
                method: filterByPseudo,
                argTransform: function(args) {
                    if (args[2] !== undefined) {
                        args[2] = args[2].replace(unescapeRe, '$1');
                    }
                    return args.slice(1);
                }
            },
            {
                re: /^(?:\{([^\}]+)\})/,
                method: filterFnPattern
            }
        ];
    cq.Query = Ext.extend(Object, {
        constructor: function(cfg) {
            cfg = cfg || {};
            Ext.apply(this, cfg);
        },
        execute: function(root) {
            var operations = this.operations,
                result = [],
                op, i, len;
            for (i = 0 , len = operations.length; i < len; i++) {
                op = operations[i];
                result = result.concat(this._execute(root, op));
            }
            return result;
        },
        _execute: function(root, operations) {
            var i = 0,
                length = operations.length,
                operation, workingItems;
            if (!root) {
                workingItems = Ext.ComponentManager.getAll();
            }
            else if (Ext.isIterable(root)) {
                workingItems = root;
            }
            else if (root.isMixedCollection) {
                workingItems = root.items;
            }
            for (; i < length; i++) {
                operation = operations[i];
                if (operation.mode === '^') {
                    workingItems = getAncestors(workingItems || [
                        root
                    ]);
                } else if (operation.mode) {
                    workingItems = getItems(workingItems || [
                        root
                    ], operation.mode);
                } else {
                    workingItems = filterItems(workingItems || getItems([
                        root
                    ]), operation);
                }
                if (i === length - 1) {
                    return workingItems;
                }
            }
            return [];
        },
        is: function(component, root) {
            var operations = this.operations,
                result = false,
                len = operations.length,
                op, i;
            if (len === 0) {
                return true;
            }
            for (i = 0; i < len; i++) {
                op = operations[i];
                result = this._is(component, root, op);
                if (result) {
                    return result;
                }
            }
            return false;
        },
        _is: function(component, root, operations) {
            var len = operations.length,
                active = [
                    component
                ],
                operation, i, j, mode, items, item;
            for (i = len - 1; i >= 0; --i) {
                operation = operations[i];
                mode = operation.mode;
                if (mode) {
                    if (mode === '^') {
                        active = getItems(active, ' ');
                    } else if (mode === '>') {
                        items = [];
                        for (j = 0 , len = active.length; j < len; ++j) {
                            item = active[j].getRefOwner();
                            if (item) {
                                items.push(item);
                            }
                        }
                        active = items;
                    } else {
                        active = getAncestors(active);
                    }
                } else {
                    active = filterItems(active, operation);
                }
                if (active.length === 0) {
                    return false;
                }
            }
            if (root) {
                if (!mode) {
                    active = getAncestors(active);
                }
                if (active.length > 0) {
                    active = filterItems(active, {
                        method: filterById,
                        args: [
                            root.id,
                            true
                        ]
                    });
                }
                if (active.length === 0) {
                    return false;
                }
            }
            return true;
        },
        getMatches: function(components, operations) {
            var len = operations.length,
                i;
            for (i = 0; i < len; ++i) {
                components = filterItems(components, operations[i]);
                if (components.length === 0) {
                    break;
                }
            }
            return components;
        },
        isMultiMatch: function() {
            return this.operations.length > 1;
        }
    });
    Ext.apply(cq, {
        cache: new Ext.util.LruCache({
            maxSize: 100
        }),
        pseudos: {
            not: function(components, selector) {
                var i = 0,
                    length = components.length,
                    results = [],
                    index = -1,
                    component;
                for (; i < length; ++i) {
                    component = components[i];
                    if (!cq.is(component, selector)) {
                        results[++index] = component;
                    }
                }
                return results;
            },
            first: function(components) {
                var ret = [];
                if (components.length > 0) {
                    ret.push(components[0]);
                }
                return ret;
            },
            last: function(components) {
                var len = components.length,
                    ret = [];
                if (len > 0) {
                    ret.push(components[len - 1]);
                }
                return ret;
            },
            focusable: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;
                for (; i < len; i++) {
                    c = cmps[i];
                    if (c.isFocusable && c.isFocusable()) {
                        results.push(c);
                    }
                }
                return results;
            },
            canfocus: function(cmps, value) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;
                for (; i < len; i++) {
                    c = cmps[i];
                    if (c.canFocus && c.canFocus(false, value)) {
                        results.push(c);
                    }
                }
                return results;
            },
            "nth-child": function(c, a) {
                var result = [],
                    m = nthRe.exec(a === "even" && "2n" || a === "odd" && "2n+1" || !nthRe2.test(a) && "n+" + a || a),
                    f = (m[1] || 1) - 0,
                    len = m[2] - 0,
                    i, n, nodeIndex;
                for (i = 0; n = c[i]; i++) {
                    nodeIndex = i + 1;
                    if (f === 1) {
                        if (len === 0 || nodeIndex === len) {
                            result.push(n);
                        }
                    } else if ((nodeIndex + len) % f === 0) {
                        result.push(n);
                    }
                }
                return result;
            },
            scrollable: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;
                for (; i < len; i++) {
                    c = cmps[i];
                    if (c.scrollable || c._scrollable) {
                        results.push(c);
                    }
                }
                return results;
            },
            visible: function(cmps, deep) {
                deep = deep === 'true';
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;
                for (; i < len; i++) {
                    c = cmps[i];
                    if (c.isVisible(deep)) {
                        results.push(c);
                    }
                }
                return results;
            }
        },
        query: function(selector, root) {
            if (!selector) {
                return Ext.ComponentManager.all.getArray();
            }
            var results = [],
                noDupResults = [],
                dupMatcher = {},
                query = cq.cache.get(selector),
                resultsLn, cmp, i;
            if (!query) {
                query = cq.cache.add(selector, cq.parse(selector));
            }
            results = query.execute(root);
            if (query.isMultiMatch()) {
                resultsLn = results.length;
                for (i = 0; i < resultsLn; i++) {
                    cmp = results[i];
                    if (!dupMatcher[cmp.id]) {
                        noDupResults.push(cmp);
                        dupMatcher[cmp.id] = true;
                    }
                }
                results = noDupResults;
            }
            return results;
        },
        visitPreOrder: function(selector, root, fn, scope, extraArgs) {
            cq._visit(true, selector, root, fn, scope, extraArgs);
        },
        visitPostOrder: function(selector, root, fn, scope, extraArgs) {
            cq._visit(false, selector, root, fn, scope, extraArgs);
        },
        _visit: function(preOrder, selector, root, fn, scope, extraArgs) {
            var query = cq.cache.get(selector),
                callArgs = [
                    root
                ],
                children,
                len = 0,
                i, rootMatch;
            if (!query) {
                query = cq.cache.add(selector, cq.parse(selector));
            }
            rootMatch = query.is(root);
            if (root.getRefItems) {
                children = root.getRefItems();
                len = children.length;
            }
            if (extraArgs) {
                Ext.Array.push(callArgs, extraArgs);
            }
            if (preOrder) {
                if (rootMatch) {
                    if (fn.apply(scope || root, callArgs) === false) {
                        return false;
                    }
                }
            }
            for (i = 0; i < len; i++) {
                if (cq._visit.call(cq, preOrder, selector, children[i], fn, scope, extraArgs) === false) {
                    return false;
                }
            }
            if (!preOrder) {
                if (rootMatch) {
                    if (fn.apply(scope || root, callArgs) === false) {
                        return false;
                    }
                }
            }
        },
        is: function(component, selector, root) {
            if (!selector) {
                return true;
            }
            var query = cq.cache.get(selector);
            if (!query) {
                query = cq.cache.add(selector, cq.parse(selector));
            }
            return query.is(component, root);
        },
        parse: function(selector) {
            var operations = [],
                selectors, sel, i, len;
            selectors = Ext.splitAndUnescape(selector, ',');
            for (i = 0 , len = selectors.length; i < len; i++) {
                sel = Ext.String.trim(selectors[i]);
                if (sel === '') {
                    Ext.raise('Invalid ComponentQuery selector: ""');
                }
                operations.push(cq._parse(sel));
            }
            return new cq.Query({
                operations: operations
            });
        },
        _parse: function(selector) {
            var operations = [],
                trim = Ext.String.trim,
                length = matchers.length,
                lastSelector, tokenMatch, token, matchedChar, modeMatch, selectorMatch, transform, i, matcher, method, args;
            while (selector && lastSelector !== selector) {
                lastSelector = selector;
                tokenMatch = selector.match(tokenRe);
                if (tokenMatch) {
                    matchedChar = tokenMatch[1];
                    token = trim(tokenMatch[2]).replace(unescapeRe, '$1');
                    if (matchedChar === '#') {
                        operations.push({
                            method: filterById,
                            args: [
                                token
                            ]
                        });
                    } else {
                        operations.push({
                            method: filterByXType,
                            args: [
                                token,
                                Boolean(tokenMatch[3])
                            ]
                        });
                    }
                    selector = selector.replace(tokenMatch[0], '').replace(stripLeadingSpaceRe, '$1');
                }
                while (!(modeMatch = selector.match(modeRe))) {
                    for (i = 0; selector && i < length; i++) {
                        matcher = matchers[i];
                        selectorMatch = selector.match(matcher.re);
                        method = matcher.method;
                        transform = matcher.argTransform;
                        if (selectorMatch) {
                            if (transform) {
                                args = transform(selectorMatch);
                            } else {
                                args = selectorMatch.slice(1);
                            }
                            operations.push({
                                method: Ext.isString(matcher.method) ? Ext.functionFactory('items', Ext.String.format.apply(Ext.String, [
                                    method
                                ].concat(selectorMatch.slice(1)))) : matcher.method,
                                args: args
                            });
                            selector = selector.replace(selectorMatch[0], '').replace(stripLeadingSpaceRe, '$1');
                            break;
                        }
                        if (i === (length - 1)) {
                            Ext.raise('Invalid ComponentQuery selector: "' + arguments[0] + '"');
                        }
                    }
                }
                if (modeMatch[1]) {
                    operations.push({
                        mode: modeMatch[2] || modeMatch[1]
                    });
                    selector = selector.replace(modeMatch[0], '').replace(stripLeadingSpaceRe, '');
                }
            }
            return operations;
        }
    });
    Ext.all = function() {
        return cq.query.apply(cq, arguments);
    };
    Ext.first = function() {
        var matches = cq.query.apply(cq, arguments);
        return (matches && matches[0]) || null;
    };
});

Ext.define('Ext.Evented', {
    alternateClassName: 'Ext.EventedBase',
    mixins: [
        Ext.mixin.Observable
    ],
    initialized: false,
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.initialized = true;
    },
    onClassExtended: function(cls, data) {
        if (!data.hasOwnProperty('eventedConfig')) {
            return;
        }
        var config = data.config,
            eventedConfig = data.eventedConfig,
            name, cfg;
        if (config) {
            Ext.applyIf(config, eventedConfig);
        } else {
            cls.addConfig(eventedConfig);
        }
        for (name in eventedConfig) {
            if (eventedConfig.hasOwnProperty(name)) {
                cfg = Ext.Config.get(name);
                data[cfg.names.set] = cfg.eventedSetter || cfg.getEventedSetter();
            }
        }
    }
});

Ext.define('Ext.util.Positionable', {
    mixinId: 'positionable',
    _positionTopLeft: [
        'position',
        'top',
        'left'
    ],
    clippedCls: Ext.baseCSSPrefix + 'clipped',
    afterSetPosition: Ext.emptyFn,
    getAnchorToXY: function() {
        Ext.raise("getAnchorToXY is not implemented in " + this.$className);
    },
    getBorderPadding: function() {
        Ext.raise("getBorderPadding is not implemented in " + this.$className);
    },
    getLocalX: function() {
        Ext.raise("getLocalX is not implemented in " + this.$className);
    },
    getLocalXY: function() {
        Ext.raise("getLocalXY is not implemented in " + this.$className);
    },
    getLocalY: function() {
        Ext.raise("getLocalY is not implemented in " + this.$className);
    },
    getX: function() {
        Ext.raise("getX is not implemented in " + this.$className);
    },
    getXY: function() {
        Ext.raise("getXY is not implemented in " + this.$className);
    },
    getY: function() {
        Ext.raise("getY is not implemented in " + this.$className);
    },
    setLocalX: function() {
        Ext.raise("setLocalX is not implemented in " + this.$className);
    },
    setLocalXY: function() {
        Ext.raise("setLocalXY is not implemented in " + this.$className);
    },
    setLocalY: function() {
        Ext.raise("setLocalY is not implemented in " + this.$className);
    },
    setX: function() {
        Ext.raise("setX is not implemented in " + this.$className);
    },
    setXY: function() {
        Ext.raise("setXY is not implemented in " + this.$className);
    },
    setY: function() {
        Ext.raise("setY is not implemented in " + this.$className);
    },
    adjustForConstraints: function(xy, parent) {
        var vector = this.getConstrainVector(parent, xy);
        if (vector) {
            xy[0] += vector[0];
            xy[1] += vector[1];
        }
        return xy;
    },
    alignTo: function(element, position, offsets, animate) {
        var me = this,
            el = me.el;
        return me.setXY(me.getAlignToXY(element, position, offsets), el.anim && !!animate ? el.anim(animate) : false);
    },
    calculateAnchorXY: function(anchor, extraX, extraY, mySize) {
        var region = this.getRegion();
        region.setPosition(0, 0);
        region.translateBy(extraX || 0, extraY || 0);
        if (mySize) {
            region.setWidth(mySize.width);
            region.setHeight(mySize.height);
        }
        return region.getAnchorPoint(anchor);
    },
    convertPositionSpec: function(posSpec) {
        return Ext.util.Region.getAlignInfo(posSpec);
    },
    getAlignToXY: function(alignToEl, posSpec, offset) {
        var newRegion = this.getAlignToRegion(alignToEl, posSpec, offset);
        return [
            newRegion.x,
            newRegion.y
        ];
    },
    getAlignToRegion: function(alignToEl, posSpec, offset, minHeight) {
        var me = this,
            inside, newRegion;
        alignToEl = Ext.get(alignToEl.el || alignToEl);
        if (!alignToEl || !alignToEl.dom) {
            Ext.raise({
                sourceClass: 'Ext.util.Positionable',
                sourceMethod: 'getAlignToXY',
                msg: 'Attempted to align an element that doesn\'t exist'
            });
        }
        posSpec = me.convertPositionSpec(posSpec);
        if (posSpec.constrain) {
            if (posSpec.constrain === '!') {
                inside = alignToEl;
            } else {
                inside = me.constrainTo || me.container || me.el.parent();
            }
            inside = Ext.get(inside.el || inside).getConstrainRegion();
        }
        newRegion = me.getRegion().alignTo({
            target: alignToEl.getRegion(),
            inside: inside,
            minHeight: minHeight,
            offset: offset,
            align: posSpec,
            axisLock: true
        });
        return newRegion;
    },
    getAnchorXY: function(anchor, local, mySize) {
        var me = this,
            region = me.getRegion(),
            el = me.el,
            isViewport = el.dom.nodeName === 'BODY' || el.dom.nodeType === 9,
            scroll = el.getScroll();
        if (local) {
            region.setPosition(0, 0);
        } else if (isViewport) {
            region.setPosition(scroll.left, scroll.top);
        }
        if (mySize) {
            region.setWidth(mySize.width);
            region.setHeight(mySize.height);
        }
        return region.getAnchorPoint(anchor);
    },
    getBox: function(contentBox, local) {
        var me = this,
            xy = local ? me.getLocalXY() : me.getXY(),
            x = xy[0],
            y = xy[1],
            w, h, borderPadding, beforeX, beforeY;
        if (me.el.dom.nodeName === 'BODY' || me.el.dom.nodeType === 9) {
            w = Ext.Element.getViewportWidth();
            h = Ext.Element.getViewportHeight();
        } else {
            w = me.getWidth();
            h = me.getHeight();
        }
        if (contentBox) {
            borderPadding = me.getBorderPadding();
            beforeX = borderPadding.beforeX;
            beforeY = borderPadding.beforeY;
            x += beforeX;
            y += beforeY;
            w -= (beforeX + borderPadding.afterX);
            h -= (beforeY + borderPadding.afterY);
        }
        return {
            x: x,
            left: x,
            0: x,
            y: y,
            top: y,
            1: y,
            width: w,
            height: h,
            right: x + w,
            bottom: y + h
        };
    },
    calculateConstrainedPosition: function(constrainTo, proposedPosition, local, proposedSize) {
        var me = this,
            vector,
            fp = me.floatParent,
            parentNode = fp ? fp.getTargetEl() : null,
            parentOffset, borderPadding, proposedConstrainPosition,
            xy = false;
        if (local && fp) {
            parentOffset = parentNode.getXY();
            borderPadding = parentNode.getBorderPadding();
            parentOffset[0] += borderPadding.beforeX;
            parentOffset[1] += borderPadding.beforeY;
            if (proposedPosition) {
                proposedConstrainPosition = [
                    proposedPosition[0] + parentOffset[0],
                    proposedPosition[1] + parentOffset[1]
                ];
            }
        } else {
            proposedConstrainPosition = proposedPosition;
        }
        constrainTo = constrainTo || me.constrainTo || parentNode || me.container || me.el.parent();
        if (local && proposedConstrainPosition) {
            proposedConstrainPosition = me.reverseTranslateXY(proposedConstrainPosition);
        }
        vector = ((me.constrainHeader && me.header.rendered) ? me.header : me).getConstrainVector(constrainTo, proposedConstrainPosition, proposedSize);
        if (vector) {
            xy = proposedPosition || me.getPosition(local);
            xy[0] += vector[0];
            xy[1] += vector[1];
        }
        return xy;
    },
    getConstrainRegion: function() {
        var me = this,
            el = me.el,
            isBody = el.dom.nodeName === 'BODY',
            dom = el.dom,
            borders = el.getBorders(),
            pos = el.getXY(),
            left = pos[0] + borders.beforeX,
            top = pos[1] + borders.beforeY,
            scroll, width, height;
        if (isBody) {
            scroll = el.getScroll();
            left = scroll.left;
            top = scroll.top;
            width = Ext.Element.getViewportWidth();
            height = Ext.Element.getViewportHeight();
        } else {
            width = dom.clientWidth;
            height = dom.clientHeight;
        }
        return new Ext.util.Region(top, left + width, top + height, left);
    },
    getConstrainVector: function(constrainTo, proposedPosition, proposedSize) {
        var me = this,
            thisRegion = me.getRegion(),
            vector = [
                0,
                0
            ],
            shadowSize = (me.shadow && me.constrainShadow && !me.shadowDisabled) ? me.el.shadow.getShadowSize() : undefined,
            overflowed = false,
            constraintInsets = me.constraintInsets;
        if (!(constrainTo instanceof Ext.util.Region)) {
            constrainTo = Ext.get(constrainTo.el || constrainTo);
            constrainTo = constrainTo.getConstrainRegion();
        }
        if (constraintInsets) {
            constraintInsets = Ext.isObject(constraintInsets) ? constraintInsets : Ext.Element.parseBox(constraintInsets);
            constrainTo.adjust(constraintInsets.top, constraintInsets.right, constraintInsets.bottom, constraintInsets.left);
        }
        if (proposedPosition) {
            thisRegion.translateBy(proposedPosition[0] - thisRegion.x, proposedPosition[1] - thisRegion.y);
        }
        if (proposedSize) {
            thisRegion.right = thisRegion.left + proposedSize[0];
            thisRegion.bottom = thisRegion.top + proposedSize[1];
        }
        if (shadowSize) {
            constrainTo.adjust(shadowSize[0], -shadowSize[1], -shadowSize[2], shadowSize[3]);
        }
        if (thisRegion.right > constrainTo.right) {
            overflowed = true;
            vector[0] = (constrainTo.right - thisRegion.right);
        }
        if (thisRegion.left + vector[0] < constrainTo.left) {
            overflowed = true;
            vector[0] = (constrainTo.left - thisRegion.left);
        }
        if (thisRegion.bottom > constrainTo.bottom) {
            overflowed = true;
            vector[1] = (constrainTo.bottom - thisRegion.bottom);
        }
        if (thisRegion.top + vector[1] < constrainTo.top) {
            overflowed = true;
            vector[1] = (constrainTo.top - thisRegion.top);
        }
        return overflowed ? vector : false;
    },
    getOffsetsTo: function(offsetsTo) {
        var o = this.getXY(),
            e = Ext.fly(offsetsTo.el || offsetsTo).getXY();
        return [
            o[0] - e[0],
            o[1] - e[1]
        ];
    },
    getRegion: function(contentBox) {
        var box = this.getBox(contentBox);
        return new Ext.util.Region(box.top, box.right, box.bottom, box.left);
    },
    getClientRegion: function() {
        var me = this,
            scrollbarSize,
            viewContentBox = me.getBox(),
            myDom = me.dom;
        scrollbarSize = myDom.offsetWidth - myDom.clientWidth;
        if (scrollbarSize) {
            if (me.getStyle('direction') === 'rtl') {
                viewContentBox.left += scrollbarSize;
            } else {
                viewContentBox.right -= scrollbarSize;
            }
        }
        scrollbarSize = myDom.offsetHeight - myDom.clientHeight;
        if (scrollbarSize) {
            viewContentBox.bottom -= scrollbarSize;
        }
        return new Ext.util.Region(viewContentBox.top, viewContentBox.right, viewContentBox.bottom, viewContentBox.left);
    },
    getViewRegion: function() {
        var me = this,
            el = me.el,
            isBody = el.dom.nodeName === 'BODY',
            borderPadding, scroll, pos, top, left, width, height;
        if (isBody) {
            scroll = el.getScroll();
            left = scroll.left;
            top = scroll.top;
            width = Ext.Element.getViewportWidth();
            height = Ext.Element.getViewportHeight();
        } else {
            borderPadding = me.getBorderPadding();
            pos = me.getXY();
            left = pos[0] + borderPadding.beforeX;
            top = pos[1] + borderPadding.beforeY;
            width = me.getWidth(true);
            height = me.getHeight(true);
        }
        return new Ext.util.Region(top, left + width, top + height, left);
    },
    getClientRegion: function() {
        var el = this.el,
            borderPadding, pos, left, top, width, height;
        borderPadding = this.getBorderPadding();
        pos = this.getXY();
        left = pos[0] + borderPadding.beforeX;
        top = pos[1] + borderPadding.beforeY;
        width = el.dom.clientWidth;
        height = el.dom.clientHeight;
        return new Ext.util.Region(top, left + width, top + height, left);
    },
    move: function(direction, distance, animate) {
        var me = this,
            xy = me.getXY(),
            x = xy[0],
            y = xy[1],
            left = [
                x - distance,
                y
            ],
            right = [
                x + distance,
                y
            ],
            top = [
                x,
                y - distance
            ],
            bottom = [
                x,
                y + distance
            ],
            hash = {
                l: left,
                left: left,
                r: right,
                right: right,
                t: top,
                top: top,
                up: top,
                b: bottom,
                bottom: bottom,
                down: bottom
            };
        direction = direction.toLowerCase();
        me.setXY([
            hash[direction][0],
            hash[direction][1]
        ], animate);
    },
    setBox: function(box) {
        var me = this,
            x, y;
        if (box.isRegion) {
            box = {
                x: box.left,
                y: box.top,
                width: box.right - box.left,
                height: box.bottom - box.top
            };
        }
        me.constrainBox(box);
        x = box.x;
        y = box.y;
        me.setXY([
            x,
            y
        ]);
        me.setSize(box.width, box.height);
        me.afterSetPosition(x, y);
        return me;
    },
    constrainBox: function(box) {
        var me = this,
            constrainedPos, x, y;
        if (me.constrain || me.constrainHeader) {
            x = ('x' in box) ? box.x : box.left;
            y = ('y' in box) ? box.y : box.top;
            constrainedPos = me.calculateConstrainedPosition(null, [
                x,
                y
            ], false, [
                box.width,
                box.height
            ]);
            if (constrainedPos) {
                box.x = constrainedPos[0];
                box.y = constrainedPos[1];
            }
        }
    },
    translatePoints: function(x, y) {
        var pos = this.translateXY(x, y);
        return {
            left: pos.x,
            top: pos.y
        };
    },
    translateXY: function(x, y) {
        var me = this,
            el = me.el,
            styles = el.getStyle(me._positionTopLeft),
            relative = styles.position === 'relative',
            left = parseFloat(styles.left),
            top = parseFloat(styles.top),
            xy = me.getXY();
        if (Ext.isArray(x)) {
            y = x[1];
            x = x[0];
        }
        if (isNaN(left)) {
            left = relative ? 0 : el.dom.offsetLeft;
        }
        if (isNaN(top)) {
            top = relative ? 0 : el.dom.offsetTop;
        }
        left = (typeof x === 'number') ? x - xy[0] + left : undefined;
        top = (typeof y === 'number') ? y - xy[1] + top : undefined;
        return {
            x: left,
            y: top
        };
    },
    reverseTranslateXY: function(xy) {
        var coords = xy,
            el = this.el,
            dom = el.dom,
            offsetParent = dom.offsetParent,
            relative, offsetParentXY, x, y;
        if (offsetParent) {
            relative = el.isStyle('position', 'relative') , offsetParentXY = Ext.fly(offsetParent).getXY() , x = xy[0] + offsetParentXY[0] + offsetParent.clientLeft;
            y = xy[1] + offsetParentXY[1] + offsetParent.clientTop;
            if (relative) {
                x += el.getPadding('l');
                y += el.getPadding('t');
            }
            coords = [
                x,
                y
            ];
        }
        return coords;
    },
    privates: {
        clipTo: function(clippingEl, sides) {
            var clippingRegion,
                el = this.el,
                floaterRegion = el.getRegion(),
                overflow, i,
                clipValues = [],
                clippedCls = this.clippedCls,
                clipStyle, clipped, shadow;
            if (clippingEl.isRegion) {
                clippingRegion = clippingEl;
            } else {
                clippingRegion = (clippingEl.isComponent ? clippingEl.el : Ext.fly(clippingEl)).getConstrainRegion();
            }
            if (!sides) {
                sides = 15;
            }
            if (sides & 1 && (overflow = clippingRegion.top - floaterRegion.top) > 0) {
                clipValues[0] = overflow;
                clipped = true;
            } else {
                clipValues[0] = -10000;
            }
            if (sides & 2 && (overflow = floaterRegion.right - clippingRegion.right) > 0) {
                clipValues[1] = Math.max(0, el.getWidth() - overflow);
                clipped = true;
            } else {
                clipValues[1] = 10000;
            }
            if (sides & 4 && (overflow = floaterRegion.bottom - clippingRegion.bottom) > 0) {
                clipValues[2] = Math.max(0, el.getHeight() - overflow);
                clipped = true;
            } else {
                clipValues[2] = 10000;
            }
            if (sides & 8 && (overflow = clippingRegion.left - floaterRegion.left) > 0) {
                clipValues[3] = overflow;
                clipped = true;
            } else {
                clipValues[3] = -10000;
            }
            clipStyle = 'rect(';
            for (i = 0; i < 4; ++i) {
                clipStyle += Ext.Element.addUnits(clipValues[i], 'px');
                clipStyle += (i === 3) ? ')' : ',';
            }
            el.dom.style.clip = clipStyle;
            el.addCls(clippedCls);
            if ((shadow = el.shadow) && (el = shadow.el) && el.dom) {
                clipValues[2] -= shadow.offsets.y;
                clipValues[3] -= shadow.offsets.x;
                clipStyle = 'rect(';
                for (i = 0; i < 4; ++i) {
                    clipStyle += Ext.Element.addUnits(clipValues[i], 'px');
                    clipStyle += (i === 3) ? ')' : ',';
                }
                el.dom.style.clip = clipStyle;
                if (clipped && !Ext.supports.CSS3BoxShadow) {
                    el.dom.style.display = 'none';
                } else {
                    el.dom.style.display = '';
                    el.addCls(clippedCls);
                }
            }
        },
        clearClip: function() {
            var el = this.el,
                clippedCls = this.clippedCls;
            el.dom.style.clip = Ext.isIE8 ? 'auto' : '';
            el.removeCls(clippedCls);
            if (el.shadow && el.shadow.el && el.shadow.el.dom) {
                el.shadow.el.dom.style.clip = Ext.isIE8 ? 'auto' : '';
                if (!Ext.supports.CSS3BoxShadow) {
                    el.dom.style.display = '';
                    el.removeCls(clippedCls);
                }
            }
        }
    }
});

Ext.define('Ext.dom.UnderlayPool', {
    constructor: function(elementConfig) {
        this.elementConfig = elementConfig;
        this.cache = [];
    },
    checkOut: function() {
        var el = this.cache.shift();
        if (!el) {
            el = Ext.Element.create(this.elementConfig);
            el.setVisibilityMode(2);
            el.dom.setAttribute('data-sticky', true);
        }
        return el;
    },
    checkIn: function(el) {
        this.cache.push(el);
    },
    reset: function() {
        var cache = this.cache,
            i = cache.length;
        while (i--) {
            cache[i].destroy();
        }
        this.cache = [];
    }
});

Ext.define('Ext.dom.Underlay', {
    constructor: function(config) {
        Ext.apply(this, config);
    },
    beforeShow: Ext.emptyFn,
    getInsertionTarget: function() {
        return this.target;
    },
    getPool: function() {
        return this.pool || (this.self.prototype.pool = new Ext.dom.UnderlayPool(this.elementConfig));
    },
    hide: function() {
        var me = this,
            el = me.el;
        if (el) {
            el.hide();
            me.getPool().checkIn(el);
            me.el = null;
            me.hidden = true;
        }
    },
    realign: function(x, y, width, height) {
        var me = this,
            el = me.el,
            target = me.target,
            offsets = me.offsets,
            max = Math.max;
        if (el) {
            if (x == null) {
                x = target.getX();
            }
            if (y == null) {
                y = target.getY();
            }
            if (width == null) {
                width = target.getWidth();
            }
            if (height == null) {
                height = target.getHeight();
            }
            if (offsets) {
                x = x + offsets.x;
                y = y + offsets.y;
                width = max(width + offsets.w, 0);
                height = max(height + offsets.h, 0);
            }
            el.setXY([
                x,
                y
            ]);
            el.setSize(width, height);
        }
    },
    setZIndex: function(zIndex) {
        this.zIndex = zIndex;
        if (this.el) {
            this.el.setStyle("z-index", zIndex);
        }
    },
    show: function() {
        var me = this,
            target = me.target,
            zIndex = me.zIndex,
            el = me.el,
            insertionTarget = me.getInsertionTarget().dom,
            dom;
        if (!el) {
            el = me.el = me.getPool().checkOut();
        }
        me.beforeShow();
        if (zIndex == null) {
            zIndex = (parseInt(target.getStyle("z-index"), 10));
        }
        if (zIndex) {
            el.setStyle("z-index", zIndex);
        }
        el.setStyle('position', me.fixed ? 'fixed' : '');
        dom = el.dom;
        if (dom.nextSibling !== insertionTarget) {
            target.dom.parentNode.insertBefore(dom, insertionTarget);
        }
        el.show();
        me.realign();
        me.hidden = false;
    }
});

Ext.define('Ext.dom.Shadow', {
    extend: Ext.dom.Underlay,
    alternateClassName: 'Ext.Shadow',
    mode: 'drop',
    offset: 4,
    cls: Ext.baseCSSPrefix + (!Ext.supports.CSS3BoxShadow ? 'ie' : 'css') + '-shadow',
    constructor: function(config) {
        var me = this,
            outerOffsets, offsets, offset, rad;
        me.callParent([
            config
        ]);
        me.elementConfig = {
            cls: me.cls,
            role: 'presentation'
        };
        offset = me.offset;
        rad = Math.floor(offset / 2);
        me.opacity = 50;
        switch (me.mode.toLowerCase()) {
            case "drop":
                outerOffsets = {
                    x: 0,
                    y: 0,
                    w: offset,
                    h: offset
                };
                if (Ext.supports.CSS3BoxShadow) {
                    offsets = {
                        x: offset,
                        y: offset,
                        h: -offset,
                        w: -offset
                    };
                } else {
                    offsets = {
                        x: -rad,
                        y: -rad,
                        h: -rad,
                        w: -rad
                    };
                };
                break;
            case "sides":
                outerOffsets = {
                    x: -offset,
                    y: 0,
                    w: offset * 2,
                    h: offset
                };
                if (Ext.supports.CSS3BoxShadow) {
                    offsets = {
                        x: 0,
                        y: offset,
                        h: -offset,
                        w: 0
                    };
                } else {
                    offsets = {
                        x: 1 + rad - 2 * offset,
                        y: -(1 + rad),
                        h: -1,
                        w: rad - 1
                    };
                };
                break;
            case "frame":
                outerOffsets = {
                    x: -offset,
                    y: -offset,
                    w: offset * 2,
                    h: offset * 2
                };
                if (Ext.supports.CSS3BoxShadow) {
                    offsets = {
                        x: 0,
                        y: 0,
                        h: 0,
                        w: 0
                    };
                } else {
                    offsets = {
                        x: 1 + rad - 2 * offset,
                        y: 1 + rad - 2 * offset,
                        h: offset - rad - 1,
                        w: offset - rad - 1
                    };
                };
                break;
            case "bottom":
                outerOffsets = {
                    x: -offset,
                    y: 0,
                    w: offset * 2,
                    h: offset
                };
                if (Ext.supports.CSS3BoxShadow) {
                    offsets = {
                        x: 0,
                        y: offset,
                        h: -offset,
                        w: 0
                    };
                } else {
                    offsets = {
                        x: 0,
                        y: offset,
                        h: 0,
                        w: 0
                    };
                };
                break;
        }
        me.offsets = offsets;
        me.outerOffsets = outerOffsets;
    },
    getShadowSize: function() {
        var me = this,
            offset = me.el ? me.offset : 0,
            result = [
                offset,
                offset,
                offset,
                offset
            ],
            mode = me.mode.toLowerCase();
        if (me.el && mode !== 'frame') {
            result[0] = 0;
            if (mode == 'drop') {
                result[3] = 0;
            }
        }
        return result;
    },
    boxShadowProperty: (function() {
        var property = 'boxShadow',
            style = document.documentElement.style;
        if (!('boxShadow' in style)) {
            if ('WebkitBoxShadow' in style) {
                property = 'WebkitBoxShadow';
            } else if ('MozBoxShadow' in style) {
                property = 'MozBoxShadow';
            }
        }
        return property;
    }()),
    beforeShow: function() {
        var me = this,
            style = me.el.dom.style,
            shim = me.shim;
        if (Ext.supports.CSS3BoxShadow) {
            style[me.boxShadowProperty] = '0 0 ' + (me.offset + 2) + 'px #888';
        } else {
            style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=" + me.opacity + ") progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (me.offset) + ")";
        }
        if (shim) {
            shim.realign();
        }
    },
    setOpacity: function(opacity) {
        var el = this.el;
        if (el) {
            if (Ext.isIE && !Ext.supports.CSS3BoxShadow) {
                opacity = Math.floor(opacity * 100 / 2) / 100;
            }
            this.opacity = opacity;
            el.setOpacity(opacity);
        }
    }
});

Ext.define('Ext.dom.Shim', {
    extend: Ext.dom.Underlay,
    cls: Ext.baseCSSPrefix + 'shim',
    constructor: function(config) {
        this.callParent([
            config
        ]);
        this.elementConfig = {
            tag: 'iframe',
            cls: this.cls,
            role: 'presentation',
            frameBorder: '0',
            src: Ext.SSL_SECURE_URL,
            tabindex: '-1'
        };
    },
    getInsertionTarget: function() {
        var shadow = this.shadow;
        return (shadow && shadow.el) || this.target;
    }
});

Ext.define('Ext.dom.ElementEvent', {
    extend: Ext.util.Event,
    addListener: function(fn, scope, options, caller, manager) {
        var me = this,
            added = false,
            name = me.name,
            isDirectEvent = Ext.event.publisher.Dom.instance.directEvents[name],
            captures, directs, directCaptures;
        options = options || {};
        if (options.delegated === false || isDirectEvent) {
            if (isDirectEvent && options.delegate) {
                options.capture = true;
            }
            if (options.capture) {
                directCaptures = me.directCaptures || (me.directCaptures = new Ext.util.Event(me.observable, name));
                added = directCaptures.addListener(fn, scope, options, caller, manager);
            } else {
                directs = me.directs || (me.directs = new Ext.util.Event(me.observable, name));
                added = directs.addListener(fn, scope, options, caller, manager);
            }
        } else if (options.capture) {
            captures = me.captures || (me.captures = new Ext.util.Event(me.observable, name));
            added = captures.addListener(fn, scope, options, caller, manager);
        } else {
            added = me.callParent([
                fn,
                scope,
                options,
                caller,
                manager
            ]);
        }
        return added;
    },
    removeListener: function(fn, scope) {
        var me = this,
            captures = me.captures,
            directs = me.directs,
            directCaptures = me.directCaptures,
            removed = false,
            index = me.findListener(fn, scope);
        if (index !== -1) {
            removed = me.callParent([
                fn,
                scope,
                index
            ]);
        } else {
            if (directs) {
                index = directs.findListener(fn, scope);
            }
            if (index !== -1) {
                removed = directs.removeListener(fn, scope, index);
            } else {
                if (captures) {
                    index = captures.findListener(fn, scope);
                }
                if (index !== -1) {
                    removed = captures.removeListener(fn, scope, index);
                } else if (directCaptures) {
                    index = directCaptures.findListener(fn, scope);
                    if (index !== -1) {
                        removed = directCaptures.removeListener(fn, scope, index);
                    }
                }
            }
        }
        return removed;
    },
    clearListeners: function() {
        var me = this,
            directCaptures = me.directCaptures,
            directs = me.directs,
            captures = me.captures;
        if (directCaptures) {
            directCaptures.clearListeners();
        }
        if (directs) {
            directs.clearListeners();
        }
        if (captures) {
            captures.clearListeners();
        }
        me.callParent();
    },
    suspend: function() {
        var me = this,
            directCaptures = me.directCaptures,
            directs = me.directs,
            captures = me.captures;
        if (directCaptures) {
            directCaptures.suspend();
        }
        if (directs) {
            directs.suspend();
        }
        if (captures) {
            captures.suspend();
        }
        me.callParent();
    },
    resume: function() {
        var me = this,
            directCaptures = me.directCaptures,
            directs = me.directs,
            captures = me.captures;
        if (directCaptures) {
            directCaptures.resume();
        }
        if (directs) {
            directs.resume();
        }
        if (captures) {
            captures.resume();
        }
        me.callParent();
    }
});

Ext.define('Ext.event.publisher.Publisher', {
    isEventPublisher: true,
    $vetoClearingPrototypeOnDestroy: true,
    handledEvents: [],
    statics: {
        publishers: {},
        publishersByEvent: {}
    },
    constructor: function() {
        var me = this,
            type = me.type;
        me.handles = {};
        if (!type) {
            Ext.raise("Event publisher '" + me.$className + "' defined without a 'type' property.");
        }
        if (me.self.instance) {
            Ext.raise("Cannot create multiple instances of '" + me.$className + "'. " + "Use '" + me.$className + ".instance' to retrieve the singleton instance.");
        }
        me.registerEvents();
        Ext.event.publisher.Publisher.publishers[type] = me;
    },
    registerEvents: function(events) {
        var me = this,
            publishersByEvent = Ext.event.publisher.Publisher.publishersByEvent,
            handledEvents = events || me.handledEvents,
            ln = handledEvents.length,
            eventName, i;
        for (i = 0; i < ln; i++) {
            eventName = handledEvents[i];
            me.handles[eventName] = 1;
            publishersByEvent[eventName] = me;
        }
    },
    subscribe: function() {
        Ext.raise("Ext.event.publisher.Publisher subclass '" + this.$className + '" has no subscribe method.');
    },
    unsubscribe: function() {
        Ext.raise("Ext.event.publisher.Publisher subclass '" + this.$className + '" has no unsubscribe method.');
    },
    fire: function(element, eventName, args) {
        var event;
        if (element.hasListeners[eventName]) {
            event = element.events[eventName];
            if (event) {
                event.fire.apply(event, args);
            }
        }
    }
});

Ext.define('Ext.util.Offset', {
    statics: {
        fromObject: function(obj) {
            if (obj instanceof this) {
                return obj;
            }
            if (typeof obj === 'number') {
                return new this(obj, obj);
            }
            if (obj.length) {
                return new this(obj[0], obj[1]);
            }
            return new this(obj.x, obj.y);
        }
    },
    constructor: function(x, y) {
        this.x = (x != null && !isNaN(x)) ? x : 0;
        this.y = (y != null && !isNaN(y)) ? y : 0;
        return this;
    },
    copy: function() {
        return new Ext.util.Offset(this.x, this.y);
    },
    copyFrom: function(p) {
        this.x = p.x;
        this.y = p.y;
    },
    toString: function() {
        return "Offset[" + this.x + "," + this.y + "]";
    },
    equals: function(offset) {
        if (!(offset instanceof this.statics())) {
            Ext.raise('Offset must be an instance of Ext.util.Offset');
        }
        return (this.x === offset.x && this.y === offset.y);
    },
    add: function(offset) {
        if (!(offset instanceof this.statics())) {
            Ext.raise('Offset must be an instance of Ext.util.Offset');
        }
        this.x += offset.x;
        this.y += offset.y;
    },
    round: function(to) {
        if (!isNaN(to)) {
            var factor = Math.pow(10, to);
            this.x = Math.round(this.x * factor) / factor;
            this.y = Math.round(this.y * factor) / factor;
        } else {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    },
    isZero: function() {
        return this.x === 0 && this.y === 0;
    }
});

Ext.define('Ext.util.Region', function() {
    var ExtUtil = Ext.util,
        constrainRe = /([^\?!]*)(!|\?)?$/,
        alignRe = /^(?:(?:([trbl])(\d+))|(tl|t|tc|tr|l|c|r|bl|b|bc|br))(?:-(?:(?:([trbl])(\d+))|(tl|t|tc|tr|l|c|r|bl|b|bc|br)))?$/i,
        LTROffsetFactors = {
            l: 0,
            r: 100,
            t: 0,
            b: 100,
            c: 50
        },
        RTLOffsetFactors = {
            l: 100,
            r: 0,
            t: 0,
            b: 100,
            c: 50
        },
        relativePositions = {
            b: 0,
            l: 1,
            t: 2,
            r: 3
        },
        alignMap = {
            "tl-tr": "l0-r0",
            "tl-r": "l0-r50",
            "bl-r": "l100-r50",
            "bl-br": "l100-r100",
            "tr-tl": "r0-l0",
            "tr-l": "r0-l50",
            "br-l": "r100-l50",
            "br-bl": "r100-l100"
        },
        rtlAlignMap = {
            "tl-tr": "r0-l0",
            "tl-r": "r0-l50",
            "bl-r": "r100-l50",
            "bl-br": "r100-l100",
            "tr-tl": "l0-r0",
            "tr-l": "l0-r50",
            "br-l": "l100-r50",
            "br-bl": "l100-r100"
        },
        adjustParams = [],
        zeroOffset = new ExtUtil.Offset(0, 0),
        parseRegion = function(box) {
            var Region = ExtUtil.Region,
                type = typeof box,
                top, right, bottom, left;
            if (box == null) {
                return Region.EMPTY;
            }
            if (box.isRegion) {
                return box;
            }
            if (box.isElement || box.nodeType === 1) {
                return this.getRegion(box);
            }
            if (type === 'string') {
                box = box.split(' ');
                switch (box.length) {
                    case 1:
                        box[1] = box[2] = box[3] = box[0];
                        break;
                    case 2:
                        box[2] = box[0];
                        box[3] = box[1];
                        break;
                    case 3:
                        box[3] = box[1];
                }
                top = parseInt(box[0], 10) || 0;
                right = parseInt(box[1], 10) || 0;
                bottom = parseInt(box[2], 10) || 0;
                left = parseInt(box[3], 10) || 0;
            } else if (type === 'number') {
                top = right = bottom = left = box;
            } else if (typeof box.x === 'number') {
                top = box.y;
                left = box.x;
                if (typeof box.right === 'number') {
                    right = box.right;
                    bottom = box.bottom;
                } else {
                    right = left + box.width;
                    bottom = top + box.height;
                }
            } else {
                Ext.raise('Not convertible to a Region: ' + box);
            }
            return new Region(top, right, bottom, left);
        },
        magnitude = [
            -1,
            1,
            1,
            -1
        ],
        addAnchorOffset = function(target, anchorSize, relativePosition) {
            if (relativePosition != null && anchorSize) {
                adjustParams[0] = adjustParams[1] = adjustParams[2] = adjustParams[3] = 0;
                adjustParams[relativePosition] = anchorSize.y * magnitude[relativePosition];
                target = ExtUtil.Region.from(target);
                target.adjust.apply(target, adjustParams);
            }
            return target;
        },
        calculateAnchorPosition = function(target, result, relativePosition, anchorSize, inside) {
            var minOverlap = Math.ceil(anchorSize.x / 2) + 2,
                anchorPos, isBefore, overlapLine, overlapLength, beforeStart, x, y;
            if (inside && !inside.intersect(target)) {
                return;
            }
            if (relativePosition != null) {
                if (relativePosition & 1) {
                    anchorPos = new ExtUtil.Region(0, 0, 0, 0).setWidth(anchorSize.y).setHeight(anchorSize.x);
                    isBefore = relativePosition === 3;
                    x = isBefore ? result.right : result.left;
                    overlapLine = new ExtUtil.Region(Math.max(result.top, target.top), x, Math.min(result.bottom, target.bottom), x);
                    if (target.getHeight() > minOverlap) {
                        overlapLength = overlapLine.getHeight();
                        if (overlapLength < target.width && overlapLength < anchorSize.x + 4) {
                            if (overlapLength < minOverlap) {
                                if (overlapLine.getAnchorPoint_c()[1] > target.getAnchorPoint_c()[1]) {
                                    y = target.bottom - minOverlap;
                                } else {
                                    beforeStart = true;
                                    y = target.top + minOverlap - result.getHeight();
                                }
                                if (inside) {
                                    y = Math.min(Math.max(y, inside.top), inside.bottom - result.getHeight());
                                }
                                result.setPosition(result.x, y);
                                overlapLine = new ExtUtil.Region(Math.max(result.top, target.top), x, Math.min(result.bottom, target.bottom), x);
                                overlapLength = overlapLine.getHeight();
                                if (overlapLength < minOverlap) {
                                    return;
                                }
                                if (beforeStart) {
                                    overlapLine.setPosition(x, target.y - anchorSize.x / 2 - 2);
                                }
                            }
                            overlapLine.setHeight(Math.max(overlapLength, anchorSize.x + 4));
                            if (inside && !inside.contains(overlapLine)) {
                                return;
                            }
                        }
                    }
                    result.anchor = anchorPos.alignTo({
                        target: overlapLine,
                        align: isBefore ? 'l-r' : 'r-l',
                        overlap: true
                    });
                    result.anchor.position = isBefore ? 'right' : 'left';
                } else {
                    anchorPos = new ExtUtil.Region(0, 0, 0, 0).setWidth(anchorSize.x).setHeight(anchorSize.y);
                    isBefore = relativePosition === 0;
                    y = isBefore ? result.bottom : result.top;
                    overlapLine = new ExtUtil.Region(y, Math.min(result.right, target.right), y, Math.max(result.left, target.left));
                    if (target.getWidth() > minOverlap) {
                        overlapLength = overlapLine.getWidth();
                        if (overlapLength < target.height && overlapLength < anchorSize.x + 4) {
                            if (overlapLength < minOverlap) {
                                if (overlapLine.getAnchorPoint_c()[0] > target.getAnchorPoint_c()[0]) {
                                    x = target.right - minOverlap;
                                } else {
                                    beforeStart = true;
                                    x = target.left + minOverlap - result.getWidth();
                                }
                                if (inside) {
                                    x = Math.min(Math.max(x, inside.left), inside.right - result.getWidth());
                                }
                                result.setPosition(x, result.y);
                                overlapLine = new ExtUtil.Region(y, Math.min(result.right, target.right), y, Math.max(result.left, target.left));
                                overlapLength = overlapLine.getWidth();
                                if (overlapLength < minOverlap) {
                                    return;
                                }
                                if (beforeStart) {
                                    overlapLine.setPosition(target.x - anchorSize.x / 2 - 2, y);
                                }
                            }
                            overlapLine.setWidth(Math.max(overlapLength, anchorSize.x + 4));
                            if (inside && !inside.contains(overlapLine)) {
                                return;
                            }
                        }
                    }
                    result.anchor = anchorPos.alignTo({
                        target: overlapLine,
                        align: isBefore ? 't-b' : 'b-t',
                        overlap: true
                    });
                    result.anchor.position = isBefore ? 'bottom' : 'top';
                }
                result.anchor.align = relativePosition;
            }
            return result;
        },
        checkMinHeight = function(minHeight, result, target, inside) {
            var newHeight;
            if (minHeight && inside) {
                if (result.top >= target.bottom && result.bottom > inside.bottom) {
                    result.setHeight(Math.max(result.getHeight() + inside.bottom - result.bottom, minHeight));
                    result.constrainHeight = true;
                }
                else if (result.bottom <= target.top && result.top < inside.top) {
                    newHeight = Math.max(result.getHeight() + result.top - inside.top, minHeight);
                    result.adjust(result.getHeight() - newHeight);
                    result.constrainHeight = true;
                }
                else if (result.getHeight() > inside.getHeight()) {
                    result.setHeight(Math.max(minHeight, inside.getHeight()));
                    result.setPosition(result.x, 0);
                    result.constrainHeight = true;
                }
            }
        },
        checkMinWidth = function(minWidth, result, target, inside) {
            var newWidth;
            if (minWidth && inside) {
                if (result.left >= target.right && result.right > inside.right) {
                    result.setWidth(Math.max(result.getWidth() + inside.right - result.right, minWidth));
                    result.constrainWidth = true;
                }
                else if (result.right <= target.left && result.left < inside.left) {
                    newWidth = Math.max(result.getWidth() + result.left - inside.left, minWidth);
                    result.adjust(0, 0, 0, result.getWidth() - newWidth);
                    result.constrainWidth = true;
                }
                else if (result.getWidth() > inside.getWidth()) {
                    result.setWidth(Math.max(minWidth, inside.getWidth()));
                    result.setPosition(0, result.y);
                    result.constrainWidth = true;
                }
            }
        };
    return {
        isRegion: true,
        statics: {
            getRegion: function(el) {
                return Ext.fly(el).getRegion();
            },
            from: function(o) {
                return new this(o.top, o.right, o.bottom, o.left);
            },
            getAlignInfo: function(align, rtl) {
                if (typeof align === 'object') {
                    return align;
                }
                align = align ? ((align.indexOf('-') < 0) ? 'tl-' + align : align) : 'tl-bl';
                constrain = constrainRe.exec(align);
                align = constrain[1];
                align = (rtl ? rtlAlignMap : alignMap)[align] || align;
                var offsetFactors = rtl ? RTLOffsetFactors : LTROffsetFactors,
                    constrain,
                    parts = alignRe.exec(align),
                    result;
                if (!parts) {
                    Ext.raise({
                        sourceClass: 'Ext.util.Region',
                        sourceMethod: 'getAlignInfo',
                        position: align,
                        msg: 'Attemmpted to align an element with an invalid position: "' + align + '"'
                    });
                }
                result = {
                    myEdge: parts[1],
                    myOffset: parts[2],
                    otherEdge: parts[4],
                    otherOffset: parts[5],
                    constrain: constrain[2]
                };
                if (parts[3]) {
                    result.myEdge = parts[3][0];
                    result.myOffset = offsetFactors[parts[3][1]];
                    if (result.myOffset == null) {
                        result.myOffset = 50;
                    }
                }
                if (parts[6]) {
                    result.otherEdge = parts[6][0];
                    result.otherOffset = offsetFactors[parts[6][1]];
                    if (result.otherOffset == null) {
                        result.otherOffset = 50;
                    }
                }
                result.position = relativePositions[result.myEdge];
                return result;
            }
        },
        constructor: function(top, right, bottom, left) {
            var me = this;
            me.y = me.top = me[1] = top;
            me.right = right;
            me.bottom = bottom;
            me.x = me.left = me[0] = left;
            me.height = me.bottom - me.top;
            me.width = me.right - me.left;
        },
        setPosition: function(x, y) {
            if (arguments.length === 1) {
                y = x[1];
                x = x[0];
            }
            return this.translateBy(x - this.x, y - this.y);
        },
        contains: function(region) {
            var me = this;
            return (region.x >= me.x && (region.right || region.x) <= me.right && region.y >= me.y && (region.bottom || region.y) <= me.bottom);
        },
        intersect: function(region) {
            var me = this,
                t = Math.max(me.y, region.y),
                r = Math.min(me.right, region.right),
                b = Math.min(me.bottom, region.bottom),
                l = Math.max(me.x, region.x);
            if (b > t && r > l) {
                return new this.self(t, r, b, l);
            } else {
                return false;
            }
        },
        union: function(region) {
            var me = this,
                t = Math.min(me.y, region.y),
                r = Math.max(me.right, region.right),
                b = Math.max(me.bottom, region.bottom),
                l = Math.min(me.x, region.x);
            return new this.self(t, r, b, l);
        },
        constrainTo: function(targetRegion) {
            var me = this,
                constrain = Ext.Number.constrain;
            me.top = me.y = constrain(me.top, targetRegion.y, targetRegion.bottom);
            me.bottom = constrain(me.bottom, targetRegion.y, targetRegion.bottom);
            me.left = me.x = constrain(me.left, targetRegion.x, targetRegion.right);
            me.right = constrain(me.right, targetRegion.x, targetRegion.right);
            return me;
        },
        adjust: function(top, right, bottom, left) {
            var me = this;
            me.top = me.y += top || 0;
            me.left = me.x += left || 0;
            me.right += right || 0;
            me.bottom += bottom || 0;
            return me;
        },
        getOutOfBoundOffset: function(axis, p) {
            if (!Ext.isObject(axis)) {
                if (axis === 'x') {
                    return this.getOutOfBoundOffsetX(p);
                } else {
                    return this.getOutOfBoundOffsetY(p);
                }
            } else {
                p = axis;
                var d = new ExtUtil.Offset();
                d.x = this.getOutOfBoundOffsetX(p.x);
                d.y = this.getOutOfBoundOffsetY(p.y);
                return d;
            }
        },
        getOutOfBoundOffsetX: function(p) {
            if (p <= this.x) {
                return this.x - p;
            } else if (p >= this.right) {
                return this.right - p;
            }
            return 0;
        },
        getOutOfBoundOffsetY: function(p) {
            if (p <= this.y) {
                return this.y - p;
            } else if (p >= this.bottom) {
                return this.bottom - p;
            }
            return 0;
        },
        isOutOfBound: function(axis, p) {
            if (!Ext.isObject(axis)) {
                if (axis === 'x') {
                    return this.isOutOfBoundX(p);
                } else {
                    return this.isOutOfBoundY(p);
                }
            } else {
                p = axis;
                return (this.isOutOfBoundX(p.x) || this.isOutOfBoundY(p.y));
            }
        },
        isOutOfBoundX: function(p) {
            return (p < this.x || p > this.right);
        },
        isOutOfBoundY: function(p) {
            return (p < this.y || p > this.bottom);
        },
        restrict: function(axis, p, factor) {
            if (Ext.isObject(axis)) {
                var newP;
                factor = p;
                p = axis;
                if (p.copy) {
                    newP = p.copy();
                } else {
                    newP = {
                        x: p.x,
                        y: p.y
                    };
                }
                newP.x = this.restrictX(p.x, factor);
                newP.y = this.restrictY(p.y, factor);
                return newP;
            } else {
                if (axis === 'x') {
                    return this.restrictX(p, factor);
                } else {
                    return this.restrictY(p, factor);
                }
            }
        },
        restrictX: function(p, factor) {
            if (!factor) {
                factor = 1;
            }
            if (p <= this.x) {
                p -= (p - this.x) * factor;
            } else if (p >= this.right) {
                p -= (p - this.right) * factor;
            }
            return p;
        },
        restrictY: function(p, factor) {
            if (!factor) {
                factor = 1;
            }
            if (p <= this.y) {
                p -= (p - this.y) * factor;
            } else if (p >= this.bottom) {
                p -= (p - this.bottom) * factor;
            }
            return p;
        },
        alignTo: function(options) {
            var me = this,
                Region = me.self,
                Offset = ExtUtil.Offset,
                target = parseRegion(options.target),
                targetPlusAnchorOffset,
                rtl = options.rtl,
                overlap = options.overlap,
                align = options.align,
                anchorSize = options.anchorSize,
                offset = options.offset,
                inside = options.inside,
                position = options.position,
                allowXTranslate = options.allowXTranslate,
                allowYTranslate = options.allowYTranslate,
                wasConstrained, result;
            if (offset) {
                offset = Offset.fromObject(offset);
                if (!(offset instanceof Offset)) {
                    Ext.raise('offset option must be an Ext.util.Offset');
                }
            }
            if (anchorSize) {
                anchorSize = Offset.fromObject(anchorSize);
                if (!(anchorSize instanceof Offset)) {
                    Ext.raise('anchorSize option must be an Ext.util.Offset');
                }
            }
            if (position) {
                if (position.length === 2) {
                    position = new ExtUtil.Point(position[0], position[1]);
                }
                result = new Region().copyFrom(me).setPosition(position.x, position.y);
            } else {
                align = me.getAlignInfo(align, rtl);
                if (inside) {
                    if (target.x >= inside.right) {
                        target.setPosition(inside.right - 1, target.y);
                        if (align.position !== 3) {
                            align = me.getAlignInfo('r-l', rtl);
                        }
                    } else if (target.right < inside.x) {
                        target.setPosition(inside.x - target.getWidth() + 1, target.y);
                        if (align.position !== 1) {
                            align = me.getAlignInfo('l-r', rtl);
                        }
                    }
                    if (target.y >= inside.bottom) {
                        target.setPosition(target.x, inside.bottom - 1);
                        if (align.position !== 0) {
                            align = me.getAlignInfo('b-t', rtl);
                        }
                    } else if (target.bottom < inside.y) {
                        target.setPosition(target.x, inside.y - target.getHeight() + 1);
                        if (align.position !== 2) {
                            align = me.getAlignInfo('t-b', rtl);
                        }
                    }
                }
                targetPlusAnchorOffset = anchorSize ? addAnchorOffset(target, anchorSize, align.position) : target;
                result = Region.from(me).translateBy(me.getAlignToVector(targetPlusAnchorOffset, align));
                overlap = !!result.intersect(targetPlusAnchorOffset);
                if (offset && (overlap || !anchorSize)) {
                    result.translateBy(offset);
                }
                if (anchorSize) {
                    calculateAnchorPosition(target, result, align.position, anchorSize, inside);
                }
            }
            if (inside) {
                if (result.left < inside.left) {
                    result.translateBy(inside.left - result.left, 0);
                    wasConstrained = true;
                }
                if (result.right > inside.right && result.left > inside.left) {
                    result.translateBy(inside.right - result.right, 0);
                    wasConstrained = true;
                }
                if (result.top < inside.top) {
                    result.translateBy(0, inside.top - result.top);
                    wasConstrained = true;
                }
                if (result.bottom > inside.bottom && result.top > inside.top) {
                    result.translateBy(0, inside.bottom - result.bottom);
                    wasConstrained = true;
                }
                if (wasConstrained && !overlap) {
                    result.anchor = null;
                    if (options.axisLock) {
                        if (align.position & 1) {
                            allowYTranslate = false;
                        } else {
                            allowXTranslate = false;
                        }
                    }
                    if (position) {
                        if (result.contains(position)) {
                            position.exclude(result, {
                                inside: inside,
                                centerOnSideChange: false
                            });
                        }
                    } else {
                        if (result.intersect(targetPlusAnchorOffset)) {
                            align.position = target.exclude(result, {
                                defaultPosition: align.position,
                                inside: inside,
                                minHeight: options.minHeight,
                                minWidth: options.minWidth,
                                allowX: allowXTranslate,
                                allowY: allowYTranslate,
                                offset: offset,
                                anchorHeight: anchorSize ? anchorSize.y : 0,
                                centerOnSideChange: !!anchorSize
                            });
                        } else if (options.minWidth && result.getWidth() > inside.getWidth()) {
                            result.setPosition(0, result.y);
                            result.setWidth(Math.max(inside.getWidth(), options.minWidth));
                            result.constrainWidth = true;
                        } else if (options.minHeight && result.getHeight() > inside.getHeight()) {
                            result.setPosition(result.x, 0);
                            result.setHeight(Math.max(inside.getHeight(), options.minHeight));
                            result.constrainHeight = true;
                        }
                        result.align = align;
                        if (anchorSize) {
                            calculateAnchorPosition(target, result, align.position, anchorSize, inside);
                        }
                    }
                }
            }
            return result;
        },
        exclude: function(other, options) {
            options = options || {};
            var me = this,
                inside = options.inside,
                defaultPosition = options.defaultPosition,
                centerOnSideChange = options.centerOnSideChange,
                minHeight = options.minHeight,
                minWidth = options.minWidth,
                allowX = options.allowX !== false,
                allowY = options.allowY !== false,
                anchorHeight = options.anchorHeight,
                offset = options.offset,
                translations = [],
                testRegion, t, i, sizeConstrainedSolution, leastBadSolution, intersection, result;
            if (!offset) {
                offset = zeroOffset;
            }
            if (allowY) {
                translations.push([
                    0,
                    t = me.top - other.bottom - anchorHeight + offset.y,
                    'b-t',
                    0,
                    Math.abs(t)
                ]);
                translations.push([
                    0,
                    t = me.bottom - other.top + anchorHeight + offset.y,
                    't-b',
                    2,
                    Math.abs(t)
                ]);
            } else {
                centerOnSideChange = false;
            }
            if (allowX) {
                translations.push([
                    t = me.left - other.right - anchorHeight + offset.x,
                    0,
                    'r-l',
                    3,
                    Math.abs(t)
                ]);
                translations.push([
                    t = me.right - other.left + anchorHeight + offset.x,
                    0,
                    'l-r',
                    1,
                    Math.abs(t)
                ]);
            } else {
                centerOnSideChange = false;
            }
            Ext.Array.sort(translations, function(l, r) {
                var result = l[4] - r[4];
                if (!result) {
                    if (l[3] === defaultPosition) {
                        return -1;
                    }
                    if (r[3] === defaultPosition) {
                        return 1;
                    }
                }
                return result;
            });
            if (inside) {
                for (i = 0; i < translations.length; i++) {
                    t = translations[i];
                    testRegion = ExtUtil.Region.from(other);
                    testRegion.translateBy.apply(testRegion, t);
                    if (inside.contains(testRegion)) {
                        other.copyFrom(testRegion);
                        result = {
                            align: t[2],
                            position: t[3],
                            distance: t[4]
                        };
                        break;
                    }
                    if (minHeight) {
                        checkMinHeight(minHeight, testRegion, me, inside);
                        if (inside.contains(testRegion)) {
                            if (!sizeConstrainedSolution || testRegion.getArea() > sizeConstrainedSolution.region.getArea()) {
                                sizeConstrainedSolution = {
                                    region: testRegion,
                                    align: t[2],
                                    position: t[3],
                                    distance: t[4]
                                };
                            }
                        }
                    }
                    if (minWidth) {
                        checkMinWidth(minWidth, testRegion, me, inside);
                        if (inside.contains(testRegion)) {
                            if (!sizeConstrainedSolution || testRegion.getArea() > sizeConstrainedSolution.region.getArea()) {
                                sizeConstrainedSolution = {
                                    region: testRegion,
                                    align: t[2],
                                    position: t[3],
                                    distance: t[4]
                                };
                            }
                        }
                    }
                    intersection = inside.intersect(testRegion);
                    if (intersection) {
                        intersection = intersection.getArea();
                        if (!leastBadSolution || (intersection && leastBadSolution.area < intersection)) {
                            leastBadSolution = {
                                region: testRegion,
                                align: t[2],
                                position: t[3],
                                distance: t[4],
                                area: intersection
                            };
                        }
                    }
                }
                if (!result) {
                    if (sizeConstrainedSolution) {
                        other.copyFrom(sizeConstrainedSolution.region);
                        result = sizeConstrainedSolution;
                        other.constrainWidth = sizeConstrainedSolution.region.constrainWidth;
                        other.constrainHeight = sizeConstrainedSolution.region.constrainHeight;
                    }
                    else if (leastBadSolution) {
                        other.copyFrom(leastBadSolution.region);
                        result = leastBadSolution;
                    }
                }
                if (result) {
                    if ((result.position & 1) !== (defaultPosition & 1)) {
                        if (result.distance && centerOnSideChange) {
                            t = other.alignTo({
                                align: result.align,
                                target: me,
                                anchorSize: anchorHeight,
                                offset: offset,
                                axisLock: true,
                                inside: inside,
                                minHeight: options.minHeight,
                                minWidth: options.minWidth
                            });
                            if (inside.contains(t)) {
                                other.setPosition(t.x, t.y);
                            }
                        }
                    }
                    return result.position;
                }
            } else {
                other.translateBy.apply(other, translations[0]);
                return translations[0][3];
            }
            return defaultPosition;
        },
        getAlignToXY: function(target, align, rtl) {
            var alignVector = this.getAlignToVector(target, align, rtl);
            return [
                this.x + alignVector[0],
                this.y + alignVector[1]
            ];
        },
        getAnchorPoint: function(align, rtl) {
            align = (typeof align === 'string') ? this.getAlignInfo(align + '-tl', rtl) : align;
            return this['getAnchorPoint_' + align.myEdge](align.myOffset);
        },
        getAlignToVector: function(target, align, rtl) {
            align = (typeof align === 'string') ? this.getAlignInfo(align, rtl) : align;
            var myAnchorPoint = this['getAnchorPoint_' + align.myEdge](align.myOffset),
                targetAnchorPoint = target['getAnchorPoint_' + align.otherEdge](align.otherOffset);
            return [
                targetAnchorPoint[0] - myAnchorPoint[0],
                targetAnchorPoint[1] - myAnchorPoint[1]
            ];
        },
        getAnchorPoint_t: function(offset) {
            return [
                this.x + Math.round(this.getWidth() * (offset / 100)),
                this.y
            ];
        },
        getAnchorPoint_b: function(offset) {
            return [
                this.x + Math.round(this.getWidth() * (offset / 100)),
                this.bottom
            ];
        },
        getAnchorPoint_l: function(offset) {
            return [
                this.x,
                this.y + Math.round(this.getHeight() * (offset / 100))
            ];
        },
        getAnchorPoint_r: function(offset) {
            return [
                this.right,
                this.y + Math.round(this.getHeight() * (offset / 100))
            ];
        },
        getAnchorPoint_c: function() {
            return [
                this.x + Math.round(this.getWidth() / 2),
                this.y + Math.round(this.getHeight() / 2)
            ];
        },
        getHeight: function() {
            return this.bottom - this.y;
        },
        getWidth: function() {
            return this.right - this.x;
        },
        getArea: function() {
            return this.getHeight() * this.getWidth();
        },
        setHeight: function(h) {
            this.bottom = this.top + h;
            return this;
        },
        setWidth: function(w) {
            this.right = this.left + w;
            return this;
        },
        getSize: function() {
            return {
                width: this.right - this.x,
                height: this.bottom - this.y
            };
        },
        copy: function() {
            return new this.self(this.y, this.right, this.bottom, this.x);
        },
        copyFrom: function(p) {
            var me = this;
            me.top = me.y = me[1] = p.y;
            me.right = p.right;
            me.bottom = p.bottom;
            me.left = me.x = me[0] = p.x;
            return this;
        },
        toString: function() {
            return "Region[" + this.top + "," + this.right + "," + this.bottom + "," + this.left + "]";
        },
        translateBy: function(x, y) {
            if (x.length) {
                y = x[1];
                x = x[0];
            } else if (arguments.length === 1) {
                y = x.y;
                x = x.x;
            }
            var me = this;
            me.top = me.y += y;
            me.right += x;
            me.bottom += y;
            me.left = me.x += x;
            return me;
        },
        round: function() {
            var me = this;
            me.top = me.y = Math.round(me.y);
            me.right = Math.round(me.right);
            me.bottom = Math.round(me.bottom);
            me.left = me.x = Math.round(me.x);
            return me;
        },
        equals: function(region) {
            return (this.top === region.top && this.right === region.right && this.bottom === region.bottom && this.left === region.left);
        },
        getOffsetsTo: function(offsetsTo) {
            return {
                x: this.x - offsetsTo.x,
                y: this.y - offsetsTo.y
            };
        }
    };
}, function(Region) {
    Region.prototype.getAlignInfo = Region.getAlignInfo;
    Region.EMPTY = new Region(0, 0, 0, 0);
    if (Object.freeze) {
        Object.freeze(Region.EMPTY);
    }
});

Ext.define('Ext.util.Point', {
    extend: Ext.util.Region,
    isPoint: true,
    radianToDegreeConstant: 180 / Math.PI,
    origin: {
        x: 0,
        y: 0
    },
    statics: {
        fromEvent: function(e) {
            var changedTouches = e.changedTouches,
                touch = (changedTouches && changedTouches.length > 0) ? changedTouches[0] : e;
            return this.fromTouch(touch);
        },
        fromTouch: function(touch) {
            return new this(touch.pageX, touch.pageY);
        },
        from: function(object) {
            if (!object) {
                return new this(0, 0);
            }
            if (!(object instanceof this)) {
                return new this(object.x, object.y);
            }
            return object;
        }
    },
    constructor: function(x, y) {
        if (x == null) {
            x = 0;
        }
        if (y == null) {
            y = 0;
        }
        this.callParent([
            y,
            x,
            y,
            x
        ]);
    },
    clone: function() {
        return new this.self(this.x, this.y);
    },
    copy: function() {
        return this.clone.apply(this, arguments);
    },
    copyFrom: function(point) {
        this.x = point.x;
        this.y = point.y;
        return this;
    },
    toString: function() {
        return "Point[" + this.x + "," + this.y + "]";
    },
    equals: function(point) {
        return (this.x === point.x && this.y === point.y);
    },
    isCloseTo: function(point, threshold) {
        if (typeof threshold == 'number') {
            return this.getDistanceTo(point) <= threshold;
        }
        var x = point.x,
            y = point.y,
            thresholdX = threshold.x,
            thresholdY = threshold.y;
        return (this.x <= x + thresholdX && this.x >= x - thresholdX && this.y <= y + thresholdY && this.y >= y - thresholdY);
    },
    isWithin: function() {
        return this.isCloseTo.apply(this, arguments);
    },
    isContainedBy: function(region) {
        if (!(region instanceof Ext.util.Region)) {
            region = Ext.get(region.el || region).getRegion();
        }
        return region.contains(this);
    },
    roundedEquals: function(point) {
        if (!point || typeof point !== 'object') {
            point = this.origin;
        }
        return (Math.round(this.x) === Math.round(point.x) && Math.round(this.y) === Math.round(point.y));
    },
    getDistanceTo: function(point) {
        if (!point || typeof point !== 'object') {
            point = this.origin;
        }
        var deltaX = this.x - point.x,
            deltaY = this.y - point.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    },
    getAngleTo: function(point) {
        if (!point || typeof point !== 'object') {
            point = this.origin;
        }
        var deltaX = this.x - point.x,
            deltaY = this.y - point.y;
        return Math.atan2(deltaY, deltaX) * this.radianToDegreeConstant;
    }
}, function() {
    this.prototype.translate = this.prototype.translateBy;
});

Ext.define('Ext.event.Event', {
    alternateClassName: 'Ext.EventObjectImpl',
    stopped: false,
    claimed: false,
    defaultPrevented: false,
    isEvent: true,
    statics: {
        resolveTextNode: function(node) {
            return (node && node.nodeType === 3) ? node.parentNode : node;
        },
        pointerEvents: {
            pointerdown: 1,
            pointermove: 1,
            pointerup: 1,
            pointercancel: 1,
            pointerover: 1,
            pointerout: 1,
            pointerenter: 1,
            pointerleave: 1,
            MSPointerDown: 1,
            MSPointerMove: 1,
            MSPointerUp: 1,
            MSPointerOver: 1,
            MSPointerOut: 1,
            MSPointerCancel: 1,
            MSPointerEnter: 1,
            MSPointerLeave: 1
        },
        mouseEvents: {
            mousedown: 1,
            mousemove: 1,
            mouseup: 1,
            mouseover: 1,
            mouseout: 1,
            mouseenter: 1,
            mouseleave: 1
        },
        clickEvents: {
            click: 1,
            dblclick: 1
        },
        touchEvents: {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            touchcancel: 1
        },
        focusEvents: {
            focus: 1,
            blur: 1,
            focusin: 1,
            focusout: 1,
            focusenter: 1,
            focusleave: 1
        },
        pointerTypeMap: {
            2: 'touch',
            3: 'pen',
            4: 'mouse',
            touch: 'touch',
            pen: 'pen',
            mouse: 'mouse'
        },
        keyFlags: {
            CTRL: 'ctrlKey',
            CONTROL: 'ctrlKey',
            ALT: 'altKey',
            SHIFT: 'shiftKey',
            CMD: 'metaKey',
            COMMAND: 'metaKey',
            CMDORCTRL: Ext.isMac ? 'metaKey' : 'ctrlKey',
            COMMANDORCONTROL: Ext.isMac ? 'metaKey' : 'ctrlKey',
            META: 'metaKey'
        },
        modifierGlyphs: {
            ctrlKey: '⌃',
            altKey: '⌥',
            metaKey: Ext.isMac ? '⌘' : '⊞',
            shiftKey: '⇧'
        },
        specialKeyGlyphs: {
            BACKSPACE: '⌫',
            TAB: '⇥',
            ENTER: '⏎',
            RETURN: '⏎',
            SPACE: '␣',
            PAGE_UP: '⇞',
            PAGE_DOWN: '⇟',
            END: '⇲',
            HOME: '⌂',
            LEFT: '←',
            UP: '↑',
            RIGHT: '→',
            DOWN: '↓',
            PRINT_SCREEN: '⎙',
            INSERT: '⎀',
            DELETE: '⌦',
            CONTEXT_MENU: '☰'
        },
        getKeyId: function(keyName) {
            keyName = keyName.toUpperCase();
            var me = this,
                parts = keyName.split('+'),
                numModifiers = parts.length - 1,
                rawKey = parts[numModifiers],
                result = [],
                eventFlag, i;
            if (!Ext.event.Event[rawKey]) {
                Ext.raise('Invalid key name: "' + rawKey + '"');
            }
            for (i = 0; i < numModifiers; i++) {
                eventFlag = me.keyFlags[parts[i]];
                if (!eventFlag) {
                    Ext.raise('Invalid key modifier: "' + parts[i] + '"');
                }
                result[eventFlag] = true;
            }
            if (result.ctrlKey) {
                result.push(me.modifierGlyphs.ctrlKey);
            }
            if (result.altKey) {
                result.push(me.modifierGlyphs.altKey);
            }
            if (result.shiftKey) {
                result.push(me.modifierGlyphs.shiftKey);
            }
            if (result.metaKey) {
                result.push(me.modifierGlyphs.metaKey);
            }
            result.push(this.specialKeyGlyphs[rawKey] || rawKey);
            return result.join('');
        }
    },
    constructor: function(event) {
        var me = this,
            self = me.self,
            resolveTextNode = me.self.resolveTextNode,
            changedTouches = event.changedTouches,
            coordinateOwner = changedTouches ? changedTouches[0] : event,
            type = event.type,
            pointerType, relatedTarget;
        me.timeStamp = me.time = Ext.now();
        me.pageX = coordinateOwner.pageX;
        me.pageY = coordinateOwner.pageY;
        me.clientX = coordinateOwner.clientX;
        me.clientY = coordinateOwner.clientY;
        me.target = me.delegatedTarget = resolveTextNode(event.target);
        relatedTarget = event.relatedTarget;
        if (relatedTarget) {
            if (Ext.isGecko && type === 'dragenter' || type === 'dragleave') {
                try {
                    me.relatedTarget = resolveTextNode(relatedTarget);
                } catch (e) {
                    me.relatedTarget = null;
                }
            } else {
                me.relatedTarget = resolveTextNode(relatedTarget);
            }
        }
        me.browserEvent = me.event = event;
        me.type = type;
        me.button = event.button || 0;
        me.shiftKey = event.shiftKey;
        me.ctrlKey = event.ctrlKey || event.metaKey || false;
        me.altKey = event.altKey;
        me.charCode = event.charCode;
        me.keyCode = event.keyCode;
        me.buttons = event.buttons;
        if (me.button === 0 && me.buttons === 0) {
            me.buttons = 1;
        }
        if (self.focusEvents[type]) {
            if (self.forwardTab !== undefined) {
                me.forwardTab = self.forwardTab;
            }
        } else if (type !== 'keydown') {
            delete self.forwardTab;
        }
        if (self.mouseEvents[type]) {
            pointerType = 'mouse';
        } else if (self.clickEvents[type]) {
            pointerType = self.pointerTypeMap[event.pointerType] || 'mouse';
        } else if (self.pointerEvents[type]) {
            pointerType = self.pointerTypeMap[event.pointerType];
        } else if (self.touchEvents[type]) {
            pointerType = 'touch';
        }
        if (pointerType) {
            me.pointerType = pointerType;
        }
        me.isMultitouch = event.isPrimary === false || (event.touches && event.touches.length > 1);
    },
    chain: function(props) {
        var e = Ext.Object.chain(this);
        e.parentEvent = this;
        return Ext.apply(e, props);
    },
    correctWheelDelta: function(delta) {
        var scale = this.WHEEL_SCALE,
            ret = Math.round(delta / scale);
        if (!ret && delta) {
            ret = (delta < 0) ? -1 : 1;
        }
        return ret;
    },
    getCharCode: function() {
        return this.charCode || this.keyCode;
    },
    getKey: function() {
        return this.keyCode || this.charCode;
    },
    getKeyName: function() {
        return this.keyCodes[this.keyCode];
    },
    getPoint: function() {
        var me = this,
            point = me.point,
            xy;
        if (!point) {
            xy = me.getXY();
            point = me.point = new Ext.util.Point(xy[0], xy[1]);
        }
        return point;
    },
    getRelatedTarget: function(selector, maxDepth, returnEl) {
        var relatedTarget = this.relatedTarget,
            target = null;
        if (relatedTarget && relatedTarget.nodeType) {
            if (selector) {
                target = Ext.fly(relatedTarget).findParent(selector, maxDepth, returnEl);
            } else {
                target = returnEl ? Ext.get(relatedTarget) : relatedTarget;
            }
        }
        return target;
    },
    getTarget: function(selector, maxDepth, returnEl) {
        return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
    },
    getTime: function() {
        return this.time;
    },
    getWheelDelta: function() {
        var deltas = this.getWheelDeltas();
        return deltas.y;
    },
    getWheelDeltas: function() {
        var me = this,
            event = me.browserEvent,
            dx = 0,
            dy = 0;
        if (Ext.isDefined(event.wheelDeltaX)) {
            dx = event.wheelDeltaX;
            dy = event.wheelDeltaY;
        } else if (event.wheelDelta) {
            dy = event.wheelDelta;
        } else if ('deltaX' in event) {
            dx = event.deltaX;
            dy = -event.deltaY;
        }
        else if (event.detail) {
            dy = -event.detail;
            if (dy > 100) {
                dy = 3;
            } else if (dy < -100) {
                dy = -3;
            }
            if (Ext.isDefined(event.axis) && event.axis === event.HORIZONTAL_AXIS) {
                dx = dy;
                dy = 0;
            }
        }
        return {
            x: me.correctWheelDelta(dx),
            y: me.correctWheelDelta(dy)
        };
    },
    getX: function() {
        return this.getXY()[0];
    },
    getXY: function() {
        var me = this,
            xy = me.xy;
        if (!xy) {
            xy = me.xy = [
                me.pageX,
                me.pageY
            ];
            var x = xy[0],
                browserEvent, doc, docEl, body;
            if (!x && x !== 0) {
                browserEvent = me.browserEvent;
                doc = document;
                docEl = doc.documentElement;
                body = doc.body;
                xy[0] = browserEvent.clientX + (docEl && docEl.scrollLeft || body && body.scrollLeft || 0) - (docEl && docEl.clientLeft || body && body.clientLeft || 0);
                xy[1] = browserEvent.clientY + (docEl && docEl.scrollTop || body && body.scrollTop || 0) - (docEl && docEl.clientTop || body && body.clientTop || 0);
            }
        }
        return xy;
    },
    getY: function() {
        return this.getXY()[1];
    },
    hasModifier: function() {
        var me = this;
        return !!(me.ctrlKey || me.altKey || me.shiftKey || me.metaKey);
    },
    isNavKeyPress: function(scrollableOnly) {
        var me = this,
            k = me.keyCode,
            isKeyPress = me.type === 'keypress';
        return ((!isKeyPress || Ext.isGecko) && k >= 33 && k <= 40) || (!scrollableOnly && (k === me.RETURN || k === me.TAB || k === me.ESC));
    },
    isSpecialKey: function() {
        var me = this,
            k = me.keyCode,
            isGecko = Ext.isGecko,
            isKeyPress = me.type === 'keypress';
        return (isGecko && isKeyPress && me.charCode === 0) || (this.isNavKeyPress()) || (k === me.BACKSPACE) || (k === me.ENTER) || (k >= 16 && k <= 20) || ((!isKeyPress || isGecko) && k >= 44 && k <= 46);
    },
    makeUnpreventable: function() {
        this.browserEvent.preventDefault = Ext.emptyFn;
    },
    preventDefault: function() {
        var me = this,
            parentEvent = me.parentEvent;
        me.defaultPrevented = true;
        if (parentEvent) {
            parentEvent.defaultPrevented = true;
        }
        me.browserEvent.preventDefault();
        return me;
    },
    setCurrentTarget: function(target) {
        this.currentTarget = this.delegatedTarget = target;
    },
    stopEvent: function() {
        return this.preventDefault().stopPropagation();
    },
    stopPropagation: function() {
        var me = this,
            browserEvent = me.browserEvent,
            parentEvent = me.parentEvent;
        me.stopped = true;
        if (parentEvent && !me.isGesture) {
            parentEvent.stopped = true;
        }
        if (!browserEvent.stopPropagation) {
            browserEvent.cancelBubble = true;
            return me;
        }
        browserEvent.stopPropagation();
        return me;
    },
    claimGesture: function() {
        var me = this,
            parentEvent = me.parentEvent;
        me.claimed = true;
        if (parentEvent && !me.hasOwnProperty('isGesture')) {
            parentEvent.claimGesture();
        } else {
            me.preventDefault();
        }
        return me;
    },
    within: function(el, related, allowEl) {
        var t;
        if (el) {
            t = related ? this.getRelatedTarget() : this.getTarget();
        }
        return t ? Ext.fly(el).contains(t) || !!(allowEl && t === Ext.getDom(el)) : false;
    },
    deprecated: {
        '4.0': {
            methods: {
                getPageX: 'getX',
                getPageY: 'getY'
            }
        }
    }
}, function(Event) {
    var prototype = Event.prototype,
        constants = {
            BACKSPACE: 8,
            TAB: 9,
            NUM_CENTER: 12,
            ENTER: 13,
            RETURN: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            PAUSE: 19,
            CAPS_LOCK: 20,
            ESC: 27,
            SPACE: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            PRINT_SCREEN: 44,
            INSERT: 45,
            DELETE: 46,
            ZERO: 48,
            ONE: 49,
            TWO: 50,
            THREE: 51,
            FOUR: 52,
            FIVE: 53,
            SIX: 54,
            SEVEN: 55,
            EIGHT: 56,
            NINE: 57,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            CONTEXT_MENU: 93,
            NUM_ZERO: 96,
            NUM_ONE: 97,
            NUM_TWO: 98,
            NUM_THREE: 99,
            NUM_FOUR: 100,
            NUM_FIVE: 101,
            NUM_SIX: 102,
            NUM_SEVEN: 103,
            NUM_EIGHT: 104,
            NUM_NINE: 105,
            NUM_MULTIPLY: 106,
            NUM_PLUS: 107,
            NUM_MINUS: 109,
            NUM_PERIOD: 110,
            NUM_DIVISION: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            WHEEL_SCALE: (function() {
                var scale;
                if (Ext.isGecko) {
                    scale = 3;
                } else if (Ext.isMac) {
                    if (Ext.isSafari && Ext.webKitVersion >= 532) {
                        scale = 120;
                    } else {
                        scale = 12;
                    }
                    scale *= 3;
                } else {
                    scale = 120;
                }
                return scale;
            }())
        },
        keyCodes = {},
        keyName, keyCode;
    Ext.apply(Event, constants);
    Ext.apply(prototype, constants);
    delete constants.WHEEL_SCALE;
    delete constants.RETURN;
    for (keyName in constants) {
        keyCode = constants[keyName];
        keyCodes[keyCode] = keyName;
    }
    prototype.keyCodes = keyCodes;
    prototype.getTrueXY = prototype.getXY;
});

Ext.define('Ext.event.publisher.Dom', {
    extend: Ext.event.publisher.Publisher,
    type: 'dom',
    handledDomEvents: [],
    reEnterCount: 0,
    captureEvents: {
        animationstart: 1,
        animationend: 1,
        resize: 1,
        focus: 1,
        blur: 1
    },
    directEvents: {
        mouseenter: 1,
        mouseleave: 1,
        pointerenter: 1,
        pointerleave: 1,
        MSPointerEnter: 1,
        MSPointerLeave: 1,
        load: 1,
        unload: 1,
        beforeunload: 1,
        error: 1,
        DOMContentLoaded: 1,
        DOMFrameContentLoaded: 1,
        hashchange: 1,
        scroll: 1
    },
    blockedPointerEvents: {
        pointerover: 1,
        pointerout: 1,
        pointerenter: 1,
        pointerleave: 1,
        MSPointerOver: 1,
        MSPointerOut: 1,
        MSPointerEnter: 1,
        MSPointerLeave: 1
    },
    blockedCompatibilityMouseEvents: {
        mouseenter: 1,
        mouseleave: 1
    },
    constructor: function() {
        var me = this;
        me.bubbleSubscribers = {};
        me.captureSubscribers = {};
        me.directSubscribers = {};
        me.directCaptureSubscribers = {};
        me.delegatedListeners = {};
        me.initHandlers();
        Ext.onInternalReady(me.onReady, me);
        me.callParent();
    },
    registerEvents: function() {
        var me = this,
            publishersByEvent = Ext.event.publisher.Publisher.publishersByEvent,
            domEvents = me.handledDomEvents,
            ln = domEvents.length,
            i = 0,
            eventName;
        for (; i < ln; i++) {
            eventName = domEvents[i];
            me.handles[eventName] = 1;
            publishersByEvent[eventName] = me;
        }
        this.callParent();
    },
    onReady: function() {
        var me = this,
            domEvents = me.handledDomEvents,
            ln, i;
        if (domEvents) {
            for (i = 0 , ln = domEvents.length; i < ln; i++) {
                me.addDelegatedListener(domEvents[i]);
            }
        }
        Ext.getWin().on('unload', me.destroy, me);
    },
    initHandlers: function() {
        var me = this;
        me.onDelegatedEvent = Ext.bind(me.onDelegatedEvent, me);
        me.onDirectEvent = Ext.bind(me.onDirectEvent, me);
        me.onDirectCaptureEvent = Ext.bind(me.onDirectCaptureEvent, me);
    },
    addDelegatedListener: function(eventName) {
        this.delegatedListeners[eventName] = 1;
        this.target.addEventListener(eventName, this.onDelegatedEvent, !!this.captureEvents[eventName]);
    },
    removeDelegatedListener: function(eventName) {
        delete this.delegatedListeners[eventName];
        this.target.removeEventListener(eventName, this.onDelegatedEvent, !!this.captureEvents[eventName]);
    },
    addDirectListener: function(eventName, element, capture) {
        element.dom.addEventListener(eventName, capture ? this.onDirectCaptureEvent : this.onDirectEvent, capture);
    },
    removeDirectListener: function(eventName, element, capture) {
        element.dom.removeEventListener(eventName, capture ? this.onDirectCaptureEvent : this.onDirectEvent, capture);
    },
    subscribe: function(element, eventName, delegated, capture) {
        var me = this,
            subscribers, id;
        if (delegated && !me.directEvents[eventName]) {
            subscribers = capture ? me.captureSubscribers : me.bubbleSubscribers;
            if (!me.handles[eventName] && !me.delegatedListeners[eventName]) {
                me.addDelegatedListener(eventName);
            }
            if (subscribers[eventName]) {
                ++subscribers[eventName];
            } else {
                subscribers[eventName] = 1;
            }
        } else {
            subscribers = capture ? me.directCaptureSubscribers : me.directSubscribers;
            id = element.id;
            subscribers = subscribers[eventName] || (subscribers[eventName] = {});
            if (subscribers[id]) {
                ++subscribers[id];
            } else {
                subscribers[id] = 1;
                me.addDirectListener(eventName, element, capture);
            }
        }
    },
    unsubscribe: function(element, eventName, delegated, capture) {
        var me = this,
            captureSubscribers, bubbleSubscribers, subscribers, id;
        if (delegated && !me.directEvents[eventName]) {
            captureSubscribers = me.captureSubscribers;
            bubbleSubscribers = me.bubbleSubscribers;
            subscribers = capture ? captureSubscribers : bubbleSubscribers;
            if (subscribers[eventName]) {
                --subscribers[eventName];
            }
            if (!me.handles[eventName] && !bubbleSubscribers[eventName] && !captureSubscribers[eventName]) {
                this.removeDelegatedListener(eventName);
            }
        } else {
            subscribers = capture ? me.directCaptureSubscribers : me.directSubscribers;
            id = element.id;
            subscribers = subscribers[eventName];
            if (subscribers[id]) {
                --subscribers[id];
            }
            if (!subscribers[id]) {
                delete subscribers[id];
                me.removeDirectListener(eventName, element, capture);
            }
        }
    },
    getPropagatingTargets: function(target) {
        var currentNode = target,
            targets = [],
            parentNode;
        while (currentNode) {
            targets.push(currentNode);
            parentNode = currentNode.parentNode;
            if (!parentNode) {
                parentNode = currentNode.defaultView;
            }
            currentNode = parentNode;
        }
        return targets;
    },
    publish: function(e, targets, claimed) {
        var me = this,
            hasCaptureSubscribers = false,
            hasBubbleSubscribers = false,
            events, type, target, el, i, ln, j, eLn;
        claimed = claimed || false;
        if (!targets) {
            if (e instanceof Array) {
                Ext.raise("Propagation targets must be supplied when publishing an array of events.");
            }
            target = e.target;
            if (me.captureEvents[e.type]) {
                el = Ext.cache[target.id];
                targets = el ? [
                    el
                ] : [];
            } else {
                targets = me.getPropagatingTargets(target);
            }
        }
        events = Ext.Array.from(e);
        ln = targets.length;
        eLn = events.length;
        for (i = 0; i < eLn; i++) {
            type = events[i].type;
            if (!hasCaptureSubscribers && me.captureSubscribers[type]) {
                hasCaptureSubscribers = true;
            }
            if (!hasBubbleSubscribers && me.bubbleSubscribers[type]) {
                hasBubbleSubscribers = true;
            }
        }
        if (hasCaptureSubscribers) {
            for (i = ln; i--; ) {
                el = Ext.cache[targets[i].id];
                if (el) {
                    for (j = 0; j < eLn; j++) {
                        e = events[j];
                        me.fire(el, e.type, e, false, true);
                        if (!claimed && e.claimed) {
                            claimed = true;
                            j = me.filterClaimed(events, e);
                            eLn = events.length;
                        }
                        if (e.stopped) {
                            events.splice(j, 1);
                            j--;
                            eLn--;
                        }
                    }
                }
            }
        }
        if (hasBubbleSubscribers && !e.stopped) {
            for (i = 0; i < ln; i++) {
                el = Ext.cache[targets[i].id];
                if (el) {
                    for (j = 0; j < eLn; j++) {
                        e = events[j];
                        me.fire(el, e.type, e, false, false);
                        if (!claimed && e.claimed && me.filterClaimed) {
                            claimed = true;
                            j = me.filterClaimed(events, e);
                            eLn = events.length;
                        }
                        if (e.stopped) {
                            events.splice(j, 1);
                            j--;
                            eLn--;
                        }
                    }
                }
            }
        }
    },
    publishDelegatedDomEvent: function(e) {
        this.publish(e);
    },
    fire: function(element, eventName, e, direct, capture) {
        var event;
        if (element.hasListeners[eventName]) {
            event = element.events[eventName];
            if (event) {
                if (capture && direct) {
                    event = event.directCaptures;
                } else if (capture) {
                    event = event.captures;
                } else if (direct) {
                    event = event.directs;
                }
                if (event) {
                    e.setCurrentTarget(element.dom);
                    event.fire(e, e.target);
                }
            }
        }
    },
    onDelegatedEvent: function(e) {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doDelegatedEvent, this, [
                e
            ]);
        } else {
            this.doDelegatedEvent(e);
        }
    },
    doDelegatedEvent: function(e) {
        var me = this,
            timeStamp;
        e = new Ext.event.Event(e);
        timeStamp = e.time;
        if (!me.isEventBlocked(e)) {
            me.beforeEvent(e);
            Ext.frameStartTime = timeStamp;
            me.reEnterCount++;
            me.publishDelegatedDomEvent(e);
            me.reEnterCount--;
            me.afterEvent(e);
        }
    },
    onDirectEvent: function(e) {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doDirectEvent, this, [
                e,
                false
            ]);
        } else {
            this.doDirectEvent(e, false);
        }
    },
    onDirectCaptureEvent: function(e) {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doDirectEvent, this, [
                e,
                true
            ]);
        } else {
            this.doDirectEvent(e, true);
        }
    },
    doDirectEvent: function(e, capture) {
        var me = this,
            currentTarget = e.currentTarget,
            timeStamp, el;
        e = new Ext.event.Event(e);
        timeStamp = e.time;
        if (me.isEventBlocked(e)) {
            return;
        }
        me.beforeEvent(e);
        Ext.frameStartTime = timeStamp;
        el = Ext.cache[currentTarget.id];
        if (el) {
            me.reEnterCount++;
            me.fire(el, e.type, e, true, capture);
            me.reEnterCount--;
        }
        me.afterEvent(e);
    },
    beforeEvent: function(e) {
        var browserEvent = e.browserEvent,
            self = Ext.event.publisher.Dom,
            touches, touch;
        if (browserEvent.type === 'touchstart') {
            touches = browserEvent.touches;
            if (touches.length === 1) {
                touch = touches[0];
                self.lastTouchStartX = touch.pageX;
                self.lastTouchStartY = touch.pageY;
            }
        }
    },
    afterEvent: function(e) {
        var browserEvent = e.browserEvent,
            type = browserEvent.type,
            self = Ext.event.publisher.Dom,
            GlobalEvents = Ext.GlobalEvents;
        if (e.self.pointerEvents[type] && e.pointerType !== 'mouse') {
            self.lastScreenPointerEventTime = Ext.now();
        }
        if (type === 'touchend') {
            self.lastTouchEndTime = Ext.now();
        }
        if (!this.reEnterCount && GlobalEvents.hasListeners.idle && !GlobalEvents.idleEventMask[type]) {
            GlobalEvents.fireEvent('idle');
        }
    },
    isEventBlocked: function(e) {
        var me = this,
            type = e.type,
            self = Ext.event.publisher.Dom,
            now = Ext.now();
        if (Ext.isGecko && e.type === 'click' && e.button === 2) {
            return true;
        }
        return (me.blockedPointerEvents[type] && e.pointerType !== 'mouse') || (me.blockedCompatibilityMouseEvents[type] && (now - self.lastScreenPointerEventTime < 1000)) || (Ext.supports.TouchEvents && e.self.mouseEvents[e.type] && Math.abs(e.pageX - self.lastTouchStartX) < 15 && Math.abs(e.pageY - self.lastTouchStartY) < 15 && (Ext.now() - self.lastTouchEndTime) < 1000);
    },
    destroy: function() {
        var GC = Ext.dom['GarbageCollector'],
            eventName;
        for (eventName in this.delegatedListeners) {
            this.removeDelegatedListener(eventName);
        }
        Ext.Reaper.flush();
        if (GC) {
            GC.collect();
        }
        this.callParent();
    },
    reset: function() {
        var self = Ext.event.publisher.Dom;
        self.lastScreenPointerEventTime = self.lastTouchEndTime = self.lastTouchStartX = self.lastTouchStartY = undefined;
    }
}, function(Dom) {
    var doc = document,
        defaultView = doc.defaultView,
        prototype = Dom.prototype;
    if ((Ext.os.is.iOS && Ext.os.version.getMajor() < 5) || Ext.browser.is.AndroidStock || !(defaultView && defaultView.addEventListener)) {
        prototype.target = doc;
    } else {
        prototype.target = defaultView;
    }
    Dom.instance = new Dom();
});

Ext.define('Ext.event.publisher.Gesture', {
    extend: Ext.event.publisher.Dom,
    type: 'gesture',
    isCancelEvent: {
        touchcancel: 1,
        pointercancel: 1,
        MSPointerCancel: 1
    },
    handledEvents: [],
    handledDomEvents: [],
    constructor: function(config) {
        var me = this,
            handledDomEvents = me.handledDomEvents,
            supports = Ext.supports,
            supportsTouchEvents = supports.TouchEvents,
            onTouchStart = me.onTouchStart,
            onTouchMove = me.onTouchMove,
            onTouchEnd = me.onTouchEnd;
        me.handlers = {
            touchstart: onTouchStart,
            touchmove: onTouchMove,
            touchend: onTouchEnd,
            touchcancel: onTouchEnd,
            pointerdown: onTouchStart,
            pointermove: onTouchMove,
            pointerup: onTouchEnd,
            pointercancel: onTouchEnd,
            MSPointerDown: onTouchStart,
            MSPointerMove: onTouchMove,
            MSPointerUp: onTouchEnd,
            MSPointerCancel: onTouchEnd,
            mousedown: onTouchStart,
            mousemove: onTouchMove,
            mouseup: onTouchEnd
        };
        me.activeTouchesMap = {};
        me.activeTouches = [];
        me.changedTouches = [];
        me.recognizers = [];
        me.eventToRecognizer = {};
        me.cancelEvents = [];
        if (supportsTouchEvents) {
            me.onTargetTouchMove = me.onTargetTouchMove.bind(me);
            me.onTargetTouchEnd = me.onTargetTouchEnd.bind(me);
        }
        if (supports.PointerEvents) {
            handledDomEvents.push('pointerdown', 'pointermove', 'pointerup', 'pointercancel');
            me.mousePointerType = 'mouse';
        } else if (supports.MSPointerEvents) {
            handledDomEvents.push('MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel');
            me.mousePointerType = 4;
        } else if (supportsTouchEvents) {
            handledDomEvents.push('touchstart', 'touchmove', 'touchend', 'touchcancel');
        }
        if (!handledDomEvents.length || (supportsTouchEvents && Ext.isWebKit && Ext.os.is.Desktop)) {
            handledDomEvents.push('mousedown', 'mousemove', 'mouseup');
        }
        me.initConfig(config);
        return me.callParent();
    },
    onReady: function() {
        this.callParent();
        Ext.Array.sort(this.recognizers, function(recognizerA, recognizerB) {
            var a = recognizerA.priority,
                b = recognizerB.priority;
            return (a > b) ? 1 : (a < b) ? -1 : 0;
        });
    },
    registerRecognizer: function(recognizer) {
        var me = this,
            handledEvents = recognizer.handledEvents,
            ln = handledEvents.length,
            eventName, i;
        recognizer.setOnRecognized(me.onRecognized);
        recognizer.setCallbackScope(me);
        for (i = 0; i < ln; i++) {
            eventName = handledEvents[i];
            me.handledEvents.push(eventName);
            me.eventToRecognizer[eventName] = recognizer;
        }
        me.registerEvents(handledEvents);
        me.recognizers.push(recognizer);
    },
    onRecognized: function(recognizer, eventName, e, info, isCancel) {
        var me = this,
            touches = e.touches,
            changedTouches = e.changedTouches,
            ln = changedTouches.length,
            events = me.events,
            queueWasEmpty = !events.length,
            cancelEvents = me.cancelEvents,
            targetGroups, targets, i, touch;
        info = info || {};
        info.type = eventName;
        info.target = changedTouches[0].target;
        info.stopped = false;
        info.claimed = false;
        info.isGesture = true;
        e = e.chain(info);
        if (!me.gestureTargets) {
            if (ln > 1) {
                targetGroups = [];
                for (i = 0; i < ln; i++) {
                    touch = changedTouches[i];
                    targetGroups.push(touch.targets);
                }
                targets = me.getCommonTargets(targetGroups);
            } else {
                targets = changedTouches[0].targets;
            }
            me.gestureTargets = targets;
        }
        if (isCancel && recognizer.isSingleTouch && (touches.length > 1)) {
            e.target = touches[0].target;
            cancelEvents.push(e);
        } else {
            events.push(e);
        }
        if (queueWasEmpty) {
            me.publishGestures();
        }
    },
    getCommonTargets: function(targetGroups) {
        var firstTargetGroup = targetGroups[0],
            ln = targetGroups.length;
        if (ln === 1) {
            return firstTargetGroup;
        }
        var commonTargets = [],
            i = 1,
            target, targets, j;
        while (true) {
            target = firstTargetGroup[firstTargetGroup.length - i];
            if (!target) {
                return commonTargets;
            }
            for (j = 1; j < ln; j++) {
                targets = targetGroups[j];
                if (targets[targets.length - i] !== target) {
                    return commonTargets;
                }
            }
            commonTargets.unshift(target);
            i++;
        }
        return commonTargets;
    },
    invokeRecognizers: function(methodName, e) {
        var recognizers = this.recognizers,
            ln = recognizers.length,
            i, recognizer;
        if (methodName === 'onStart') {
            for (i = 0; i < ln; i++) {
                recognizers[i].isActive = true;
            }
        }
        for (i = 0; i < ln; i++) {
            recognizer = recognizers[i];
            if (recognizer.isActive && recognizer[methodName].call(recognizer, e) === false) {
                recognizer.isActive = false;
            }
        }
    },
    filterClaimed: function(events, claimedEvent) {
        var me = this,
            eventToRecognizer = me.eventToRecognizer,
            claimedEventType = claimedEvent.type,
            claimedRecognizer = eventToRecognizer[claimedEventType],
            claimedEventIndex, recognizer, type, i;
        for (i = events.length; i--; ) {
            type = events[i].type;
            if (type === claimedEventType) {
                claimedEventIndex = i;
            } else {
                recognizer = eventToRecognizer[type];
                if (!claimedRecognizer || (recognizer && (recognizer !== claimedRecognizer))) {
                    events.splice(i, 1);
                    if (claimedEventIndex) {
                        claimedEventIndex--;
                    }
                }
            }
        }
        me.claimRecognizer(claimedRecognizer, events[0]);
        return claimedEventIndex;
    },
    claimRecognizer: function(claimedRecognizer, e) {
        var me = this,
            recognizers = me.recognizers,
            i, ln, recognizer;
        for (i = 0 , ln = recognizers.length; i < ln; i++) {
            recognizer = recognizers[i];
            if (recognizer !== claimedRecognizer) {
                recognizer.isActive = false;
                recognizer.cancel(e);
            }
        }
        if (me.events.length) {
            me.publishGestures(true);
        }
    },
    publishGestures: function(claimed) {
        var me = this,
            cancelEvents = me.cancelEvents,
            events = me.events,
            gestureTargets = me.gestureTargets;
        if (cancelEvents.length) {
            me.cancelEvents = [];
            me.publish(cancelEvents, me.getPropagatingTargets(cancelEvents[0].target), true);
        }
        if (events.length) {
            me.events = [];
            me.gestureTargets = null;
            me.publish(events, gestureTargets || me.getPropagatingTargets(events[0].target), claimed);
        }
    },
    updateTouches: function(e, isEnd) {
        var me = this,
            browserEvent = e.browserEvent,
            touchSources = browserEvent.changedTouches || [
                browserEvent
            ],
            activeTouches = me.activeTouches,
            activeTouchesMap = me.activeTouchesMap,
            changedTouches = [],
            touchSource, identifier, touch, target, i, ln, x, y;
        for (i = 0 , ln = touchSources.length; i < ln; i++) {
            touchSource = touchSources[i];
            if ('identifier' in touchSource) {
                identifier = touchSource.identifier;
            } else if ('pointerId' in touchSource) {
                identifier = touchSource.pointerId;
            } else {
                identifier = 1;
            }
            touch = activeTouchesMap[identifier];
            if (!touch) {
                target = Ext.event.Event.resolveTextNode(touchSource.target);
                touch = activeTouchesMap[identifier] = {
                    identifier: identifier,
                    target: target,
                    targets: me.getPropagatingTargets(target)
                };
                activeTouches.push(touch);
            }
            if (isEnd) {
                delete activeTouchesMap[identifier];
                Ext.Array.remove(activeTouches, touch);
            }
            x = touchSource.pageX;
            y = touchSource.pageY;
            touch.pageX = x;
            touch.pageY = y;
            touch.point = new Ext.util.Point(x, y);
            changedTouches.push(touch);
        }
        e.touches = Ext.Array.clone(activeTouches);
        e.changedTouches = changedTouches;
    },
    publishDelegatedDomEvent: function(e) {
        var me = this;
        if (!e.button || e.button < 1) {
            me.events = [
                e
            ];
            me.handlers[e.type].call(me, e);
        } else {
            me.callParent([
                e
            ]);
        }
    },
    onTouchStart: function(e) {
        var me = this,
            target = e.target,
            touches = e.browserEvent.touches;
        if (e.browserEvent.type === 'touchstart') {
            target.addEventListener('touchmove', me.onTargetTouchMove);
            target.addEventListener('touchend', me.onTargetTouchEnd);
            target.addEventListener('touchcancel', me.onTargetTouchEnd);
        }
        if (touches && touches.length <= me.activeTouches.length) {
            me.removeGhostTouches(touches);
        }
        me.updateTouches(e);
        if (!me.isStarted) {
            if (Ext.enableGarbageCollector) {
                Ext.dom.GarbageCollector.pause();
            }
            me.isStarted = true;
            me.invokeRecognizers('onStart', e);
        }
        me.invokeRecognizers('onTouchStart', e);
        me.publishGestures();
    },
    onTouchMove: function(e) {
        var me = this,
            mousePointerType = me.mousePointerType;
        if (me.isStarted) {
            if (mousePointerType && e.browserEvent.pointerType === mousePointerType && e.buttons === 0) {
                e.type = Ext.dom.Element.prototype.eventMap.touchend;
                e.button = 0;
                me.onTouchEnd(e);
                return;
            }
            me.updateTouches(e);
            if (e.changedTouches.length > 0) {
                me.invokeRecognizers('onTouchMove', e);
            }
        }
        me.publishGestures();
    },
    onTouchEnd: function(e) {
        var me = this,
            touchCount;
        if (!me.isStarted) {
            me.publishGestures();
            return;
        }
        me.updateTouches(e, true);
        touchCount = me.activeTouches.length;
        try {
            me.invokeRecognizers(me.isCancelEvent[e.type] ? 'onTouchCancel' : 'onTouchEnd', e);
        } finally {
            if (!touchCount) {
                me.isStarted = false;
                me.invokeRecognizers('onEnd', e);
            }
            me.publishGestures();
            if (!touchCount) {
                if (Ext.enableGarbageCollector) {
                    Ext.dom.GarbageCollector.resume();
                }
            }
        }
    },
    onTargetTouchMove: function(e) {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doTargetTouchMove, this, [
                e
            ]);
        } else {
            this.doTargetTouchMove(e);
        }
    },
    doTargetTouchMove: function(e) {
        if (!Ext.getBody().contains(e.target)) {
            this.onTouchMove(new Ext.event.Event(e));
        }
    },
    onTargetTouchEnd: function(e) {
        if (Ext.elevateFunction) {
            Ext.elevateFunction(this.doTargetTouchEnd, this, [
                e
            ]);
        } else {
            this.doTargetTouchEnd(e);
        }
    },
    doTargetTouchEnd: function(e) {
        var me = this,
            target = e.target;
        target.removeEventListener('touchmove', me.onTargetTouchMove);
        target.removeEventListener('touchend', me.onTargetTouchEnd);
        target.removeEventListener('touchcancel', me.onTargetTouchEnd);
        if (!Ext.getBody().contains(target)) {
            me.onTouchEnd(new Ext.event.Event(e));
        }
    },
    reset: function() {
        var me = this,
            recognizers = me.recognizers,
            ln = recognizers.length,
            i, recognizer;
        me.activeTouchesMap = {};
        me.activeTouches = [];
        me.changedTouches = [];
        me.isStarted = false;
        me.gestureTargets = null;
        me.events = [];
        me.cancelEvents = [];
        for (i = 0; i < ln; i++) {
            recognizer = recognizers[i];
            recognizer.reset();
            recognizer.isActive = false;
        }
        this.callParent();
    },
    privates: {
        removeGhostTouches: function(touches) {
            var ids = {},
                len = touches.length,
                activeTouches = this.activeTouches,
                map = this.activeTouchesMap,
                i, id, touch;
            for (i = 0; i < len; ++i) {
                ids[touches[i].identifier] = true;
            }
            i = activeTouches.length;
            while (i--) {
                touch = activeTouches[i];
                id = touch.identifier;
                if (!touches[id]) {
                    Ext.Array.remove(activeTouches, touch);
                    delete map[id];
                }
            }
        }
    }
}, function(Gesture) {
    Gesture.instance = Ext.$gesturePublisher = new Gesture();
});

Ext.define('Ext.mixin.Templatable', {
    extend: Ext.Mixin,
    mixinConfig: {
        id: 'templatable'
    },
    referenceAttributeName: 'reference',
    referenceSelector: '[reference]',
    getElementConfig: function() {
        return {
            reference: 'element'
        };
    },
    getElementTemplate: function() {
        var elementTemplate = document.createDocumentFragment();
        elementTemplate.appendChild(Ext.Element.create(this.getElementConfig(), true));
        return elementTemplate;
    },
    initElement: function() {
        var prototype = this.self.prototype;
        prototype.elementTemplate = this.getElementTemplate();
        prototype.initElement = prototype.doInitElement;
        this.initElement.apply(this, arguments);
    },
    linkElement: function(reference, node) {
        this.link(reference, node);
    },
    doInitElement: function() {
        var referenceAttributeName = this.referenceAttributeName,
            renderElement, referenceNodes, i, ln, referenceNode, reference;
        renderElement = this.elementTemplate.cloneNode(true);
        referenceNodes = renderElement.querySelectorAll(this.referenceSelector);
        for (i = 0 , ln = referenceNodes.length; i < ln; i++) {
            referenceNode = referenceNodes[i];
            reference = referenceNode.getAttribute(referenceAttributeName);
            referenceNode.removeAttribute(referenceAttributeName);
            this.linkElement(reference, referenceNode);
        }
    }
});

Ext.define('Ext.TaskQueue', {
    singleton: true,
    pending: false,
    mode: true,
    constructor: function() {
        this.readQueue = [];
        this.writeQueue = [];
        this.run = Ext.Function.bind(this.run, this);
        if (Ext.os.is.iOS) {
            Ext.interval(this.watch, 500, this);
        }
    },
    requestRead: function(fn, scope, args) {
        this.request(true);
        this.readQueue.push(arguments);
    },
    requestWrite: function(fn, scope, args) {
        this.request(false);
        this.writeQueue.push(arguments);
    },
    request: function(mode) {
        if (!this.pending) {
            this.pendingTime = Date.now();
            this.pending = true;
            this.mode = mode;
            if (mode) {
                Ext.defer(this.run, 1, this);
            } else {
                Ext.Function.requestAnimationFrame(this.run);
            }
        }
    },
    watch: function() {
        if (this.pending && Date.now() - this.pendingTime >= 500) {
            this.run();
        }
    },
    run: function() {
        this.pending = false;
        var readQueue = this.readQueue,
            writeQueue = this.writeQueue,
            request = null,
            queue;
        if (this.mode) {
            queue = readQueue;
            if (writeQueue.length > 0) {
                request = false;
            }
        } else {
            queue = writeQueue;
            if (readQueue.length > 0) {
                request = true;
            }
        }
        var tasks = queue.slice(),
            i, ln, task, fn, scope;
        queue.length = 0;
        for (i = 0 , ln = tasks.length; i < ln; i++) {
            task = tasks[i];
            fn = task[0];
            scope = task[1];
            if (scope && (scope.destroying || scope.destroyed)) {
                
                continue;
            }
            if (typeof fn === 'string') {
                fn = scope[fn];
            }
            if (task.length > 2) {
                fn.apply(scope, task[2]);
            } else {
                fn.call(scope);
            }
        }
        tasks.length = 0;
        if (request !== null) {
            this.request(request);
        }
    },
    privates: {
        flush: function() {
            while (this.readQueue.length || this.writeQueue.length) {
                this.run();
            }
        }
    }
});

Ext.define('Ext.util.sizemonitor.Abstract', {
    mixins: [
        Ext.mixin.Templatable
    ],
    config: {
        element: null,
        callback: Ext.emptyFn,
        scope: null,
        args: []
    },
    width: null,
    height: null,
    contentWidth: null,
    contentHeight: null,
    constructor: function(config) {
        this.refresh = Ext.Function.bind(this.refresh, this);
        this.info = {
            width: 0,
            height: 0,
            contentWidth: 0,
            contentHeight: 0,
            flag: 0
        };
        this.initElement();
        this.initConfig(config);
        this.bindListeners(true);
    },
    bindListeners: Ext.emptyFn,
    applyElement: function(element) {
        if (element) {
            return Ext.get(element);
        }
    },
    updateElement: function(element) {
        element.append(this.detectorsContainer);
        element.addCls(Ext.baseCSSPrefix + 'size-monitored');
    },
    applyArgs: function(args) {
        return args.concat([
            this.info
        ]);
    },
    refreshMonitors: Ext.emptyFn,
    forceRefresh: function() {
        Ext.TaskQueue.requestRead('refresh', this);
    },
    getContentBounds: function() {
        return this.detectorsContainer.getBoundingClientRect();
    },
    getContentWidth: function() {
        return this.detectorsContainer.clientWidth;
    },
    getContentHeight: function() {
        return this.detectorsContainer.clientHeight;
    },
    refreshSize: function() {
        var element = this.getElement();
        if (!element || element.destroyed) {
            return false;
        }
        var width = element.getWidth(),
            height = element.getHeight(),
            contentWidth = this.getContentWidth(),
            contentHeight = this.getContentHeight(),
            currentContentWidth = this.contentWidth,
            currentContentHeight = this.contentHeight,
            info = this.info,
            resized = false,
            flag = 0;
        this.width = width;
        this.height = height;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
        flag = ((currentContentWidth !== contentWidth ? 1 : 0) + (currentContentHeight !== contentHeight ? 2 : 0));
        if (flag > 0) {
            info.width = width;
            info.height = height;
            info.contentWidth = contentWidth;
            info.contentHeight = contentHeight;
            info.flag = flag;
            resized = true;
            this.getCallback().apply(this.getScope(), this.getArgs());
        }
        return resized;
    },
    refresh: function(force) {
        if (this.destroying || this.destroyed) {
            return;
        }
        if (this.refreshSize() || force) {
            Ext.TaskQueue.requestWrite('refreshMonitors', this);
        }
    },
    destroy: function() {
        var me = this,
            element = me.getElement();
        me.bindListeners(false);
        if (element && !element.destroyed) {
            element.removeCls(Ext.baseCSSPrefix + 'size-monitored');
        }
        delete me._element;
        me.refresh = null;
        me.callParent();
    }
});

Ext.define('Ext.util.sizemonitor.Scroll', {
    extend: Ext.util.sizemonitor.Abstract,
    getElementConfig: function() {
        return {
            reference: 'detectorsContainer',
            classList: [
                Ext.baseCSSPrefix + 'size-monitors',
                'scroll'
            ],
            children: [
                {
                    reference: 'expandMonitor',
                    className: 'expand'
                },
                {
                    reference: 'shrinkMonitor',
                    className: 'shrink'
                }
            ]
        };
    },
    constructor: function(config) {
        this.onScroll = Ext.Function.bind(this.onScroll, this);
        this.callParent(arguments);
    },
    bindListeners: function(bind) {
        var method = bind ? 'addEventListener' : 'removeEventListener';
        this.expandMonitor[method]('scroll', this.onScroll, true);
        this.shrinkMonitor[method]('scroll', this.onScroll, true);
    },
    forceRefresh: function() {
        Ext.TaskQueue.requestRead('refresh', this, [
            true
        ]);
    },
    onScroll: function() {
        Ext.TaskQueue.requestRead('refresh', this);
    },
    refreshMonitors: function() {
        var expandMonitor = this.expandMonitor,
            shrinkMonitor = this.shrinkMonitor,
            end = 1000000;
        if (expandMonitor && !expandMonitor.destroyed) {
            expandMonitor.scrollLeft = end;
            expandMonitor.scrollTop = end;
        }
        if (shrinkMonitor && !shrinkMonitor.destroyed) {
            shrinkMonitor.scrollLeft = end;
            shrinkMonitor.scrollTop = end;
        }
    },
    destroy: function() {
        this.onScroll = null;
        this.callParent();
    }
});

Ext.define('Ext.util.sizemonitor.OverflowChange', {
    extend: Ext.util.sizemonitor.Abstract,
    constructor: function(config) {
        this.onExpand = Ext.Function.bind(this.onExpand, this);
        this.onShrink = Ext.Function.bind(this.onShrink, this);
        this.callParent(arguments);
    },
    getElementConfig: function() {
        return {
            reference: 'detectorsContainer',
            classList: [
                Ext.baseCSSPrefix + 'size-monitors',
                'overflowchanged'
            ],
            children: [
                {
                    reference: 'expandMonitor',
                    className: 'expand',
                    children: [
                        {
                            reference: 'expandHelper'
                        }
                    ]
                },
                {
                    reference: 'shrinkMonitor',
                    className: 'shrink',
                    children: [
                        {
                            reference: 'shrinkHelper'
                        }
                    ]
                }
            ]
        };
    },
    bindListeners: function(bind) {
        var method = bind ? 'addEventListener' : 'removeEventListener';
        this.expandMonitor[method](Ext.browser.is.Firefox ? 'underflow' : 'overflowchanged', this.onExpand, true);
        this.shrinkMonitor[method](Ext.browser.is.Firefox ? 'overflow' : 'overflowchanged', this.onShrink, true);
    },
    onExpand: function(e) {
        if (Ext.browser.is.Webkit && e.horizontalOverflow && e.verticalOverflow) {
            return;
        }
        Ext.TaskQueue.requestRead('refresh', this);
    },
    onShrink: function(e) {
        if (Ext.browser.is.Webkit && !e.horizontalOverflow && !e.verticalOverflow) {
            return;
        }
        Ext.TaskQueue.requestRead('refresh', this);
    },
    refreshMonitors: function() {
        if (this.destroying || this.destroyed) {
            return;
        }
        var expandHelper = this.expandHelper,
            shrinkHelper = this.shrinkHelper,
            contentBounds = this.getContentBounds(),
            width = contentBounds.width,
            height = contentBounds.height,
            style;
        if (expandHelper && !expandHelper.destroyed) {
            style = expandHelper.style;
            style.width = (width + 1) + 'px';
            style.height = (height + 1) + 'px';
        }
        if (shrinkHelper && !shrinkHelper.destroyed) {
            style = shrinkHelper.style;
            style.width = width + 'px';
            style.height = height + 'px';
        }
        Ext.TaskQueue.requestRead('refresh', this);
    },
    destroy: function() {
        this.onExpand = this.onShrink = null;
        this.callParent();
    }
});

Ext.define('Ext.util.SizeMonitor', {
    constructor: function(config) {
        var namespace = Ext.util.sizemonitor;
        if (Ext.browser.is.Firefox) {
            return new namespace.OverflowChange(config);
        } else {
            return new namespace.Scroll(config);
        }
    }
});

Ext.define('Ext.event.publisher.ElementSize', {
    extend: Ext.event.publisher.Publisher,
    type: 'size',
    handledEvents: [
        'resize'
    ],
    constructor: function() {
        this.monitors = {};
        this.subscribers = {};
        this.callParent(arguments);
    },
    subscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors;
        if (subscribers[id]) {
            ++subscribers[id];
        } else {
            subscribers[id] = 1;
            monitors[id] = new Ext.util.SizeMonitor({
                element: element,
                callback: this.onElementResize,
                scope: this,
                args: [
                    element
                ]
            });
        }
        element.on('painted', 'forceRefresh', monitors[id]);
        return true;
    },
    unsubscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors,
            sizeMonitor;
        if (subscribers[id] && !--subscribers[id]) {
            delete subscribers[id];
            sizeMonitor = monitors[id];
            element.un('painted', 'forceRefresh', sizeMonitor);
            sizeMonitor.destroy();
            delete monitors[id];
        }
    },
    onElementResize: function(element, info) {
        Ext.TaskQueue.requestRead('fire', this, [
            element,
            'resize',
            [
                element,
                info
            ]
        ]);
    },
    privates: {
        syncRefresh: function(elements) {
            elements = Ext.Array.from(elements);
            var len = elements.length,
                i = 0,
                el, monitor;
            for (i = 0; i < len; ++i) {
                el = elements[i];
                if (typeof el !== 'string') {
                    el = el.id;
                }
                monitor = this.monitors[el];
                if (monitor) {
                    monitor.forceRefresh();
                }
            }
            Ext.TaskQueue.flush();
        }
    }
}, function(ElementSize) {
    ElementSize.instance = new ElementSize();
});

Ext.define('Ext.util.paintmonitor.Abstract', {
    config: {
        element: null,
        callback: Ext.emptyFn,
        scope: null,
        args: []
    },
    eventName: '',
    monitorClass: '',
    constructor: function(config) {
        this.onElementPainted = Ext.Function.bind(this.onElementPainted, this);
        this.initConfig(config);
    },
    bindListeners: function(bind) {
        this.monitorElement[bind ? 'addEventListener' : 'removeEventListener'](this.eventName, this.onElementPainted, true);
    },
    applyElement: function(element) {
        if (element) {
            return Ext.get(element);
        }
    },
    updateElement: function(element) {
        this.monitorElement = Ext.Element.create({
            classList: [
                Ext.baseCSSPrefix + 'paint-monitor',
                this.monitorClass
            ]
        }, true);
        element.appendChild(this.monitorElement);
        element.addCls(Ext.baseCSSPrefix + 'paint-monitored');
        this.bindListeners(true);
    },
    onElementPainted: function() {},
    destroy: function() {
        var me = this,
            monitorElement = me.monitorElement,
            parentNode = monitorElement.parentNode,
            element = me.getElement();
        me.bindListeners(false);
        delete me.monitorElement;
        if (element && !element.destroyed) {
            element.removeCls(Ext.baseCSSPrefix + 'paint-monitored');
            delete me._element;
        }
        if (parentNode) {
            parentNode.removeChild(monitorElement);
        }
        me.callParent();
    }
});

Ext.define('Ext.util.paintmonitor.CssAnimation', {
    extend: Ext.util.paintmonitor.Abstract,
    eventName: Ext.browser.is.WebKit ? 'webkitAnimationEnd' : 'animationend',
    monitorClass: 'cssanimation',
    onElementPainted: function(e) {
        if (e.animationName === Ext.baseCSSPrefix + 'paint-monitor-helper') {
            this.getCallback().apply(this.getScope(), this.getArgs());
        }
    }
});

Ext.define('Ext.util.PaintMonitor', {
    constructor: function(config) {
        return new Ext.util.paintmonitor.CssAnimation(config);
    }
});

Ext.define('Ext.event.publisher.ElementPaint', {
    extend: Ext.event.publisher.Publisher,
    type: 'paint',
    handledEvents: [
        'painted'
    ],
    constructor: function() {
        this.monitors = {};
        this.subscribers = {};
        this.callParent(arguments);
    },
    subscribe: function(element) {
        var me = this,
            id = element.id,
            subscribers = me.subscribers;
        if (subscribers[id]) {
            ++subscribers[id];
        } else {
            subscribers[id] = 1;
            me.monitors[id] = new Ext.util.PaintMonitor({
                element: element,
                callback: me.onElementPainted,
                scope: me,
                args: [
                    element
                ]
            });
        }
    },
    unsubscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors;
        if (subscribers[id] && !--subscribers[id]) {
            delete subscribers[id];
            monitors[id].destroy();
            delete monitors[id];
        }
    },
    onElementPainted: function(element) {
        Ext.TaskQueue.requestRead('fire', this, [
            element,
            'painted',
            [
                element
            ]
        ]);
    }
}, function(ElementPaint) {
    ElementPaint.instance = new ElementPaint();
});

Ext.define('Ext.dom.Element', function(Element) {
    var WIN = window,
        DOC = document,
        docEl = DOC.documentElement,
        TOP = WIN.top,
        elementIdCounter, windowId, documentId,
        WIDTH = 'width',
        HEIGHT = 'height',
        MIN_WIDTH = 'min-width',
        MIN_HEIGHT = 'min-height',
        MAX_WIDTH = 'max-width',
        MAX_HEIGHT = 'max-height',
        TOP = 'top',
        RIGHT = 'right',
        BOTTOM = 'bottom',
        LEFT = 'left',
        VISIBILITY = 'visibility',
        HIDDEN = 'hidden',
        DISPLAY = "display",
        NONE = "none",
        ZINDEX = "z-index",
        POSITION = "position",
        RELATIVE = "relative",
        STATIC = "static",
        SEPARATOR = '-',
        wordsRe = /\w/g,
        spacesRe = /\s+/,
        classNameSplitRegex = /[\s]+/,
        transparentRe = /^(?:transparent|(?:rgba[(](?:\s*\d+\s*[,]){3}\s*0\s*[)]))$/i,
        adjustDirect2DTableRe = /table-row|table-.*-group/,
        topRe = /top/i,
        borders = {
            t: 'border-top-width',
            r: 'border-right-width',
            b: 'border-bottom-width',
            l: 'border-left-width'
        },
        paddings = {
            t: 'padding-top',
            r: 'padding-right',
            b: 'padding-bottom',
            l: 'padding-left'
        },
        margins = {
            t: 'margin-top',
            r: 'margin-right',
            b: 'margin-bottom',
            l: 'margin-left'
        },
        paddingsTLRB = [
            paddings.l,
            paddings.r,
            paddings.t,
            paddings.b
        ],
        bordersTLRB = [
            borders.l,
            borders.r,
            borders.t,
            borders.b
        ],
        numberRe = /\d+$/,
        unitRe = /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
        defaultUnit = 'px',
        camelRe = /(-[a-z])/gi,
        cssRe = /([a-z0-9\-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*);?/gi,
        pxRe = /^\d+(?:\.\d*)?px$/i,
        propertyCache = {},
        ORIGINALDISPLAY = 'originalDisplay',
        camelReplaceFn = function(m, a) {
            return a.charAt(1).toUpperCase();
        },
        clearData = function(node, deep) {
            var childNodes, i, len;
            if (node.nodeType === 1) {
                node._extData = null;
                if (deep) {
                    childNodes = node.childNodes;
                    for (i = 0 , len = childNodes.length; i < len; ++i) {
                        clearData(childNodes[i], deep);
                    }
                }
            }
        },
        visibilityCls = Ext.baseCSSPrefix + 'hidden-visibility',
        displayCls = Ext.baseCSSPrefix + 'hidden-display',
        offsetsCls = Ext.baseCSSPrefix + 'hidden-offsets',
        clipCls = Ext.baseCSSPrefix + 'hidden-clip',
        sizedCls = Ext.baseCSSPrefix + 'sized',
        unsizedCls = Ext.baseCSSPrefix + 'unsized',
        stretchedCls = Ext.baseCSSPrefix + 'stretched',
        CREATE_ATTRIBUTES = {
            style: 'style',
            className: 'className',
            cls: 'cls',
            classList: 'classList',
            text: 'text',
            hidden: 'hidden',
            html: 'html',
            children: 'children'
        },
        lastFocusChange = 0,
        lastKeyboardClose = 0,
        editableHasFocus = false,
        isVirtualKeyboardOpen = false,
        visFly, scrollFly, caFly;
    try {
        elementIdCounter = TOP.__elementIdCounter__;
    } catch (e) {
        TOP = WIN;
    }
    TOP.__elementIdCounter = elementIdCounter = (TOP.__elementIdCounter__ || 0) + 1;
    windowId = 'ext-window-' + elementIdCounter;
    documentId = 'ext-document-' + elementIdCounter;
    return {
        alternateClassName: [
            'Ext.Element'
        ],
        mixins: [
            Ext.util.Positionable,
            Ext.mixin.Observable
        ],
        observableType: 'element',
        isElement: true,
        skipGarbageCollection: true,
        $applyConfigs: true,
        identifiablePrefix: 'ext-element-',
        styleHooks: {},
        validIdRe: Ext.validIdRe,
        blockedEvents: Ext.supports.EmulatedMouseOver ? {
            mouseover: 1
        } : {},
        longpressEvents: {
            longpress: 1,
            taphold: 1
        },
        constructor: function(dom) {
            var me = this,
                id;
            if (typeof dom === 'string') {
                dom = DOC.getElementById(dom);
            }
            if (!dom) {
                Ext.raise("Invalid domNode reference or an id of an existing domNode: " + dom);
                return null;
            }
            if (Ext.cache[dom.id]) {
                Ext.raise("Element cache already contains an entry for id '" + dom.id + "'.  Use Ext.get() to create or retrieve Element instances.");
            }
            me.dom = dom;
            id = dom.id;
            if (id) {
                me.id = id;
            } else {
                id = dom.id = me.getUniqueId();
            }
            if (!me.validIdRe.test(me.id)) {
                Ext.raise('Invalid Element "id": "' + me.id + '"');
            }
            me.el = me;
            Ext.cache[id] = me;
            me.longpressListenerCount = 0;
            me.mixins.observable.constructor.call(me);
        },
        inheritableStatics: {
            cache: Ext.cache = {},
            editableSelector: 'input,textarea,[contenteditable="true"]',
            VISIBILITY: 1,
            DISPLAY: 2,
            OFFSETS: 3,
            CLIP: 4,
            minKeyboardHeight: 100,
            unitRe: unitRe,
            useDelegatedEvents: true,
            validNodeTypes: {
                1: 1,
                9: 1
            },
            addUnits: function(size, units) {
                if (typeof size === 'number') {
                    return size + (units || defaultUnit);
                }
                if (size === "" || size === "auto" || size == null) {
                    return size || '';
                }
                if (numberRe.test(size)) {
                    return size + (units || defaultUnit);
                }
                if (!unitRe.test(size)) {
                    Ext.Logger.warn("Warning, size detected (" + size + ") not a valid property value on Element.addUnits.");
                    return size || '';
                }
                return size;
            },
            create: function(attributes, domNode) {
                var me = this,
                    classes, element, elementStyle, tag, value, name, i, ln, tmp;
                attributes = attributes || {};
                if (attributes.isElement) {
                    return domNode ? attributes.dom : attributes;
                } else if ('nodeType' in attributes) {
                    return domNode ? attributes : Ext.get(attributes);
                }
                if (typeof attributes === 'string') {
                    return DOC.createTextNode(attributes);
                }
                tag = attributes.tag;
                if (!tag) {
                    tag = 'div';
                }
                if (attributes.namespace) {
                    element = DOC.createElementNS(attributes.namespace, tag);
                } else {
                    element = DOC.createElement(tag);
                }
                elementStyle = element.style;
                for (name in attributes) {
                    if (name !== 'tag') {
                        value = attributes[name];
                        switch (name) {
                            case CREATE_ATTRIBUTES.style:
                                if (typeof value === 'string') {
                                    element.setAttribute(name, value);
                                } else {
                                    for (i in value) {
                                        if (value.hasOwnProperty(i)) {
                                            elementStyle[i] = value[i];
                                        }
                                    }
                                };
                                break;
                            case CREATE_ATTRIBUTES.className:
                            case CREATE_ATTRIBUTES.cls:
                                tmp = value.split(spacesRe);
                                classes = classes ? classes.concat(tmp) : tmp;
                                break;
                            case CREATE_ATTRIBUTES.classList:
                                classes = classes ? classes.concat(value) : value;
                                break;
                            case CREATE_ATTRIBUTES.text:
                                element.textContent = value;
                                break;
                            case CREATE_ATTRIBUTES.html:
                                element.innerHTML = value;
                                break;
                            case CREATE_ATTRIBUTES.hidden:
                                if (classes) {
                                    classes.push(displayCls);
                                } else {
                                    classes = [
                                        displayCls
                                    ];
                                };
                                break;
                            case CREATE_ATTRIBUTES.children:
                                if (value != null) {
                                    for (i = 0 , ln = value.length; i < ln; i++) {
                                        element.appendChild(me.create(value[i], true));
                                    }
                                };
                                break;
                            default:
                                if (value != null) {
                                    element.setAttribute(name, value);
                                };
                        }
                    }
                }
                if (classes) {
                    element.className = classes.join(' ');
                }
                if (domNode) {
                    return element;
                } else {
                    return me.get(element);
                }
            },
            detach: function() {
                var dom = this.dom;
                if (dom && dom.parentNode && dom.tagName !== 'BODY') {
                    dom.parentNode.removeChild(dom);
                }
                return this;
            },
            fly: function(dom, named) {
                return Ext.fly(dom, named);
            },
            fromPoint: (function() {
                var elementFromPointBug;
                if (Ext.isIE) {
                    try {
                        elementFromPointBug = window.self !== window.top;
                    } catch (e) {
                        elementFromPointBug = true;
                    }
                }
                return function(x, y, asDom) {
                    var el = null;
                    el = DOC.elementFromPoint(x, y);
                    if (!el && elementFromPointBug) {
                        el = DOC.elementFromPoint(x, y);
                    }
                    return asDom ? el : Ext.get(el);
                };
            })(),
            fromPagePoint: function(x, y, asDom) {
                var scroll = Ext.getDoc().getScroll();
                return Element.fromPoint(x - scroll.left, y - scroll.top, asDom);
            },
            get: function(el) {
                var me = this,
                    cache = Ext.cache,
                    nodeType, dom, id, entry, isDoc, isWin, isValidNodeType;
                if (!el) {
                    return null;
                }
                function warnDuplicate(id) {
                    Ext.raise("DOM element with id " + id + " in Element cache is not the same as element in the DOM. " + "Make sure to clean up Element instances using destroy()");
                }
                if (el.isFly) {
                    el = el.dom;
                }
                if (typeof el === 'string') {
                    id = el;
                    if (cache.hasOwnProperty(id)) {
                        entry = cache[id];
                        if (entry.skipGarbageCollection || !Ext.isGarbage(entry.dom)) {
                            dom = Ext.getElementById ? Ext.getElementById(id) : DOC.getElementById(id);
                            if (dom && (dom !== entry.dom)) {
                                warnDuplicate(id);
                            }
                            return entry;
                        } else {
                            entry.destroy();
                        }
                    }
                    if (id === windowId) {
                        return Element.get(WIN);
                    } else if (id === documentId) {
                        return Element.get(DOC);
                    }
                    dom = Ext.getElementById ? Ext.getElementById(id) : DOC.getElementById(id);
                    if (dom) {
                        return new Element(dom);
                    }
                }
                nodeType = el.nodeType;
                if (nodeType) {
                    isDoc = (nodeType === 9);
                    isValidNodeType = me.validNodeTypes[nodeType];
                } else {
                    isWin = (el.window == el);
                }
                if (isValidNodeType || isWin) {
                    id = el.id;
                    if (cache.hasOwnProperty(id)) {
                        entry = cache[id];
                        if (entry.skipGarbageCollection || el === entry.dom || !Ext.isGarbage(entry.dom)) {
                            if (el !== entry.dom) {
                                warnDuplicate(id);
                            }
                            return entry;
                        } else {
                            entry.destroy();
                        }
                    }
                    if (el === DOC) {
                        el.id = documentId;
                    }
                    if (el == WIN) {
                        el.id = windowId;
                    }
                    el = new Element(el);
                    if (isWin || isDoc) {
                        el.skipGarbageCollection = true;
                    }
                    return el;
                }
                if (el.isElement) {
                    return el;
                }
                if (el.isComposite) {
                    return el;
                }
                if (Ext.isIterable(el)) {
                    return me.select(el);
                }
                return null;
            },
            getActiveElement: function(asElement) {
                var active = DOC.activeElement;
                if (!active || !active.focus) {
                    active = DOC.body;
                }
                return asElement ? Ext.get(active) : active;
            },
            getDocumentHeight: function() {
                return Math.max(!Ext.isStrict ? DOC.body.scrollHeight : docEl.scrollHeight, this.getViewportHeight());
            },
            getDocumentWidth: function() {
                return Math.max(!Ext.isStrict ? DOC.body.scrollWidth : docEl.scrollWidth, this.getViewportWidth());
            },
            getOrientation: function() {
                if (Ext.supports.OrientationChange) {
                    return (WIN.orientation == 0) ? 'portrait' : 'landscape';
                }
                return (WIN.innerHeight > WIN.innerWidth) ? 'portrait' : 'landscape';
            },
            getViewportHeight: function() {
                var viewportHeight = Element._viewportHeight;
                if (Ext.isIE9m) {
                    return DOC.documentElement.clientHeight;
                }
                return (viewportHeight != null) ? viewportHeight : docEl.clientHeight;
            },
            getViewportWidth: function() {
                var viewportWidth = Element._viewportWidth;
                if (Ext.isIE9m) {
                    return DOC.documentElement.clientWidth;
                }
                return (viewportWidth != null) ? viewportWidth : docEl.clientWidth;
            },
            getViewportScale: function() {
                var top = WIN.top;
                return ((Ext.isiOS || Ext.isAndroid) ? 1 : (top.devicePixelRatio || top.screen.deviceXDPI / top.screen.logicalXDPI)) * this.getViewportTouchScale();
            },
            getViewportTouchScale: function(forceRead) {
                var scale = 1,
                    hidden = 'hidden',
                    top = WIN.top,
                    cachedScale;
                if (!forceRead) {
                    cachedScale = this._viewportTouchScale;
                    if (cachedScale) {
                        return cachedScale;
                    }
                }
                if (Ext.isIE10p || Ext.isEdge || Ext.isiOS) {
                    scale = docEl.offsetWidth / WIN.innerWidth;
                } else if (Ext.isChromeMobile) {
                    scale = top.outerWidth / top.innerWidth;
                }
                return scale;
            },
            getViewSize: function() {
                return {
                    width: Element.getViewportWidth(),
                    height: Element.getViewportHeight()
                };
            },
            maskIframes: function() {
                var iframes = document.getElementsByTagName('iframe');
                Ext.each(iframes, function(iframe) {
                    var myMask;
                    myMask = Ext.fly(iframe.parentNode).mask();
                    myMask.setStyle('background-color', 'transparent');
                });
            },
            normalize: function(prop) {
                return propertyCache[prop] || (propertyCache[prop] = prop.replace(camelRe, camelReplaceFn));
            },
            _onWindowFocusChange: function(e) {
                if (Ext.fly(e.target).is(Element.editableSelector)) {
                    lastFocusChange = new Date();
                    editableHasFocus = (e.type === 'focusin' || e.type === 'pointerup');
                }
            },
            _onWindowResize: function() {
                var documentWidth = docEl.clientWidth,
                    documentHeight = docEl.clientHeight,
                    now = new Date(),
                    threshold = 1000,
                    deltaX, deltaY;
                deltaX = documentWidth - Element._documentWidth;
                deltaY = documentHeight - Element._documentHeight;
                Element._windowWidth = documentWidth;
                Element._windowHeight = documentHeight;
                if (((now - lastFocusChange) < threshold) || ((now - lastKeyboardClose) < threshold)) {
                    if (deltaX === 0 && (editableHasFocus && (deltaY <= -Element.minKeyboardHeight))) {
                        isVirtualKeyboardOpen = true;
                        return;
                    }
                }
                if (isVirtualKeyboardOpen && (deltaX === 0) && (deltaY >= Element.minKeyboardHeight)) {
                    isVirtualKeyboardOpen = false;
                    lastKeyboardClose = new Date();
                }
                if (isVirtualKeyboardOpen) {
                    return;
                }
                Element._viewportWidth = documentWidth;
                Element._viewportHeight = documentHeight;
            },
            parseBox: function(box) {
                box = box || 0;
                var type = typeof box,
                    parts, ln;
                if (type === 'number') {
                    return {
                        top: box,
                        right: box,
                        bottom: box,
                        left: box
                    };
                } else if (type !== 'string') {
                    return box;
                }
                parts = box.split(' ');
                ln = parts.length;
                if (ln === 1) {
                    parts[1] = parts[2] = parts[3] = parts[0];
                } else if (ln === 2) {
                    parts[2] = parts[0];
                    parts[3] = parts[1];
                } else if (ln === 3) {
                    parts[3] = parts[1];
                }
                return {
                    top: parseFloat(parts[0]) || 0,
                    right: parseFloat(parts[1]) || 0,
                    bottom: parseFloat(parts[2]) || 0,
                    left: parseFloat(parts[3]) || 0
                };
            },
            parseStyles: function(styles) {
                var out = {},
                    matches;
                if (styles) {
                    cssRe.lastIndex = 0;
                    while ((matches = cssRe.exec(styles))) {
                        out[matches[1]] = matches[2] || '';
                    }
                }
                return out;
            },
            select: function(selector, composite, root) {
                return Ext.fly(root || DOC).select(selector, composite);
            },
            query: function(selector, asDom, root) {
                return Ext.fly(root || DOC).query(selector, asDom);
            },
            unitizeBox: function(box, units) {
                var me = this;
                box = me.parseBox(box);
                return me.addUnits(box.top, units) + ' ' + me.addUnits(box.right, units) + ' ' + me.addUnits(box.bottom, units) + ' ' + me.addUnits(box.left, units);
            },
            unmaskIframes: function() {
                var iframes = document.getElementsByTagName('iframe');
                Ext.each(iframes, function(iframe) {
                    Ext.fly(iframe.parentNode).unmask();
                });
            },
            serializeForm: function(form) {
                var fElements = form.elements || (DOC.forms[form] || Ext.getDom(form)).elements,
                    hasSubmit = false,
                    encoder = encodeURIComponent,
                    data = '',
                    eLen = fElements.length,
                    element, name, type, options, hasValue, e, o, oLen, opt;
                for (e = 0; e < eLen; e++) {
                    element = fElements[e];
                    name = element.name;
                    type = element.type;
                    options = element.options;
                    if (!element.disabled && name) {
                        if (/select-(one|multiple)/i.test(type)) {
                            oLen = options.length;
                            for (o = 0; o < oLen; o++) {
                                opt = options[o];
                                if (opt.selected) {
                                    hasValue = opt.hasAttribute('value');
                                    data += Ext.String.format('{0}={1}&', encoder(name), encoder(hasValue ? opt.value : opt.text));
                                }
                            }
                        } else if (!(/file|undefined|reset|button/i.test(type))) {
                            if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                                data += encoder(name) + '=' + encoder(element.value) + '&';
                                hasSubmit = /submit/i.test(type);
                            }
                        }
                    }
                }
                return data.substr(0, data.length - 1);
            },
            getCommonAncestor: function(nodeA, nodeB, returnDom) {
                caFly = caFly || new Ext.dom.Fly();
                caFly.attach(Ext.getDom(nodeA));
                while (!caFly.isAncestor(nodeB)) {
                    if (caFly.dom.parentNode) {
                        caFly.attach(caFly.dom.parentNode);
                    } else {
                        caFly.attach(DOC.body);
                        break;
                    }
                }
                return returnDom ? caFly.dom : Ext.get(caFly);
            }
        },
        addCls: function(names, prefix, suffix) {
            var me = this,
                elementData = me.getData(),
                hasNewCls, dom, map, classList, i, ln, name;
            if (!names) {
                return me;
            }
            if (!elementData.isSynchronized) {
                me.synchronize();
            }
            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;
            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';
            if (typeof names === 'string') {
                names = names.split(spacesRe);
            }
            for (i = 0 , ln = names.length; i < ln; i++) {
                name = names[i];
                if (name) {
                    name = prefix + name + suffix;
                    if (!map[name]) {
                        map[name] = true;
                        classList.push(name);
                        hasNewCls = true;
                    }
                }
            }
            if (hasNewCls) {
                dom.className = classList.join(' ');
            }
            return me;
        },
        addClsOnClick: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);
            me.on("mousedown", function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return false;
                }
                Ext.fly(dom).addCls(className);
                var d = Ext.getDoc(),
                    fn = function() {
                        Ext.fly(dom).removeCls(className);
                        d.removeListener("mouseup", fn);
                    };
                d.on("mouseup", fn);
            });
            return me;
        },
        addClsOnFocus: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);
            me.on("focus", function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return false;
                }
                Ext.fly(dom).addCls(className);
            });
            me.on("blur", function() {
                Ext.fly(dom).removeCls(className);
            });
            return me;
        },
        addClsOnOver: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);
            me.hover(function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return;
                }
                Ext.fly(dom).addCls(className);
            }, function() {
                Ext.fly(dom).removeCls(className);
            });
            return me;
        },
        addStyles: function(sides, styles) {
            var totalSize = 0,
                sidesArr = (sides || '').match(wordsRe),
                i,
                len = sidesArr.length,
                side,
                styleSides = [];
            if (len === 1) {
                totalSize = Math.abs(parseFloat(this.getStyle(styles[sidesArr[0]])) || 0);
            } else if (len) {
                for (i = 0; i < len; i++) {
                    side = sidesArr[i];
                    styleSides.push(styles[side]);
                }
                styleSides = this.getStyle(styleSides);
                for (i = 0; i < len; i++) {
                    side = sidesArr[i];
                    totalSize += parseFloat(styleSides[styles[side]]) || 0;
                }
            }
            return totalSize;
        },
        addUnits: function(size, units) {
            return Element.addUnits(size, units);
        },
        adjustDirect2DDimension: function(dimension) {
            var me = this,
                dom = me.dom,
                display = me.getStyle('display'),
                inlineDisplay = dom.style.display,
                inlinePosition = dom.style.position,
                originIndex = dimension === WIDTH ? 0 : 1,
                currentStyle = dom.currentStyle,
                floating;
            if (display === 'inline') {
                dom.style.display = 'inline-block';
            }
            dom.style.position = display.match(adjustDirect2DTableRe) ? 'absolute' : 'static';
            floating = (parseFloat(currentStyle[dimension]) || parseFloat(currentStyle.msTransformOrigin.split(' ')[originIndex]) * 2) % 1;
            dom.style.position = inlinePosition;
            if (display === 'inline') {
                dom.style.display = inlineDisplay;
            }
            return floating;
        },
        animate: function(animation) {
            animation = new Ext.fx.Animation(animation);
            animation.setElement(this);
            this._activeAnimation = animation;
            animation.on({
                animationend: this._onAnimationEnd,
                scope: this
            });
            Ext.Animator.run(animation);
            return animation;
        },
        _onAnimationEnd: function() {
            this._activeAnimation = null;
        },
        getActiveAnimation: function() {
            return this._activeAnimation;
        },
        append: function() {
            this.appendChild.apply(this, arguments);
        },
        appendChild: function(el, returnDom) {
            var me = this,
                insertEl, eLen, e;
            if (el.nodeType || el.dom || typeof el === 'string') {
                el = Ext.getDom(el);
                me.dom.appendChild(el);
                return !returnDom ? Ext.get(el) : el;
            } else if (el.length) {
                insertEl = Ext.fly(DOC.createDocumentFragment());
                eLen = el.length;
                for (e = 0; e < eLen; e++) {
                    insertEl.appendChild(el[e], returnDom);
                }
                el = Ext.Array.toArray(insertEl.dom.childNodes);
                me.dom.appendChild(insertEl.dom);
                return returnDom ? el : new Ext.dom.CompositeElementLite(el);
            } else {
                return me.createChild(el, null, returnDom);
            }
        },
        appendTo: function(el) {
            Ext.getDom(el).appendChild(this.dom);
            return this;
        },
        applyStyles: function(styles) {
            if (styles) {
                if (typeof styles === "function") {
                    styles = styles.call();
                }
                if (typeof styles === "string") {
                    styles = Element.parseStyles(styles);
                }
                if (typeof styles === "object") {
                    this.setStyle(styles);
                }
            }
            return this;
        },
        blur: function() {
            var me = this,
                dom = me.dom;
            if (dom !== DOC.body) {
                try {
                    dom.blur();
                } catch (e) {}
                return me;
            } else {
                return me.focus(undefined, dom);
            }
        },
        cacheScrollValues: function() {
            var me = this,
                scrollValues = [],
                scrolledDescendants = [],
                descendants, descendant, i, len;
            scrollFly = scrollFly || new Ext.dom.Fly();
            descendants = me.query('*');
            for (i = 0 , len = descendants.length; i < len; i++) {
                descendant = descendants[i];
                if (descendant.scrollTop > 0 || descendant.scrollLeft !== 0) {
                    scrolledDescendants.push(descendant);
                    scrollValues.push(scrollFly.attach(descendant).getScroll());
                }
            }
            return function() {
                var scroll, i, len;
                for (i = 0 , len = scrolledDescendants.length; i < len; i++) {
                    scroll = scrollValues[i];
                    scrollFly.attach(scrolledDescendants[i]);
                    scrollFly.setScrollLeft(scroll.left);
                    scrollFly.setScrollTop(scroll.top);
                }
            };
        },
        center: function(centerIn) {
            return this.alignTo(centerIn || DOC, 'c-c');
        },
        child: function(selector, returnDom) {
            var me = this,
                id = Ext.get(me).id;
            return me.selectNode(Ext.makeIdSelector(id) + " > " + selector, !!returnDom);
        },
        clone: function(deep, returnDom) {
            var clone = this.dom.cloneNode(deep);
            if (Ext.supports.CloneNodeCopiesExpando) {
                clearData(clone, deep);
            }
            return returnDom ? clone : Ext.get(clone);
        },
        constrainScrollLeft: function(left) {
            var dom = this.dom;
            return Math.max(Math.min(left, dom.scrollWidth - dom.clientWidth), 0);
        },
        constrainScrollTop: function(top) {
            var dom = this.dom;
            return Math.max(Math.min(top, dom.scrollHeight - dom.clientHeight), 0);
        },
        createChild: function(config, insertBefore, returnDom) {
            config = config || {
                tag: 'div'
            };
            if (insertBefore) {
                return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
            } else {
                return Ext.DomHelper.append(this.dom, config, returnDom !== true);
            }
        },
        contains: function(element) {
            if (!element) {
                return false;
            }
            var me = this,
                dom = Ext.getDom(element);
            return (dom === me.dom) || me.isAncestor(dom);
        },
        destroy: function() {
            var me = this,
                dom = me.dom;
            if (me.destroyed) {
                Ext.Logger.warn("Cannot destroy Element \"" + me.id + "\". Already destroyed.");
                return;
            }
            if (dom) {
                if (dom === DOC.body) {
                    Ext.raise("Cannot destroy body element.");
                } else if (dom === DOC) {
                    Ext.raise("Cannot destroy document object.");
                } else if (dom === WIN) {
                    Ext.raise("Cannot destroy window object");
                }
            }
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
            me.collect();
        },
        detach: function() {
            var dom = this.dom;
            if (dom && dom.parentNode && dom.tagName !== 'BODY') {
                dom.parentNode.removeChild(dom);
            }
            return this;
        },
        disableShadow: function() {
            var shadow = this.shadow;
            if (shadow) {
                shadow.hide();
                shadow.disabled = true;
            }
        },
        disableShim: function() {
            var shim = this.shim;
            if (shim) {
                shim.hide();
                shim.disabled = true;
            }
        },
        doReplaceWith: function(element) {
            var dom = this.dom;
            dom.parentNode.replaceChild(Ext.getDom(element), dom);
        },
        doScrollIntoView: function(container, hscroll, animate, highlight, getScrollX, scrollTo) {
            scrollFly = scrollFly || new Ext.dom.Fly();
            var me = this,
                dom = me.dom,
                scrollX = scrollFly.attach(container)[getScrollX](),
                scrollY = container.scrollTop,
                position = me.getScrollIntoViewXY(container, scrollX, scrollY),
                newScrollX = position.x,
                newScrollY = position.y;
            if (highlight) {
                if (animate) {
                    animate = Ext.apply({
                        listeners: {
                            afteranimate: function() {
                                scrollFly.attach(dom).highlight();
                            }
                        }
                    }, animate);
                } else {
                    scrollFly.attach(dom).highlight();
                }
            }
            if (newScrollY !== scrollY) {
                scrollFly.attach(container).scrollTo('top', newScrollY, animate);
            }
            if (hscroll !== false && (newScrollX !== scrollX)) {
                scrollFly.attach(container)[scrollTo]('left', newScrollX, animate);
            }
            return me;
        },
        down: function(selector, returnDom) {
            return this.selectNode(selector, !!returnDom);
        },
        enableShadow: function(options, isVisible) {
            var me = this,
                shadow = me.shadow || (me.shadow = new Ext.dom.Shadow(Ext.apply({
                    target: me
                }, options))),
                shim = me.shim;
            if (shim) {
                shim.offsets = shadow.outerOffsets;
                shim.shadow = shadow;
                shadow.shim = shim;
            }
            if (isVisible === true || (isVisible !== false && me.isVisible())) {
                shadow.show();
            } else {
                shadow.hide();
            }
            shadow.disabled = false;
        },
        enableShim: function(options, isVisible) {
            var me = this,
                shim = me.shim || (me.shim = new Ext.dom.Shim(Ext.apply({
                    target: me
                }, options))),
                shadow = me.shadow;
            if (shadow) {
                shim.offsets = shadow.outerOffsets;
                shim.shadow = shadow;
                shadow.shim = shim;
            }
            if (isVisible === true || (isVisible !== false && me.isVisible())) {
                shim.show();
            } else {
                shim.hide();
            }
            shim.disabled = false;
            return shim;
        },
        findParent: function(simpleSelector, limit, returnEl) {
            var me = this,
                target = me.dom,
                topmost = docEl,
                depth = 0;
            if (limit || limit === 0) {
                if (typeof limit !== 'number') {
                    topmost = Ext.getDom(limit);
                    limit = Number.MAX_VALUE;
                }
            } else {
                limit = 50;
            }
            while (target && target.nodeType === 1 && depth < limit && target !== topmost) {
                if (Ext.fly(target).is(simpleSelector)) {
                    return returnEl ? Ext.get(target) : target;
                }
                depth++;
                target = target.parentNode;
            }
            return null;
        },
        findParentNode: function(simpleSelector, limit, returnEl) {
            var p = Ext.fly(this.dom.parentNode);
            return p ? p.findParent(simpleSelector, limit, returnEl) : null;
        },
        first: function(selector, returnDom) {
            return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
        },
        focus: function(defer, dom) {
            var me = this;
            dom = dom || me.dom;
            if (Number(defer)) {
                Ext.defer(me.focus, defer, me, [
                    null,
                    dom
                ]);
            } else {
                Ext.GlobalEvents.fireEvent('beforefocus', dom);
                dom.focus();
            }
            return me;
        },
        collect: function() {
            var me = this,
                dom = me.dom,
                shadow = me.shadow,
                shim = me.shim;
            if (!me.isFly) {
                me.mixins.observable.destroy.call(me);
                delete Ext.cache[me.id];
                me.el = null;
            }
            if (dom) {
                dom._extData = me.dom = null;
            }
            if (shadow) {
                shadow.hide();
                me.shadow = null;
            }
            if (shim) {
                shim.hide();
                me.shim = null;
            }
        },
        getAnchorToXY: function(el, anchor, local, mySize) {
            return el.getAnchorXY(anchor, local, mySize);
        },
        getAttribute: function(name, namespace) {
            var dom = this.dom;
            return namespace ? (dom.getAttributeNS(namespace, name) || dom.getAttribute(namespace + ":" + name)) : (dom.getAttribute(name) || dom[name] || null);
        },
        getAttributes: function() {
            var attributes = this.dom.attributes,
                result = {},
                attr, i, len;
            for (i = 0 , len = attributes.length; i < len; i++) {
                attr = attributes[i];
                result[attr.name] = attr.value;
            }
            return result;
        },
        getBottom: function(local) {
            return (local ? this.getLocalY() : this.getY()) + this.getHeight();
        },
        getById: function(id, asDom) {
            var dom = DOC.getElementById(id) || this.dom.querySelector(Ext.makeIdSelector(id));
            return asDom ? dom : (dom ? Ext.get(dom) : null);
        },
        getBorderPadding: function() {
            var paddingWidth = this.getStyle(paddingsTLRB),
                bordersWidth = this.getStyle(bordersTLRB);
            return {
                beforeX: (parseFloat(bordersWidth[borders.l]) || 0) + (parseFloat(paddingWidth[paddings.l]) || 0),
                afterX: (parseFloat(bordersWidth[borders.r]) || 0) + (parseFloat(paddingWidth[paddings.r]) || 0),
                beforeY: (parseFloat(bordersWidth[borders.t]) || 0) + (parseFloat(paddingWidth[paddings.t]) || 0),
                afterY: (parseFloat(bordersWidth[borders.b]) || 0) + (parseFloat(paddingWidth[paddings.b]) || 0)
            };
        },
        getBorders: function() {
            var bordersWidth = this.getStyle(bordersTLRB);
            return {
                beforeX: (parseFloat(bordersWidth[borders.l]) || 0),
                afterX: (parseFloat(bordersWidth[borders.r]) || 0),
                beforeY: (parseFloat(bordersWidth[borders.t]) || 0),
                afterY: (parseFloat(bordersWidth[borders.b]) || 0)
            };
        },
        getBorderWidth: function(side) {
            return this.addStyles(side, borders);
        },
        getData: function(preventCreate) {
            var dom = this.dom,
                data;
            if (dom) {
                data = dom._extData;
                if (!data && !preventCreate) {
                    dom._extData = data = {};
                }
            }
            return data;
        },
        getFirstChild: function() {
            return Ext.get(this.dom.firstElementChild);
        },
        getHeight: function(contentHeight, preciseHeight) {
            var me = this,
                dom = me.dom,
                hidden = me.isStyle('display', 'none'),
                height, floating;
            if (hidden) {
                return 0;
            }
            if (dom.nodeName === 'BODY') {
                height = Element.getViewportHeight();
            } else {
                height = dom.offsetHeight;
                if (height == null) {
                    height = dom.getBoundingClientRect().height;
                }
            }
            if (Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension(HEIGHT);
                if (preciseHeight) {
                    height += floating;
                } else if (floating > 0 && floating < 0.5) {
                    height++;
                }
            }
            if (contentHeight) {
                height -= me.getBorderWidth("tb") + me.getPadding("tb");
            }
            return (height < 0) ? 0 : height;
        },
        getHtml: function() {
            return this.dom ? this.dom.innerHTML : '';
        },
        getLeft: function(local) {
            return local ? this.getLocalX() : this.getX();
        },
        getLocalX: function() {
            var me = this,
                offsetParent,
                x = me.getStyle('left');
            if (!x || x === 'auto') {
                x = 0;
            } else if (pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    x -= Ext.fly(offsetParent).getX();
                }
            }
            return x;
        },
        getLocalXY: function() {
            var me = this,
                offsetParent,
                style = me.getStyle([
                    'left',
                    'top'
                ]),
                x = style.left,
                y = style.top;
            if (!x || x === 'auto') {
                x = 0;
            } else if (pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    x -= Ext.fly(offsetParent).getX();
                }
            }
            if (!y || y === 'auto') {
                y = 0;
            } else if (pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    y -= Ext.fly(offsetParent).getY();
                }
            }
            return [
                x,
                y
            ];
        },
        getLocalY: function() {
            var me = this,
                offsetParent,
                y = me.getStyle('top');
            if (!y || y === 'auto') {
                y = 0;
            } else if (pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    y -= Ext.fly(offsetParent).getY();
                }
            }
            return y;
        },
        getMargin: (function() {
            var hash = {
                    t: "top",
                    l: "left",
                    r: "right",
                    b: "bottom"
                },
                allMargins = [
                    'margin-top',
                    'margin-left',
                    'margin-right',
                    'margin-bottom'
                ];
            return function(side) {
                var me = this,
                    style, key, o;
                if (!side) {
                    style = me.getStyle(allMargins);
                    o = {};
                    if (style && typeof style === 'object') {
                        o = {};
                        for (key in margins) {
                            o[key] = o[hash[key]] = parseFloat(style[margins[key]]) || 0;
                        }
                    }
                } else {
                    o = me.addStyles(side, margins);
                }
                return o;
            };
        })(),
        getPadding: function(side) {
            return this.addStyles(side, paddings);
        },
        getParent: function() {
            return Ext.get(this.dom.parentNode);
        },
        getRight: function(local) {
            return (local ? this.getLocalX() : this.getX()) + this.getWidth();
        },
        getScroll: function() {
            var me = this,
                dom = me.dom,
                docElement = docEl,
                left, top,
                body = DOC.body;
            if (dom === DOC || dom === body) {
                left = docElement.scrollLeft || (body ? body.scrollLeft : 0);
                top = docElement.scrollTop || (body ? body.scrollTop : 0);
            } else {
                left = dom.scrollLeft;
                top = dom.scrollTop;
            }
            return {
                left: left,
                top: top
            };
        },
        getScrollIntoViewXY: function(container, scrollX, scrollY) {
            var dom = this.dom,
                ct = Ext.getDom(container),
                offsets = this.getOffsetsTo(ct),
                width = dom.offsetWidth,
                height = dom.offsetHeight,
                left = offsets[0] + scrollX,
                top = offsets[1] + scrollY,
                bottom = top + height,
                right = left + width,
                viewHeight = ct.clientHeight,
                viewWidth = ct.clientWidth,
                viewLeft = scrollX,
                viewTop = scrollY,
                viewBottom = viewTop + viewHeight,
                viewRight = viewLeft + viewWidth;
            if (height > viewHeight || top < viewTop) {
                scrollY = top;
            } else if (bottom > viewBottom) {
                scrollY = bottom - viewHeight;
            }
            if (width > viewWidth || left < viewLeft) {
                scrollX = left;
            } else if (right > viewRight) {
                scrollX = right - viewWidth;
            }
            return {
                x: scrollX,
                y: scrollY
            };
        },
        getScrollLeft: function() {
            var dom = this.dom;
            if (dom === DOC || dom === DOC.body) {
                return this.getScroll().left;
            } else {
                return dom.scrollLeft;
            }
        },
        getScrollTop: function() {
            var dom = this.dom;
            if (dom === DOC || dom === DOC.body) {
                return this.getScroll().top;
            } else {
                return dom.scrollTop;
            }
        },
        getSize: function(contentSize) {
            return {
                width: this.getWidth(contentSize),
                height: this.getHeight(contentSize)
            };
        },
        getStyle: function(property, inline) {
            var me = this,
                dom = me.dom,
                multiple = typeof property !== 'string',
                hooks = me.styleHooks,
                prop = property,
                props = prop,
                len = 1,
                domStyle, camel, values, hook, out, style, i;
            if (multiple) {
                values = {};
                prop = props[0];
                i = 0;
                if (!(len = props.length)) {
                    return values;
                }
            }
            if (!dom || dom.documentElement) {
                return values || '';
            }
            domStyle = dom.style;
            if (inline) {
                style = domStyle;
            } else {
                style = dom.ownerDocument.defaultView.getComputedStyle(dom, null);
                if (!style) {
                    inline = true;
                    style = domStyle;
                }
            }
            do {
                hook = hooks[prop];
                if (!hook) {
                    hooks[prop] = hook = {
                        name: Element.normalize(prop)
                    };
                }
                if (hook.get) {
                    out = hook.get(dom, me, inline, style);
                } else {
                    camel = hook.name;
                    out = style[camel];
                }
                if (!multiple) {
                    return out;
                }
                values[prop] = out;
                prop = props[++i];
            } while (i < len);
            return values;
        },
        getStyleValue: function(name) {
            return this.dom.style.getPropertyValue(name);
        },
        getTop: function(local) {
            return local ? this.getLocalY() : this.getY();
        },
        getTouchAction: function() {
            return Ext.dom.TouchAction.get(this.dom);
        },
        getValue: function(asNumber) {
            var value = this.dom.value;
            return asNumber ? parseInt(value, 10) : value;
        },
        getViewSize: function() {
            var dom = this.dom;
            if (dom === DOC || dom === DOC.body) {
                return {
                    width: Element.getViewportWidth(),
                    height: Element.getViewportHeight()
                };
            } else {
                return {
                    width: dom.clientWidth,
                    height: dom.clientHeight
                };
            }
        },
        getVisibilityMode: function() {
            var me = this,
                data = me.getData(),
                mode = data.visibilityMode;
            if (mode === undefined) {
                data.visibilityMode = mode = Element.DISPLAY;
            }
            return mode;
        },
        getWidth: function(contentWidth, preciseWidth) {
            var me = this,
                dom = me.dom,
                hidden = me.isStyle('display', 'none'),
                rect, width, floating;
            if (hidden) {
                return 0;
            }
            if (Ext.supports.BoundingClientRect) {
                rect = dom.getBoundingClientRect();
                width = (me.vertical && !Ext.supports.RotatedBoundingClientRect) ? (rect.bottom - rect.top) : (rect.right - rect.left);
                width = preciseWidth ? width : Math.ceil(width);
            } else {
                width = dom.offsetWidth;
            }
            if (Ext.supports.Direct2DBug && !me.vertical) {
                floating = me.adjustDirect2DDimension(WIDTH);
                if (preciseWidth) {
                    width += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    width++;
                }
            }
            if (contentWidth) {
                width -= me.getBorderWidth("lr") + me.getPadding("lr");
            }
            return (width < 0) ? 0 : width;
        },
        getX: function() {
            return this.getXY()[0];
        },
        getXY: function() {
            var round = Math.round,
                dom = this.dom,
                body = DOC.body,
                x = 0,
                y = 0,
                bodyRect, rect;
            if (dom !== DOC && dom !== body) {
                try {
                    bodyRect = body.getBoundingClientRect();
                    rect = dom.getBoundingClientRect();
                    x = rect.left - bodyRect.left;
                    y = rect.top - bodyRect.top;
                } catch (ex) {}
            }
            return [
                round(x),
                round(y)
            ];
        },
        getY: function() {
            return this.getXY()[1];
        },
        getZIndex: function() {
            return parseInt(this.getStyle('z-index'), 10);
        },
        hasCls: function(name) {
            var elementData = this.getData();
            if (!elementData.isSynchronized) {
                this.synchronize();
            }
            return elementData.classMap.hasOwnProperty(name);
        },
        hide: function() {
            this.setVisible(false);
            return this;
        },
        insertAfter: function(el) {
            el = Ext.getDom(el);
            el.parentNode.insertBefore(this.dom, el.nextSibling);
            return this;
        },
        insertBefore: function(el) {
            el = Ext.getDom(el);
            el.parentNode.insertBefore(this.dom, el);
            return this;
        },
        insertFirst: function(el, returnDom) {
            el = el || {};
            if (el.nodeType || el.dom || typeof el === 'string') {
                el = Ext.getDom(el);
                this.dom.insertBefore(el, this.dom.firstChild);
                return !returnDom ? Ext.get(el) : el;
            } else {
                return this.createChild(el, this.dom.firstChild, returnDom);
            }
        },
        insertHtml: function(where, html, returnEl) {
            var el = Ext.DomHelper.insertHtml(where, this.dom, html);
            return returnEl ? Ext.get(el) : el;
        },
        insertSibling: function(el, where, returnDom) {
            var me = this,
                DomHelper = Ext.DomHelper,
                isAfter = (where || 'before').toLowerCase() === 'after',
                rt, insertEl, eLen, e;
            if (Ext.isIterable(el)) {
                eLen = el.length;
                insertEl = Ext.fly(DOC.createDocumentFragment());
                if (Ext.isArray(el)) {
                    for (e = 0; e < eLen; e++) {
                        rt = insertEl.appendChild(el[e], returnDom);
                    }
                } else {
                    for (e = 0; e < eLen; e++) {
                        insertEl.dom.appendChild(rt = el[0]);
                    }
                    if (returnDom === false) {
                        rt = Ext.get(rt);
                    }
                }
                me.dom.parentNode.insertBefore(insertEl.dom, isAfter ? me.dom.nextSibling : me.dom);
                return rt;
            }
            el = el || {};
            if (el.nodeType || el.dom) {
                rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
                if (!returnDom) {
                    rt = Ext.get(rt);
                }
            } else {
                if (isAfter && !me.dom.nextSibling) {
                    rt = DomHelper.append(me.dom.parentNode, el, !returnDom);
                } else {
                    rt = DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
                }
            }
            return rt;
        },
        is: function(selector) {
            var dom = this.dom,
                is;
            if (!selector) {
                is = true;
            } else if (!dom.tagName) {
                is = false;
            } else if (Ext.isFunction(selector)) {
                is = selector(dom);
            } else {
                is = dom[Ext.supports.matchesSelector](selector);
            }
            return is;
        },
        isAncestor: function(el) {
            var ret = false,
                dom = this.dom,
                child = Ext.getDom(el);
            if (dom && child) {
                if (dom.contains) {
                    return dom.contains(child);
                } else if (dom.compareDocumentPosition) {
                    return !!(dom.compareDocumentPosition(child) & 16);
                } else {
                    while ((child = child.parentNode)) {
                        ret = child === dom || ret;
                    }
                }
            }
            return ret;
        },
        isPainted: (function() {
            return !Ext.browser.is.IE ? function() {
                var dom = this.dom;
                return Boolean(dom && dom.offsetParent);
            } : function() {
                var dom = this.dom;
                return Boolean(dom && (dom.offsetHeight !== 0 && dom.offsetWidth !== 0));
            };
        })(),
        isScrollable: function() {
            var dom = this.dom;
            return dom.scrollHeight > dom.clientHeight || dom.scrollWidth > dom.clientWidth;
        },
        isStyle: function(style, val) {
            return this.getStyle(style) === val;
        },
        isVisible: function(deep) {
            var dom = this.dom,
                end;
            if (!dom) {
                return false;
            }
            if (!visFly) {
                visFly = new Ext.dom.Fly();
            }
            for (end = dom.ownerDocument.documentElement; dom !== end; dom = dom.parentNode) {
                if (!dom || dom.nodeType === 11 || (visFly.attach(dom)).isStyle(VISIBILITY, HIDDEN) || visFly.isStyle(DISPLAY, NONE)) {
                    return false;
                }
                if (!deep) {
                    break;
                }
            }
            return true;
        },
        last: function(selector, returnDom) {
            return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
        },
        matchNode: function(dir, start, selector, returnDom) {
            var dom = this.dom,
                n;
            if (!dom) {
                return null;
            }
            n = dom[start];
            while (n) {
                if (n.nodeType === 1 && (!selector || Ext.fly(n, '_matchNode').is(selector))) {
                    return !returnDom ? Ext.get(n) : n;
                }
                n = n[dir];
            }
            return null;
        },
        monitorMouseLeave: function(delay, handler, scope) {
            var me = this,
                timer,
                listeners = {
                    mouseleave: function(e) {
                        if (Ext.isIE9m) {
                            e.enableIEAsync();
                        }
                        timer = Ext.defer(handler, delay, scope || me, [
                            e
                        ]);
                    },
                    mouseenter: function() {
                        clearTimeout(timer);
                    },
                    destroy: function() {
                        clearTimeout(timer);
                        me.un(listeners);
                    }
                };
            me.on(listeners);
            return listeners;
        },
        next: function(selector, returnDom) {
            return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
        },
        parent: function(selector, returnDom) {
            return this.matchNode('parentNode', 'parentNode', selector, returnDom);
        },
        position: function(pos, zIndex, x, y) {
            var me = this;
            if (me.dom.tagName !== 'BODY') {
                if (!pos && me.isStyle(POSITION, STATIC)) {
                    me.setStyle(POSITION, RELATIVE);
                } else if (pos) {
                    me.setStyle(POSITION, pos);
                }
                if (zIndex) {
                    me.setStyle(ZINDEX, zIndex);
                }
                if (x || y) {
                    me.setXY([
                        x || false,
                        y || false
                    ]);
                }
            }
        },
        prev: function(selector, returnDom) {
            return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
        },
        query: function(selector, asDom, single) {
            var dom = this.dom,
                results, len, nlen, node, nodes, i, j;
            if (!dom) {
                return null;
            }
            asDom = (asDom !== false);
            selector = selector.split(",");
            if (!single) {
                results = [];
            }
            for (i = 0 , len = selector.length; i < len; i++) {
                if (typeof selector[i] === 'string') {
                    if (single) {
                        node = dom.querySelector(selector[i]);
                        return asDom ? node : Ext.get(node);
                    }
                    nodes = dom.querySelectorAll(selector[i]);
                    for (j = 0 , nlen = nodes.length; j < nlen; j++) {
                        results.push(asDom ? nodes[j] : Ext.get(nodes[j]));
                    }
                }
            }
            return results;
        },
        radioCls: function(className) {
            var cn = this.dom.parentNode.childNodes,
                v;
            className = Ext.isArray(className) ? className : [
                className
            ];
            for (var i = 0,
                len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType === 1) {
                    Ext.fly(v).removeCls(className);
                }
            }
            return this.addCls(className);
        },
        redraw: function() {
            var dom = this.dom,
                domStyle = dom.style;
            domStyle.display = 'none';
            dom.offsetHeight;
            domStyle.display = '';
        },
        remove: function() {
            this.destroy();
        },
        removeChild: function(element) {
            this.dom.removeChild(Ext.getDom(element));
            return this;
        },
        removeCls: function(names, prefix, suffix) {
            var me = this,
                elementData = me.getData(),
                hasNewCls, dom, map, classList, i, ln, name;
            if (!names) {
                return me;
            }
            if (!elementData.isSynchronized) {
                me.synchronize();
            }
            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;
            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';
            if (typeof names === 'string') {
                names = names.split(spacesRe);
            }
            for (i = 0 , ln = names.length; i < ln; i++) {
                name = names[i];
                if (name) {
                    name = prefix + name + suffix;
                    if (map[name]) {
                        delete map[name];
                        Ext.Array.remove(classList, name);
                        hasNewCls = true;
                    }
                }
            }
            if (hasNewCls) {
                dom.className = classList.join(' ');
            }
            return me;
        },
        repaint: function() {
            var me = this;
            me.addCls(Ext.baseCSSPrefix + 'repaint');
            Ext.defer(function() {
                if (me.dom) {
                    Ext.fly(me.dom).removeCls(Ext.baseCSSPrefix + 'repaint');
                }
            }, 1);
            return me;
        },
        replace: function(el, destroy) {
            el = Ext.getDom(el);
            var parentNode = el.parentNode,
                id = el.id,
                dom = this.dom;
            if (!parentNode) {
                Ext.raise('Cannot replace element "' + id + '". It is not attached to a parent node.');
            }
            if (destroy !== false && id && Ext.cache[id]) {
                parentNode.insertBefore(dom, el);
                Ext.get(el).destroy();
            } else {
                parentNode.replaceChild(dom, el);
            }
            return this;
        },
        replaceCls: function(oldName, newName, prefix, suffix) {
            var me = this,
                dom, map, classList, i, ln, name,
                elementData = me.getData(),
                change;
            if (!oldName && !newName) {
                return me;
            }
            oldName = oldName || [];
            newName = newName || [];
            if (!elementData.isSynchronized) {
                me.synchronize();
            }
            if (!suffix) {
                suffix = '';
            }
            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;
            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';
            if (typeof oldName === 'string') {
                oldName = oldName.split(spacesRe);
            }
            if (typeof newName === 'string') {
                newName = newName.split(spacesRe);
            }
            for (i = 0 , ln = oldName.length; i < ln; i++) {
                name = prefix + oldName[i] + suffix;
                if (map[name]) {
                    delete map[name];
                    change = true;
                }
            }
            for (i = 0 , ln = newName.length; i < ln; i++) {
                name = prefix + newName[i] + suffix;
                if (!map[name]) {
                    map[name] = true;
                    change = true;
                }
            }
            if (change) {
                elementData.classList = classList = Ext.Object.getKeys(map);
                dom.className = classList.join(' ');
            }
            return me;
        },
        replaceWith: function(el) {
            var me = this,
                dom = me.dom,
                parent = dom.parentNode,
                cache = Ext.cache,
                newDom;
            me.clearListeners();
            if (el.nodeType || el.dom || typeof el === 'string') {
                el = Ext.get(el);
                newDom = parent.insertBefore(el.dom, dom);
            } else {
                newDom = Ext.DomHelper.insertBefore(dom, el);
            }
            parent.removeChild(dom);
            me.dom = newDom;
            if (!me.isFly) {
                delete cache[me.id];
                cache[me.id = Ext.id(newDom)] = me;
            }
            return me;
        },
        resolveListenerScope: function(defaultScope) {
            var component = this.component;
            return component ? component.resolveListenerScope(defaultScope) : this;
        },
        scroll: function(direction, distance, animate) {
            if (!this.isScrollable()) {
                return false;
            }
            direction = direction.charAt(0);
            var me = this,
                dom = me.dom,
                side = direction === 'r' || direction === 'l' ? 'left' : 'top',
                scrolled = false,
                currentScroll, constrainedScroll;
            if (direction === 'l' || direction === 't' || direction === 'u') {
                distance = -distance;
            }
            if (side === 'left') {
                currentScroll = dom.scrollLeft;
                constrainedScroll = me.constrainScrollLeft(currentScroll + distance);
            } else {
                currentScroll = dom.scrollTop;
                constrainedScroll = me.constrainScrollTop(currentScroll + distance);
            }
            if (constrainedScroll !== currentScroll) {
                this.scrollTo(side, constrainedScroll, animate);
                scrolled = true;
            }
            return scrolled;
        },
        scrollBy: function(deltaX, deltaY, animate) {
            var me = this,
                dom = me.dom;
            if (deltaX.length) {
                animate = deltaY;
                deltaY = deltaX[1];
                deltaX = deltaX[0];
            } else if (typeof deltaX != 'number') {
                animate = deltaY;
                deltaY = deltaX.y;
                deltaX = deltaX.x;
            }
            if (deltaX) {
                me.scrollTo('left', me.constrainScrollLeft(dom.scrollLeft + deltaX), animate);
            }
            if (deltaY) {
                me.scrollTo('top', me.constrainScrollTop(dom.scrollTop + deltaY), animate);
            }
            return me;
        },
        scrollChildIntoView: function(child, hscroll) {
            Ext.fly(child).scrollIntoView(this, hscroll);
        },
        scrollIntoView: function(container, hscroll, animate, highlight) {
            container = Ext.getDom(container) || Ext.getBody().dom;
            return this.doScrollIntoView(container, hscroll, animate, highlight, 'getScrollLeft', 'scrollTo');
        },
        scrollTo: function(side, value, animate) {
            var top = topRe.test(side),
                me = this,
                prop = top ? 'scrollTop' : 'scrollLeft',
                dom = me.dom,
                animCfg;
            if (!animate || !me.anim) {
                dom[prop] = value;
                dom[prop] = value;
            } else {
                animCfg = {
                    to: {}
                };
                animCfg.to[prop] = value;
                if (Ext.isObject(animate)) {
                    Ext.applyIf(animCfg, animate);
                }
                me.animate(animCfg);
            }
            return me;
        },
        select: function(selector, composite) {
            var isElementArray, elements;
            if (typeof selector === "string") {
                elements = this.query(selector, !composite);
            }
            else if (selector.length === undefined) {
                Ext.raise("Invalid selector specified: " + selector);
            } else {
                elements = selector;
                isElementArray = true;
            }
            return composite ? new Ext.CompositeElement(elements, !isElementArray) : new Ext.CompositeElementLite(elements, true);
        },
        selectNode: function(selector, asDom) {
            return this.query(selector, asDom, true);
        },
        set: function(attributes, useSet) {
            var me = this,
                dom = me.dom,
                attribute, value;
            for (attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    value = attributes[attribute];
                    if (attribute === 'style') {
                        me.applyStyles(value);
                    } else if (attribute === 'cls') {
                        dom.className = value;
                    } else if (useSet !== false) {
                        if (value === undefined) {
                            dom.removeAttribute(attribute);
                        } else {
                            dom.setAttribute(attribute, value);
                        }
                    } else {
                        dom[attribute] = value;
                    }
                }
            }
            return me;
        },
        setBottom: function(bottom) {
            this.dom.style[BOTTOM] = Element.addUnits(bottom);
            return this;
        },
        setCls: function(className) {
            var me = this,
                elementData = me.getData(),
                i, ln, name, map, classList;
            if (!elementData.isSynchronized) {
                me.synchronize();
            }
            if (typeof className === 'string') {
                className = className.split(spacesRe);
            }
            elementData.classList = classList = className.slice();
            elementData.classMap = map = {};
            for (i = 0 , ln = classList.length; i < ln; i++) {
                map[classList[i]] = true;
            }
            me.dom.className = classList.join(' ');
        },
        setDisplayed: function(value) {
            var me = this;
            if (typeof value === "boolean") {
                value = value ? me._getDisplay() : NONE;
            }
            me.setStyle(DISPLAY, value);
            if (me.shadow || me.shim) {
                me.setUnderlaysVisible(value !== NONE);
            }
            return me;
        },
        setHeight: function(height) {
            var me = this;
            me.dom.style[HEIGHT] = Element.addUnits(height);
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setHtml: function(html) {
            if (this.dom) {
                this.dom.innerHTML = html;
            }
            return this;
        },
        setId: function(id) {
            var me = this,
                currentId = me.id,
                cache = Ext.cache;
            if (currentId) {
                delete cache[currentId];
            }
            me.dom.id = id;
            me.id = id;
            cache[id] = me;
            return me;
        },
        setLeft: function(left) {
            var me = this;
            me.dom.style[LEFT] = Element.addUnits(left);
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setLocalX: function(x) {
            var me = this,
                style = me.dom.style;
            style.right = 'auto';
            style.left = (x === null) ? 'auto' : x + 'px';
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setLocalXY: function(x, y) {
            var me = this,
                style = me.dom.style;
            style.right = 'auto';
            if (x && x.length) {
                y = x[1];
                x = x[0];
            }
            if (x === null) {
                style.left = 'auto';
            } else if (x !== undefined) {
                style.left = x + 'px';
            }
            if (y === null) {
                style.top = 'auto';
            } else if (y !== undefined) {
                style.top = y + 'px';
            }
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setLocalY: function(y) {
            var me = this;
            me.dom.style.top = (y === null) ? 'auto' : y + 'px';
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setMargin: function(margin) {
            var me = this,
                domStyle = me.dom.style;
            if (margin || margin === 0) {
                margin = me.self.unitizeBox((margin === true) ? 5 : margin);
                domStyle.setProperty('margin', margin, 'important');
            } else {
                domStyle.removeProperty('margin-top');
                domStyle.removeProperty('margin-right');
                domStyle.removeProperty('margin-bottom');
                domStyle.removeProperty('margin-left');
            }
        },
        setMaxHeight: function(height) {
            this.dom.style[MAX_HEIGHT] = Element.addUnits(height);
            return this;
        },
        setMaxWidth: function(width) {
            this.dom.style[MAX_WIDTH] = Element.addUnits(width);
            return this;
        },
        setMinHeight: function(height) {
            this.dom.style[MIN_HEIGHT] = Element.addUnits(height);
            return this;
        },
        setMinWidth: function(width) {
            this.dom.style[MIN_WIDTH] = Element.addUnits(width);
            return this;
        },
        setOpacity: function(opacity) {
            var me = this;
            if (me.dom) {
                me.setStyle('opacity', opacity);
            }
            return me;
        },
        setPadding: function(padding) {
            var me = this,
                domStyle = me.dom.style;
            if (padding || padding === 0) {
                padding = me.self.unitizeBox((padding === true) ? 5 : padding);
                domStyle.setProperty('padding', padding, 'important');
            } else {
                domStyle.removeProperty('padding-top');
                domStyle.removeProperty('padding-right');
                domStyle.removeProperty('padding-bottom');
                domStyle.removeProperty('padding-left');
            }
        },
        setRight: function(right) {
            this.dom.style[RIGHT] = Element.addUnits(right);
            return this;
        },
        setScrollLeft: function(left) {
            this.dom.scrollLeft = left;
            return this;
        },
        setScrollTop: function(top) {
            this.dom.scrollTop = top;
            return this;
        },
        setSize: function(width, height) {
            var me = this,
                style = me.dom.style;
            if (Ext.isObject(width)) {
                height = width.height;
                width = width.width;
            }
            style.width = Element.addUnits(width);
            style.height = Element.addUnits(height);
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setSizeState: function(state) {
            var me = this,
                add, remove;
            if (state === true) {
                add = sizedCls;
                remove = [
                    unsizedCls,
                    stretchedCls
                ];
            } else if (state === false) {
                add = unsizedCls;
                remove = [
                    sizedCls,
                    stretchedCls
                ];
            } else if (state === null) {
                add = stretchedCls;
                remove = [
                    sizedCls,
                    unsizedCls
                ];
            } else {
                remove = [
                    sizedCls,
                    unsizedCls,
                    stretchedCls
                ];
            }
            if (add) {
                me.addCls(add);
            }
            me.removeCls(remove);
            return me;
        },
        setStyle: function(prop, value) {
            var me = this,
                dom = me.dom,
                hooks = me.styleHooks,
                style = dom.style,
                name = prop,
                hook;
            if (typeof name === 'string') {
                hook = hooks[name];
                if (!hook) {
                    hooks[name] = hook = {
                        name: Element.normalize(name)
                    };
                }
                value = (value == null) ? '' : value;
                if (hook.set) {
                    hook.set(dom, value, me);
                } else {
                    style[hook.name] = value;
                }
                if (hook.afterSet) {
                    hook.afterSet(dom, value, me);
                }
            } else {
                for (name in prop) {
                    if (prop.hasOwnProperty(name)) {
                        hook = hooks[name];
                        if (!hook) {
                            hooks[name] = hook = {
                                name: Element.normalize(name)
                            };
                        }
                        value = prop[name];
                        value = (value == null) ? '' : value;
                        if (hook.set) {
                            hook.set(dom, value, me);
                        } else {
                            style[hook.name] = value;
                        }
                        if (hook.afterSet) {
                            hook.afterSet(dom, value, me);
                        }
                    }
                }
            }
            return me;
        },
        setText: function(text) {
            this.dom.textContent = text;
        },
        setTop: function(top) {
            var me = this;
            me.dom.style[TOP] = Element.addUnits(top);
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setTouchAction: function(touchAction) {
            Ext.dom.TouchAction.set(this.dom, touchAction);
        },
        setUnderlaysVisible: function(visible) {
            var shadow = this.shadow,
                shim = this.shim;
            if (shadow && !shadow.disabled) {
                if (visible) {
                    shadow.show();
                } else {
                    shadow.hide();
                }
            }
            if (shim && !shim.disabled) {
                if (visible) {
                    shim.show();
                } else {
                    shim.hide();
                }
            }
        },
        setVisibility: function(isVisible) {
            var domStyle = this.dom.style;
            if (isVisible) {
                domStyle.removeProperty('visibility');
            } else {
                domStyle.setProperty('visibility', 'hidden', 'important');
            }
        },
        setVisibilityMode: function(mode) {
            if (mode !== 1 && mode !== 2 && mode !== 3 && mode !== 4) {
                Ext.raise("visibilityMode must be one of the following: " + "Ext.Element.DISPLAY, Ext.Element.VISIBILITY, Ext.Element.OFFSETS, " + "or Ext.Element.CLIP");
            }
            this.getData().visibilityMode = mode;
            return this;
        },
        setVisible: function(visible) {
            var me = this,
                mode = me.getVisibilityMode(),
                addOrRemove = visible ? 'removeCls' : 'addCls';
            switch (mode) {
                case Element.DISPLAY:
                    me.removeCls([
                        visibilityCls,
                        offsetsCls,
                        clipCls
                    ]);
                    me[addOrRemove](displayCls);
                    break;
                case Element.VISIBILITY:
                    me.removeCls([
                        displayCls,
                        offsetsCls,
                        clipCls
                    ]);
                    me[addOrRemove](visibilityCls);
                    break;
                case Element.OFFSETS:
                    me.removeCls([
                        visibilityCls,
                        displayCls,
                        clipCls
                    ]);
                    me[addOrRemove](offsetsCls);
                    break;
                case Element.CLIP:
                    me.removeCls([
                        visibilityCls,
                        displayCls,
                        offsetsCls
                    ]);
                    me[addOrRemove](clipCls);
                    break;
            }
            if (me.shadow || me.shim) {
                me.setUnderlaysVisible(visible);
            }
            return me;
        },
        setWidth: function(width) {
            var me = this;
            me.dom.style[WIDTH] = Element.addUnits(width);
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setX: function(x) {
            return this.setXY([
                x,
                false
            ]);
        },
        setXY: function(xy) {
            var me = this,
                pts = me.translatePoints(xy),
                style = me.dom.style,
                pos;
            me.position();
            style.right = 'auto';
            for (pos in pts) {
                if (!isNaN(pts[pos])) {
                    style[pos] = pts[pos] + 'px';
                }
            }
            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }
            return me;
        },
        setY: function(y) {
            return this.setXY([
                false,
                y
            ]);
        },
        setZIndex: function(zindex) {
            var me = this;
            if (me.shadow) {
                me.shadow.setZIndex(zindex);
            }
            if (me.shim) {
                me.shim.setZIndex(zindex);
            }
            return me.setStyle('z-index', zindex);
        },
        show: function() {
            this.setVisible(true);
            return this;
        },
        swapCls: function(firstClass, secondClass, flag, prefix) {
            if (flag === undefined) {
                flag = true;
            }
            var me = this,
                addedClass = flag ? firstClass : secondClass,
                removedClass = flag ? secondClass : firstClass;
            if (removedClass) {
                me.removeCls(prefix ? prefix + '-' + removedClass : removedClass);
            }
            if (addedClass) {
                me.addCls(prefix ? prefix + '-' + addedClass : addedClass);
            }
            return me;
        },
        synchronize: function() {
            var me = this,
                dom = me.dom,
                hasClassMap = {},
                className = dom.className,
                classList, i, ln, name,
                elementData = me.getData();
            if (className && className.length > 0) {
                classList = dom.className.split(classNameSplitRegex);
                for (i = 0 , ln = classList.length; i < ln; i++) {
                    name = classList[i];
                    hasClassMap[name] = true;
                }
            } else {
                classList = [];
            }
            elementData.classList = classList;
            elementData.classMap = hasClassMap;
            elementData.isSynchronized = true;
            return me;
        },
        syncUnderlays: function() {
            var me = this,
                shadow = me.shadow,
                shim = me.shim,
                dom = me.dom,
                xy, x, y, w, h;
            if (me.isVisible()) {
                xy = me.getXY();
                x = xy[0];
                y = xy[1];
                w = dom.offsetWidth;
                h = dom.offsetHeight;
                if (shadow && !shadow.hidden) {
                    shadow.realign(x, y, w, h);
                }
                if (shim && !shim.hidden) {
                    shim.realign(x, y, w, h);
                }
            }
        },
        toggleCls: function(className, state) {
            if (typeof state !== 'boolean') {
                state = !this.hasCls(className);
            }
            return state ? this.addCls(className) : this.removeCls(className);
        },
        toggle: function() {
            this.setVisible(!this.isVisible());
            return this;
        },
        translate: function() {
            var transformStyleName = 'webkitTransform' in DOC.createElement('div').style ? 'webkitTransform' : 'transform';
            return function(x, y, z) {
                x = Math.round(x);
                y = Math.round(y);
                z = Math.round(z);
                this.dom.style[transformStyleName] = 'translate3d(' + (x || 0) + 'px, ' + (y || 0) + 'px, ' + (z || 0) + 'px)';
            };
        }(),
        unwrap: function() {
            var dom = this.dom,
                parentNode = dom.parentNode,
                grandparentNode,
                activeElement = Ext.fly(Ext.Element.getActiveElement()),
                cached, resumeFocus, grannyFly, tabIndex;
            cached = Ext.cache[activeElement.id];
            if (cached) {
                activeElement = cached;
            }
            if (this.contains(activeElement)) {
                if (cached) {
                    cached.suspendFocusEvents();
                }
                resumeFocus = true;
            }
            if (parentNode) {
                grandparentNode = parentNode.parentNode;
                if (resumeFocus) {
                    tabIndex = grandparentNode.getAttribute('tabIndex');
                    grannyFly = Ext.fly(grandparentNode);
                    grannyFly.set({
                        tabIndex: -1
                    });
                    grannyFly.suspendFocusEvents();
                    grannyFly.focus();
                }
                grandparentNode.insertBefore(dom, parentNode);
                grandparentNode.removeChild(parentNode);
            } else {
                grandparentNode = DOC.createDocumentFragment();
                grandparentNode.appendChild(dom);
            }
            if (resumeFocus) {
                if (cached) {
                    cached.focus();
                    cached.resumeFocusEvents();
                } else {
                    Ext.fly(activeElement).focus();
                }
                if (grannyFly) {
                    grannyFly.resumeFocusEvents();
                    grannyFly.set({
                        tabIndex: tabIndex
                    });
                }
            }
            return this;
        },
        up: function(simpleSelector, limit, returnDom) {
            return this.findParentNode(simpleSelector, limit, !returnDom);
        },
        update: function(html) {
            return this.setHtml(html);
        },
        wrap: function(config, returnDom, selector) {
            var me = this,
                dom = me.dom,
                newEl = Ext.DomHelper.insertBefore(dom, config || {
                    tag: "div"
                }, !returnDom),
                target = newEl,
                activeElement = Ext.Element.getActiveElement(),
                cached, resumeFocus, tabIndex;
            cached = Ext.cache[activeElement.id];
            if (cached) {
                activeElement = cached;
            }
            if (selector) {
                target = newEl.selectNode(selector, returnDom);
            }
            if (me.contains(activeElement)) {
                if (cached) {
                    cached.suspendFocusEvents();
                }
                tabIndex = newEl.dom.getAttribute('tabIndex');
                newEl.set({
                    tabIndex: -1
                });
                newEl.suspendFocusEvents();
                newEl.focus();
                resumeFocus = true;
            }
            target.appendChild(dom);
            if (resumeFocus) {
                if (cached) {
                    cached.focus();
                    cached.resumeFocusEvents();
                } else {
                    Ext.fly(activeElement).focus();
                }
                newEl.resumeFocusEvents();
                newEl.set({
                    tabIndex: tabIndex
                });
            }
            return newEl;
        },
        privates: {
            doAddListener: function(eventName, fn, scope, options, order, caller, manager) {
                var me = this,
                    gesturePublisher = Ext.$gesturePublisher,
                    originalName = eventName,
                    supports = Ext.supports,
                    supportsTouch = supports.TouchEvents,
                    supportsPointer = supports.PointerEvents,
                    observableDoAddListener, additiveEventName, translatedEventName;
                eventName = Ext.canonicalEventName(eventName);
                if (!me.blockedEvents[eventName]) {
                    observableDoAddListener = me.mixins.observable.doAddListener;
                    options = options || {};
                    if (Element.useDelegatedEvents === false) {
                        options.delegated = options.delegated || false;
                    }
                    if (options.translate !== false) {
                        additiveEventName = me.additiveEvents[eventName];
                        if (additiveEventName) {
                            options.type = eventName;
                            eventName = additiveEventName;
                            observableDoAddListener.call(me, eventName, fn, scope, options, order, caller, manager);
                        }
                        translatedEventName = me.eventMap[eventName];
                        if (translatedEventName) {
                            options.type = options.type || eventName;
                            if (manager) {
                                options.managedName = originalName;
                            }
                            eventName = translatedEventName;
                        }
                    }
                    if (observableDoAddListener.call(me, eventName, fn, scope, options, order, caller, manager)) {
                        if (me.longpressEvents[eventName] && (++me.longpressListenerCount === 1)) {
                            me.on('MSHoldVisual', 'preventMsHoldVisual', me);
                        }
                    }
                    if (manager && translatedEventName) {
                        delete options.managedName;
                    }
                    delete options.type;
                }
            },
            doRemoveListener: function(eventName, fn, scope) {
                var me = this,
                    gesturePublisher = Ext.$gesturePublisher,
                    supports = Ext.supports,
                    supportsTouch = supports.TouchEvents,
                    supportsPointer = supports.PointerEvents,
                    observableDoRemoveListener, translatedEventName, additiveEventName, contextMenuListenerRemover, removed;
                eventName = Ext.canonicalEventName(eventName);
                if (!me.blockedEvents[eventName]) {
                    observableDoRemoveListener = me.mixins.observable.doRemoveListener;
                    additiveEventName = me.additiveEvents[eventName];
                    if (additiveEventName) {
                        eventName = additiveEventName;
                        observableDoRemoveListener.call(me, eventName, fn, scope);
                    }
                    translatedEventName = me.eventMap[eventName];
                    if (translatedEventName) {
                        removed = observableDoRemoveListener.call(me, translatedEventName, fn, scope);
                    }
                    removed = observableDoRemoveListener.call(me, eventName, fn, scope) || removed;
                    if (removed) {
                        if (me.longpressEvents[eventName] && !--me.longpressListenerCount) {
                            me.un('MSHoldVisual', 'preventMsHoldVisual', me);
                        }
                    }
                }
            },
            _initEvent: function(eventName) {
                return (this.events[eventName] = new Ext.dom.ElementEvent(this, eventName));
            },
            _getDisplay: function() {
                var data = this.getData(),
                    display = data[ORIGINALDISPLAY];
                if (display === undefined) {
                    data[ORIGINALDISPLAY] = display = '';
                }
                return display;
            },
            _getPublisher: function(eventName) {
                var Publisher = Ext.event.publisher.Publisher,
                    publisher = Publisher.publishersByEvent[eventName];
                if (!publisher || (this.dom === window && eventName === 'resize')) {
                    publisher = Publisher.publishers.dom;
                }
                return publisher;
            },
            isFocusSuspended: function() {
                return !!this.getData().suspendFocusEvents;
            },
            preventMsHoldVisual: function(e) {
                e.preventDefault();
            },
            suspendFocusEvents: function() {
                if (!this.isFly) {
                    this.suspendEvent('focus', 'blur');
                }
                this.getData().suspendFocusEvents = true;
            },
            resumeFocusEvents: function() {
                function resumeFn() {
                    var data;
                    if (!this.destroyed) {
                        data = this.getData();
                        if (data) {
                            data.suspendFocusEvents = false;
                        }
                        if (!this.isFly) {
                            this.resumeEvent('focus', 'blur');
                        }
                    }
                }
                if (!this.destroyed && this.getData().suspendFocusEvents) {
                    if (Ext.isIE) {
                        Ext.asap(resumeFn, this);
                    } else {
                        resumeFn.call(this);
                    }
                }
            }
        },
        deprecated: {
            '5.0': {
                methods: {
                    cssTranslate: null,
                    getHTML: 'getHtml',
                    getOuterHeight: null,
                    getOuterWidth: null,
                    getPageBox: function(getRegion) {
                        var me = this,
                            dom = me.dom,
                            isDoc = dom.nodeName === 'BODY',
                            w = isDoc ? Element.getViewportWidth() : dom.offsetWidth,
                            h = isDoc ? Element.getViewportHeight() : dom.offsetHeight,
                            xy = me.getXY(),
                            t = xy[1],
                            r = xy[0] + w,
                            b = xy[1] + h,
                            l = xy[0];
                        if (getRegion) {
                            return new Ext.util.Region(t, r, b, l);
                        } else {
                            return {
                                left: l,
                                top: t,
                                width: w,
                                height: h,
                                right: r,
                                bottom: b
                            };
                        }
                    },
                    getScrollParent: null,
                    isDescendent: null,
                    isTransparent: function(prop) {
                        var value = this.getStyle(prop);
                        return value ? transparentRe.test(value) : false;
                    },
                    purgeAllListeners: 'clearListeners',
                    removeAllListeners: 'clearListeners',
                    setHTML: 'setHtml',
                    setTopLeft: null
                }
            }
        }
    };
}, function(Element) {
    var DOC = document,
        docEl = DOC.documentElement,
        prototype = Element.prototype,
        supports = Ext.supports,
        pointerdown = 'pointerdown',
        pointermove = 'pointermove',
        pointerup = 'pointerup',
        pointercancel = 'pointercancel',
        MSPointerDown = 'MSPointerDown',
        MSPointerMove = 'MSPointerMove',
        MSPointerUp = 'MSPointerUp',
        MSPointerCancel = 'MSPointerCancel',
        mousedown = 'mousedown',
        mousemove = 'mousemove',
        mouseup = 'mouseup',
        mouseover = 'mouseover',
        mouseout = 'mouseout',
        mouseenter = 'mouseenter',
        mouseleave = 'mouseleave',
        touchstart = 'touchstart',
        touchmove = 'touchmove',
        touchend = 'touchend',
        touchcancel = 'touchcancel',
        click = 'click',
        dblclick = 'dblclick',
        tap = 'tap',
        doubletap = 'doubletap',
        eventMap = prototype.eventMap = {},
        additiveEvents = prototype.additiveEvents = {},
        oldId = Ext.id,
        eventOptions;
    Ext.id = function(obj, prefix) {
        var el = Ext.getDom(obj, true),
            sandboxPrefix, id;
        if (!el) {
            id = oldId(obj, prefix);
        } else if (!(id = el.id)) {
            id = oldId(null, prefix || Element.prototype.identifiablePrefix);
            if (Ext.isSandboxed) {
                sandboxPrefix = Ext.sandboxPrefix || (Ext.sandboxPrefix = Ext.sandboxName.toLowerCase() + '-');
                id = sandboxPrefix + id;
            }
            el.id = id;
        }
        return id;
    };
    if (supports.PointerEvents) {
        eventMap[mousedown] = pointerdown;
        eventMap[mousemove] = pointermove;
        eventMap[mouseup] = pointerup;
        eventMap[touchstart] = pointerdown;
        eventMap[touchmove] = pointermove;
        eventMap[touchend] = pointerup;
        eventMap[touchcancel] = pointercancel;
        eventMap[mouseover] = 'pointerover';
        eventMap[mouseout] = 'pointerout';
        eventMap[mouseenter] = 'pointerenter';
        if (!Ext.isIE11) {
            eventMap[mouseleave] = 'pointerleave';
        }
    } else if (supports.MSPointerEvents) {
        eventMap[pointerdown] = MSPointerDown;
        eventMap[pointermove] = MSPointerMove;
        eventMap[pointerup] = MSPointerUp;
        eventMap[pointercancel] = MSPointerCancel;
        eventMap[mousedown] = MSPointerDown;
        eventMap[mousemove] = MSPointerMove;
        eventMap[mouseup] = MSPointerUp;
        eventMap[touchstart] = MSPointerDown;
        eventMap[touchmove] = MSPointerMove;
        eventMap[touchend] = MSPointerUp;
        eventMap[touchcancel] = MSPointerCancel;
        eventMap[mouseover] = 'MSPointerOver';
        eventMap[mouseout] = 'MSPointerOut';
    } else if (supports.TouchEvents) {
        eventMap[pointerdown] = touchstart;
        eventMap[pointermove] = touchmove;
        eventMap[pointerup] = touchend;
        eventMap[pointercancel] = touchcancel;
        eventMap[mousedown] = touchstart;
        eventMap[mousemove] = touchmove;
        eventMap[mouseup] = touchend;
        eventMap[click] = tap;
        eventMap[dblclick] = doubletap;
        if (Ext.isWebKit && Ext.os.is.Desktop) {
            eventMap[touchstart] = mousedown;
            eventMap[touchmove] = mousemove;
            eventMap[touchend] = mouseup;
            eventMap[touchcancel] = mouseup;
            additiveEvents[mousedown] = mousedown;
            additiveEvents[mousemove] = mousemove;
            additiveEvents[mouseup] = mouseup;
            additiveEvents[touchstart] = touchstart;
            additiveEvents[touchmove] = touchmove;
            additiveEvents[touchend] = touchend;
            additiveEvents[touchcancel] = touchcancel;
            additiveEvents[pointerdown] = mousedown;
            additiveEvents[pointermove] = mousemove;
            additiveEvents[pointerup] = mouseup;
            additiveEvents[pointercancel] = mouseup;
        }
    } else {
        eventMap[pointerdown] = mousedown;
        eventMap[pointermove] = mousemove;
        eventMap[pointerup] = mouseup;
        eventMap[pointercancel] = mouseup;
        eventMap[touchstart] = mousedown;
        eventMap[touchmove] = mousemove;
        eventMap[touchend] = mouseup;
        eventMap[touchcancel] = mouseup;
    }
    if (Ext.isWebKit) {
        eventMap.transitionend = Ext.browser.getVendorProperyName('transitionEnd');
        eventMap.animationstart = Ext.browser.getVendorProperyName('animationStart');
        eventMap.animationend = Ext.browser.getVendorProperyName('animationEnd');
    }
    if (!Ext.supports.MouseWheel && !Ext.isOpera) {
        eventMap.mousewheel = 'DOMMouseScroll';
    }
    eventOptions = prototype.$eventOptions = Ext.Object.chain(prototype.$eventOptions);
    eventOptions.translate = eventOptions.capture = eventOptions.delegate = eventOptions.delegated = eventOptions.stopEvent = eventOptions.preventDefault = eventOptions.stopPropagation = eventOptions.element = 1;
    prototype.styleHooks.opacity = {
        name: 'opacity',
        afterSet: function(dom, value, el) {
            var shadow = el.shadow;
            if (shadow) {
                shadow.setOpacity(value);
            }
        }
    };
    prototype.getTrueXY = prototype.getXY;
    Ext.select = Element.select;
    Ext.query = Element.query;
    Ext.apply(Ext, {
        get: function(element) {
            return Element.get(element);
        },
        getDom: function(el) {
            if (!el || !DOC) {
                return null;
            }
            return typeof el === 'string' ? Ext.getElementById(el) : 'dom' in el ? el.dom : el;
        },
        getBody: function() {
            if (!Ext._bodyEl) {
                if (!DOC.body) {
                    throw new Error("[Ext.getBody] document.body does not yet exist");
                }
                Ext._bodyEl = Ext.get(DOC.body);
            }
            return Ext._bodyEl;
        },
        getHead: function() {
            if (!Ext._headEl) {
                Ext._headEl = Ext.get(DOC.head || DOC.getElementsByTagName('head')[0]);
            }
            return Ext._headEl;
        },
        getDoc: function() {
            if (!Ext._docEl) {
                Ext._docEl = Ext.get(DOC);
            }
            return Ext._docEl;
        },
        getWin: function() {
            if (!Ext._winEl) {
                Ext._winEl = Ext.get(window);
            }
            return Ext._winEl;
        },
        removeNode: function(node) {
            node = node.dom || node;
            var id = node && node.id,
                el = Ext.cache[id],
                parent;
            if (el) {
                el.destroy();
            } else if (node && (node.nodeType === 3 || node.tagName.toUpperCase() !== 'BODY')) {
                parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            }
        }
    });
    Ext.isGarbage = function(dom) {
        return dom && dom.nodeType === 1 && dom.tagName !== 'BODY' && dom.tagName !== 'HTML' && (!dom.parentNode || (dom.offsetParent === null && ((Ext.isIE8 ? DOC.all[dom.id] : DOC.getElementById(dom.id)) !== dom) && !(Ext.detachedBodyEl && Ext.detachedBodyEl.isAncestor(dom))));
    };
    if (Ext.os.is.Android || (Ext.os.is.Windows && Ext.supports.Touch)) {
        Ext.onReady(function() {
            var win = Ext.getWin();
            Element._documentWidth = Element._viewportWidth = docEl.clientWidth;
            Element._documentHeight = Element._viewportHeight = docEl.clientHeight;
            win.on({
                focusin: '_onWindowFocusChange',
                focusout: '_onWindowFocusChange',
                pointerup: '_onWindowFocusChange',
                capture: true,
                delegated: false,
                delay: 1,
                scope: Element
            });
            win.on({
                resize: '_onWindowResize',
                priority: 2000,
                scope: Element
            });
        });
    }
});

Ext.define('Ext.GlobalEvents', {
    extend: Ext.mixin.Observable,
    alternateClassName: 'Ext.globalEvents',
    observableType: 'global',
    singleton: true,
    resizeBuffer: 100,
    idleEventMask: {
        mousemove: 1,
        touchmove: 1,
        pointermove: 1,
        MSPointerMove: 1,
        unload: 1
    },
    constructor: function() {
        var me = this;
        me.callParent();
        Ext.onInternalReady(function() {
            me.attachListeners();
        });
    },
    attachListeners: function() {
        Ext.get(window).on('resize', this.fireResize, this, {
            buffer: this.resizeBuffer
        });
        Ext.getDoc().on('mousedown', this.fireMouseDown, this);
    },
    fireMouseDown: function(e) {
        this.fireEvent('mousedown', e);
    },
    fireResize: function() {
        var me = this,
            Element = Ext.Element,
            w = Element.getViewportWidth(),
            h = Element.getViewportHeight();
        if (me.curHeight !== h || me.curWidth !== w) {
            me.curHeight = h;
            me.curWidth = w;
            me.fireEvent('resize', w, h);
        }
    }
}, function(GlobalEvents) {
    Ext.on = function() {
        return GlobalEvents.addListener.apply(GlobalEvents, arguments);
    };
    Ext.un = function() {
        return GlobalEvents.removeListener.apply(GlobalEvents, arguments);
    };
    Ext.fireEvent = function() {
        return GlobalEvents.fireEvent.apply(GlobalEvents, arguments);
    };
});

Ext.USE_NATIVE_JSON = false;
Ext.JSON = (new (function() {
    var me = this,
        hasNative = window.JSON && JSON.toString() === '[object JSON]',
        useHasOwn = !!{}.hasOwnProperty,
        pad = function(n) {
            return n < 10 ? "0" + n : n;
        },
        doDecode = function(json) {
            return eval("(" + json + ')');
        },
        doEncode = function(o, newline) {
            if (o === null || o === undefined) {
                return "null";
            } else if (Ext.isDate(o)) {
                return me.encodeDate(o);
            } else if (Ext.isString(o)) {
                if (Ext.isMSDate(o)) {
                    return me.encodeMSDate(o);
                } else {
                    return me.encodeString(o);
                }
            } else if (typeof o === "number") {
                return isFinite(o) ? String(o) : "null";
            } else if (Ext.isBoolean(o)) {
                return String(o);
            }
            else if (o.toJSON) {
                return o.toJSON();
            } else if (Ext.isArray(o)) {
                return encodeArray(o, newline);
            } else if (Ext.isObject(o)) {
                return encodeObject(o, newline);
            } else if (typeof o === "function") {
                return "null";
            }
            return 'undefined';
        },
        m = {
            "\b": '\\b',
            "\t": '\\t',
            "\n": '\\n',
            "\f": '\\f',
            "\r": '\\r',
            '"': '\\"',
            "\\": '\\\\',
            '\v': '\\u000b'
        },
        charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
        encodeString = function(s) {
            return '"' + s.replace(charToReplace, function(a) {
                var c = m[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"';
        },
        encodeMSDate = function(o) {
            return '"' + o + '"';
        },
        encodeArrayPretty = function(o, newline) {
            var len = o.length,
                cnewline = newline + '   ',
                sep = ',' + cnewline,
                a = [
                    "[",
                    cnewline
                ],
                i;
            for (i = 0; i < len; i += 1) {
                a.push(me.encodeValue(o[i], cnewline), sep);
            }
            a[a.length - 1] = newline + ']';
            return a.join('');
        },
        encodeObjectPretty = function(o, newline) {
            var cnewline = newline + '   ',
                sep = ',' + cnewline,
                a = [
                    "{",
                    cnewline
                ],
                i, val;
            for (i in o) {
                val = o[i];
                if (!useHasOwn || o.hasOwnProperty(i)) {
                    if (typeof val === 'function' || val === undefined) {
                        
                        continue;
                    }
                    a.push(me.encodeValue(i) + ': ' + me.encodeValue(val, cnewline), sep);
                }
            }
            a[a.length - 1] = newline + '}';
            return a.join('');
        },
        encodeArray = function(o, newline) {
            if (newline) {
                return encodeArrayPretty(o, newline);
            }
            var a = [
                    "[",
                    ""
                ],
                len = o.length,
                i;
            for (i = 0; i < len; i += 1) {
                a.push(me.encodeValue(o[i]), ',');
            }
            a[a.length - 1] = ']';
            return a.join("");
        },
        encodeObject = function(o, newline) {
            if (newline) {
                return encodeObjectPretty(o, newline);
            }
            var a = [
                    "{",
                    ""
                ],
                i, val;
            for (i in o) {
                val = o[i];
                if (!useHasOwn || o.hasOwnProperty(i)) {
                    if (typeof val === 'function' || val === undefined) {
                        
                        continue;
                    }
                    a.push(me.encodeValue(i), ":", me.encodeValue(val), ',');
                }
            }
            a[a.length - 1] = '}';
            return a.join("");
        };
    me.encodeString = encodeString;
    me.encodeValue = doEncode;
    me.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-" + pad(o.getMonth() + 1) + "-" + pad(o.getDate()) + "T" + pad(o.getHours()) + ":" + pad(o.getMinutes()) + ":" + pad(o.getSeconds()) + '"';
    };
    me.encode = function(o) {
        if (hasNative && Ext.USE_NATIVE_JSON) {
            return JSON.stringify(o);
        }
        return me.encodeValue(o);
    };
    me.decode = function(json, safe) {
        try {
            if (hasNative && Ext.USE_NATIVE_JSON) {
                return JSON.parse(json);
            }
            return doDecode(json);
        } catch (e) {
            if (safe) {
                return null;
            }
            Ext.raise({
                sourceClass: "Ext.JSON",
                sourceMethod: "decode",
                msg: "You're trying to decode an invalid JSON String: " + json
            });
        }
    };
    me.encodeMSDate = encodeMSDate;
    if (!Ext.util) {
        Ext.util = {};
    }
    Ext.util.JSON = me;
    Ext.encode = me.encode;
    Ext.decode = me.decode;
})());

Ext.define('Ext.util.Format', function() {
    var me;
    return {
        singleton: true,
        defaultDateFormat: 'm/d/Y',
        thousandSeparator: ',',
        decimalSeparator: '.',
        currencyPrecision: 2,
        currencySign: '$',
        currencySpacer: '',
        percentSign: '%',
        currencyAtEnd: false,
        stripTagsRe: /<\/?[^>]+>/gi,
        stripScriptsRe: /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe: /\r?\n/g,
        hashRe: /#+$/,
        allHashes: /^#+$/,
        formatPattern: /[\d,\.#]+/,
        formatCleanRe: /[^\d\.#]/g,
        I18NFormatCleanRe: null,
        formatFns: {},
        constructor: function() {
            me = this;
        },
        nbsp: function(value, strict) {
            strict = strict !== false;
            if (strict ? value === '' || value == null : !value) {
                value = '\xa0';
            }
            return value;
        },
        undef: function(value) {
            return value !== undefined ? value : "";
        },
        defaultValue: function(value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },
        substr: 'ab'.substr(-1) != 'b' ? function(value, start, length) {
            var str = String(value);
            return (start < 0) ? str.substr(Math.max(str.length + start, 0), length) : str.substr(start, length);
        } : function(value, start, length) {
            return String(value).substr(start, length);
        },
        lowercase: function(value) {
            return String(value).toLowerCase();
        },
        uppercase: function(value) {
            return String(value).toUpperCase();
        },
        usMoney: function(v) {
            return me.currency(v, '$', 2);
        },
        currency: function(v, currencySign, decimals, end, currencySpacer) {
            var negativeSign = '',
                format = ",0",
                i = 0;
            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }
            decimals = Ext.isDefined(decimals) ? decimals : me.currencyPrecision;
            format += (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = me.number(v, format);
            if (currencySpacer == null) {
                currencySpacer = me.currencySpacer;
            }
            if ((end || me.currencyAtEnd) === true) {
                return Ext.String.format("{0}{1}{2}{3}", negativeSign, v, currencySpacer, currencySign || me.currencySign);
            } else {
                return Ext.String.format("{0}{1}{2}{3}", negativeSign, currencySign || me.currencySign, currencySpacer, v);
            }
        },
        date: function(value, format) {
            if (!value) {
                return "";
            }
            if (!Ext.isDate(value)) {
                value = new Date(Date.parse(value));
            }
            return Ext.Date.dateFormat(value, format || Ext.Date.defaultFormat);
        },
        dateRenderer: function(format) {
            return function(v) {
                return me.date(v, format);
            };
        },
        hex: function(value, digits) {
            var s = parseInt(value || 0, 10).toString(16);
            if (digits) {
                if (digits < 0) {
                    digits = -digits;
                    if (s.length > digits) {
                        s = s.substring(s.length - digits);
                    }
                }
                while (s.length < digits) {
                    s = '0' + s;
                }
            }
            return s;
        },
        or: function(value, orValue) {
            return value || orValue;
        },
        pick: function(value, firstValue, secondValue) {
            if (Ext.isNumber(value)) {
                var ret = arguments[value + 1];
                if (ret) {
                    return ret;
                }
            }
            return value ? secondValue : firstValue;
        },
        lessThanElse: function(value, threshold, below, above, equal) {
            var v = Ext.Number.from(value, 0),
                t = Ext.Number.from(threshold, 0),
                missing = !Ext.isDefined(equal);
            return v < t ? below : (v > t ? above : (missing ? above : equal));
        },
        sign: function(value, negative, positive, zero) {
            if (zero === undefined) {
                zero = positive;
            }
            return me.lessThanElse(value, 0, negative, positive, zero);
        },
        stripTags: function(value) {
            return !value ? value : String(value).replace(me.stripTagsRe, "");
        },
        stripScripts: function(value) {
            return !value ? value : String(value).replace(me.stripScriptsRe, "");
        },
        fileSize: (function() {
            var byteLimit = 1024,
                kbLimit = 1048576,
                mbLimit = 1073741824;
            return function(size) {
                var out;
                if (size < byteLimit) {
                    if (size === 1) {
                        out = '1 byte';
                    } else {
                        out = size + ' bytes';
                    }
                } else if (size < kbLimit) {
                    out = (Math.round(((size * 10) / byteLimit)) / 10) + ' KB';
                } else if (size < mbLimit) {
                    out = (Math.round(((size * 10) / kbLimit)) / 10) + ' MB';
                } else {
                    out = (Math.round(((size * 10) / mbLimit)) / 10) + ' GB';
                }
                return out;
            };
        })(),
        math: (function() {
            var fns = {};
            return function(v, a) {
                if (!fns[a]) {
                    fns[a] = Ext.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }()),
        round: function(value, precision) {
            var result = Number(value);
            if (typeof precision === 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            } else if (precision === undefined) {
                result = Math.round(result);
            }
            return result;
        },
        number: function(v, formatString) {
            if (!formatString) {
                return v;
            }
            if (isNaN(v)) {
                return '';
            }
            var formatFn = me.formatFns[formatString];
            if (!formatFn) {
                var originalFormatString = formatString,
                    comma = me.thousandSeparator,
                    decimalSeparator = me.decimalSeparator,
                    precision = 0,
                    trimPart = '',
                    hasComma, splitFormat, extraChars, trimTrailingZeroes, code, len;
                if (formatString.substr(formatString.length - 2) === '/i') {
                    if (!me.I18NFormatCleanRe || me.lastDecimalSeparator !== decimalSeparator) {
                        me.I18NFormatCleanRe = new RegExp('[^\\d\\' + decimalSeparator + '#]', 'g');
                        me.lastDecimalSeparator = decimalSeparator;
                    }
                    formatString = formatString.substr(0, formatString.length - 2);
                    hasComma = formatString.indexOf(comma) !== -1;
                    splitFormat = formatString.replace(me.I18NFormatCleanRe, '').split(decimalSeparator);
                } else {
                    hasComma = formatString.indexOf(',') !== -1;
                    splitFormat = formatString.replace(me.formatCleanRe, '').split('.');
                }
                extraChars = formatString.replace(me.formatPattern, '');
                if (splitFormat.length > 2) {
                    Ext.raise({
                        sourceClass: "Ext.util.Format",
                        sourceMethod: "number",
                        value: v,
                        formatString: formatString,
                        msg: "Invalid number format, should have no more than 1 decimal"
                    });
                }
                else if (splitFormat.length === 2) {
                    precision = splitFormat[1].length;
                    trimTrailingZeroes = splitFormat[1].match(me.hashRe);
                    if (trimTrailingZeroes) {
                        len = trimTrailingZeroes[0].length;
                        trimPart = 'trailingZeroes=new RegExp(Ext.String.escapeRegex(utilFormat.decimalSeparator) + "*0{0,' + len + '}$")';
                    }
                }
                code = [
                    'var utilFormat=Ext.util.Format,extNumber=Ext.Number,neg,absVal,fnum,parts' + (hasComma ? ',thousandSeparator,thousands=[],j,n,i' : '') + (extraChars ? ',formatString="' + formatString + '",formatPattern=/[\\d,\\.#]+/' : '') + ',trailingZeroes;' + 'return function(v){' + 'if(typeof v!=="number"&&isNaN(v=extNumber.from(v,NaN)))return"";' + 'neg=v<0;',
                    'absVal=Math.abs(v);',
                    'fnum=Ext.Number.toFixed(absVal, ' + precision + ');',
                    trimPart,
                    ';'
                ];
                if (hasComma) {
                    if (precision) {
                        code[code.length] = 'parts=fnum.split(".");';
                        code[code.length] = 'fnum=parts[0];';
                    }
                    code[code.length] = 'if(absVal>=1000) {';
                    code[code.length] = 'thousandSeparator=utilFormat.thousandSeparator;' + 'thousands.length=0;' + 'j=fnum.length;' + 'n=fnum.length%3||3;' + 'for(i=0;i<j;i+=n){' + 'if(i!==0){' + 'n=3;' + '}' + 'thousands[thousands.length]=fnum.substr(i,n);' + '}' + 'fnum=thousands.join(thousandSeparator);' + '}';
                    if (precision) {
                        code[code.length] = 'fnum += utilFormat.decimalSeparator+parts[1];';
                    }
                } else if (precision) {
                    code[code.length] = 'if(utilFormat.decimalSeparator!=="."){' + 'parts=fnum.split(".");' + 'fnum=parts[0]+utilFormat.decimalSeparator+parts[1];' + '}';
                }
                code[code.length] = 'if(neg&&fnum!=="' + (precision ? '0.' + Ext.String.repeat('0', precision) : '0') + '") { fnum="-"+fnum; }';
                if (trimTrailingZeroes) {
                    code[code.length] = 'fnum=fnum.replace(trailingZeroes,"");';
                }
                code[code.length] = 'return ';
                if (extraChars) {
                    code[code.length] = 'formatString.replace(formatPattern, fnum);';
                } else {
                    code[code.length] = 'fnum;';
                }
                code[code.length] = '};';
                formatFn = me.formatFns[originalFormatString] = Ext.functionFactory('Ext', code.join(''))(Ext);
            }
            return formatFn(v);
        },
        numberRenderer: function(format) {
            return function(v) {
                return me.number(v, format);
            };
        },
        percent: function(value, formatString) {
            return me.number(value * 100, formatString || '0') + me.percentSign;
        },
        attributes: function(attributes) {
            if (typeof attributes === 'object') {
                var result = [],
                    name;
                for (name in attributes) {
                    if (attributes.hasOwnProperty(name)) {
                        result.push(name, '="', name === 'style' ? Ext.DomHelper.generateStyles(attributes[name], null, true) : Ext.htmlEncode(attributes[name]), '" ');
                    }
                }
                attributes = result.join('');
            }
            return attributes || '';
        },
        plural: function(value, singular, plural) {
            return value + ' ' + (value === 1 ? singular : (plural ? plural : singular + 's'));
        },
        nl2br: function(v) {
            return Ext.isEmpty(v) ? '' : v.replace(me.nl2brRe, '<br/>');
        },
        capitalize: Ext.String.capitalize,
        uncapitalize: Ext.String.uncapitalize,
        ellipsis: Ext.String.ellipsis,
        escape: Ext.String.escape,
        escapeRegex: Ext.String.escapeRegex,
        htmlDecode: Ext.String.htmlDecode,
        htmlEncode: Ext.String.htmlEncode,
        leftPad: Ext.String.leftPad,
        toggle: Ext.String.toggle,
        trim: Ext.String.trim,
        parseBox: function(box) {
            box = box || 0;
            if (typeof box === 'number') {
                return {
                    top: box,
                    right: box,
                    bottom: box,
                    left: box
                };
            }
            var parts = box.split(' '),
                ln = parts.length;
            if (ln === 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            } else if (ln === 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            } else if (ln === 3) {
                parts[3] = parts[1];
            }
            return {
                top: parseInt(parts[0], 10) || 0,
                right: parseInt(parts[1], 10) || 0,
                bottom: parseInt(parts[2], 10) || 0,
                left: parseInt(parts[3], 10) || 0
            };
        },
        uri: function(value) {
            return encodeURI(value);
        },
        uriCmp: function(value) {
            return encodeURIComponent(value);
        },
        wordBreakRe: /[\W\s]+/,
        word: function(value, index, sep) {
            var re = sep ? (typeof sep === 'string' ? new RegExp(sep) : sep) : me.wordBreakRe,
                parts = (value || '').split(re);
            return parts[index || 0] || '';
        }
    };
});

Ext.define('Ext.Template', {
    inheritableStatics: {
        from: function(el, config) {
            el = Ext.getDom(el);
            return new this(el.value || el.innerHTML, config || '');
        }
    },
    useEval: Ext.isGecko,
    constructor: function(html) {
        var me = this,
            args = arguments,
            buffer = [],
            i,
            length = args.length,
            value;
        me.initialConfig = {};
        if (length === 1 && Ext.isArray(html)) {
            args = html;
            length = args.length;
        }
        if (length > 1) {
            for (i = 0; i < length; i++) {
                value = args[i];
                if (typeof value === 'object') {
                    Ext.apply(me.initialConfig, value);
                    Ext.apply(me, value);
                } else {
                    buffer.push(value);
                }
            }
        } else {
            buffer.push(html);
        }
        me.html = buffer.join('');
    },
    isTemplate: true,
    disableFormats: false,
    tokenRe: /\{(?:(?:(\d+)|([a-z_][\w\-]*))(?::([a-z_\.]+)(?:\(([^\)]*?)?\))?)?)\}/gi,
    apply: function(values) {
        var me = this;
        if (me.compiled) {
            if (!me.fn) {
                me.compile();
            }
            return me.fn(values).join('');
        }
        return me.evaluate(values);
    },
    evaluate: function(values) {
        var me = this,
            useFormat = !me.disableFormats,
            fm = Ext.util.Format,
            tpl = me;
        function fn(match, index, name, formatFn, args) {
            if (name == null || name === '') {
                name = index;
            }
            if (formatFn && useFormat) {
                if (args) {
                    args = [
                        values[name]
                    ].concat(Ext.functionFactory('return [' + args + '];')());
                } else {
                    args = [
                        values[name]
                    ];
                }
                if (formatFn.substr(0, 5) === "this.") {
                    return tpl[formatFn.substr(5)].apply(tpl, args);
                }
                else if (fm[formatFn]) {
                    return fm[formatFn].apply(fm, args);
                } else {
                    return match;
                }
            } else {
                return values[name] !== undefined ? values[name] : "";
            }
        }
        return me.html.replace(me.tokenRe, fn);
    },
    applyOut: function(values, out) {
        var me = this;
        if (me.compiled) {
            if (!me.fn) {
                me.compile();
            }
            out.push.apply(out, me.fn(values));
        } else {
            out.push(me.apply(values));
        }
        return out;
    },
    applyTemplate: function() {
        return this.apply.apply(this, arguments);
    },
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = !!compile;
        me.fn = null;
        return me;
    },
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    compile: function() {
        var me = this,
            code;
        code = me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.tokenRe, me.regexReplaceFn.bind(me));
        code = (this.disableFormats !== true ? 'var fm=Ext.util.Format;' : '') + (me.useEval ? '$=' : 'return') + " function(v){return ['" + code + "'];};";
        me.fn = me.useEval ? me.evalCompiled(code) : (new Function('Ext', code))(Ext);
        me.compiled = true;
        return me;
    },
    evalCompiled: function($) {
        eval($);
        return $;
    },
    regexReplaceFn: function(match, index, name, formatFn, args) {
        if (index == null || index === '') {
            index = '"' + name + '"';
        }
        else if (this.stringFormat) {
            index = parseInt(index) + 1;
        }
        if (formatFn && this.disableFormats !== true) {
            args = args ? ',' + args : "";
            if (formatFn.substr(0, 5) === "this.") {
                formatFn = formatFn + '(';
            }
            else if (Ext.util.Format[formatFn]) {
                formatFn = "fm." + formatFn + '(';
            } else {
                return match;
            }
            return "'," + formatFn + "v[" + index + "]" + args + "),'";
        } else {
            return "',v[" + index + "] == undefined ? '' : v[" + index + "],'";
        }
    },
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },
    doInsert: function(where, el, values, returnElement) {
        var newNode = Ext.DomHelper.insertHtml(where, Ext.getDom(el), this.apply(values));
        return returnElement ? Ext.get(newNode) : newNode;
    },
    overwrite: function(el, values, returnElement) {
        var newNode = Ext.DomHelper.overwrite(Ext.getDom(el), this.apply(values));
        return returnElement ? Ext.get(newNode) : newNode;
    }
}, function(Template) {
    var formatRe = /\{\d+\}/,
        generateFormatFn = function(format) {
            if (formatRe.test(format)) {
                format = new Template(format, formatTplConfig);
                return function() {
                    return format.apply(arguments);
                };
            } else {
                return function() {
                    return format;
                };
            }
        },
        formatTplConfig = {
            useFormat: false,
            compiled: true,
            stringFormat: true
        },
        formatFns = {};
    Ext.String.format = Ext.util.Format.format = function(format) {
        var formatFn = formatFns[format] || (formatFns[format] = generateFormatFn(format));
        return formatFn.apply(this, arguments);
    };
    Ext.String.formatEncode = function() {
        return Ext.String.htmlEncode(Ext.String.format.apply(this, arguments));
    };
});

Ext.define('Ext.util.XTemplateParser', {
    constructor: function(config) {
        Ext.apply(this, config);
    },
    doTpl: Ext.emptyFn,
    parse: function(str) {
        var me = this,
            len = str.length,
            aliases = {
                elseif: 'elif'
            },
            topRe = me.topRe,
            actionsRe = me.actionsRe,
            index, stack, s, m, t, prev, frame, subMatch, begin, end, actions, prop, expectTplNext;
        me.level = 0;
        me.stack = stack = [];
        for (index = 0; index < len; index = end) {
            topRe.lastIndex = index;
            m = topRe.exec(str);
            if (!m) {
                me.doText(str.substring(index, len));
                break;
            }
            begin = m.index;
            end = topRe.lastIndex;
            if (index < begin) {
                s = str.substring(index, begin);
                if (!(expectTplNext && Ext.String.trim(s) === '')) {
                    me.doText(s);
                }
            }
            expectTplNext = false;
            if (m[1]) {
                end = str.indexOf('%}', begin + 2);
                me.doEval(str.substring(begin + 2, end));
                end += 2;
            } else if (m[2]) {
                end = str.indexOf(']}', begin + 2);
                me.doExpr(str.substring(begin + 2, end));
                end += 2;
            } else if (m[3]) {
                me.doTag(m[3]);
            } else if (m[4]) {
                actions = null;
                while ((subMatch = actionsRe.exec(m[4])) !== null) {
                    s = subMatch[2] || subMatch[3];
                    if (s) {
                        s = Ext.String.htmlDecode(s);
                        t = subMatch[1];
                        t = aliases[t] || t;
                        actions = actions || {};
                        prev = actions[t];
                        if (typeof prev == 'string') {
                            actions[t] = [
                                prev,
                                s
                            ];
                        } else if (prev) {
                            actions[t].push(s);
                        } else {
                            actions[t] = s;
                        }
                    }
                }
                if (!actions) {
                    if (me.elseRe.test(m[4])) {
                        me.doElse();
                    } else if (me.defaultRe.test(m[4])) {
                        me.doDefault();
                    } else {
                        me.doTpl();
                        stack.push({
                            type: 'tpl'
                        });
                    }
                } else if (actions['if']) {
                    me.doIf(actions['if'], actions);
                    stack.push({
                        type: 'if'
                    });
                } else if (actions['switch']) {
                    me.doSwitch(actions['switch'], actions);
                    stack.push({
                        type: 'switch'
                    });
                    expectTplNext = true;
                } else if (actions['case']) {
                    me.doCase(actions['case'], actions);
                } else if (actions['elif']) {
                    me.doElseIf(actions['elif'], actions);
                } else if (actions['for']) {
                    ++me.level;
                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doFor(actions['for'], actions);
                    stack.push({
                        type: 'for',
                        actions: actions
                    });
                } else if (actions['foreach']) {
                    ++me.level;
                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doForEach(actions['foreach'], actions);
                    stack.push({
                        type: 'foreach',
                        actions: actions
                    });
                } else if (actions.exec) {
                    me.doExec(actions.exec, actions);
                    stack.push({
                        type: 'exec',
                        actions: actions
                    });
                }
            }
            else if (m[0].length === 5) {
                stack.push({
                    type: 'tpl'
                });
            } else {
                frame = stack.pop();
                me.doEnd(frame.type, frame.actions);
                if (frame.type == 'for' || frame.type == 'foreach') {
                    --me.level;
                }
            }
        }
    },
    topRe: /(?:(\{\%)|(\{\[)|\{([^{}]+)\})|(?:<tpl([^>]*)\>)|(?:<\/tpl>)/g,
    actionsRe: /\s*(elif|elseif|if|for|foreach|exec|switch|case|eval|between)\s*\=\s*(?:(?:"([^"]*)")|(?:'([^']*)'))\s*/g,
    propRe: /prop=(?:(?:"([^"]*)")|(?:'([^']*)'))/,
    defaultRe: /^\s*default\s*$/,
    elseRe: /^\s*else\s*$/
});

Ext.define('Ext.util.XTemplateCompiler', {
    extend: Ext.util.XTemplateParser,
    useEval: Ext.isGecko,
    useIndex: Ext.isIE8m,
    useFormat: true,
    propNameRe: /^[\w\d\$]*$/,
    compile: function(tpl) {
        var me = this,
            code = me.generate(tpl);
        return me.useEval ? me.evalTpl(code) : (new Function('Ext', code))(Ext);
    },
    generate: function(tpl) {
        var me = this,
            definitions = 'var fm=Ext.util.Format,ts=Object.prototype.toString;',
            code;
        me.maxLevel = 0;
        me.body = [
            'var c0=values, a0=' + me.createArrayTest(0) + ', p0=parent, n0=xcount, i0=xindex, k0, v;\n'
        ];
        if (me.definitions) {
            if (typeof me.definitions === 'string') {
                me.definitions = [
                    me.definitions,
                    definitions
                ];
            } else {
                me.definitions.push(definitions);
            }
        } else {
            me.definitions = [
                definitions
            ];
        }
        me.switches = [];
        me.parse(tpl);
        me.definitions.push((me.useEval ? '$=' : 'return') + ' function (' + me.fnArgs + ') {', me.body.join(''), '}');
        code = me.definitions.join('\n');
        me.definitions.length = me.body.length = me.switches.length = 0;
        delete me.definitions;
        delete me.body;
        delete me.switches;
        return code;
    },
    doText: function(text) {
        var me = this,
            out = me.body;
        text = text.replace(me.aposRe, "\\'").replace(me.newLineRe, '\\n');
        if (me.useIndex) {
            out.push('out[out.length]=\'', text, '\'\n');
        } else {
            out.push('out.push(\'', text, '\')\n');
        }
    },
    doExpr: function(expr) {
        var out = this.body;
        out.push('if ((v=' + expr + ') != null) out');
        if (this.useIndex) {
            out.push('[out.length]=v+\'\'\n');
        } else {
            out.push('.push(v+\'\')\n');
        }
    },
    doTag: function(tag) {
        var expr = this.parseTag(tag);
        if (expr) {
            this.doExpr(expr);
        } else {
            this.doText('{' + tag + '}');
        }
    },
    doElse: function() {
        this.body.push('} else {\n');
    },
    doEval: function(text) {
        this.body.push(text, '\n');
    },
    doIf: function(action, actions) {
        var me = this;
        if (action === '.') {
            me.body.push('if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('if (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },
    doElseIf: function(action, actions) {
        var me = this;
        if (action === '.') {
            me.body.push('else if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('} else if (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('} else if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },
    doSwitch: function(action) {
        var me = this,
            key;
        if (action === '.' || action === '#') {
            key = action === '.' ? 'values' : 'xindex';
            me.body.push('switch (', key, ') {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('switch (', me.parseTag(action), ') {\n');
        } else {
            me.body.push('switch (', me.addFn(action), me.callFn, ') {\n');
        }
        me.switches.push(0);
    },
    doCase: function(action) {
        var me = this,
            cases = Ext.isArray(action) ? action : [
                action
            ],
            n = me.switches.length - 1,
            match, i;
        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }
        for (i = 0 , n = cases.length; i < n; ++i) {
            match = me.intRe.exec(cases[i]);
            cases[i] = match ? match[1] : ("'" + cases[i].replace(me.aposRe, "\\'") + "'");
        }
        me.body.push('case ', cases.join(': case '), ':\n');
    },
    doDefault: function() {
        var me = this,
            n = me.switches.length - 1;
        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }
        me.body.push('default:\n');
    },
    doEnd: function(type, actions) {
        var me = this,
            L = me.level - 1;
        if (type == 'for' || type == 'foreach') {
            if (actions.exec) {
                me.doExec(actions.exec);
            }
            me.body.push('}\n');
            me.body.push('parent=p', L, ';values=r', L + 1, ';xcount=n' + L + ';xindex=i', L, '+1;xkey=k', L, ';\n');
        } else if (type == 'if' || type == 'switch') {
            me.body.push('}\n');
        }
    },
    doFor: function(action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L - 1,
            parentAssignment;
        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        } else {
            s = me.addFn(action) + me.callFn;
        }
        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }
        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }
        me.body.push('i', L, '=0,n', L, '=0,c', L, '=', s, ',a', L, '=', me.createArrayTest(L), ',r', L, '=values,p', L, ',k', L, ';\n', 'p', L, '=parent=', parentAssignment, '\n', 'if (c', L, '){if(a', L, '){n', L, '=c', L, '.length;}else if (c', L, '.isMixedCollection){c', L, '=c', L, '.items;n', L, '=c', L, '.length;}else if(c', L, '.isStore){c', L, '=c', L, '.data.items;n', L, '=c', L, '.length;}else{c', L, '=[c', L, '];n', L, '=1;}}\n', 'for (xcount=n', L, ';i', L, '<n' + L + ';++i', L, '){\n', 'values=c', L, '[i', L, ']');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }
        me.body.push('\n', 'xindex=i', L, '+1\n');
        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("', actions.between, '"); } \n');
        }
    },
    doForEach: function(action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L - 1,
            parentAssignment;
        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        } else {
            s = me.addFn(action) + me.callFn;
        }
        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }
        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }
        me.body.push('i', L, '=-1,n', L, '=0,c', L, '=', s, ',a', L, '=', me.createArrayTest(L), ',r', L, '=values,p', L, ',k', L, ';\n', 'p', L, '=parent=', parentAssignment, '\n', 'for(k', L, ' in c', L, '){\n', 'xindex=++i', L, '+1;\n', 'xkey=k', L, ';\n', 'values=c', L, '[k', L, '];');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }
        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("', actions.between, '"); } \n');
        }
    },
    createArrayTest: ('isArray' in Array) ? function(L) {
        return 'Array.isArray(c' + L + ')';
    } : function(L) {
        return 'ts.call(c' + L + ')==="[object Array]"';
    },
    doExec: function(action, actions) {
        var me = this,
            name = 'f' + me.definitions.length,
            guards = me.guards[me.strict ? 0 : 1];
        me.definitions.push('function ' + name + '(' + me.fnArgs + ') {', guards.doTry, ' var $v = values; with($v) {', '  ' + action, ' }', guards.doCatch, '}');
        me.body.push(name + me.callFn + '\n');
    },
    guards: [
        {
            doTry: '',
            doCatch: ''
        },
        {
            doTry: 'try { ',
            doCatch: ' } catch(e) {\n' + 'Ext.log.warn("XTemplate evaluation exception: " + e.message);\n' + '}'
        }
    ],
    addFn: function(body) {
        var me = this,
            name = 'f' + me.definitions.length,
            guards = me.guards[me.strict ? 0 : 1];
        if (body === '.') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {', ' return values', '}');
        } else if (body === '..') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {', ' return parent', '}');
        } else {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {', guards.doTry, ' var $v = values; with($v) {', '  return(' + body + ')', ' }', guards.doCatch, '}');
        }
        return name;
    },
    parseTag: function(tag) {
        var me = this,
            m = me.tagRe.exec(tag),
            name, format, args, math, v;
        if (!m) {
            return null;
        }
        name = m[1];
        format = m[2];
        args = m[3];
        math = m[4];
        if (name == '.') {
            if (!me.validTypes) {
                me.definitions.push('var validTypes={string:1,number:1,boolean:1};');
                me.validTypes = true;
            }
            v = 'validTypes[typeof values] || ts.call(values) === "[object Date]" ? values : ""';
        }
        else if (name == '#') {
            v = 'xindex';
        }
        else if (name == '$') {
            v = 'xkey';
        } else if (name.substr(0, 7) == "parent.") {
            v = name;
        }
        else if (isNaN(name) && name.indexOf('-') == -1 && name.indexOf('.') != -1) {
            v = "values." + name;
        } else {
            v = "values['" + name + "']";
        }
        if (math) {
            v = '(' + v + math + ')';
        }
        if (format && me.useFormat) {
            args = args ? ',' + args : "";
            if (format.substr(0, 5) != "this.") {
                format = "fm." + format + '(';
            } else {
                format += '(';
            }
        } else {
            return v;
        }
        return format + v + args + ')';
    },
    evalTpl: function($) {
        eval($);
        return $;
    },
    newLineRe: /\r\n|\r|\n/g,
    aposRe: /[']/g,
    intRe: /^\s*(\d+)\s*$/,
    tagRe: /^([\w-\.\#\$]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?$/
}, function() {
    var proto = this.prototype;
    proto.fnArgs = 'out,values,parent,xindex,xcount,xkey';
    proto.callFn = '.call(this,' + proto.fnArgs + ')';
});

Ext.define('Ext.XTemplate', {
    extend: Ext.Template,
    isXTemplate: true,
    emptyObj: {},
    fn: null,
    strict: false,
    apply: function(values, parent, xindex, xcount) {
        return this.applyOut(values, [], parent, xindex, xcount).join('');
    },
    applyOut: function(values, out, parent, xindex, xcount) {
        var me = this,
            compiler;
        if (!me.fn) {
            compiler = new Ext.util.XTemplateCompiler({
                useFormat: me.disableFormats !== true,
                definitions: me.definitions,
                strict: me.strict
            });
            me.fn = compiler.compile(me.html);
        }
        xindex = xindex || 1;
        xcount = xcount || 1;
        if (me.strict) {
            me.fn(out, values, parent || me.emptyObj, xindex, xcount);
        } else {
            try {
                me.fn(out, values, parent || me.emptyObj, xindex, xcount);
            } catch (e) {
                Ext.log.warn('XTemplate evaluation exception: ' + e.message);
            }
        }
        return out;
    },
    compile: function() {
        return this;
    },
    statics: {
        getTpl: function(instance, name) {
            var tpl = instance[name],
                owner;
            if (tpl && !tpl.isTemplate) {
                tpl = Ext.ClassManager.dynInstantiate('Ext.XTemplate', tpl);
                if (instance.hasOwnProperty(name)) {
                    owner = instance;
                } else {
                    for (owner = instance.self.prototype; owner && !owner.hasOwnProperty(name); owner = owner.superclass) {}
                }
                owner[name] = tpl;
                tpl.owner = owner;
            }
            return tpl || null;
        }
    }
});

Ext.define('Ext.util.Observable', {
    extend: Ext.mixin.Observable,
    $applyConfigs: true
}, function(Observable) {
    var Super = Ext.mixin.Observable;
    Observable.releaseCapture = Super.releaseCapture;
    Observable.capture = Super.capture;
    Observable.captureArgs = Super.captureArgs;
    Observable.observe = Observable.observeClass = Super.observe;
});

Ext.define('Ext.dom.Helper', function() {
    var afterbegin = 'afterbegin',
        afterend = 'afterend',
        beforebegin = 'beforebegin',
        beforeend = 'beforeend',
        bbValues = [
            'BeforeBegin',
            'previousSibling'
        ],
        aeValues = [
            'AfterEnd',
            'nextSibling'
        ],
        bb_ae_PositionHash = {
            beforebegin: bbValues,
            afterend: aeValues
        },
        fullPositionHash = {
            beforebegin: bbValues,
            afterend: aeValues,
            afterbegin: [
                'AfterBegin',
                'firstChild'
            ],
            beforeend: [
                'BeforeEnd',
                'lastChild'
            ]
        };
    return {
        singleton: true,
        alternateClassName: [
            'Ext.DomHelper',
            'Ext.core.DomHelper'
        ],
        emptyTags: /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
        confRe: /^(?:tag|children|cn|html|tpl|tplData)$/i,
        endRe: /end/i,
        attributeTransform: {
            cls: 'class',
            htmlFor: 'for'
        },
        closeTags: {},
        detachedDiv: document.createElement('div'),
        decamelizeName: function() {
            var camelCaseRe = /([a-z])([A-Z])/g,
                cache = {};
            function decamel(match, p1, p2) {
                return p1 + '-' + p2.toLowerCase();
            }
            return function(s) {
                return cache[s] || (cache[s] = s.replace(camelCaseRe, decamel));
            };
        }(),
        generateMarkup: function(spec, buffer) {
            var me = this,
                specType = typeof spec,
                attr, val, tag, i, closeTags;
            if (specType === "string" || specType === "number") {
                buffer.push(spec);
            } else if (Ext.isArray(spec)) {
                for (i = 0; i < spec.length; i++) {
                    if (spec[i]) {
                        me.generateMarkup(spec[i], buffer);
                    }
                }
            } else {
                tag = spec.tag || 'div';
                buffer.push('<', tag);
                for (attr in spec) {
                    if (spec.hasOwnProperty(attr)) {
                        val = spec[attr];
                        if (val !== undefined && !me.confRe.test(attr)) {
                            if (val && val.join) {
                                val = val.join(' ');
                            }
                            if (typeof val === "object") {
                                buffer.push(' ', attr, '="');
                                me.generateStyles(val, buffer, true).push('"');
                            } else {
                                buffer.push(' ', me.attributeTransform[attr] || attr, '="', val, '"');
                            }
                        }
                    }
                }
                if (me.emptyTags.test(tag)) {
                    buffer.push('/>');
                } else {
                    buffer.push('>');
                    if ((val = spec.tpl)) {
                        val.applyOut(spec.tplData, buffer);
                    }
                    if ((val = spec.html)) {
                        buffer.push(val);
                    }
                    if ((val = spec.cn || spec.children)) {
                        me.generateMarkup(val, buffer);
                    }
                    closeTags = me.closeTags;
                    buffer.push(closeTags[tag] || (closeTags[tag] = '</' + tag + '>'));
                }
            }
            return buffer;
        },
        generateStyles: function(styles, buffer, encode) {
            var a = buffer || [],
                name, val;
            for (name in styles) {
                if (styles.hasOwnProperty(name)) {
                    val = styles[name];
                    name = this.decamelizeName(name);
                    if (encode && Ext.String.hasHtmlCharacters(val)) {
                        val = Ext.String.htmlEncode(val);
                    }
                    a.push(name, ':', val, ';');
                }
            }
            return buffer || a.join('');
        },
        markup: function(spec) {
            if (typeof spec === "string") {
                return spec;
            }
            var buf = this.generateMarkup(spec, []);
            return buf.join('');
        },
        applyStyles: function(el, styles) {
            Ext.fly(el).applyStyles(styles);
        },
        createContextualFragment: function(html) {
            var div = this.detachedDiv,
                fragment = document.createDocumentFragment(),
                length, childNodes;
            div.innerHTML = html;
            childNodes = div.childNodes;
            length = childNodes.length;
            while (length--) {
                fragment.appendChild(childNodes[0]);
            }
            return fragment;
        },
        createDom: function(o, parentNode) {
            var me = this,
                markup = me.markup(o),
                div = me.detachedDiv,
                child;
            div.innerHTML = markup;
            child = div.firstChild;
            return Ext.supports.ChildContentClearedWhenSettingInnerHTML ? child.cloneNode(true) : child;
        },
        insertHtml: function(where, el, html) {
            var me = this,
                hashVal, range, rangeEl, setStart, frag;
            where = where.toLowerCase();
            if (el.insertAdjacentHTML) {
                if (me.ieInsertHtml) {
                    frag = me.ieInsertHtml(where, el, html);
                    if (frag) {
                        return frag;
                    }
                }
                hashVal = fullPositionHash[where];
                if (hashVal) {
                    el.insertAdjacentHTML(hashVal[0], html);
                    return el[hashVal[1]];
                }
            } else {
                if (el.nodeType === 3) {
                    where = where === afterbegin ? beforebegin : where;
                    where = where === beforeend ? afterend : where;
                }
                range = Ext.supports.CreateContextualFragment ? el.ownerDocument.createRange() : undefined;
                setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
                if (bb_ae_PositionHash[where]) {
                    if (range) {
                        range[setStart](el);
                        frag = range.createContextualFragment(html);
                    } else {
                        frag = this.createContextualFragment(html);
                    }
                    el.parentNode.insertBefore(frag, where === beforebegin ? el : el.nextSibling);
                    return el[(where === beforebegin ? 'previous' : 'next') + 'Sibling'];
                } else {
                    rangeEl = (where === afterbegin ? 'first' : 'last') + 'Child';
                    if (el.firstChild) {
                        if (range) {
                            try {
                                range[setStart](el[rangeEl]);
                                frag = range.createContextualFragment(html);
                            } catch (e) {
                                frag = this.createContextualFragment(html);
                            }
                        } else {
                            frag = this.createContextualFragment(html);
                        }
                        if (where === afterbegin) {
                            el.insertBefore(frag, el.firstChild);
                        } else {
                            el.appendChild(frag);
                        }
                    } else {
                        el.innerHTML = html;
                    }
                    return el[rangeEl];
                }
            }
            Ext.raise({
                sourceClass: 'Ext.DomHelper',
                sourceMethod: 'insertHtml',
                htmlToInsert: html,
                targetElement: el,
                msg: 'Illegal insertion point reached: "' + where + '"'
            });
        },
        insertBefore: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, beforebegin);
        },
        insertAfter: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, afterend);
        },
        insertFirst: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, afterbegin);
        },
        append: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, beforeend);
        },
        overwrite: function(el, html, returnElement) {
            var me = this,
                newNode;
            el = Ext.getDom(el);
            html = me.markup(html);
            if (me.ieOverwrite) {
                newNode = me.ieOverwrite(el, html);
            }
            if (!newNode) {
                el.innerHTML = html;
                newNode = el.firstChild;
            }
            return returnElement ? Ext.get(newNode) : newNode;
        },
        doInsert: function(el, o, returnElement, where) {
            var me = this,
                newNode;
            el = el.dom || Ext.getDom(el);
            if ('innerHTML' in el) {
                newNode = me.insertHtml(where, el, me.markup(o));
            } else {
                newNode = me.createDom(o, null);
                if (el.nodeType === 3) {
                    where = where === afterbegin ? beforebegin : where;
                    where = where === beforeend ? afterend : where;
                }
                if (bb_ae_PositionHash[where]) {
                    el.parentNode.insertBefore(newNode, where === beforebegin ? el : el.nextSibling);
                } else if (el.firstChild && where === afterbegin) {
                    el.insertBefore(newNode, el.firstChild);
                } else {
                    el.appendChild(newNode);
                }
            }
            return returnElement ? Ext.get(newNode) : newNode;
        },
        createTemplate: function(o) {
            var html = this.markup(o);
            return new Ext.Template(html);
        },
        createHtml: function(spec) {
            return this.markup(spec);
        }
    };
});

Ext.define('Ext.util.TaskRunner', {
    interval: 10,
    timerId: null,
    constructor: function(interval) {
        var me = this;
        if (typeof interval == 'number') {
            me.interval = interval;
        } else if (interval) {
            Ext.apply(me, interval);
        }
        me.tasks = [];
        me.timerFn = Ext.Function.bind(me.onTick, me);
    },
    newTask: function(config) {
        var task = new Ext.util.TaskRunner.Task(config);
        task.manager = this;
        return task;
    },
    start: function(task) {
        var me = this,
            now = Ext.Date.now();
        if (!task.pending) {
            me.tasks.push(task);
            task.pending = true;
        }
        task.stopped = false;
        task.taskStartTime = now;
        task.taskRunTime = task.fireOnStart !== false ? 0 : task.taskStartTime;
        task.taskRunCount = 0;
        if (!me.firing) {
            if (task.fireOnStart !== false) {
                me.startTimer(0, now);
            } else {
                me.startTimer(task.interval, now);
            }
        }
        return task;
    },
    stop: function(task) {
        if (!task.stopped) {
            task.stopped = true;
            if (task.onStop) {
                task.onStop.call(task.scope || task, task);
            }
        }
        return task;
    },
    stopAll: function() {
        Ext.each(this.tasks, this.stop, this);
    },
    firing: false,
    nextExpires: 1.0E99,
    onTick: function() {
        var me = this,
            tasks = me.tasks,
            fireIdleEvent = me.fireIdleEvent,
            now = Ext.Date.now(),
            nextExpires = 1.0E99,
            len = tasks.length,
            globalEvents = Ext.GlobalEvents,
            expires, newTasks, i, task, rt, remove, args;
        me.timerId = null;
        me.firing = true;
        for (i = 0; i < len || i < (len = tasks.length); ++i) {
            task = tasks[i];
            if (!(remove = task.stopped)) {
                expires = task.taskRunTime + task.interval;
                if (expires <= now) {
                    rt = 1;
                    if (task.hasOwnProperty('fireIdleEvent')) {
                        fireIdleEvent = task.fireIdleEvent;
                    } else {
                        fireIdleEvent = me.fireIdleEvent;
                    }
                    task.taskRunCount++;
                    if (task.args) {
                        args = task.addCountToArgs ? task.args.concat([
                            task.taskRunCount
                        ]) : task.args;
                    } else {
                        args = [
                            task.taskRunCount
                        ];
                    }
                    if (me.disableTryCatch) {
                        rt = task.run.apply(task.scope || task, args);
                    } else {
                        try {
                            rt = task.run.apply(task.scope || task, args);
                        } catch (taskError) {
                            try {
                                Ext.log({
                                    fn: task.run,
                                    prefix: 'Error while running task',
                                    stack: taskError.stack,
                                    msg: taskError,
                                    level: 'error'
                                });
                                if (task.onError) {
                                    rt = task.onError.call(task.scope || task, task, taskError);
                                }
                            } catch (ignore) {}
                        }
                    }
                    task.taskRunTime = now;
                    if (rt === false || task.taskRunCount === task.repeat) {
                        me.stop(task);
                        remove = true;
                    } else {
                        remove = task.stopped;
                        expires = now + task.interval;
                    }
                }
                if (!remove && task.duration && task.duration <= (now - task.taskStartTime)) {
                    me.stop(task);
                    remove = true;
                }
            }
            if (remove) {
                task.pending = false;
                if (!newTasks) {
                    newTasks = tasks.slice(0, i);
                }
            } else {
                if (newTasks) {
                    newTasks.push(task);
                }
                if (nextExpires > expires) {
                    nextExpires = expires;
                }
            }
        }
        if (newTasks) {
            me.tasks = newTasks;
        }
        me.firing = false;
        if (me.tasks.length) {
            me.startTimer(nextExpires - now, Ext.Date.now());
        }
        if (fireIdleEvent !== false && globalEvents.hasListeners.idle) {
            globalEvents.fireEvent('idle');
        }
    },
    startTimer: function(timeout, now) {
        var me = this,
            expires = now + timeout,
            timerId = me.timerId;
        if (timerId && me.nextExpires - expires > me.interval) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (!timerId) {
            if (timeout < me.interval) {
                timeout = me.interval;
            }
            me.timerId = Ext.defer(me.timerFn, timeout);
            me.nextExpires = expires;
        }
    }
}, function() {
    var me = this,
        proto = me.prototype;
    proto.destroy = proto.stopAll;
    me.Task = new Ext.Class({
        isTask: true,
        stopped: true,
        fireOnStart: false,
        constructor: function(config) {
            Ext.apply(this, config);
        },
        restart: function(interval) {
            if (interval !== undefined) {
                this.interval = interval;
            }
            this.manager.start(this);
        },
        start: function(interval) {
            if (this.stopped) {
                this.restart(interval);
            }
        },
        stop: function() {
            this.manager.stop(this);
        }
    });
    proto = me.Task.prototype;
    proto.destroy = proto.stop;
});

Ext.define('Ext.dom.Fly', {
    extend: Ext.dom.Element,
    alternateClassName: 'Ext.dom.Element.Fly',
    validNodeTypes: {
        1: 1,
        9: 1,
        11: 1
    },
    isFly: true,
    constructor: function(dom) {
        this.dom = dom;
        this.el = this;
    },
    attach: function(dom) {
        var me = this;
        if (!dom) {
            return me.detach();
        }
        me.dom = dom;
        if (!Ext.cache[dom.id]) {
            me.getData().isSynchronized = false;
        }
        return me;
    },
    detach: function() {
        this.dom = null;
    },
    addListener: function() {
        Ext.raise("Cannot use addListener() on Ext.dom.Fly instances. " + "Please use Ext.get() to retrieve an Ext.dom.Element instance instead.");
    } || null,
    removeListener: function() {
        Ext.raise("Cannot use removeListener() on Ext.dom.Fly instances. " + "Please use Ext.get() to retrieve an Ext.dom.Element instance instead.");
    } || null
}, function(Fly) {
    var flyweights = {},
        detachedBodyEl;
    Fly.cache = flyweights;
    Ext.fly = function(dom, named) {
        var fly = null,
            fn = Ext.fly,
            nodeType, data;
        named = named || (fn.caller && fn.caller.$name) || '_global';
        dom = Ext.getDom(dom);
        if (dom) {
            nodeType = dom.nodeType;
            if (Fly.prototype.validNodeTypes[nodeType] || (!nodeType && (dom.window == dom))) {
                fly = Ext.cache[dom.id];
                if (!fly || fly.dom !== dom) {
                    fly = flyweights[named] || (flyweights[named] = new Fly());
                    fly.dom = dom;
                    data = fly.getData(true);
                    if (data) {
                        data.isSynchronized = false;
                    }
                }
            }
        }
        return fly;
    };
    Ext.getDetachedBody = function() {
        if (!detachedBodyEl) {
            Ext.detachedBodyEl = detachedBodyEl = new Fly(document.createElement('div'));
            detachedBodyEl.isDetachedBody = true;
        }
        return detachedBodyEl;
    };
});

Ext.define('Ext.dom.CompositeElementLite', {
    alternateClassName: [
        'Ext.CompositeElementLite'
    ],
    isComposite: true,
    isLite: true,
    statics: {
        importElementMethods: function() {
            var Element = Ext.dom.Element,
                prototype = this.prototype;
            Ext.Object.each(Element.prototype, function(name, member) {
                if (typeof member === 'function' && !prototype[name]) {
                    prototype[name] = function() {
                        return this.invoke(name, arguments);
                    };
                }
            });
        }
    },
    constructor: function(elements, skipValidation) {
        if (skipValidation) {
            this.elements = elements || [];
        } else {
            this.elements = [];
            this.add(elements);
        }
    },
    getElement: function(el) {
        var fly = this._fly || (this._fly = new Ext.dom.Fly());
        return fly.attach(el);
    },
    transformElement: function(el) {
        return Ext.getDom(el);
    },
    getCount: function() {
        return this.elements.length;
    },
    add: function(els, root) {
        var elements = this.elements,
            i, ln;
        if (!els) {
            return this;
        }
        if (typeof els == "string") {
            els = Ext.fly(root || document).query(els);
        } else if (els.isComposite) {
            els = els.elements;
        } else if (!Ext.isIterable(els)) {
            els = [
                els
            ];
        }
        for (i = 0 , ln = els.length; i < ln; ++i) {
            elements.push(this.transformElement(els[i]));
        }
        return this;
    },
    invoke: function(fn, args) {
        var me = this,
            elements = me.elements,
            ln = elements.length,
            prototype, element, i;
        if (i !== 0) {
            prototype = (me.isLite ? Ext.dom.Fly : Ext.dom.Element).prototype;
            for (i = 0; i < ln; i++) {
                element = elements[i];
                if (element) {
                    prototype[fn].apply(me.getElement(element), args);
                }
            }
        }
        return me;
    },
    item: function(index) {
        var el = this.elements[index],
            out = null;
        if (el) {
            out = this.getElement(el);
        }
        return out;
    },
    slice: function(start, end) {
        return Ext.Array.slice(this.elements, start, end);
    },
    each: function(fn, scope) {
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;
        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                e = this.getElement(e);
                if (fn.call(scope || e, e, me, i) === false) {
                    break;
                }
            }
        }
        return me;
    },
    fill: function(els) {
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },
    insert: function(index, nodes) {
        Ext.Array.insert(this.elements, index, nodes);
    },
    filter: function(selector) {
        var me = this,
            els = me.elements,
            len = els.length,
            out = [],
            i = 0,
            isFunc = typeof selector == 'function',
            add, el;
        for (; i < len; i++) {
            el = els[i];
            add = false;
            if (el) {
                el = me.getElement(el);
                if (isFunc) {
                    add = selector.call(el, el, me, i) !== false;
                } else {
                    add = el.is(selector);
                }
                if (add) {
                    out.push(me.transformElement(el));
                }
            }
        }
        me.elements = out;
        return me;
    },
    indexOf: function(el) {
        return Ext.Array.indexOf(this.elements, this.transformElement(el));
    },
    replaceElement: function(el, replacement, domReplace) {
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if (index > -1) {
            replacement = Ext.getDom(replacement);
            if (domReplace) {
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            Ext.Array.splice(this.elements, index, 1, replacement);
        }
        return this;
    },
    clear: function(removeDom) {
        var me = this,
            els = me.elements,
            i = els.length - 1;
        if (removeDom) {
            for (; i >= 0; i--) {
                Ext.removeNode(els[i]);
            }
        }
        this.elements = [];
    },
    addElements: function(els, root) {
        if (!els) {
            return this;
        }
        if (typeof els === "string") {
            els = Ext.dom.Element.selectorFunction(els, root);
        }
        var yels = this.elements,
            eLen = els.length,
            e;
        for (e = 0; e < eLen; e++) {
            yels.push(Ext.get(els[e]));
        }
        return this;
    },
    first: function() {
        return this.item(0);
    },
    last: function() {
        return this.item(this.getCount() - 1);
    },
    contains: function(el) {
        return this.indexOf(el) != -1;
    },
    removeElement: function(keys, removeDom) {
        keys = [].concat(keys);
        var me = this,
            elements = me.elements,
            kLen = keys.length,
            val, el, k;
        for (k = 0; k < kLen; k++) {
            val = keys[k];
            if ((el = (elements[val] || elements[val = me.indexOf(val)]))) {
                if (removeDom) {
                    if (el.dom) {
                        el.destroy();
                    } else {
                        Ext.removeNode(el);
                    }
                }
                Ext.Array.erase(elements, val, 1);
            }
        }
        return me;
    },
    destroy: function() {
        return this.invoke('destroy', arguments);
        this.callParent();
    }
}, function(CompositeElementLite) {
    var prototype = CompositeElementLite.prototype;
    CompositeElementLite.importElementMethods();
    prototype.on = prototype.addListener;
});

Ext.define('Ext.dom.CompositeElement', {
    alternateClassName: 'Ext.CompositeElement',
    extend: Ext.dom.CompositeElementLite,
    isLite: false,
    getElement: function(el) {
        return el;
    },
    transformElement: function(el) {
        return Ext.get(el);
    }
});

Ext.define('Ext.dom.GarbageCollector', {
    singleton: true,
    interval: 30000,
    constructor: function() {
        var me = this;
        me.lastTime = Ext.now();
        me.onTick = me.onTick.bind(me);
        me.resume();
    },
    collect: function() {
        var me = this,
            cache = Ext.cache,
            eid, dom, el, t, isGarbage, tagName;
        var collectedIds = [];
        for (eid in cache) {
            if (!cache.hasOwnProperty(eid)) {
                
                continue;
            }
            el = cache[eid];
            if (el.skipGarbageCollection) {
                
                continue;
            }
            dom = el.dom;
            if (!dom) {
                Ext.raise('Missing DOM node in element garbage collection: ' + eid);
            }
            try {
                isGarbage = Ext.isGarbage(dom);
            } catch (e) {
                delete cache[eid];
                collectedIds.push('#' + el.id);
                
                continue;
            }
            if (isGarbage) {
                if (el && el.dom) {
                    tagName = el.dom.tagName;
                    el.collect();
                    collectedIds.push((tagName ? tagName : '') + '#' + el.id);
                }
            }
        }
        if (Ext.isIE9m) {
            t = {};
            for (eid in cache) {
                if (cache.hasOwnProperty(eid)) {
                    t[eid] = cache[eid];
                }
            }
            Ext.cache = Ext.dom.Element.cache = t;
        }
        me.lastTime = Ext.now();
        return collectedIds;
    },
    onTick: function() {
        this.timerId = null;
        if (Ext.enableGarbageCollector) {
            this.collect();
        }
        this.resume();
    },
    pause: function() {
        var timerId = this.timerId;
        if (timerId) {
            this.timerId = null;
            clearTimeout(timerId);
        }
    },
    resume: function() {
        var me = this,
            lastTime = me.lastTime;
        if (Ext.enableGarbageCollector && (Ext.now() - lastTime) > me.interval) {
            me.collect();
        }
        if (!me.timerId) {
            me.timerId = Ext.defer(me.onTick, me.interval);
        }
    }
});

Ext.define('Ext.dom.TouchAction', {
    singleton: true,
    lastTouchStartTime: 0,
    minMoveDistance: 8,
    spaceRe: /\s+/,
    preventSingle: null,
    preventMulti: null,
    disabledOverflowDom: null,
    panXCls: Ext.baseCSSPrefix + 'touch-action-pan-x',
    panYCls: Ext.baseCSSPrefix + 'touch-action-pan-y',
    cssValues: [
        'none',
        'pan-x',
        'pan-y',
        'pan-x pan-y',
        'pinch-zoom',
        'pan-x pinch-zoom',
        'pan-y pinch-zoom',
        'manipulation',
        'double-tap-zoom',
        'pan-x double-tap-zoom',
        'pan-y double-tap-zoom',
        'pan-x pan-y double-tap-zoom',
        'pinch-zoom double-tap-zoom',
        'pan-x pinch-zoom double-tap-zoom',
        'pan-y pinch-zoom double-tap-zoom',
        ''
    ],
    objectValues: [
        {
            panX: false,
            panY: false,
            pinchZoom: false,
            doubleTapZoom: false
        },
        {
            panX: true,
            panY: false,
            pinchZoom: false,
            doubleTapZoom: false
        },
        {
            panX: false,
            panY: true,
            pinchZoom: false,
            doubleTapZoom: false
        },
        {
            panX: true,
            panY: true,
            pinchZoom: false,
            doubleTapZoom: false
        },
        {
            panX: false,
            panY: false,
            pinchZoom: true,
            doubleTapZoom: false
        },
        {
            panX: true,
            panY: false,
            pinchZoom: true,
            doubleTapZoom: false
        },
        {
            panX: false,
            panY: true,
            pinchZoom: true,
            doubleTapZoom: false
        },
        {
            panX: true,
            panY: true,
            pinchZoom: true,
            doubleTapZoom: false
        },
        {
            panX: false,
            panY: false,
            pinchZoom: false,
            doubleTapZoom: true
        },
        {
            panX: true,
            panY: false,
            pinchZoom: false,
            doubleTapZoom: true
        },
        {
            panX: false,
            panY: true,
            pinchZoom: false,
            doubleTapZoom: true
        },
        {
            panX: true,
            panY: true,
            pinchZoom: false,
            doubleTapZoom: true
        },
        {
            panX: false,
            panY: false,
            pinchZoom: true,
            doubleTapZoom: true
        },
        {
            panX: true,
            panY: false,
            pinchZoom: true,
            doubleTapZoom: true
        },
        {
            panX: false,
            panY: true,
            pinchZoom: true,
            doubleTapZoom: true
        },
        {
            panX: true,
            panY: true,
            pinchZoom: true,
            doubleTapZoom: true
        }
    ],
    attributeName: 'data-extTouchAction',
    constructor: function() {
        var me = this,
            supports = Ext.supports;
        if (supports.PointerEvents) {
            me.cssProp = 'touch-action';
        } else if (supports.MSPointerEvents) {
            me.cssProp = '-ms-touch-action';
        } else if (supports.TouchEvents) {
            Ext.getWin().on({
                touchstart: 'onTouchStart',
                touchmove: 'onTouchMove',
                touchend: 'onTouchEnd',
                scope: me,
                translate: false,
                capture: true,
                priority: 5000
            });
            Ext.on({
                scroll: 'onScroll',
                scope: me,
                destroyable: true
            });
        }
        if (Ext.isFunction(Object.freeze)) {
            var objectValues = me.objectValues;
            for (var i = 0,
                ln = objectValues.length; i < ln; i++) {
                Object.freeze(objectValues[i]);
            }
        }
    },
    containsTargets: function(dom, e) {
        var contains = true,
            touches = e.type === 'touchend' ? e.changedTouches : e.touches,
            i, ln;
        for (i = 0 , ln = touches.length; i < ln; i++) {
            if (!dom.contains(touches[i].target)) {
                contains = false;
                break;
            }
        }
        return contains;
    },
    disableOverflow: function(dom, vertical) {
        var me = this,
            overflowName = vertical ? 'overflow-y' : 'overflow-x',
            overflowStyle, cls;
        if (!me.disabledOverflowDom && !Ext.isiOS && !Ext.getScrollbarSize().width) {
            me.disabledOverflowDom = dom;
            cls = vertical ? me.panXCls : me.panYCls;
            while (dom) {
                overflowStyle = Ext.fly(dom).getStyle(overflowName);
                if (overflowStyle === 'auto' || overflowStyle === 'scroll') {
                    Ext.fly(dom).addCls(cls);
                }
                dom = dom.parentNode;
            }
        }
    },
    get: function(dom) {
        var flags = dom.getAttribute(this.attributeName),
            ret = null;
        if (flags != null) {
            ret = this.objectValues[flags];
        }
        return ret;
    },
    getFlags: function(touchAction) {
        var flags;
        if (typeof touchAction === 'number') {
            flags = touchAction;
        } else {
            flags = 0;
            if (touchAction.panX !== false) {
                flags |= 1;
            }
            if (touchAction.panY !== false) {
                flags |= 2;
            }
            if (touchAction.pinchZoom !== false) {
                flags |= 4;
            }
            if (touchAction.doubleTapZoom !== false) {
                flags |= 8;
            }
        }
        return flags;
    },
    lookupFlags: function(dom) {
        return dom.getAttribute && dom.getAttribute(this.attributeName);
    },
    onScroll: function() {
        this.scrollOccurred = true;
        this.isDoubleTap = false;
    },
    onTouchEnd: function(e) {
        var me = this,
            dom = e.target,
            touchCount, flags, doubleTapZoom;
        touchCount = e.touches.length;
        if (touchCount === 0) {
            if (me.isDoubleTap) {
                while (dom) {
                    flags = me.lookupFlags(dom);
                    if (flags != null) {
                        doubleTapZoom = flags & 8;
                        if (!doubleTapZoom) {
                            e.preventDefault();
                        }
                    }
                    dom = dom.parentNode;
                }
            }
            me.isDoubleTap = false;
            me.preventSingle = null;
            me.preventMulti = null;
            me.resetOverflow();
        }
    },
    onTouchMove: function(e) {
        var me = this,
            prevent = null,
            dom = e.target,
            flags, touchCount, panX, panY, point, startPoint, scale, distance, deltaX, deltaY, preventSingle, preventMulti;
        preventSingle = me.preventSingle;
        preventMulti = me.preventMulti;
        touchCount = e.touches.length;
        if ((touchCount === 1 && (preventSingle === false)) || (preventMulti === false)) {
            return;
        }
        if ((touchCount > 1 && (preventMulti === true)) || (touchCount === 1 && (preventSingle === true))) {
            prevent = true;
        } else {
            while (dom) {
                flags = me.lookupFlags(dom);
                if (flags != null) {
                    if (!flags) {
                        prevent = true;
                    } else if (touchCount === 1) {
                        panX = !!(flags & 1);
                        panY = !!(flags & 2);
                        if (panX && panY) {
                            prevent = false;
                        } else if (!panX && !panY) {
                            prevent = true;
                        } else {
                            point = e.getPoint();
                            startPoint = me.startPoint;
                            scale = Ext.Element.getViewportScale();
                            distance = Math.abs(point.getDistanceTo(me.startPoint) * scale);
                            if (distance >= me.minMoveDistance) {
                                deltaX = Math.abs(point.x - startPoint.x);
                                deltaY = Math.abs(point.y - startPoint.y);
                                prevent = !!((panX && (deltaY > deltaX)) || (panY && (deltaX > deltaY)));
                            }
                        }
                    } else if (me.containsTargets(dom, e)) {
                        prevent = !(flags & 4);
                    } else {
                        prevent = false;
                    }
                    if (prevent) {
                        break;
                    }
                }
                dom = dom.parentNode;
            }
        }
        if (touchCount === 1) {
            me.preventSingle = prevent;
        } else if (touchCount > 1) {
            me.preventMulti = prevent;
        }
        if (prevent) {
            e.preventDefault();
        }
    },
    onTouchStart: function(e) {
        var me = this,
            time, flags, dom, panX, panY;
        if (e.touches.length === 1) {
            time = e.time;
            if (!me.scrollOccurred && ((time - me.lastTouchStartTime) <= 500)) {
                me.isDoubleTap = true;
            }
            me.lastTouchStartTime = time;
            me.scrollOccurred = false;
            me.startPoint = e.getPoint();
            dom = e.target;
            while (dom) {
                flags = me.lookupFlags(dom);
                if (flags != null) {
                    panX = !!(flags & 1);
                    panY = !!(flags & 2);
                    if (panX !== panY) {
                        me.disableOverflow(dom, panX);
                        break;
                    }
                }
                dom = dom.parentNode;
            }
        } else {
            me.isDoubleTap = false;
        }
    },
    resetOverflow: function() {
        var me = this,
            dom = me.disabledOverflowDom;
        while (dom) {
            Ext.fly(dom).removeCls([
                me.panXCls,
                me.panYCls
            ]);
            dom = dom.parentNode;
        }
        me.disabledOverflowDom = null;
    },
    set: function(dom, value) {
        var me = this,
            cssProp = me.cssProp,
            flags = me.getFlags(value),
            attributeName = me.attributeName;
        if (cssProp) {
            Ext.fly(dom).setStyle(cssProp, me.cssValues[flags]);
        }
        if (flags === 15) {
            dom.removeAttribute(attributeName);
        } else {
            dom.setAttribute(attributeName, flags);
        }
    }
});

Ext.define('Ext.event.gesture.Recognizer', {
    mixins: [
        Ext.mixin.Identifiable
    ],
    priority: 0,
    handledEvents: [],
    isStarted: false,
    config: {
        onRecognized: Ext.emptyFn,
        callbackScope: null
    },
    constructor: function(config) {
        this.initConfig(config);
        Ext.event.publisher.Gesture.instance.registerRecognizer(this);
    },
    onStart: Ext.emptyFn,
    onEnd: Ext.emptyFn,
    onTouchStart: Ext.emptyFn,
    onTouchMove: Ext.emptyFn,
    onTouchEnd: function() {
        return this.reset();
    },
    onTouchCancel: function(e) {
        return this.cancel(e);
    },
    fire: function(eventName, e, info, isCancel) {
        this.getOnRecognized().call(this.getCallbackScope(), this, eventName, e, info, isCancel);
    },
    cancel: function(e) {
        if (this.isStarted) {
            this.onCancel(e);
        }
        return this.reset();
    },
    onCancel: Ext.emptyFn,
    reset: function() {
        this.isStarted = false;
        return false;
    }
});

Ext.define('Ext.event.gesture.SingleTouch', {
    extend: Ext.event.gesture.Recognizer,
    isSingleTouch: true,
    onTouchStart: function(e) {
        if (e.touches.length > 1) {
            return this.cancel(e);
        }
    }
});

Ext.define('Ext.event.gesture.DoubleTap', {
    extend: Ext.event.gesture.SingleTouch,
    priority: 300,
    config: {
        moveDistance: 8,
        tapDistance: 24,
        maxDuration: 300
    },
    handledEvents: [
        'singletap',
        'doubletap'
    ],
    singleTapTimer: null,
    startTime: 0,
    lastTapTime: 0,
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]),
            lastStartPoint;
        if (ret !== false) {
            me.isStarted = true;
            lastStartPoint = me.lastStartPoint = e.changedTouches[0].point;
            me.startPoint = me.startPoint || lastStartPoint;
            me.startTime = e.time;
            clearTimeout(me.singleTapTimer);
        }
        return ret;
    },
    onTouchMove: function(e) {
        var me = this,
            point = e.changedTouches[0].point,
            scale = Ext.Element.getViewportScale(),
            distance = Math.round(Math.abs(point.getDistanceTo(me.lastStartPoint) * scale));
        if (distance >= me.getMoveDistance()) {
            return me.cancel(e);
        }
    },
    onTouchEnd: function(e) {
        var me = this,
            maxDuration = me.getMaxDuration(),
            time = e.time,
            target = e.target,
            lastTapTime = me.lastTapTime,
            lastTarget = me.lastTarget,
            point = e.changedTouches[0].point,
            duration, scale, distance;
        me.lastTapTime = time;
        me.lastTarget = target;
        if (lastTapTime) {
            duration = time - lastTapTime;
            if (duration <= maxDuration) {
                scale = Ext.Element.getViewportScale();
                distance = Math.round(Math.abs(point.getDistanceTo(me.startPoint) * scale));
                if (distance <= me.getTapDistance()) {
                    if (target !== lastTarget) {
                        return me.cancel(e);
                    }
                    me.lastTarget = null;
                    me.lastTapTime = 0;
                    me.fire('doubletap', e, {
                        touch: e.changedTouches[0],
                        duration: duration
                    });
                    return me.callParent([
                        e
                    ]);
                }
            }
        }
        if (time - me.startTime > maxDuration) {
            me.fire('singletap', e);
            me.reset();
        } else {
            me.setSingleTapTimer(e);
        }
    },
    setSingleTapTimer: function(e) {
        var me = this;
        me.singleTapTimer = Ext.defer(function() {
            me.fire('singletap', e);
            me.reset();
        }, me.getMaxDuration());
    },
    reset: function() {
        var me = this;
        clearTimeout(me.singleTapTimer);
        me.startTime = me.lastTapTime = 0;
        me.lastStartPoint = me.startPoint = me.singleTapTimer = null;
        return me.callParent();
    }
}, function(DoubleTap) {
    var gestures = Ext.manifest.gestures;
    DoubleTap.instance = new DoubleTap(gestures && gestures.doubleTap);
});

Ext.define('Ext.event.gesture.Drag', {
    extend: Ext.event.gesture.SingleTouch,
    priority: 100,
    startPoint: null,
    previousPoint: null,
    lastPoint: null,
    handledEvents: [
        'dragstart',
        'drag',
        'dragend',
        'dragcancel'
    ],
    config: {
        minDistance: 8
    },
    constructor: function() {
        this.callParent(arguments);
        this.initInfo();
    },
    initInfo: function() {
        this.info = {
            touch: null,
            previous: {
                x: 0,
                y: 0
            },
            x: 0,
            y: 0,
            delta: {
                x: 0,
                y: 0
            },
            absDelta: {
                x: 0,
                y: 0
            },
            flick: {
                velocity: {
                    x: 0,
                    y: 0
                }
            },
            direction: {
                x: 0,
                y: 0
            },
            time: 0,
            previousTime: {
                x: 0,
                y: 0
            },
            longpress: false
        };
    },
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]);
        if (ret !== false) {
            me.startTime = e.time;
            me.startPoint = e.changedTouches[0].point;
        }
        return ret;
    },
    tryDragStart: function(e) {
        var me = this,
            point = e.changedTouches[0].point,
            minDistance = me.getMinDistance(),
            scale = Ext.Element.getViewportScale(),
            distance = Math.round(Math.abs(point.getDistanceTo(me.startPoint) * scale));
        if (distance >= minDistance) {
            me.doDragStart(e);
        }
    },
    doDragStart: function(e, isLongPress) {
        var me = this,
            touch = e.changedTouches[0],
            point = touch.point,
            info = me.info,
            time;
        if (isLongPress) {
            time = Ext.now();
            me.startTime = time;
            me.startPoint = point;
            info.longpress = true;
        } else {
            time = e.time;
        }
        me.isStarted = true;
        me.previousPoint = me.lastPoint = point;
        me.resetInfo('x', e, touch);
        me.resetInfo('y', e, touch);
        info.time = time;
        me.fire('dragstart', e, info);
    },
    onTouchMove: function(e) {
        var me = this,
            touch, point;
        if (!me.startPoint) {
            return;
        }
        if (!me.isStarted) {
            me.tryDragStart(e);
        }
        if (!me.isStarted) {
            return;
        }
        touch = e.changedTouches[0];
        point = touch.point;
        if (me.lastPoint) {
            me.previousPoint = me.lastPoint;
        }
        me.lastPoint = point;
        me.lastMoveEvent = e;
        me.updateInfo('x', e, touch);
        me.updateInfo('y', e, touch);
        me.info.time = e.time;
        me.fire('drag', e, me.info);
    },
    onAxisDragEnd: function(axis, info) {
        var duration = info.time - info.previousTime[axis];
        if (duration > 0) {
            info.flick.velocity[axis] = (info[axis] - info.previous[axis]) / duration;
        }
    },
    resetInfo: function(axis, e, touch) {
        var me = this,
            value = me.lastPoint[axis],
            startValue = me.startPoint[axis],
            delta = value - startValue,
            capAxis = axis.toUpperCase(),
            info = me.info;
        info.touch = touch;
        info.delta[axis] = delta;
        info.absDelta[axis] = Math.abs(delta);
        info.previousTime[axis] = me.startTime;
        info.previous[axis] = startValue;
        info[axis] = value;
        info.direction[axis] = 0;
        info['start' + capAxis] = me.startPoint[axis];
        info['previous' + capAxis] = info.previous[axis];
        info['page' + capAxis] = info[axis];
        info['delta' + capAxis] = info.delta[axis];
        info['absDelta' + capAxis] = info.absDelta[axis];
        info['previousDelta' + capAxis] = 0;
        info.startTime = me.startTime;
    },
    updateInfo: function(axis, e, touch) {
        var me = this,
            value = me.lastPoint[axis],
            previousValue = me.previousPoint[axis],
            startValue = me.startPoint[axis],
            delta = value - startValue,
            info = me.info,
            direction = info.direction,
            capAxis = axis.toUpperCase(),
            previousFlick = info.previous[axis];
        info.touch = touch;
        info.delta[axis] = delta;
        info.absDelta[axis] = Math.abs(delta);
        if (value !== previousFlick && value !== info[axis]) {
            info.previous[axis] = info[axis];
            info.previousTime[axis] = info.time;
        }
        info[axis] = value;
        if (value > previousValue) {
            direction[axis] = 1;
        } else if (value < previousValue) {
            direction[axis] = -1;
        }
        info['start' + capAxis] = startValue;
        info['previous' + capAxis] = info.previous[axis];
        info['page' + capAxis] = info[axis];
        info['delta' + capAxis] = info.delta[axis];
        info['absDelta' + capAxis] = info.absDelta[axis];
        info['previousDelta' + capAxis] = info.previous[axis] - startValue;
        info.startTime = me.startTime;
    },
    onTouchEnd: function(e) {
        var me = this,
            touch, point, info;
        if (me.isStarted) {
            touch = e.changedTouches[0];
            point = touch.point;
            info = me.info;
            me.lastPoint = point;
            me.updateInfo('x', e, touch);
            me.updateInfo('y', e, touch);
            info.time = e.time;
            me.onAxisDragEnd('x', info);
            me.onAxisDragEnd('y', info);
            me.fire('dragend', e, info);
        }
        return this.callParent([
            e
        ]);
    },
    onCancel: function(e) {
        var me = this,
            touch = e.changedTouches[0],
            info = me.info;
        if (!e.touches.length) {
            me.lastPoint = touch.point;
        }
        me.updateInfo('x', e, touch);
        me.updateInfo('y', e, touch);
        info.time = e.time;
        me.fire('dragcancel', e, info, true);
    },
    reset: function() {
        var me = this;
        me.lastPoint = me.startPoint = me.previousPoint = me.lastPoint = me.lastMoveEvent = null;
        me.initInfo();
        return me.callParent();
    }
}, function(Drag) {
    var gestures = Ext.manifest.gestures;
    Drag.instance = new Drag(gestures && gestures.drag);
});

Ext.define('Ext.event.gesture.Swipe', {
    extend: Ext.event.gesture.SingleTouch,
    priority: 600,
    handledEvents: [
        'swipestart',
        'swipe',
        'swipecancel'
    ],
    config: {
        minDistance: 80,
        maxOffset: 35,
        maxDuration: 1000
    },
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]),
            touch;
        if (ret !== false) {
            touch = e.changedTouches[0];
            me.startTime = e.time;
            me.isHorizontal = true;
            me.isVertical = true;
            me.startX = touch.pageX;
            me.startY = touch.pageY;
        }
        return ret;
    },
    onTouchMove: function(e) {
        var me = this,
            touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - me.startX,
            deltaY = y - me.startY,
            absDeltaX = Math.abs(x - me.startX),
            absDeltaY = Math.abs(y - me.startY),
            duration = e.time - me.startTime,
            minDistance, direction, distance;
        if ((absDeltaX === 0 && absDeltaY === 0) || (duration > me.getMaxDuration())) {
            return me.cancel(e);
        }
        if (me.isHorizontal && absDeltaY > me.getMaxOffset()) {
            me.isHorizontal = false;
        }
        if (me.isVertical && absDeltaX > me.getMaxOffset()) {
            me.isVertical = false;
        }
        if (!me.isVertical || !me.isHorizontal) {
            minDistance = me.getMinDistance();
            if (me.isHorizontal && absDeltaX < minDistance) {
                direction = (deltaX < 0) ? 'left' : 'right';
                distance = absDeltaX;
            } else if (me.isVertical && absDeltaY < minDistance) {
                direction = (deltaY < 0) ? 'up' : 'down';
                distance = absDeltaY;
            }
        }
        if (!me.isHorizontal && !me.isVertical) {
            return me.cancel(e);
        }
        if (direction && !me.isStarted) {
            me.isStarted = true;
            me.fire('swipestart', e, {
                touch: touch,
                direction: direction,
                distance: distance,
                duration: duration
            });
        }
    },
    onTouchEnd: function(e) {
        var me = this,
            touch, x, y, deltaX, deltaY, absDeltaX, absDeltaY, minDistance, duration, direction, distance;
        if (me.onTouchMove(e) !== false) {
            touch = e.changedTouches[0];
            x = touch.pageX;
            y = touch.pageY;
            deltaX = x - me.startX;
            deltaY = y - me.startY;
            absDeltaX = Math.abs(deltaX);
            absDeltaY = Math.abs(deltaY);
            minDistance = me.getMinDistance();
            duration = e.time - me.startTime;
            if (me.isVertical && absDeltaY < minDistance) {
                me.isVertical = false;
            }
            if (me.isHorizontal && absDeltaX < minDistance) {
                me.isHorizontal = false;
            }
            if (me.isHorizontal) {
                direction = (deltaX < 0) ? 'left' : 'right';
                distance = absDeltaX;
            } else if (me.isVertical) {
                direction = (deltaY < 0) ? 'up' : 'down';
                distance = absDeltaY;
            }
            me.fire('swipe', e, {
                touch: touch,
                direction: direction,
                distance: distance,
                duration: duration
            });
        }
        return this.callParent([
            e
        ]);
    },
    onCancel: function(e) {
        this.fire('swipecancel', e, null, true);
    },
    reset: function() {
        var me = this;
        me.startTime = me.isHorizontal = me.isVertical = me.startX = me.startY = null;
        return me.callParent();
    }
}, function(Swipe) {
    var gestures = Ext.manifest.gestures;
    Swipe.instance = new Swipe(gestures && gestures.swipe);
});

Ext.define('Ext.event.gesture.EdgeSwipe', {
    extend: Ext.event.gesture.Swipe,
    priority: 500,
    handledEvents: [
        'edgeswipe',
        'edgeswipestart',
        'edgeswipeend',
        'edgeswipecancel'
    ],
    config: {
        minDistance: 60
    },
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]),
            touch;
        if (ret !== false) {
            touch = e.changedTouches[0];
            me.direction = null;
            me.isHorizontal = true;
            me.isVertical = true;
            me.startX = touch.pageX;
            me.startY = touch.pageY;
        }
        return ret;
    },
    onTouchMove: function(e) {
        var me = this,
            touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - me.startX,
            deltaY = y - me.startY,
            absDeltaY = Math.abs(y - me.startY),
            absDeltaX = Math.abs(x - me.startX),
            minDistance = me.getMinDistance(),
            maxOffset = me.getMaxOffset(),
            duration = e.time - me.startTime,
            elementWidth = Ext.Viewport && Ext.Element.getViewportWidth(),
            elementHeight = Ext.Viewport && Ext.Element.getViewportHeight(),
            direction, distance;
        if (me.isVertical && absDeltaX > maxOffset) {
            me.isVertical = false;
        }
        if (me.isHorizontal && absDeltaY > maxOffset) {
            me.isHorizontal = false;
        }
        if (me.isVertical && me.isHorizontal) {
            if (absDeltaY > absDeltaX) {
                me.isHorizontal = false;
            } else {
                me.isVertical = false;
            }
        }
        if (me.isHorizontal) {
            direction = (deltaX < 0) ? 'left' : 'right';
            distance = deltaX;
        } else if (me.isVertical) {
            direction = (deltaY < 0) ? 'up' : 'down';
            distance = deltaY;
        }
        direction = me.direction || (me.direction = direction);
        if (direction === 'up') {
            distance = deltaY * -1;
        } else if (direction === 'left') {
            distance = deltaX * -1;
        }
        me.distance = distance;
        if (!distance) {
            return me.cancel(e);
        }
        if (!me.isStarted) {
            if ((direction === 'right' && me.startX > minDistance) || (direction === 'down' && me.startY > minDistance) || (direction === 'left' && (elementWidth - me.startX) > minDistance) || (direction === 'up' && (elementHeight - me.startY) > minDistance)) {
                return me.cancel(e);
            }
            me.isStarted = true;
            me.startTime = e.time;
            me.fire('edgeswipestart', e, {
                touch: touch,
                direction: direction,
                distance: distance,
                duration: duration
            });
        } else {
            me.fire('edgeswipe', e, {
                touch: touch,
                direction: direction,
                distance: distance,
                duration: duration
            });
        }
    },
    onTouchEnd: function(e) {
        var me = this,
            duration;
        if (me.onTouchMove(e) !== false) {
            duration = e.time - me.startTime;
            me.fire('edgeswipeend', e, {
                touch: e.changedTouches[0],
                direction: me.direction,
                distance: me.distance,
                duration: duration
            });
        }
        return this.reset();
    },
    onCancel: function(e) {
        this.fire('edgeswipecancel', e, {
            touch: e.changedTouches[0]
        }, true);
    },
    reset: function() {
        var me = this;
        me.direction = me.isHorizontal = me.isVertical = me.startX = me.startY = me.startTime = me.distance = null;
        return me.callParent();
    }
}, function(EdgeSwipe) {
    var gestures = Ext.manifest.gestures;
    EdgeSwipe.instance = new EdgeSwipe(gestures && gestures.edgeSwipe);
});

Ext.define('Ext.event.gesture.LongPress', {
    extend: Ext.event.gesture.SingleTouch,
    priority: 400,
    config: {
        moveDistance: 8,
        minDuration: 1000
    },
    handledEvents: [
        'longpress',
        'taphold'
    ],
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]);
        if (ret !== false) {
            me.startPoint = e.changedTouches[0].point;
            me.setLongPressTimer(e);
        }
        return ret;
    },
    setLongPressTimer: function(e) {
        var me = this;
        me.timer = Ext.defer(me.fireLongPress, me.getMinDuration(), me, [
            e
        ]);
    },
    onTouchMove: function(e) {
        var me = this,
            point = e.changedTouches[0].point,
            scale = Ext.Element.getViewportScale(),
            distance = Math.round(Math.abs(point.getDistanceTo(me.startPoint) * scale));
        if (distance >= me.getMoveDistance()) {
            return me.cancel(e);
        }
    },
    reset: function() {
        var me = this;
        clearTimeout(me.timer);
        me.timer = me.startPoint = null;
        return me.callParent();
    },
    fireLongPress: function(e) {
        var me = this,
            info = {
                touch: e.changedTouches[0],
                duration: me.getMinDuration(),
                startDrag: me.startDrag
            };
        this.fire('taphold', e, info);
        this.fire('longpress', e, info);
        this.reset();
    },
    startDrag: function() {
        var dragRecognizer = Ext.event.gesture.Drag.instance,
            touchStartEvent = this.parentEvent;
        dragRecognizer.doDragStart(touchStartEvent, true);
        Ext.event.publisher.Gesture.instance.claimRecognizer(dragRecognizer, touchStartEvent);
    }
}, function(LongPress) {
    var gestures = Ext.manifest.gestures;
    LongPress.instance = new LongPress(gestures && gestures.longPress);
});

Ext.define('Ext.event.gesture.MultiTouch', {
    extend: Ext.event.gesture.Recognizer,
    requiredTouchesCount: 2,
    isTracking: false,
    isMultiTouch: true,
    onTouchStart: function(e) {
        var me = this,
            requiredTouchesCount = me.requiredTouchesCount,
            touches = e.touches,
            touchesCount = touches.length;
        if (touchesCount === requiredTouchesCount) {
            me.isTracking = true;
        } else if (touchesCount > requiredTouchesCount) {
            return me.cancel(e);
        }
    },
    reset: function() {
        this.isTracking = false;
        return this.callParent();
    }
});

Ext.define('Ext.event.gesture.Pinch', {
    extend: Ext.event.gesture.MultiTouch,
    priority: 700,
    handledEvents: [
        'pinchstart',
        'pinch',
        'pinchend',
        'pinchcancel'
    ],
    startDistance: 0,
    lastTouches: null,
    onTouchMove: function(e) {
        var me = this,
            touches, firstPoint, secondPoint, distance;
        if (me.isTracking) {
            touches = e.touches;
            firstPoint = touches[0].point;
            secondPoint = touches[1].point;
            distance = firstPoint.getDistanceTo(secondPoint);
            if (distance === 0) {
                return;
            }
            if (!me.isStarted) {
                me.isStarted = true;
                me.startDistance = distance;
                me.fire('pinchstart', e, {
                    touches: touches,
                    distance: distance,
                    scale: 1
                });
            } else {
                me.fire('pinch', e, {
                    touches: touches,
                    distance: distance,
                    scale: distance / me.startDistance
                });
            }
        }
    },
    onTouchEnd: function(e) {
        if (this.isStarted) {
            this.fire('pinchend', e);
        }
        return this.callParent([
            e
        ]);
    },
    onCancel: function(e) {
        this.fire('pinchcancel', e, null, true);
    },
    reset: function() {
        this.lastTouches = null;
        this.startDistance = 0;
        return this.callParent();
    }
}, function(Pinch) {
    var gestures = Ext.manifest.gestures;
    Pinch.instance = new Pinch(gestures && gestures.pinch);
});

Ext.define('Ext.event.gesture.Rotate', {
    extend: Ext.event.gesture.MultiTouch,
    priority: 800,
    handledEvents: [
        'rotatestart',
        'rotate',
        'rotateend',
        'rotatecancel'
    ],
    startAngle: 0,
    lastTouches: null,
    lastAngle: null,
    onTouchMove: function(e) {
        var me = this,
            touches, lastAngle, firstPoint, secondPoint, angle, nextAngle, previousAngle, diff;
        if (me.isTracking) {
            touches = e.touches;
            lastAngle = me.lastAngle;
            firstPoint = touches[0].point;
            secondPoint = touches[1].point;
            angle = firstPoint.getAngleTo(secondPoint);
            if (lastAngle !== null) {
                diff = Math.abs(lastAngle - angle);
                nextAngle = angle + 360;
                previousAngle = angle - 360;
                if (Math.abs(nextAngle - lastAngle) < diff) {
                    angle = nextAngle;
                } else if (Math.abs(previousAngle - lastAngle) < diff) {
                    angle = previousAngle;
                }
            }
            me.lastAngle = angle;
            if (!me.isStarted) {
                me.isStarted = true;
                me.startAngle = angle;
                me.fire('rotatestart', e, {
                    touches: touches,
                    angle: angle,
                    rotation: 0
                });
            } else {
                me.fire('rotate', e, {
                    touches: touches,
                    angle: angle,
                    rotation: angle - me.startAngle
                });
            }
            me.lastTouches = Ext.Array.clone(touches);
        }
    },
    onTouchEnd: function(e) {
        if (this.isStarted) {
            this.fire('rotateend', e);
        }
        return this.callParent([
            e
        ]);
    },
    onCancel: function(e) {
        this.fire('rotatecancel', e, null, true);
    },
    reset: function() {
        var me = this;
        me.lastTouches = me.lastAngle = me.startAngle = null;
        return this.callParent();
    }
}, function(Rotate) {
    var gestures = Ext.manifest.gestures;
    Rotate.instance = new Rotate(gestures && gestures.rotate);
});

Ext.define('Ext.event.gesture.Tap', {
    extend: Ext.event.gesture.SingleTouch,
    priority: 200,
    handledEvents: [
        'tap',
        'tapcancel'
    ],
    config: {
        moveDistance: 8
    },
    onTouchStart: function(e) {
        var me = this,
            ret = me.callParent([
                e
            ]);
        if (ret !== false) {
            me.isStarted = true;
            me.startPoint = e.changedTouches[0].point;
        }
        return ret;
    },
    onTouchMove: function(e) {
        var me = this,
            point = e.changedTouches[0].point,
            scale = Ext.Element.getViewportScale(),
            distance = Math.round(Math.abs(point.getDistanceTo(me.startPoint) * scale));
        if (distance >= me.getMoveDistance()) {
            return me.cancel(e);
        }
    },
    onTouchEnd: function(e) {
        this.fire('tap', e, {
            touch: e.changedTouches[0]
        });
        return this.callParent([
            e
        ]);
    },
    onCancel: function(e) {
        this.fire('tapcancel', e, {
            touch: e.changedTouches[0]
        }, true);
    },
    reset: function() {
        this.startPoint = null;
        return this.callParent();
    }
}, function(Tap) {
    var gestures = Ext.manifest.gestures;
    Tap.instance = new Tap(gestures && gestures.tap);
});

Ext.define('Ext.event.publisher.Focus', {
    extend: Ext.event.publisher.Dom,
    type: 'focus',
    handledEvents: [
        'focusenter',
        'focusleave',
        'focusmove'
    ],
    handledDomEvents: [
        'focusin',
        'focusout'
    ],
    publishDelegatedDomEvent: function(e) {
        var me = this,
            relatedTarget = e.relatedTarget;
        if (e.type === 'focusout') {
            if (relatedTarget == null) {
                me.processFocusIn(e, e.target, document.body);
            }
        } else {
            if (relatedTarget == null || !relatedTarget.tagName) {
                relatedTarget = document.body;
            }
            me.processFocusIn(e, relatedTarget, e.target);
        }
    },
    processFocusIn: function(e, fromElement, toElement) {
        var me = this,
            commonAncestor, node,
            targets = [],
            event, focusEnterEvent, fromFly, toFly;
        fromFly = Ext.fly(fromElement);
        toFly = Ext.fly(toElement);
        if ((fromFly && fromFly.isFocusSuspended()) || (toFly && toFly.isFocusSuspended())) {
            return;
        }
        for (node = fromElement , commonAncestor = Ext.dom.Element.getCommonAncestor(toElement, fromElement, true); node && node !== commonAncestor; node = node.parentNode) {
            targets.push(node);
        }
        if (targets.length) {
            event = me.createSyntheticEvent('focusleave', e, fromElement, toElement);
            me.publish(event, targets);
            if (event.stopped) {
                return;
            }
        }
        targets.length = 0;
        for (node = toElement; node && node !== commonAncestor; node = node.parentNode) {
            targets.push(node);
        }
        focusEnterEvent = me.createSyntheticEvent('focusenter', e, toElement, fromElement);
        if (targets.length) {
            me.publish(focusEnterEvent, targets);
            if (focusEnterEvent.stopped) {
                return;
            }
        }
        targets = me.getPropagatingTargets(commonAncestor);
        if (targets.length) {
            event = me.createSyntheticEvent('focusmove', e, toElement, fromElement);
            me.publish(event, targets);
            if (event.stopped) {
                return;
            }
        }
        Ext.GlobalEvents.fireEvent('focus', {
            event: focusEnterEvent,
            toElement: toElement,
            fromElement: fromElement
        });
    },
    createSyntheticEvent: function(eventName, browserEvent, target, relatedTarget) {
        var event = new Ext.event.Event(browserEvent);
        event.type = eventName;
        event.relatedTarget = relatedTarget;
        event.target = target;
        return event;
    }
}, function(Focus) {
    var focusTimeout;
    Focus.instance = new Focus();
    if (!Ext.supports.FocusinFocusoutEvents) {
        this.override({
            handledDomEvents: [
                'focus',
                'blur'
            ],
            publishDelegatedDomEvent: function(e) {
                var me = this,
                    targetIsElement;
                me.callSuper([
                    e
                ]);
                targetIsElement = e.target !== window && e.target !== document;
                if (e.type === 'blur') {
                    if (!targetIsElement) {
                        if (e.explicitOriginalTarget === Focus.previousActiveElement) {
                            if (e.target === window) {
                                clearTimeout(focusTimeout);
                                focusTimeout = 0;
                                me.processFocusIn(e, Focus.previousActiveElement, document.body);
                                Focus.previousActiveElement = null;
                            }
                        }
                    } else {
                        focusTimeout = setTimeout(function() {
                            focusTimeout = 0;
                            me.processFocusIn(e, e.target, document.body);
                            Focus.previousActiveElement = null;
                        }, 0);
                    }
                    Focus.previousActiveElement = targetIsElement ? e.target : null;
                } else {
                    clearTimeout(focusTimeout);
                    focusTimeout = 0;
                    me.processFocusIn(e, Focus.previousActiveElement || document.body, targetIsElement ? e.target : document.body);
                }
            }
        });
    }
});

Ext.define('Ext.fx.State', {
    isAnimatable: {
        'background-color': true,
        'background-image': true,
        'background-position': true,
        'border-bottom-color': true,
        'border-bottom-width': true,
        'border-color': true,
        'border-left-color': true,
        'border-left-width': true,
        'border-right-color': true,
        'border-right-width': true,
        'border-spacing': true,
        'border-top-color': true,
        'border-top-width': true,
        'border-width': true,
        'bottom': true,
        'color': true,
        'crop': true,
        'font-size': true,
        'font-weight': true,
        'height': true,
        'left': true,
        'letter-spacing': true,
        'line-height': true,
        'margin-bottom': true,
        'margin-left': true,
        'margin-right': true,
        'margin-top': true,
        'max-height': true,
        'max-width': true,
        'min-height': true,
        'min-width': true,
        'opacity': true,
        'outline-color': true,
        'outline-offset': true,
        'outline-width': true,
        'padding-bottom': true,
        'padding-left': true,
        'padding-right': true,
        'padding-top': true,
        'right': true,
        'text-indent': true,
        'text-shadow': true,
        'top': true,
        'vertical-align': true,
        'visibility': true,
        'width': true,
        'word-spacing': true,
        'z-index': true,
        'zoom': true,
        'transform': true
    },
    constructor: function(data) {
        this.data = {};
        this.set(data);
    },
    setConfig: function(data) {
        this.set(data);
        return this;
    },
    setRaw: function(data) {
        this.data = data;
        return this;
    },
    clear: function() {
        return this.setRaw({});
    },
    setTransform: function(name, value) {
        var data = this.data,
            isArray = Ext.isArray(value),
            transform = data.transform,
            ln, key;
        if (!transform) {
            transform = data.transform = {
                translateX: 0,
                translateY: 0,
                translateZ: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                skewX: 0,
                skewY: 0
            };
        }
        if (typeof name == 'string') {
            switch (name) {
                case 'translate':
                    if (isArray) {
                        ln = value.length;
                        if (ln == 0) {
                            break;
                        }
                        transform.translateX = value[0];
                        if (ln == 1) {
                            break;
                        }
                        transform.translateY = value[1];
                        if (ln == 2) {
                            break;
                        }
                        transform.translateZ = value[2];
                    } else {
                        transform.translateX = value;
                    };
                    break;
                case 'rotate':
                    if (isArray) {
                        ln = value.length;
                        if (ln == 0) {
                            break;
                        }
                        transform.rotateX = value[0];
                        if (ln == 1) {
                            break;
                        }
                        transform.rotateY = value[1];
                        if (ln == 2) {
                            break;
                        }
                        transform.rotateZ = value[2];
                    } else {
                        transform.rotate = value;
                    };
                    break;
                case 'scale':
                    if (isArray) {
                        ln = value.length;
                        if (ln == 0) {
                            break;
                        }
                        transform.scaleX = value[0];
                        if (ln == 1) {
                            break;
                        }
                        transform.scaleY = value[1];
                        if (ln == 2) {
                            break;
                        }
                        transform.scaleZ = value[2];
                    } else {
                        transform.scaleX = value;
                        transform.scaleY = value;
                    };
                    break;
                case 'skew':
                    if (isArray) {
                        ln = value.length;
                        if (ln == 0) {
                            break;
                        }
                        transform.skewX = value[0];
                        if (ln == 1) {
                            break;
                        }
                        transform.skewY = value[1];
                    } else {
                        transform.skewX = value;
                    };
                    break;
                default:
                    transform[name] = value;
            }
        } else {
            for (key in name) {
                if (name.hasOwnProperty(key)) {
                    value = name[key];
                    this.setTransform(key, value);
                }
            }
        }
    },
    set: function(name, value) {
        var data = this.data,
            key;
        if (typeof name != 'string') {
            for (key in name) {
                value = name[key];
                if (key === 'transform') {
                    this.setTransform(value);
                } else {
                    data[key] = value;
                }
            }
        } else {
            if (name === 'transform') {
                this.setTransform(value);
            } else {
                data[name] = value;
            }
        }
        return this;
    },
    unset: function(name) {
        var data = this.data;
        if (data.hasOwnProperty(name)) {
            delete data[name];
        }
        return this;
    },
    getData: function() {
        return this.data;
    }
});

Ext.define('Ext.fx.animation.Abstract', {
    extend: Ext.Evented,
    isAnimation: true,
    config: {
        name: '',
        element: null,
        before: null,
        from: {},
        to: {},
        after: null,
        states: {},
        duration: 300,
        easing: 'linear',
        iteration: 1,
        direction: 'normal',
        delay: 0,
        onBeforeStart: null,
        callback: null,
        onEnd: null,
        onBeforeEnd: null,
        scope: null,
        reverse: null,
        preserveEndState: false,
        replacePrevious: true
    },
    STATE_FROM: '0%',
    STATE_TO: '100%',
    DIRECTION_UP: 'up',
    DIRECTION_DOWN: 'down',
    DIRECTION_LEFT: 'left',
    DIRECTION_RIGHT: 'right',
    stateNameRegex: /^(?:[\d\.]+)%$/,
    constructor: function() {
        this.states = {};
        this.callParent(arguments);
        return this;
    },
    applyElement: function(element) {
        return Ext.get(element);
    },
    applyBefore: function(before, current) {
        if (before) {
            return Ext.factory(before, Ext.fx.State, current);
        }
    },
    applyAfter: function(after, current) {
        if (after) {
            return Ext.factory(after, Ext.fx.State, current);
        }
    },
    setFrom: function(from) {
        return this.setState(this.STATE_FROM, from);
    },
    setTo: function(to) {
        return this.setState(this.STATE_TO, to);
    },
    getFrom: function() {
        return this.getState(this.STATE_FROM);
    },
    getTo: function() {
        return this.getState(this.STATE_TO);
    },
    setStates: function(states) {
        var validNameRegex = this.stateNameRegex,
            name;
        for (name in states) {
            if (validNameRegex.test(name)) {
                this.setState(name, states[name]);
            }
        }
        return this;
    },
    getStates: function() {
        return this.states;
    },
    updateCallback: function(callback) {
        if (callback) {
            this.setOnEnd(callback);
        }
    },
    end: function() {
        this.stop();
    },
    stop: function() {
        this.fireEvent('stop', this);
    },
    destroy: function() {
        this.stop();
        this.callParent();
    },
    setState: function(name, state) {
        var states = this.getStates(),
            stateInstance;
        stateInstance = Ext.factory(state, Ext.fx.State, states[name]);
        if (stateInstance) {
            states[name] = stateInstance;
        }
        else if (name === this.STATE_TO) {
            Ext.Logger.error("Setting and invalid '100%' / 'to' state of: " + state);
        }
        return this;
    },
    getState: function(name) {
        return this.getStates()[name];
    },
    getData: function() {
        var me = this,
            states = me.getStates(),
            statesData = {},
            before = me.getBefore(),
            after = me.getAfter(),
            from = states[me.STATE_FROM],
            to = states[me.STATE_TO],
            fromData = from.getData(),
            toData = to.getData(),
            data, name, state;
        for (name in states) {
            if (states.hasOwnProperty(name)) {
                state = states[name];
                data = state.getData();
                statesData[name] = data;
            }
        }
        return {
            before: before ? before.getData() : {},
            after: after ? after.getData() : {},
            states: statesData,
            from: fromData,
            to: toData,
            duration: me.getDuration(),
            iteration: me.getIteration(),
            direction: me.getDirection(),
            easing: me.getEasing(),
            delay: me.getDelay(),
            onEnd: me.getOnEnd(),
            onBeforeEnd: me.getOnBeforeEnd(),
            onBeforeStart: me.getOnBeforeStart(),
            scope: me.getScope(),
            preserveEndState: me.getPreserveEndState(),
            replacePrevious: me.getReplacePrevious()
        };
    }
});

Ext.define('Ext.fx.animation.Slide', {
    extend: Ext.fx.animation.Abstract,
    alternateClassName: 'Ext.fx.animation.SlideIn',
    alias: [
        'animation.slide',
        'animation.slideIn'
    ],
    config: {
        direction: 'left',
        out: false,
        offset: 0,
        easing: 'auto',
        containerBox: 'auto',
        elementBox: 'auto',
        isElementBoxFit: true,
        useCssTransform: true
    },
    reverseDirectionMap: {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    },
    applyEasing: function(easing) {
        if (easing === 'auto') {
            return 'ease-' + ((this.getOut()) ? 'in' : 'out');
        }
        return easing;
    },
    getContainerBox: function() {
        var box = this._containerBox;
        if (box === 'auto') {
            box = this.getElement().getParent().getBox();
        }
        return box;
    },
    getElementBox: function() {
        var box = this._elementBox;
        if (this.getIsElementBoxFit()) {
            return this.getContainerBox();
        }
        if (box === 'auto') {
            box = this.getElement().getBox();
        }
        return box;
    },
    getData: function() {
        var elementBox = this.getElementBox(),
            containerBox = this.getContainerBox(),
            box = elementBox ? elementBox : containerBox,
            from = this.getFrom(),
            to = this.getTo(),
            out = this.getOut(),
            offset = this.getOffset(),
            direction = this.getDirection(),
            useCssTransform = this.getUseCssTransform(),
            reverse = this.getReverse(),
            translateX = 0,
            translateY = 0,
            fromX, fromY, toX, toY;
        if (reverse) {
            direction = this.reverseDirectionMap[direction];
        }
        switch (direction) {
            case this.DIRECTION_UP:
                if (out) {
                    translateY = containerBox.top - box.top - box.height - offset;
                } else {
                    translateY = containerBox.bottom - box.bottom + box.height + offset;
                };
                break;
            case this.DIRECTION_DOWN:
                if (out) {
                    translateY = containerBox.bottom - box.bottom + box.height + offset;
                } else {
                    translateY = containerBox.top - box.height - box.top - offset;
                };
                break;
            case this.DIRECTION_RIGHT:
                if (out) {
                    translateX = containerBox.right - box.right + box.width + offset;
                } else {
                    translateX = containerBox.left - box.left - box.width - offset;
                };
                break;
            case this.DIRECTION_LEFT:
                if (out) {
                    translateX = containerBox.left - box.left - box.width - offset;
                } else {
                    translateX = containerBox.right - box.right + box.width + offset;
                };
                break;
        }
        fromX = (out) ? 0 : translateX;
        fromY = (out) ? 0 : translateY;
        if (useCssTransform) {
            from.setTransform({
                translateX: fromX,
                translateY: fromY
            });
        } else {
            from.set('left', fromX);
            from.set('top', fromY);
        }
        toX = (out) ? translateX : 0;
        toY = (out) ? translateY : 0;
        if (useCssTransform) {
            to.setTransform({
                translateX: toX,
                translateY: toY
            });
        } else {
            to.set('left', toX);
            to.set('top', toY);
        }
        return this.callParent(arguments);
    }
});

Ext.define('Ext.fx.animation.SlideOut', {
    extend: Ext.fx.animation.Slide,
    alias: [
        'animation.slideOut'
    ],
    config: {
        out: true
    }
});

Ext.define('Ext.fx.animation.Fade', {
    extend: Ext.fx.animation.Abstract,
    alternateClassName: 'Ext.fx.animation.FadeIn',
    alias: [
        'animation.fade',
        'animation.fadeIn'
    ],
    config: {
        out: false,
        before: {
            display: null,
            opacity: 0
        },
        after: {
            opacity: null
        },
        reverse: null
    },
    updateOut: function(newOut) {
        var to = this.getTo(),
            from = this.getFrom();
        if (newOut) {
            from.set('opacity', 1);
            to.set('opacity', 0);
        } else {
            from.set('opacity', 0);
            to.set('opacity', 1);
        }
    }
});

Ext.define('Ext.fx.animation.FadeOut', {
    extend: Ext.fx.animation.Fade,
    alias: 'animation.fadeOut',
    config: {
        out: true,
        before: {}
    }
});

Ext.define('Ext.fx.animation.Flip', {
    extend: Ext.fx.animation.Abstract,
    alias: 'animation.flip',
    config: {
        easing: 'ease-in',
        direction: 'right',
        half: false,
        out: null
    },
    getData: function() {
        var me = this,
            from = me.getFrom(),
            to = me.getTo(),
            direction = me.getDirection(),
            out = me.getOut(),
            half = me.getHalf(),
            rotate = half ? 90 : 180,
            fromScale = 1,
            toScale = 1,
            fromRotateX = 0,
            fromRotateY = 0,
            toRotateX = 0,
            toRotateY = 0;
        if (out) {
            toScale = 0.8;
        } else {
            fromScale = 0.8;
        }
        switch (direction) {
            case this.DIRECTION_UP:
                if (out) {
                    toRotateX = rotate;
                } else {
                    fromRotateX = -rotate;
                };
                break;
            case this.DIRECTION_DOWN:
                if (out) {
                    toRotateX = -rotate;
                } else {
                    fromRotateX = rotate;
                };
                break;
            case this.DIRECTION_RIGHT:
                if (out) {
                    toRotateY = rotate;
                } else {
                    fromRotateY = -rotate;
                };
                break;
            case this.DIRECTION_LEFT:
                if (out) {
                    toRotateY = -rotate;
                } else {
                    fromRotateY = rotate;
                };
                break;
        }
        from.setTransform({
            rotateX: fromRotateX,
            rotateY: fromRotateY,
            scale: fromScale
        });
        to.setTransform({
            rotateX: toRotateX,
            rotateY: toRotateY,
            scale: toScale
        });
        return this.callParent();
    }
});

Ext.define('Ext.fx.animation.Pop', {
    extend: Ext.fx.animation.Abstract,
    alias: [
        'animation.pop',
        'animation.popIn'
    ],
    alternateClassName: 'Ext.fx.animation.PopIn',
    config: {
        out: false,
        before: {
            display: null,
            opacity: 0
        },
        after: {
            opacity: null
        }
    },
    getData: function() {
        var to = this.getTo(),
            from = this.getFrom(),
            out = this.getOut();
        if (out) {
            from.set('opacity', 1);
            from.setTransform({
                scale: 1
            });
            to.set('opacity', 0);
            to.setTransform({
                scale: 0
            });
        } else {
            from.set('opacity', 0);
            from.setTransform({
                scale: 0
            });
            to.set('opacity', 1);
            to.setTransform({
                scale: 1
            });
        }
        return this.callParent(arguments);
    }
});

Ext.define('Ext.fx.animation.PopOut', {
    extend: Ext.fx.animation.Pop,
    alias: 'animation.popOut',
    config: {
        out: true,
        before: {}
    }
});

Ext.define('Ext.fx.Animation', {
    constructor: function(config) {
        var defaultClass = Ext.fx.animation.Abstract,
            type;
        if (typeof config == 'string') {
            type = config;
            config = {};
        } else if (config && config.type) {
            type = config.type;
        }
        if (type) {
            defaultClass = Ext.ClassManager.getByAlias('animation.' + type);
            if (!defaultClass) {
                Ext.Logger.error("Invalid animation type of: '" + type + "'");
            }
        }
        return Ext.factory(config, defaultClass);
    }
});

Ext.define('Ext.fx.runner.Css', {
    extend: Ext.Evented,
    prefixedProperties: {
        'transform': true,
        'transform-origin': true,
        'perspective': true,
        'transform-style': true,
        'transition': true,
        'transition-property': true,
        'transition-duration': true,
        'transition-timing-function': true,
        'transition-delay': true,
        'animation': true,
        'animation-name': true,
        'animation-duration': true,
        'animation-iteration-count': true,
        'animation-direction': true,
        'animation-timing-function': true,
        'animation-delay': true
    },
    lengthProperties: {
        'top': true,
        'right': true,
        'bottom': true,
        'left': true,
        'width': true,
        'height': true,
        'max-height': true,
        'max-width': true,
        'min-height': true,
        'min-width': true,
        'margin-bottom': true,
        'margin-left': true,
        'margin-right': true,
        'margin-top': true,
        'padding-bottom': true,
        'padding-left': true,
        'padding-right': true,
        'padding-top': true,
        'border-bottom-width': true,
        'border-left-width': true,
        'border-right-width': true,
        'border-spacing': true,
        'border-top-width': true,
        'border-width': true,
        'outline-width': true,
        'letter-spacing': true,
        'line-height': true,
        'text-indent': true,
        'word-spacing': true,
        'font-size': true,
        'translate': true,
        'translateX': true,
        'translateY': true,
        'translateZ': true,
        'translate3d': true,
        'x': true,
        'y': true
    },
    durationProperties: {
        'transition-duration': true,
        'transition-delay': true,
        'animation-duration': true,
        'animation-delay': true
    },
    angleProperties: {
        rotate: true,
        rotateX: true,
        rotateY: true,
        rotateZ: true,
        skew: true,
        skewX: true,
        skewY: true
    },
    lengthUnitRegex: /([a-z%]*)$/,
    DEFAULT_UNIT_LENGTH: 'px',
    DEFAULT_UNIT_ANGLE: 'deg',
    DEFAULT_UNIT_DURATION: 'ms',
    customProperties: {
        x: true,
        y: true
    },
    formattedNameCache: {
        'x': 'left',
        'y': 'top'
    },
    transformMethods3d: [
        'translateX',
        'translateY',
        'translateZ',
        'rotate',
        'rotateX',
        'rotateY',
        'rotateZ',
        'skewX',
        'skewY',
        'scaleX',
        'scaleY',
        'scaleZ'
    ],
    transformMethodsNo3d: [
        'translateX',
        'translateY',
        'rotate',
        'skewX',
        'skewY',
        'scaleX',
        'scaleY'
    ],
    constructor: function() {
        var me = this;
        me.transformMethods = Ext.feature.has.Css3dTransforms ? me.transformMethods3d : me.transformMethodsNo3d;
        me.vendorPrefix = Ext.browser.getStyleDashPrefix();
        me.ruleStylesCache = {};
        me.callParent();
    },
    getStyleSheet: function() {
        var styleSheet = this.styleSheet,
            styleElement, styleSheets;
        if (!styleSheet) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            (document.head || document.getElementsByTagName('head')[0]).appendChild(styleElement);
            styleSheets = document.styleSheets;
            this.styleSheet = styleSheet = styleSheets[styleSheets.length - 1];
        }
        return styleSheet;
    },
    applyRules: function(selectors) {
        var styleSheet = this.getStyleSheet(),
            ruleStylesCache = this.ruleStylesCache,
            rules = styleSheet.cssRules,
            selector, properties, ruleStyle, ruleStyleCache, rulesLength, name, value;
        for (selector in selectors) {
            properties = selectors[selector];
            ruleStyle = ruleStylesCache[selector];
            if (ruleStyle === undefined) {
                rulesLength = rules.length;
                styleSheet.insertRule(selector + '{}', rulesLength);
                ruleStyle = ruleStylesCache[selector] = rules.item(rulesLength).style;
            }
            ruleStyleCache = ruleStyle.$cache;
            if (!ruleStyleCache) {
                ruleStyleCache = ruleStyle.$cache = {};
            }
            for (name in properties) {
                value = this.formatValue(properties[name], name);
                name = this.formatName(name);
                if (ruleStyleCache[name] !== value) {
                    ruleStyleCache[name] = value;
                    if (value === null) {
                        ruleStyle.removeProperty(name);
                    } else {
                        ruleStyle.setProperty(name, value, 'important');
                    }
                }
            }
        }
        return this;
    },
    applyStyles: function(styles) {
        var id, element, elementStyle, properties, name, value;
        for (id in styles) {
            if (styles.hasOwnProperty(id)) {
                this.activeElement = element = document.getElementById(id);
                if (!element) {
                    
                    continue;
                }
                elementStyle = element.style;
                properties = styles[id];
                for (name in properties) {
                    if (properties.hasOwnProperty(name)) {
                        value = this.formatValue(properties[name], name);
                        name = this.formatName(name);
                        if (value === null) {
                            elementStyle.removeProperty(name);
                        } else {
                            elementStyle.setProperty(name, value, 'important');
                        }
                    }
                }
            }
        }
        this.activeElement = null;
        return this;
    },
    formatName: function(name) {
        var cache = this.formattedNameCache,
            formattedName = cache[name];
        if (!formattedName) {
            if ((Ext.os.is.Tizen || !Ext.feature.has.CssTransformNoPrefix) && this.prefixedProperties[name]) {
                formattedName = this.vendorPrefix + name;
            } else {
                formattedName = name;
            }
            cache[name] = formattedName;
        }
        return formattedName;
    },
    formatValue: function(value, name) {
        var type = typeof value,
            lengthUnit = this.DEFAULT_UNIT_LENGTH,
            isCustom = this.customProperties[name],
            transformMethods, method, i, ln, transformValues, values, unit;
        if (value === null) {
            return '';
        }
        if (type === 'string') {
            if (this.lengthProperties[name]) {
                unit = value.match(this.lengthUnitRegex)[1];
                if (unit.length > 0) {
                    if (unit !== lengthUnit) {
                        Ext.Logger.error("Length unit: '" + unit + "' in value: '" + value + "' of property: '" + name + "' is not " + "valid for animation. Only 'px' is allowed");
                    }
                } else {
                    value = value + lengthUnit;
                    if (isCustom) {
                        value = this.getCustomValue(value, name);
                    }
                    return value;
                }
            }
            return value;
        } else if (type === 'number') {
            if (value == 0) {
                return '0';
            }
            if (this.lengthProperties[name]) {
                value = value + lengthUnit;
                if (isCustom) {
                    value = this.getCustomValue(value, name);
                }
                return value;
            }
            if (this.angleProperties[name]) {
                return value + this.DEFAULT_UNIT_ANGLE;
            }
            if (this.durationProperties[name]) {
                return value + this.DEFAULT_UNIT_DURATION;
            }
        } else if (name === 'transform') {
            transformMethods = this.transformMethods;
            transformValues = [];
            for (i = 0 , ln = transformMethods.length; i < ln; i++) {
                method = transformMethods[i];
                transformValues.push(method + '(' + this.formatValue(value[method], method) + ')');
            }
            return transformValues.join(' ');
        } else if (Ext.isArray(value)) {
            values = [];
            for (i = 0 , ln = value.length; i < ln; i++) {
                values.push(this.formatValue(value[i], name));
            }
            return (values.length > 0) ? values.join(', ') : 'none';
        }
        return value;
    },
    getCustomValue: function(value, name) {
        var el = Ext.fly(this.activeElement),
            unit = value.match(this.lengthUnitRegex)[1];
        if (name === 'x') {
            value = el.translateXY(parseInt(value, 10)).x;
        } else if (name === 'y') {
            value = el.translateXY(null, parseInt(value, 10)).y;
        }
        return value + unit;
    }
});

Ext.define('Ext.fx.runner.CssTransition', {
    extend: Ext.fx.runner.Css,
    alternateClassName: 'Ext.Animator',
    singleton: true,
    listenersAttached: false,
    constructor: function() {
        this.runningAnimationsData = {};
        return this.callParent(arguments);
    },
    attachListeners: function() {
        this.listenersAttached = true;
        Ext.getWin().on('transitionend', 'onTransitionEnd', this);
    },
    onTransitionEnd: function(e) {
        var target = e.target,
            id = target.id;
        if (id && this.runningAnimationsData.hasOwnProperty(id)) {
            this.refreshRunningAnimationsData(Ext.get(target), [
                e.browserEvent.propertyName
            ]);
        }
    },
    getElementId: function(element) {
        return element.getId ? element.getId() : element.id;
    },
    onAnimationEnd: function(element, data, animation, isInterrupted, isReplaced) {
        var id = this.getElementId(element),
            runningData = this.runningAnimationsData[id],
            endRules = {},
            endData = {},
            runningNameMap, toPropertyNames, i, ln, name;
        animation.un('stop', 'onAnimationStop', this);
        if (runningData) {
            runningNameMap = runningData.nameMap;
        }
        endRules[id] = endData;
        if (data.onBeforeEnd) {
            data.onBeforeEnd.call(data.scope || this, element, isInterrupted);
        }
        animation.fireEvent('animationbeforeend', animation, element, isInterrupted);
        this.fireEvent('animationbeforeend', this, animation, element, isInterrupted);
        if (isReplaced || (!isInterrupted && !data.preserveEndState)) {
            toPropertyNames = data.toPropertyNames;
            for (i = 0 , ln = toPropertyNames.length; i < ln; i++) {
                name = toPropertyNames[i];
                if (runningNameMap && !runningNameMap.hasOwnProperty(name)) {
                    endData[name] = null;
                }
            }
        }
        if (data.after) {
            Ext.merge(endData, data.after);
        }
        this.applyStyles(endRules);
        if (data.onEnd) {
            data.onEnd.call(data.scope || this, element, isInterrupted);
        }
        animation.fireEvent('animationend', animation, element, isInterrupted);
        this.fireEvent('animationend', this, animation, element, isInterrupted);
        Ext.AnimationQueue.stop(Ext.emptyFn, animation);
    },
    onAllAnimationsEnd: function(element) {
        var id = this.getElementId(element),
            endRules = {};
        delete this.runningAnimationsData[id];
        endRules[id] = {
            'transition-property': null,
            'transition-duration': null,
            'transition-timing-function': null,
            'transition-delay': null
        };
        this.applyStyles(endRules);
        this.fireEvent('animationallend', this, element);
    },
    hasRunningAnimations: function(element) {
        var id = this.getElementId(element),
            runningAnimationsData = this.runningAnimationsData;
        return runningAnimationsData.hasOwnProperty(id) && runningAnimationsData[id].sessions.length > 0;
    },
    refreshRunningAnimationsData: function(element, propertyNames, interrupt, replace) {
        var id = this.getElementId(element),
            runningAnimationsData = this.runningAnimationsData,
            runningData = runningAnimationsData[id];
        if (!runningData) {
            return;
        }
        var nameMap = runningData.nameMap,
            nameList = runningData.nameList,
            sessions = runningData.sessions,
            ln, j, subLn, name, i, session, map, list,
            hasCompletedSession = false;
        interrupt = Boolean(interrupt);
        replace = Boolean(replace);
        if (!sessions) {
            return this;
        }
        ln = sessions.length;
        if (ln === 0) {
            return this;
        }
        if (replace) {
            runningData.nameMap = {};
            nameList.length = 0;
            for (i = 0; i < ln; i++) {
                session = sessions[i];
                this.onAnimationEnd(element, session.data, session.animation, interrupt, replace);
            }
            sessions.length = 0;
        } else {
            for (i = 0; i < ln; i++) {
                session = sessions[i];
                map = session.map;
                list = session.list;
                for (j = 0 , subLn = propertyNames.length; j < subLn; j++) {
                    name = propertyNames[j];
                    if (map[name]) {
                        delete map[name];
                        Ext.Array.remove(list, name);
                        session.length--;
                        if (--nameMap[name] == 0) {
                            delete nameMap[name];
                            Ext.Array.remove(nameList, name);
                        }
                    }
                }
                if (session.length == 0) {
                    sessions.splice(i, 1);
                    i--;
                    ln--;
                    hasCompletedSession = true;
                    this.onAnimationEnd(element, session.data, session.animation, interrupt);
                }
            }
        }
        if (!replace && !interrupt && sessions.length == 0 && hasCompletedSession) {
            this.onAllAnimationsEnd(element);
        }
    },
    getRunningData: function(id) {
        var runningAnimationsData = this.runningAnimationsData;
        if (!runningAnimationsData.hasOwnProperty(id)) {
            runningAnimationsData[id] = {
                nameMap: {},
                nameList: [],
                sessions: []
            };
        }
        return runningAnimationsData[id];
    },
    getTestElement: function() {
        var me = this,
            testElement = me.testElement,
            iframe = me.iframe,
            iframeDocument, iframeStyle;
        if (testElement) {
            if (testElement.ownerDocument.defaultView !== iframe.contentWindow) {
                iframe.contentDocument.body.appendChild(testElement);
                me.testElementComputedStyle = iframeDocument.defaultView.getComputedStyle(testElement);
            }
        } else {
            iframe = me.iframe = document.createElement('iframe');
            iframe.setAttribute('data-sticky', true);
            iframe.setAttribute('tabIndex', -1);
            iframeStyle = iframe.style;
            iframeStyle.setProperty('visibility', 'hidden', 'important');
            iframeStyle.setProperty('width', '0px', 'important');
            iframeStyle.setProperty('height', '0px', 'important');
            iframeStyle.setProperty('position', 'absolute', 'important');
            iframeStyle.setProperty('border', '0px', 'important');
            iframeStyle.setProperty('zIndex', '-1000', 'important');
            document.body.appendChild(iframe);
            iframeDocument = iframe.contentDocument;
            iframeDocument.open();
            iframeDocument.writeln('</body>');
            iframeDocument.close();
            me.testElement = testElement = iframeDocument.createElement('div');
            testElement.style.setProperty('position', 'absolute', 'important');
            iframeDocument.body.appendChild(testElement);
            me.testElementComputedStyle = iframeDocument.defaultView.getComputedStyle(testElement);
        }
        return testElement;
    },
    getCssStyleValue: function(name, value) {
        var testElement = this.getTestElement(),
            computedStyle = this.testElementComputedStyle,
            style = testElement.style;
        style.setProperty(name, value);
        if (Ext.browser.is.Firefox) {
            testElement.offsetHeight;
        }
        value = computedStyle.getPropertyValue(name);
        style.removeProperty(name);
        return value;
    },
    run: function(animations) {
        var me = this,
            Function = Ext.Function,
            isLengthPropertyMap = me.lengthProperties,
            fromData = {},
            toData = {},
            data = {},
            transitionData = {},
            element, elementId, from, to, before, fromPropertyNames, toPropertyNames, doApplyTo, message, runningData, elementData, i, j, ln, animation, propertiesLength, sessionNameMap, computedStyle, formattedName, name, toFormattedValue, computedValue, fromFormattedValue, isLengthProperty, runningNameMap, runningNameList, runningSessions, runningSession;
        if (!me.listenersAttached) {
            me.attachListeners();
        }
        animations = Ext.Array.from(animations);
        for (i = 0 , ln = animations.length; i < ln; i++) {
            animation = animations[i];
            animation = Ext.factory(animation, Ext.fx.Animation);
            me.activeElement = element = animation.getElement();
            Ext.AnimationQueue.start(Ext.emptyFn, animation);
            computedStyle = window.getComputedStyle(element.dom);
            elementId = me.getElementId(element);
            data[elementId] = data = Ext.merge({}, animation.getData());
            if (animation.onBeforeStart) {
                animation.onBeforeStart.call(animation.scope || me, element);
            }
            animation.fireEvent('animationstart', animation, data);
            me.fireEvent('animationstart', me, animation, data);
            before = data.before;
            from = data.from;
            to = data.to;
            data.fromPropertyNames = fromPropertyNames = [];
            data.toPropertyNames = toPropertyNames = [];
            for (name in to) {
                if (to.hasOwnProperty(name)) {
                    to[name] = toFormattedValue = me.formatValue(to[name], name);
                    formattedName = me.formatName(name);
                    isLengthProperty = isLengthPropertyMap.hasOwnProperty(name);
                    if (!isLengthProperty) {
                        toFormattedValue = me.getCssStyleValue(formattedName, toFormattedValue);
                    }
                    if (from.hasOwnProperty(name)) {
                        from[name] = fromFormattedValue = me.formatValue(from[name], name);
                        if (!isLengthProperty) {
                            fromFormattedValue = me.getCssStyleValue(formattedName, fromFormattedValue);
                        }
                        if (toFormattedValue !== fromFormattedValue) {
                            fromPropertyNames.push(formattedName);
                            toPropertyNames.push(formattedName);
                        }
                    } else {
                        computedValue = computedStyle.getPropertyValue(formattedName);
                        if (toFormattedValue !== computedValue) {
                            toPropertyNames.push(formattedName);
                        }
                    }
                }
            }
            propertiesLength = toPropertyNames.length;
            if (propertiesLength === 0) {
                me.onAnimationEnd(element, data, animation);
                
                continue;
            }
            runningData = me.getRunningData(elementId);
            runningSessions = runningData.sessions;
            if (runningSessions.length > 0) {
                me.refreshRunningAnimationsData(element, Ext.Array.merge(fromPropertyNames, toPropertyNames), true, data.replacePrevious);
            }
            runningNameMap = runningData.nameMap;
            runningNameList = runningData.nameList;
            sessionNameMap = {};
            for (j = 0; j < propertiesLength; j++) {
                name = toPropertyNames[j];
                sessionNameMap[name] = true;
                if (!runningNameMap.hasOwnProperty(name)) {
                    runningNameMap[name] = 1;
                    runningNameList.push(name);
                } else {
                    runningNameMap[name]++;
                }
            }
            runningSession = {
                element: element,
                map: sessionNameMap,
                list: toPropertyNames.slice(),
                length: propertiesLength,
                data: data,
                animation: animation
            };
            runningSessions.push(runningSession);
            animation.on('stop', 'onAnimationStop', me);
            elementData = Ext.apply({}, before);
            Ext.apply(elementData, from);
            if (runningNameList.length > 0) {
                fromPropertyNames = Ext.Array.difference(runningNameList, fromPropertyNames);
                toPropertyNames = Ext.Array.merge(fromPropertyNames, toPropertyNames);
                elementData['transition-property'] = fromPropertyNames;
            }
            fromData[elementId] = elementData;
            toData[elementId] = Ext.apply({}, to);
            transitionData[elementId] = {
                'transition-property': toPropertyNames,
                'transition-duration': data.duration,
                'transition-timing-function': data.easing,
                'transition-delay': data.delay
            };
            animation.startTime = Date.now();
        }
        me.activeElement = null;
        message = me.$className;
        me.applyStyles(fromData);
        doApplyTo = function(e) {
            if (e.data === message && e.source === window) {
                window.removeEventListener('message', doApplyTo, false);
                me.applyStyles(toData);
            }
        };
        Function.requestAnimationFrame(function() {
            if (Ext.isIE) {
                me.applyStyles(transitionData);
                Function.requestAnimationFrame(function() {
                    window.addEventListener('message', doApplyTo, false);
                    window.postMessage(message, '*');
                });
            } else {
                Ext.merge(toData, transitionData);
                window.addEventListener('message', doApplyTo, false);
                window.postMessage(message, '*');
            }
        });
    },
    onAnimationStop: function(animation) {
        var runningAnimationsData = this.runningAnimationsData,
            id, runningData, sessions, i, ln, session;
        for (id in runningAnimationsData) {
            if (runningAnimationsData.hasOwnProperty(id)) {
                runningData = runningAnimationsData[id];
                sessions = runningData.sessions;
                for (i = 0 , ln = sessions.length; i < ln; i++) {
                    session = sessions[i];
                    if (session.animation === animation) {
                        this.refreshRunningAnimationsData(session.element, session.list.slice(), false);
                    }
                }
            }
        }
    }
});

Ext.define('Ext.util.TaskManager', {
    extend: Ext.util.TaskRunner,
    alternateClassName: [
        'Ext.TaskManager'
    ],
    singleton: true
});

Ext.define('Site.widget.Login', {
    singleton: true,
    config: {
        loginLinkSelector: 'a[href^="/login"]',
        loginModalId: 'login-modal'
    },
    constructor: function(config) {
        var me = this;
        me.callParent(arguments);
        me.initConfig(config);
        Ext.onReady(me.onDocReady, me);
    },
    onDocReady: function() {
        var me = this,
            body = Ext.getBody(),
            loginModal = me.loginModal = Ext.get(me.getLoginModalId()),
            loginForm = me.loginForm = loginModal && loginModal.down('form');
        if (!loginModal) {
            return;
        }
        body.on('keyup', 'onBodyKeyup', me);
        body.on('click', 'onLoginLinkClick', me, {
            delegate: me.getLoginLinkSelector()
        });
        loginModal.on('click', 'hide', me, {
            delegate: '[data-action="close"]'
        });
        loginForm.on('submit', 'onLoginSubmit', me);
    },
    hide: function() {
        this.loginModal.setStyle('display', 'none');
        Ext.getBody().removeCls('blurred');
    },
    show: function() {
        Ext.getBody().addCls('blurred');
        this.loginModal.setStyle('display', '');
    },
    onBodyKeyup: function(ev, t) {
        if (ev.getKey() == ev.ESC) {
            this.hide();
        }
    },
    onLoginLinkClick: function(ev, t) {
        var me = this;
        ev.preventDefault();
        me.show();
        me.loginForm.down('input[autofocus]').focus();
    },
    onLoginSubmit: function(ev, t) {
        var loginForm = this.loginForm;
        ev.preventDefault();
        loginForm.addCls('waiting');
        Ext.Ajax.request({
            url: '/login/?format=json',
            method: 'POST',
            form: loginForm,
            success: function(response) {
                window.location.reload();
            },
            failure: function(response) {
                loginForm.dom.action = '/login?_LOGIN[return]=' + encodeURIComponent(location.pathname + location.search);
                loginForm.dom.submit();
            }
        });
    }
});

Ext.define('Site.widget.Search', {
    extend: Ext.util.Observable,
    config: {
        searchForm: null,
        resultsVisible: false,
        url: '/search/json',
        searchFieldSelector: 'input[type=search]',
        searchDelay: 300,
        minChars: 2,
        groupResultsLimit: 5,
        interceptTabs: false,
        noResultsCls: 'no-results',
        noResultsText: 'No results',
        resultsTpl: [
            '<tpl foreach="results.data">',
            '<tpl if="values.length">',
            '<section class="results-group">',
            '<h1 class="group-title">{[this.getGroupTitle(xkey, values)]}</h1>',
            '<tpl for="Ext.Array.slice(values, 0, parent.groupResultsLimit)">',
            '<li class="search-result">{[this.renderModel(values)]}</li>',
            '</tpl>',
            '<tpl if="values.length &gt; parent.groupResultsLimit">',
            '<li class="search-result"><a class="more-link" href="/search?q={[encodeURIComponent(parent.query)]}#results-{[xkey]}">{[values.length - parent.groupResultsLimit]} more&hellip;</a></li>',
            '</tpl>',
            '</section>',
            '</tpl>',
            '</tpl>',
            {
                getGroupTitle: function(modelClass, models) {
                    var modelWidget = modelClass && Ext.ClassManager.getByAlias('modelwidget.' + modelClass);
                    return modelWidget ? modelWidget.getCollectionTitle(models) : modelClass;
                },
                renderModel: function(model) {
                    var modelClass = model.Class,
                        modelWidget = modelClass && Ext.ClassManager.getByAlias('modelwidget.' + modelClass);
                    if (modelWidget) {
                        return modelWidget.getHtml(model);
                    } else {
                        return '[' + (modelClass || 'unrenderable item') + ']';
                    }
                }
            }
        ]
    },
    constructor: function(config) {
        var me = this;
        me.callParent(arguments);
        me.initConfig(config);
        me.searchTask = Ext.create('Ext.util.DelayedTask', me.doSearch, me);
        me.searchConnection = Ext.create('Ext.data.Connection', {
            url: me.getUrl(),
            method: 'GET',
            listeners: {
                scope: me,
                requestcomplete: me.onResults
            }
        });
        Ext.onReady(me.onDocReady, me);
    },
    applySearchForm: function(searchForm) {
        return Ext.get(searchForm);
    },
    applyResultsVisible: function(visible) {
        this.resultsCt && this.resultsCt.setStyle('display', visible ? '' : 'none');
    },
    applyResultsTpl: function(resultsTpl) {
        return (Ext.isObject(resultsTpl) && resultsTpl.isTemplate) ? resultsTpl : new Ext.XTemplate(resultsTpl);
    },
    onDocReady: function() {
        var me = this,
            searchForm = me.getSearchForm(),
            searchFieldSelector = me.getSearchFieldSelector(),
            fieldEl;
        if (!searchForm) {
            return;
        }
        fieldEl = me.fieldEl = searchForm.down(searchFieldSelector);
        me.resultsCt = searchForm.createChild({
            tag: 'ul',
            cls: 'search-results',
            style: {
                display: 'none'
            }
        });
        searchForm.on('keydown', 'onFormKeyDown', me);
        if (fieldEl) {
            fieldEl.set({
                autocomplete: 'off'
            });
            fieldEl.on({
                scope: me,
                keyup: me.onFieldKeyUp,
                focus: me.onFieldFocus
            });
        }
        Ext.getBody().on('click', 'onBodyClick', me);
    },
    onFormKeyDown: function(ev, t) {
        var me = this,
            resultsCt = me.resultsCt,
            key = ev.getKey(),
            isDown = key == ev.DOWN,
            searchResults = resultsCt.query('.search-result'),
            searchResultsLength = searchResults.length,
            lastResultIndex = searchResultsLength - 1,
            targetSearchResult, targetSearchResultIndex, nextFocusIndex;
        if (!isDown && key != ev.UP) {
            if (me.getInterceptTabs() && key == ev.TAB) {
                isDown = !ev.shiftKey;
            } else {
                return;
            }
        }
        ev.stopEvent();
        if (!this.getResultsVisible()) {
            return;
        }
        targetSearchResult = ev.getTarget('.search-result', resultsCt);
        if (targetSearchResult) {
            targetSearchResultIndex = searchResults.indexOf(targetSearchResult);
            if ((targetSearchResultIndex == 0 && !isDown) || (targetSearchResultIndex == lastResultIndex && isDown)) {
                me.fieldEl.focus();
                return;
            }
            nextFocusIndex = targetSearchResultIndex + (isDown ? 1 : -1);
        } else {
            nextFocusIndex = isDown ? 0 : lastResultIndex;
        }
        Ext.fly(searchResults[nextFocusIndex]).down('a').focus();
    },
    onFieldKeyUp: function(ev, t) {
        var me = this,
            resultsCt = me.resultsCt,
            query = t.value;
        if (me.lastTypedQuery == query) {
            return;
        }
        me.lastTypedQuery = query;
        if (t.value.length >= me.getMinChars()) {
            me.getSearchForm().addCls('is-waiting');
            me.setResultsVisible(true);
            me.searchTask.delay(me.getSearchDelay());
        } else {
            me.searchConnection.abort();
            me.setResultsVisible(false);
            me.resultsCt.update('');
            me.lastRequestedQuery = null;
        }
    },
    onFieldFocus: function(ev, t) {
        if (this.lastRequestedQuery) {
            this.setResultsVisible(true);
        }
    },
    onBodyClick: function(ev, t) {
        if (!ev.within(this.searchForm)) {
            this.setResultsVisible(false);
        }
    },
    onResults: function(connection, response) {
        var me = this,
            responseData = Ext.decode(response.responseText),
            resultsCt = me.resultsCt,
            noResultsCls = me.getNoResultsCls(),
            resultsTpl = me.getResultsTpl(),
            searchForm = me.getSearchForm();
        searchForm.removeCls('is-loading');
        if (responseData.totalResults) {
            searchForm.removeCls(noResultsCls);
            resultsTpl.overwrite(resultsCt, {
                results: responseData,
                groupResultsLimit: me.getGroupResultsLimit(),
                query: me.lastRequestedQuery
            });
        } else {
            resultsCt.update('<div class="empty-text">' + me.getNoResultsText() + '</div>');
            searchForm.addCls(noResultsCls);
        }
    },
    doSearch: function() {
        var me = this,
            fieldEl = me.fieldEl,
            searchForm = me.getSearchForm(),
            query = fieldEl && fieldEl.getValue();
        searchForm.removeCls('is-waiting');
        me.searchConnection.abort();
        if (!query || query.length < me.getMinChars() || query == me.lastRequestedQuery) {
            return;
        }
        searchForm.addCls('is-loading');
        me.searchConnection.request({
            params: {
                q: query
            }
        });
        me.lastRequestedQuery = query;
    }
});

Ext.define('Site.widget.model.AbstractModel', {
    tpl: '[instance of {Class}]',
    collectionTitleTpl: '{[(values.models && values.models.length && values.models[0].Class) || Ext.ClassManager.getName(values.widget)]}',
    getHtml: function(model) {
        return Ext.XTemplate.getTpl(this, 'tpl').apply(this.getTemplateData(model));
    },
    getTemplateData: function(model) {
        return model;
    },
    getCollectionTitle: function(models) {
        return Ext.XTemplate.getTpl(this, 'collectionTitleTpl').apply({
            models: models,
            widget: this
        });
    }
});

Ext.define('Site.widget.model.Person', {
    extend: Site.widget.model.AbstractModel,
    singleton: true,
    alias: [
        'modelwidget.Emergence\\People\\Person',
        'modelwidget.Emergence\\People\\User',
        'modelwidget.Person',
        'modelwidget.User'
    ],
    collectionTitleTpl: 'People',
    tpl: [
        '<a href="/people/{Username:defaultValue(values.ID)}" class="link-model link-person">',
        '<tpl if="PrimaryPhotoID">',
        '<div class="result-image" style="background-image:url(/thumbnail/{PrimaryPhotoID}/72x72/cropped)"></div>',
        '</tpl>',
        '<strong class="result-title">{FirstName} {LastName}</strong> ',
        '<tpl if="Username"><span class="result-info">{Username}</strong></tpl>',
        '</a>'
    ]
});

Ext.define('Site.widget.model.Tag', {
    extend: Site.widget.model.AbstractModel,
    singleton: true,
    alias: [
        'modelwidget.Tag'
    ],
    collectionTitleTpl: 'Tags',
    tpl: [
        '<a href="/tags/{Handle}" class="link-model link-tag">',
        '<strong class="result-title">{Title:htmlEncode}</strong>',
        '</a>'
    ]
});

Ext.define('Site.widget.model.CourseSection', {
    extend: Site.widget.model.AbstractModel,
    singleton: true,
    alias: 'modelwidget.Slate\\Courses\\Section',
    collectionTitleTpl: 'Course Sections',
    tpl: [
        '<a href="/sections/{Code}" class="link-model link-course-section">',
        '<strong class="result-title">{Title}</strong> ',
        '<span class="result-info">{Code}</span>',
        '</a>'
    ]
});

Ext.define('Site.widget.model.Content', {
    extend: Site.widget.model.AbstractModel,
    singleton: true,
    alias: [
        'modelwidget.Emergence\\CMS\\AbstractContent',
        'modelwidget.Emergence\\CMS\\Page',
        'modelwidget.Emergence\\CMS\\BlogPost'
    ],
    getCollectionTitle: function(models) {
        if (models && models.length) {
            return models[0].Class == 'Emergence\\CMS\\Page' ? 'Pages' : 'Blog Posts';
        } else {
            return 'Content';
        }
    },
    tpl: [
        '<tpl if="Class == \'Emergence\\\\CMS\\\\BlogPost\'">',
        '<a href="/blog/{Handle}" class="link-model link-content link-content-page">',
        '<tpl elseif="Class == \'Emergence\\\\CMS\\\\Page\'">',
        '<a href="/pages/{Handle}" class="link-model link-content link-content-blogpost">',
        '</tpl>',
        '{Title}',
        '</a>'
    ]
});

Ext.define('Site.widget.model.Event', {
    extend: Site.widget.model.AbstractModel,
    singleton: true,
    alias: [
        'modelwidget.Emergence\\Events\\Event',
        'modelwidget.Emergence\\Events\\FeedEvent'
    ],
    collectionTitleTpl: 'Events',
    tpl: [
        '<a href="/events/{Handle}" class="link-model link-event">',
        '<strong class="result-title">{Title}</strong> ',
        '<span class="result-info">{StartTime:date("l, M j, Y @ g:i a")}</span>',
        '</a>'
    ],
    getTemplateData: function(model) {
        return Ext.applyIf({
            StartTime: model.StartTime && new Date(model.StartTime * 1000)
        }, model);
    }
});

Ext.define('Site.Common', {
    singleton: true,
    constructor: function() {
        Ext.ClassManager.addAlias('Site.widget.model.Person', 'modelwidget.Slate\\People\\Student');
        Ext.onReady(this.onDocReady, this);
    },
    onDocReady: function() {
        var me = this,
            body = Ext.getBody(),
            modalTemplate;
        me.siteSearch = Ext.create('Site.widget.Search', {
            searchForm: body.down('.search-form.site-search')
        });
        modalTemplate = Ext.create('Ext.XTemplate', [
            '<div class="modal-mask">',
            '<div class="modal-dialog">',
            '<header class="modal-header">',
            '<div class="modal-close-button">&times;</div>',
            '<h2 class="modal-title">{title}</h2>',
            '</header>',
            '<div class="modal-body">{body}</div>',
            '<footer class="modal-buttons">',
            '<button class="cancel">{no}</button>',
            '<button class="<tpl if="destructive">destructive<tpl else>primary</tpl>">{yes}</button>',
            '</footer>',
            '</div>',
            '</div>'
        ]);
        body.on('click', function(ev, t) {
            ev.stopEvent();
            var confirmLink = ev.getTarget('.confirm', null, true),
                successTarget = confirmLink.getAttribute('data-confirm-success-target'),
                successMessage = confirmLink.getAttribute('data-confirm-success-message'),
                confirmData = {
                    title: confirmLink.getAttribute('data-confirm-title') || 'Confirm',
                    body: confirmLink.getAttribute('data-confirm-body') || 'Are you sure?',
                    yes: confirmLink.getAttribute('data-confirm-yes') || 'Yes',
                    no: confirmLink.getAttribute('data-confirm-no') || 'No',
                    url: confirmLink.getAttribute('data-confirm-url') || confirmLink.getAttribute('href'),
                    destructive: !!confirmLink.getAttribute('data-confirm-destructive')
                },
                modal = modalTemplate.append(body, confirmData, true);
            body.addCls('blurred');
            modal.on('click', function(ev, t) {
                t = ev.getTarget('button', null, true);
                if (t.hasCls('modal-close-button') || t.hasCls('cancel')) {
                    modal.destroy();
                    body.removeCls('blurred');
                } else if (t.hasCls('destructive') || t.hasCls('primary')) {
                    modal.down('.modal-dialog').addCls('waiting');
                    Ext.Ajax.request({
                        url: confirmData.url,
                        method: 'POST',
                        headers: {
                            Accept: 'application/json'
                        },
                        success: function(response) {
                            var r = Ext.decode(response.responseText),
                                successTargetEl = successTarget && confirmLink.up(successTarget);
                            if (r.success) {
                                modal.destroy();
                                body.removeCls('blurred');
                                if (successTargetEl) {
                                    if (successMessage) {
                                        successTargetEl.replaceWith({
                                            tag: 'p',
                                            cls: 'status',
                                            html: successMessage
                                        });
                                    } else {
                                        successTargetEl.destroy();
                                    }
                                }
                            } else {
                                modal.down('.modal-body').update('There was a problem processing your request. Would you like to try again?');
                                modal.down('.cancel').update('Cancel');
                                modal.down('.modal-buttons :last-child').update('Try Again');
                            }
                        },
                        failure: function(response) {
                            modal.down('.modal-body').update('There was a problem processing your request. Would you like to try again?');
                            modal.down('.cancel').update('Cancel');
                            modal.down('.modal-buttons :last-child').update('Try Again');
                        }
                    });
                }
            }, null, {
                delegate: 'button'
            });
        }, null, {
            delegate: '.confirm'
        });
    }
});

