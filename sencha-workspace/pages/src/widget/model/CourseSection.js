/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.CourseSection', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: 'modelwidget.CourseSection',

    collectionTitleTpl: 'Course Sections',

    tpl: [
        '<a href="/sections/{Handle}" class="link-model link-course-section">',
            '<strong class="result-title">{Title}</strong> ',
            '<span class="result-info">{Code}</span>',
        '</a>'
    ]
});