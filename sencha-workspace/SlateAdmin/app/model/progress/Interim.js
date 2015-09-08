/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.Interim', {
	extend: 'Ext.data.Model',
	requires: [
		'Ext.data.proxy.Ajax',
        'SlateAdmin.proxy.Records',
        'Ext.data.validator.Presence'
	],

	idProperty: 'ID',
	fields: [
		'Status',
		'Student',
		'Section',
		{
			name: 'ID',
			type: 'integer',
			useNull: true
		}, {
			name: 'Class',
			defaultValue: 'Group'
		}, {
			name: 'Created',
			type: 'date',
			dateFormat: 'timestamp',
			useNull: true
		}, {
			name: 'CreatorID',
			type: 'integer',
			useNull: true
		}, {
			name: 'RevisionID',
			type: 'integer',
			useNull: true
		}, {
			name: 'StudentID',
			type: 'integer'
		}, {
			name: 'CourseSectionID',
			type: 'integer'
		}, {
			name: 'TermID',
			type: 'integer'
		}, {
			name: 'Grade',
			type: 'string',
			useNull: true
		}, {
			name: 'Term'
		}, {
			name: 'Comments',
			type: 'string',
			useNull: true
		}, {
			name: 'Saved',
			type: 'date',
			dateFormat: 'timestamp',
			useNull: true
		}
	],
	validators: [{
		type: 'presence',
		name: 'Grade',
		message: 'Please enter a grade for this interim report'
	}],
	proxy: {
		type: 'slaterecords',
		include: [
		    'Student',
		    'Section',
		    'Term'
        ],
        url: '/interims',
		api: {
			read:'/interims/mystudents'
		},
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
		writer: {
    		type: 'json',
    	    writeAllFields: true,
    	    allowSingle: false,
    	    rootProperty: 'data'
        }
	}
});
