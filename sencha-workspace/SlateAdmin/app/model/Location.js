/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Location', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [{
        name: "ID",
        type: "int",
        useNull: true
    }, {
        name: "Class",
        type: "string",
        defaultValue: "Emergence\\Locations\\Location"
    }, {
        name: "Created",
        type: "date",
        dateFormat: "timestamp",
        useNull: true
    }, {
        name: "CreatorID",
        type: "int",
        useNull: true
    }, {
        name: "RevisionID",
        type: "int",
        useNull: true
    }, {
        name: "Title",
        type: "string"
    }, {
        name: "Handle",
        type: "string"
    }, {
        name: "Status",
        type: "string",
        defaultValue: "Live"
    }, {
        name: "Description",
        type: "string",
        useNull: true
    }, {
        name: "ParentID",
        type: "int",
        useNull: true
    }, {
        name: "Left",
        type: "int",
        useNull: true
    }, {
        name: "Right",
        type: "int",
        useNull: true
    }, {
        name: 'namesPath',
        type: 'string',
        persist: false
    }, {
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Title');
        }
    }, {
        name: 'leaf',
        type: 'boolean',
        persist: false,
        convert: function(v, r) {
            if (typeof v == 'boolean') {
                return v;
            } else {
                return r.raw.Left == r.raw.Right - 1;
            }
        }
    }],
    
    /*
copyFrom: function(sourceRecord) {
        var me = this,
            fields = me.fields.items,
            fieldCount = fields.length,
            modifiedFieldNames = [],
            field, i = 0,
            myData,
            sourceData,
            idProperty = me.idProperty,
            name,
            value;

        if (sourceRecord) {
            myData = me[me.persistenceProperty];
            sourceData = sourceRecord[sourceRecord.persistenceProperty];
            for (; i < fieldCount; i++) {
                field = fields[i];
                name = field.name;
                // Do not use setters.
                // Copy returned values in directly from the data object.
                // Converters have already been called because new Records
                // have been created to copy from.
                // This is a direct record-to-record value copy operation.
                // don't copy the id, we'll do it at the end
                if (name != idProperty) {
                    value = sourceData[name];

                    // If source property is specified, and value is different
                    // copy field value in and build updatedFields
                    debugger;
                    if (value !== undefined && (!me.isEqual(myData[name], value) || !me.isEqual(this.modified[name], value))) {
                        myData[name] = value;
                        modifiedFieldNames.push(name);
                    }
                }
            }

            // If this is a phantom record being updated from a concrete record, copy the ID in.
            if (me.phantom && !sourceRecord.phantom) {
                // beginEdit to prevent events firing
                // commit at the end to prevent dirty being set
                me.beginEdit();
                me.setId(sourceRecord.getId());
                me.endEdit(true);
                me.commit(true);
            }
        }
        return modifiedFieldNames;
    },
*/
    

    validations: [{
        type: 'presence',
        field: 'Title'
    },{
        type: 'presence',
        field: 'Status'
    }],

    proxy: {
        type: 'slaterecords',
        url: '/locations'
    }
});