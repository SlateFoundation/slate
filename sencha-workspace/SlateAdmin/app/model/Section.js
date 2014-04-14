/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Section', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    
    // model config
    idProperty: 'ID',

    fields: [
        'Handle',
        'Title',
        'Code',
        'Status',
        'Notes',
        {
            name: 'ID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'Class',
            defaultValue: 'Group'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true
        },
        {
            name: 'CreatorID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'TermID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'ScheduleID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'LocationID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'StudentsCapacity',
            type: 'integer'
        },
        {
            name: 'Course',
            sortType: function(v){
                return v ? v.Title : null;
            }
        },
        {
            name: 'CourseTitle',
            mapping: 'Course.Title'
        },
        {
            name: 'Schedule',
            sortType: function(v){
                return v ? v.Title : null;
            }
        },
        {
            name: 'Location',
            sortType: function(v){
                return v ? v.Title : null;
            }
        },
        {
            name: 'Term',
            sortType: function(v){
                return v ? v.Title : null;
            }
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/sections',
        sortParam: false,
        groupParam: false,
        pageParam: false
    },


    // model methods
    getDisplayName: function() {
        return this.get('Title');
    },

    getLink: function() {

        if(this.phantom)
            return this.getDisplayName();

        return '<a href="/sections/'+this.get('Handle')+'" target="_blank">'+this.getDisplayName()+'</a>';
    }
});