Ext.define('Emergence.proxy.Records', {
    extend: 'Jarvus.proxy.API',
    alias: 'proxy.records',
    alternateClassName: 'Emergence.ext.proxy.Records',
    requires: [
        'Emergence.util.API',
        'Ext.data.reader.Json',
        'Ext.data.writer.Json',
        'Ext.data.Request',
        'Ext.util.Collection'
    ],

    config: {
        connection: 'Emergence.util.API',
        include: null,
        relatedTable: null,
        summary: false,
        injectRelatedTables: true,
        injectModels: false,

        /**
         * @cfg The base URL for the managed collection (e.g. '/people')
         * @required
         */
        url: null,

        idParam: 'ID',
        pageParam: false,
        startParam: 'offset',
        limitParam: 'limit',
        sortParam: 'sort',
        directionParam: 'dir',
        filterParam: 'q',
        simpleSortMode: true,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total',
            messageProperty: 'message',
            keepRawData: true
        },
        writer: {
            type: 'json',
            rootProperty: 'data',
            writeAllFields: false,
            allowSingle: false
        }
    },


    constructor: function() {
        this.relatedCollections = {};
        this.callParent(arguments);
    },


    // config handlers
    applyInclude: function(include) {
        if (!include || !include.length) {
            return null;
        }

        return typeof include == 'string' ? [include] : include;
    },

    updateInclude: function(include) {
        this._includeParam = include ? include.join(',') : null;
    },

    applyRelatedTable: function(relatedTable) {
        var relatedTableConfigs = [],
            length, i = 0, config, relationship, model;

        if (!relatedTable || !relatedTable.length) {
            return null;
        }

        if (!Ext.isArray(relatedTable)) {
            relatedTable = [relatedTable];
        }

        length = relatedTable.length;
        for (; i < length; i++) {
            config = relatedTable[i];

            if (typeof config == 'string') {
                config = {
                    relationship: config
                };
            }

            relationship = config.relationship;

            if (!relationship) {
                Ext.Logger.error('relatedTable config missing required attribute relationship');
            }

            model = config.model;

            if (typeof model == 'string') {
                Ext.syncRequire(model);
                model = config.model = Ext.ClassManager.get(model);
            }

            if (!config.foreignKey) {
                config.foreignKey = model ? model.idProperty : 'ID';
            }

            if (!config.localKey) {
                config.localKey = relationship + 'ID';
            }

            relatedTableConfigs.push(config);
        }

        return relatedTableConfigs;
    },

    updateRelatedTable: function(relatedTable, oldRelatedTable) {
        var relatedCollections = this.relatedCollections,
            initializedTables = [],
            relatedLength, relatedIndex, config, relationship, Model, foreignKey;

        this._relatedTableParam = relatedTable ? Ext.Array.pluck(relatedTable, 'relationship').join(',') : null;

        if (relatedTable) {
            relatedLength = relatedTable.length;
            relatedIndex = 0;
            for (; relatedIndex < relatedLength; relatedIndex++) {
                config = relatedTable[relatedIndex];
                relationship = config.relationship;
                Model = config.model;
                foreignKey = config.foreignKey;

                relatedCollections[relationship] = new Ext.util.Collection({
                    // eslint-disable-next-line no-loop-func
                    decoder: Model ? function(data) {
                        return new Model(data);
                    } : null,
                    // eslint-disable-next-line no-loop-func
                    keyFn: Model ? null : function(data) {
                        return data[foreignKey];
                    }
                });

                initializedTables.push(relationship);
            }
        }

        if (oldRelatedTable) {
            relatedLength = oldRelatedTable.length;
            relatedIndex = 0;
            for (; relatedIndex < relatedLength; relatedIndex++) {
                relationship = oldRelatedTable[relatedIndex].relationship;

                if (initializedTables.indexOf(relationship) == -1) {
                    delete relatedCollections[relationship];
                }
            }
        }
    },


    /**
     * TODO: overriding this entire method may no longer be necessary given the new Jarvus.proxy.API's template methods
     */
    buildRequest: function(operation) {
        var me = this,
            initialParams = Ext.apply({}, typeof operation.getParams == 'function' ? operation.getParams() : operation.params),
            // Clone params right now so that they can be mutated at any point further down the call stack
            params = Ext.applyIf(initialParams, typeof me.getExtraParams == 'function' ? me.getExtraParams() : me.extraParams || {}),
            request = new Ext.data.Request({
                action: typeof operation.getAction == 'function' ? operation.getAction() : operation.action,
                records: operation.getRecords(),
                operation: operation,
                params: Ext.applyIf(params, me.getParams(operation))
            });

        request.setUrl(operation.getUrl() || me.buildUrl(request));
        request.setUrlParams(me.getUrlParams(request));
        request.setMethod(me.getMethod(request));
        request.setHeaders(me.getHeaders(request));
        request.setTimeout(me.getTimeout(request));
        request.setWithCredentials(me.getWithCredentials());

        // compatibility with Jarvus.ext.override.proxy.DirtyParams since we're entirely replacing the buildRequest method it overrides
        if (typeof me.clearParamsDirty == 'function') {
            me.clearParamsDirty();
        }

        operation.setRequest(request);

        return request;
    },

    buildUrl: function(request) {
        var me = this,
            baseUrl = me.getUrl(request),
            idAppended = false,
            action = typeof request.getAction == 'function' ? request.getAction() : request.action,
            operation = typeof request.getOperation == 'function' ? request.getOperation() : request.operation,
            id, idParam, handleParam;


        id = operation.recordHandle;
        if (id) {
            // use recordHandle if provided
            baseUrl += '/' + encodeURIComponent(id);
            idAppended = true;
        } else {
            // apply id to path if idProperty is ID or Handle
            id = typeof operation.getId == 'function' ? operation.getId() : operation.id;
            idParam = typeof me.getIdParam == 'function'? me.getIdParam() : me.idParam;
            handleParam = (typeof me.getModel == 'function' ? me.getModel() : me.model).handleProperty || 'Handle';

            if (id && ((idParam == 'ID' && id > 0) || idParam == handleParam)) {
                baseUrl += '/' + encodeURIComponent(id);
                idAppended = true;
            }
        }

        switch (action) {
            case 'read':
                break;
            case 'create':
            case 'update':
                baseUrl += idAppended ? '' : '/save';
                break;
            case 'destroy':
                baseUrl += idAppended ? '/delete' : '/destroy';
                break;
            default:
                Ext.Logger.error('Unhandled request action');
        }

        return baseUrl;
    },

    getUrlParams: function(request) {
        var me = this,
            operation = typeof request.getOperation == 'function' ? request.getOperation() : request.operation,
            includeParam = operation.include,
            relatedTableParam = me._relatedTableParam,
            summary = me.getSummary(),
            idParam = me.idParam,
            id = typeof operation.getId == 'function' ? operation.getId() : operation.id,
            params = me.callParent(arguments);

        if (id && idParam != 'ID') {
            params[idParam] = id;
        }

        if (includeParam) {
            if (Ext.isArray(includeParam)) {
                includeParam = includeParam.join(',');
            }
        } else {
            includeParam = me._includeParam;
        }

        if (includeParam) {
            params.include = includeParam;
        }

        if (relatedTableParam) {
            params.relatedTable = relatedTableParam;
        }

        if (summary) {
            params.summary = 'true';
        }

        return params;
    },

    encodeFilters: function(filters) {
        var out = [],
            length = filters.length,
            i = 0, filterData, filterValue;

        for (; i < length; i++) {
            filterData = filters[i].serialize();
            filterValue = filterData.value.toString();
            out[i] = filterData.property+ ':' + (filterValue.match(/\s/) ? '"' + filterValue + '"' : filterValue);
        }

        return out.join(' ');
    },

    getMethod: function(request) {
        switch (request.getAction()) {
            case 'read':
                return 'GET';
            case 'create':
            case 'update':
            case 'destroy':
                return 'POST';
            default:
                Ext.Logger.error('Unhandled request action');
                return null;
        }
    },

    extractResponseData: function() {
        var me = this,
            relatedCollections = me.relatedCollections,
            relatedTableConfigs = me.getRelatedTable(),
            injectRelatedTables = me.getInjectRelatedTables(),
            injectModels = me.getInjectModels(),
            rootProperty = me.getReader().getRootProperty(),
            data = me.callParent(arguments),
            relatedData = data.related,
            length, i = 0, config, relationship, relatedCollection, localKey,
            recordsData, recordsLength, recordIndex, recordData, relatedRecord;

        if (relatedTableConfigs && relatedData) {
            length = relatedTableConfigs.length;

            for (; i < length; i++) {
                config = relatedTableConfigs[i];
                relationship = config.relationship;
                relatedCollection = relatedCollections[relationship];

                if (config.clearOnLoad) {
                    relatedCollection.clear();
                }

                relatedCollection.add(relatedData[relationship]);

                if (injectRelatedTables) {
                    localKey = config.localKey;
                    recordsData = rootProperty ? data[rootProperty] : data;
                    recordsLength = recordsData.length;
                    recordIndex = 0;

                    for (; recordIndex < recordsLength; recordIndex++) {
                        recordData = recordsData[recordIndex];
                        relatedRecord = relatedCollection.getByKey(recordData[localKey]);
                        recordData[relationship] = !injectModels && relatedRecord instanceof Ext.data.Model ? relatedRecord.getData() : relatedRecord;
                    }
                }
            }
        }

        return data;
    },

    setException: function(operation, response) {
        var status = response.status,
            responseData = response.data,
            message = responseData && responseData.message;

        if (!message) {
            if (status == 400) {
                message = 'The server rejected this operation, please check your input and try again. If this problem persists, please backup your work to another application and report this to your technical support contact';
            } else {
                message = 'This operation failed for an unexpected reason, please check your input and try again. If this problem persists, please backup your work to another application and report this to your technical support contact';
            }
        }

        operation.setException(message);
    }
});
