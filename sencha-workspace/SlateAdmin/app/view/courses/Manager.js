/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'courses-manager',
    requires: [
        'SlateAdmin.view.courses.Grid'
//        'Slate.view.courses.Header',
//        'Slate.view.courses.RosterGrid',
//        'Slate.view.courses.Editor'
    ],


    // courses-manager config
    config: {
        selectedCourse: null
    },


    // container config
    layout: 'border',
    items: [{
        region: 'center',
    
        xtype: 'courses-grid'
    },{
        region: 'east',

        xtype: 'container',
        itemId: 'detailCt',
        split: true,
        stateful: true,
        stateId: 'courseDetails',
        disabled: true,
        width: 450,

//        items: [{
//            xtype: 'course-header',
//            disabled: false,
//            height: 150
//        },{
//            xtype: 'tabpanel',
//            flex: 1,
//            tabBar: {
//                ui: 'plain',
//                defaults: {
//                    flex: 1
//                }
//            },
//            items:[{
//                xtype: 'course-rostergrid',
//                disabled: true,
//                title: 'Roster'
//            },{
//                xtype: 'course-editor',
//                disabled: true,
//                title: 'Editor'
//            }]
//        }]
    }],


    //helper functions
    updateSection: function(section) {
        if(!section)
            return false;

        this.section = section;

        var header = this.down('course-header');

        header.update(header.tpl.apply(section.data));
    },

    getSection: function(){
        return this.section;
    }
});