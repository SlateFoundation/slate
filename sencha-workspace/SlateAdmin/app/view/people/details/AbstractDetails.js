/*jslint browser: true, undef: true *//*global Ext*/

/**
 * @abstract
 * A base class for panels that can be added to {@link SlateAdmin.view.people.Manager}'s details tabpanel.
 *
 * Provides workflow for loading the selected person's record just-in-time.
 *
 * Concrete classes should implement {@link #method-onPersonLoaded}
 */
Ext.define('SlateAdmin.view.people.details.AbstractDetails', {
    extend: 'Ext.panel.Panel',
    xtype: 'people-detailspanel',

    config: {
        loadedPerson: null
    },

    /**
     * @private
     */
    updateLoadedPerson: function(person, oldPerson) {
        var me = this;

        me.onPersonLoaded(person, oldPerson);
        me.fireEvent('personloaded', me, person, oldPerson);
    },


    /**
     * Called when the tab is activated or a new person is selected.
     * @template
     * @private
     * @param {Slate.model.person.Person} person The person being loaded
     * @param {Slate.model.person.Person} [oldPerson] The previously loaded person
     */
    onPersonLoaded: function(person, oldPerson) {
    }
});