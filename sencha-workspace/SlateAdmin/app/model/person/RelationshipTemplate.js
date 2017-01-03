/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.RelationshipTemplate', {
    extend: 'Ext.data.Model',

    idProperty: 'label',

    fields: [
        {
            name: 'label',
            type: 'string',
            mapping: 'Relationship.Label'
        },
        {
            name: 'class',
            type: 'string',
            mapping: 'Relationship.Class'
        },
        {
            name: 'Relationship'
        },
        {
            name: 'Person'
        },
        {
            name: 'Inverse'
        }
    ],

    getInverseLabel: function(gender) {
        var inverse = this.get('Inverse');
        return (inverse && inverse[gender || 'Neutral']) || null;
    }
});
