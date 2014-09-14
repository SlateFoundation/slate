/*jslint browser: true, undef: true *//*global Ext*/

/**
 * @abstract
 * A base class for panels that can be added to {@link SlateAdmin.view.courses.sections.Manager}'s details tabpanel.
 * 
 * Provides workflow for loading the selected section's record just-in-time.
 * 
 * Concrete classes should implement {@link #method-onSectionLoaded}
 */
Ext.define('SlateAdmin.view.courses.sections.details.AbstractDetails', {
    extend: 'Ext.panel.Panel',
    xtype: 'courses-sections-detailspanel',
    
    config: {
        loadedSection: null
    },
    
    /**
     * @private
     */
    updateLoadedSection: function(section, oldSection) {
        var me = this;
        
        me.onSectionLoaded(section, oldSection);
        me.fireEvent('sectionloaded', me, section, oldSection);
    },
    
    
    /**
     * Called when the tab is activated or a new section is selected.
     * @template
     * @private
     * @param {SlateAdmin.model.course.Section} section The section being loaded
     * @param {SlateAdmin.model.course.Section} [oldSection] The previously loaded section
     */
    onSectionLoaded: function(section, oldSection) {
    }
});