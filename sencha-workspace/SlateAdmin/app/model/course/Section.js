/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.course.Section', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int",
            allowNull: true
        },
        {
            name: "Class",
            type: "string",
            defaultValue: "Slate\\Courses\\Section"
        },
        {
            name: "Created",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            allowNull: true
        },
        {
            name: "CourseID",
            type: "int"
        },
        {
            name: "Title",
            type: "string"
        },
        {
            name: "Code",
            type: "string"
        },
        {
            name: "Status",
            type: "string",
            defaultValue: "Live"
        },
        {
            name: "Notes",
            type: "string",
            allowNull: true
        },
        {
            name: "StudentsCapacity",
            type: "int",
            allowNull: true
        },
        {
            name: "TermID",
            type: "int",
            allowNull: true
        },
        {
            name: "ScheduleID",
            type: "int",
            allowNull: true
        },
        {
            name: "LocationID",
            type: "int",
            allowNull: true
        },
        {
            name: 'StudentsCount',
            type: 'int'
        },
        {
            name: 'Schedule'
        },
        {
            name: 'Location'
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/sections'
    },

    getDisplayName: function() {
        return this.get('Title');
    },

    toUrl: function() {
        return 'course-sections/lookup/' + this.get('Code');
    },

    getLink: function() {
        var me = this,
            displayName = me.getDisplayName(),
            url = me.toUrl();

        return url ? '<a href="#'+url+'">'+displayName+'</a>' : displayName;
    }


    // model methods
//    getDisplayName: function() {
//        return this.get('Title');
//    },

//    getLink: function() {
//
//        if (this.phantom) {
//            return this.getDisplayName();
//        }
//
//        return '<a href="/sections/'+this.get('Handle')+'" target="_blank">'+this.getDisplayName()+'</a>';
//    }
});