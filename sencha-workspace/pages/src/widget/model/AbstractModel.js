/*jslint browser: true, undef: true *//*global Ext*/

/**
 * @abstract
 * Base class for widgets that help render model instances
 */
Ext.define('Site.widget.model.AbstractModel', {

    /**
     * @cfg
     */
    tpl: '[instance of {Class}]',

    /**
     * @cfg
     */
    collectionTitleTpl: '{[(values.models && values.models.length && values.models[0].Class) || Ext.ClassManager.getName(values.widget)]}',

    /**
     * Called to render markup representation of model instance
     * @template
     */
    getHtml: function(model) {
        return Ext.XTemplate.getTpl(this, 'tpl').apply(this.getTemplateData(model));
    },

    /**
     * Called to get template data for given model
     * @template
     */
    getTemplateData: function(model) {
        return model;
    },

    /**
     * Called to retrieve a title for a collection of model instances
     * @template
     * @param {Ext.data.Model[]} [models] Optional list of instances being described
     */
    getCollectionTitle: function(models) {
        return Ext.XTemplate.getTpl(this, 'collectionTitleTpl').apply({models: models, widget: this});
    }
});