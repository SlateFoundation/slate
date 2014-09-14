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
            useNull: true
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
            useNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            useNull: true
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
            useNull: true
        },
        {
            name: "StudentsCapacity",
            type: "int",
            useNull: true
        },
        {
            name: "TermID",
            type: "int",
            useNull: true
        },
        {
            name: "ScheduleID",
            type: "int",
            useNull: true
        },
        {
            name: "LocationID",
            type: "int",
            useNull: true
        },
        {
            name: 'StudentsCount',
            type: 'int'
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/sections'
    },
    
    toUrl: function() {
        return '/sections/' + this.get('Code');
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