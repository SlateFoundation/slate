/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.Report', {
    extend: 'Ext.form.Panel',
    xtype: 'progress-interims-report',
    requires: [
        'Ext.form.field.Display',
        'Ext.form.field.ComboBox',
        'Ext.form.field.HtmlEditor'
    ],

    title: 'Interim Report',
    bodyPadding: 15,
    bbar: [{
        text: 'Delete Report',
        action: 'delete',
        itemId: 'deleteInterim',
        disabled: true
    },{
        xtype: 'tbfill'
    },{
        text: 'Cancel Changes',
        action: 'cancel'
    },{
        text: 'Save as Draft',
        action: 'save',
        status: 'Draft'
    },{
        text: 'Publish',
        action: 'save',
        status: 'Published'
    }],
    defaults: {
        labelWidth: 70,
        labelAlign: 'right',
        anchor: '100%'
    },
    items: [{
        xtype: 'displayfield',
        fieldLabel: 'Student',
        itemId: 'Student'
    },{
        xtype: 'displayfield',
        fieldLabel: 'Section',
        itemId: 'Section'
    },{
        xtype: 'displayfield',
        fieldLabel: 'Term',
        itemId: 'Term'
    },{
        xtype: 'combobox',
        fieldLabel: 'Grade',
        name: 'Grade',
        width: 125,
        itemId: 'courseGrade',
        anchor: false,
        queryMode: 'local',
        editable: false,
        forceSelection: true,
        triggerAction: 'all',
        store: ['D', 'F', 'N/A']
    },{
        xtype: 'htmleditor',
        fieldLabel: 'Comments',
        name: 'Comments',
        anchor: '100% -150',
        enableFont: false
    }],
    loadRecord: function(record) {

        var me = this,
            hash,
            student = record.get('Student'),
            section  = record.get('Section'),
            fn = student.FirstName,
            ln = student.LastName,
            email = student.Email,
            id = student.ID,
            name;

        if(fn && ln) {
            name = fn + ' '+ ln;
        }
        else if(fn) {
            name = fn;
        }
        else if(email) {
            name = email;
        }
        else {
            name = 'Person #'+id;
        }

        if(student.Username) {
            hash = '#people//'+student.Username;
        } else {
            hash = '#people//?id='+student.ID;
        }

        me.getComponent('Student').setValue('<a href="'+hash+'">'+name+'</a>');
        me.getComponent('Section').setValue('<a href="http://scienceleadership.org/sections/'+section.Handle+'" target="_blank">'+section.Title+'</a>');
        me.getComponent('Term').setValue(record.get('Term').Title);

        me.callParent(arguments);
    }

});
