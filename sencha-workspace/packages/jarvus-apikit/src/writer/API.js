Ext.define('Jarvus.writer.API', {
    extend: 'Ext.data.writer.Json',
    alias: 'writer.api',

    config: {
        /**
         * @cfg {Boolean} [writePhantomId=false] Configure `false` to supress sending client id with phantom records
         */
        writePhantomId: false,


        allowSingle: false
    },

    /**
     * Override to implement {@link #cfg-writePhantomId}
     *
     * This technique of flipping writeRecordId on and off before calling the parent
     * implementation is inefficient, but allows us to avoid duplicating the rather
     * intricate logic contained in the parent implementation for determining what
     * property the id would have been written to in order to delete it.
     */
    getRecordData: function(record) {
        var me = this,
            restoreWriteRecordId = false,
            data;

        if (record.phantom && me.getWriteRecordId() && !me.getWritePhantomId()) {
            me.setWriteRecordId(false);
            restoreWriteRecordId = true;
        }

        data = this.callParent(arguments);

        if (restoreWriteRecordId) {
            me.setWriteRecordId(true);
        }

        return data;
    }
});