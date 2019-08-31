/**
 * Combines two earlier store-specific implementations into a generic tool:
 * - https://github.com/JarvusInnovations/spark-classroom/blob/51895b6cb1b37b3ea0fa1b681a983a281528afbd/sencha-workspace/SparkClassroomTeacher/app/store/StudentSparkpoints.js
 * - https://github.com/SlateFoundation/slate-cbl/blob/04d8d2da4c899ee225fac2f7a05e7b1cfbadd8e0/sencha-workspace/packages/slate-cbl/src/store/DemonstrationSkills.js
 */
Ext.define('Jarvus.override.data.MergeStoreData', {
    override: 'Ext.data.Store',


    /**
     * Reads an array of raw data or records into the store, updating records that already exist. If demonstration
     * is provided, existing skills not in the new list will be removed and embedded demonstration data may be omitted.
     *
     * @param {Object[]} data Array of raw record data
     * @param {Object} [options]
     * @param {boolean} [options.removeMissing=false] True to remove all existing records not present in the incoming array
     */
    mergeData: function(data, options) {
        options = options || {};

        // eslint-disable-next-line vars-on-top
        var me = this,
            reader = me.getProxy().getReader(),
            Model = me.getModel(),
            removeMissing = options.removeMissing || false,
            existingRecords = removeMissing && me.collect(Model.getIdProperty()),
            i, len,
            datum, id, existingRecord,
            newRecords = [];


        me.beginUpdate();


        // update existing records and build array of new records
        for (i = 0, len = data.length; i < len; i++) {
            datum = data[i];

            if (datum.isModel) {
                id = datum.getId();
            } else {
                id = Model.getIdFromData(datum);
                datum = reader.extractModelData(datum);
            }

            if (id && removeMissing) {
                Ext.Array.remove(existingRecords, id);
            }

            existingRecord = id && me.getById(id);
            if (existingRecord) {
                if (datum.isModel) {
                    console.groupCollapsed('Updating existing record: %o', existingRecord);
                    console.table([existingRecord.getData(), datum.getData({ persist: true })]);
                    console.groupEnd();
                    existingRecord.set(datum.getData({ persist: true }), {
                        dirty: false,
                        convert: false
                    });
                } else {
                    existingRecord.set(datum, {
                        dirty: false
                    });
                }
            } else {
                newRecords.push(datum);
            }
        }


        // add new records all together
        me.add(newRecords);


        // remove missing skills from same demonstration
        if (removeMissing) {
            for (i = 0, len = existingRecords.length; i < len; i++) {
                existingRecords[i] = me.getById(existingRecords[i]);
            }

            me.remove(existingRecords);
        }


        me.endUpdate();
    },

    /**
     * Loads data from server using configured proxy+reader but uses {@link #method-mergeRawData}
     * to incrementally apply it to existing
     *
     * @param {Object} [options]
     * @param {boolean} [options.removeMissing=true] True to remove all existing records not present in the incoming array
     */
    loadUpdates: function(options) {
        options = options || {};

        // eslint-disable-next-line vars-on-top
        var me = this,
            removeMissing = options.removeMissing || true;

        me.fetch({
            callback: function(incomingRecords) {
                me.mergeData(incomingRecords, {
                    removeMissing: removeMissing
                });
            }
        });
    }
});