/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Location
 */
Ext.define('SlateAdmin.model.Location', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    /** @property idProperty="ID" */
    idProperty: 'ID',

    fields: [
        {
            /**
             * @field {int} ID
             * The internal id
             */
            name: "ID",
            type: "int",
            allowNull: true
        },
        {
            /**
             * @field {string} [Class="Emergence\\Locations\\Location"]
             * The Emergence class.
             */
            name: "Class",
            type: "string",
            defaultValue: "Emergence\\Locations\\Location"
        },
        {
            /**
             * @field {date} Created
             * - **allowNull**: true
             * - **dateFormat**: timestamp
             */
            name: "Created",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true
        },
        {
            /** @field {int} CreatorID */
            name: "CreatorID",
            type: "int",
            allowNull: true
        },
        {
            /** @field {int} RevisionID */
            name: "RevisionID",
            type: "int",
            allowNull: true
        },
        {
            /** @field {string} Title */
            name: "Title",
            type: "string"
        },
        {
            /** @field {string} Handle */
            name: "Handle",
            type: "string"
        },
        {
            /** @field {string} [Status="Live"] */
            name: "Status",
            type: "string",
            defaultValue: "Live"
        },
        {
            /** @field {string} Description */
            name: "Description",
            type: "string",
            allowNull: true
        },
        {
            /** @field {string} ParentID */
            name: "ParentID",
            type: "int",
            allowNull: true
        },
        {
            /** @field {int} Left */
            name: "Left",
            type: "int",
            allowNull: true
        },
        {
            /** @field {int} Right */
            name: "Right",
            type: "int",
            allowNull: true
        }
    ],

    /**
     * @property proxy
     * @property proxy.type="slaterecords" {@link SlateAdmin.proxy.Records}
     * @property proxy.url="/locations"
     */
    proxy: {
        type: 'slaterecords',
        url: '/locations'
    }
});
