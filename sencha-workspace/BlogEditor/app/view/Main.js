/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,BlogEditor*/
Ext.define("BlogEditor.view.Main", {
    extend: 'Ext.Panel'
    ,alias: 'widget.blogeditor-view'
    ,record: null
    ,items:[{
		xtype: 'form'
		,height: 600	
		,defaults: {
			height: 50
			,width: 1000
		}
		,items: [{
			xtype: 'textfield'
			,name: 'Title'
			,emptyText: 'Blog Ttile'
		},{
			tbar: [{
				text: 'Tags'
				,menu: {
					plain: true
					,items: [{
						name: 'tags'
						,xtype: 'combobox'
				        ,fieldLabel: 'Tags'
				        ,allowBlank: true
				        ,displayField: 'Title'
				        ,valueField: 'ID'
				        ,forceSelection: true
				        ,queryMode: 'local'
				        ,typeAhead: true
				        ,store: {
				            autoLoad: true
				            ,fields: [
				                {name: 'ID', type: 'int'}
				                ,'Title'
				            ]
				            ,proxy: {
				                type: 'ajax'
				                ,url: '/tags/json'
				                ,reader: {
				                    type: 'json'
				                    ,root: 'data'
				                }
				            }
						}
					}]
				}
			},{
				text: 'Status'
				,name: 'Status'
				,menu: {
						plain: true
						,items: [{
							text: 'Draft'
						},{
							text: 'Published'
						}]
					}
			},{
				text: 'Visibility'
				,name: 'Visibility'
				,menu: {
						plain: true
						,items: [{
							text: 'Public'
						},{
							text: 'Private'
						}]
					}
			},{
				text: 'Publish'
				,menu: {
						plain: true
						,items: [{
							xtype: 'checkboxfield'
							,boxLabel: 'Published'
						},{
							text: 'Private'
						}]
					}
			},'->'
			,{
				xtype: 'button'
				,text: 'View'
			    ,disabled: true
			    ,scope: this
			},'-',{
				xtype: 'button'
				,text: 'Save'
				,scope: this
			}]
		},{	
			xtype: 'container'	
			,layout: {
				type: 'vbox'
			}
			,width: 600
			,height: 300
    	},{
			bbar: [{
		        xtype: 'buttongroup',
		        columns: 3,
		        title: 'Add content to',
		        items: [{
		            text: 'HTML'
		            ,action: 'showEditor'
		            ,scale: 'large'
		            ,rowspan: 3
		            ,iconCls: 'add'
		            ,iconAlign: 'top'
		            ,cls: 'btn-as-arrow'
		        },{
		            text: 'Multimedia'
		            ,scale: 'large'
		            ,action: 'onMultimediaPressed'
		            ,rowspan: 3
		            ,iconCls: 'add'
		            ,iconAlign: 'top'
		            ,cls: 'btn-as-arrow'
		        },{
		         	text: 'Content Embed Code'
		            ,scale: 'large'
		            ,action: 'onEmbedPressed'
		            ,rowspan: 3
		            ,iconCls: 'add'
		            ,iconAlign: 'top'
		            ,cls: 'btn-as-arrow'
		        }]
		    }]

    	}]
    }]
    
   
});