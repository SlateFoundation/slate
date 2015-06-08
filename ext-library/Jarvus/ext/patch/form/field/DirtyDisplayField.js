Ext.define('Jarvus.ext.patch.form.field.DirtyDisplayField', {
    override: 'Ext.form.field.Display'

    ,isDirty: function() {
        return false;
    }

});