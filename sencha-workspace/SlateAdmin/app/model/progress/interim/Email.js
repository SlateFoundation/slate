/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.interim.Email', {
    extend: 'Ext.data.Model',
    
    
    fields: [{
		name: 'Student'
    }, {
    	name: 'FirstName',
    	mapping: 'Student.FirstName'
    }, {
    	name: 'LastName',
    	mapping: 'Student.LastName'
    }, {
		name: 'EmailBody'
    }, {
		name: 'Recipients'
    }],
    
    proxy: {
    	type: 'ajax',
    	url: '/interims/email',
    	reader: {
    		type: 'json',
    		root: 'data'
    	}
    }
});
