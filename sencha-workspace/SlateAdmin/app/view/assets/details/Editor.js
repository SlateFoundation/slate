/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.details.Editor',{
	extend: 'Ext.form.Panel'
	,requires: [
		'SlateAdmin.store.AssetStatuses'
	]

	,alias: 'widget.assets-details-editor'

	,cls: 'editor-panel assets-editor'
	,title: 'Editor'
	,autoScroll: true
    ,defaults: {
	    labelAlign: 'top'
	    ,labelSeparator: ''
	    ,anchor: '100%'
    }
	,items: [{
		xtype: 'textfield'
		,name: 'Name'
		,fieldLabel: 'Device Nickname'
	},{
		xtype: 'templatecolumn'
		,name: 'Data'
		,tpl: '{Data}'
	},{
		fieldLabel: 'Status'
		,xtype: 'combo'
		,store: {
			model: 'SlateAdmin.model.asset.Status'
			,proxy: {
				type: 'ajax'
				,url: '/assets/json/statuses'
				,reader: {
					type: 'json'
					,root: 'data'
				}
				,extraParams: {
					parentStatus: 'all'
				}
			}

		}
	    ,queryMode: 'local'
	    ,displayField: 'Title'
	    ,name: 'StatusID'
	    ,queryParam: ''
	    ,emptyText: '(None)'
	    ,valueField: 'ID'
	},{
		fieldLabel: 'Location'
		,xtype: 'combo'
		,store: {
			model: 'SlateAdmin.model.Location'
			,proxy: {
				type: 'records'
				,url: '/locations'
				,extraParams: {
					Class: 'AssetLocation'
					,parentLocation: 'all'
				}
			}
		}
	    ,queryMode: 'local'
	    ,displayField: 'Title'
	    ,name: 'LocationID'
	    ,queryParam: ''
	    ,emptyText: '(None)'
	    ,valueField: 'ID'
	},{
		xtype: 'fieldset'
		,title: 'Assignee'
		,defaults: {
			anchor: '100%'
		}
		,items: [{
			xtype: 'radiogroup'
			,itemId: 'assigneeRadioGroup'
			,defaults: {
				name: 'AssigneeClass'
			}
			,items: [
				{ boxLabel: 'Person', inputValue: 'Emergence\\People\\Person', itemId: 'personRadio' }
				,{ boxLabel: 'Group/Organization', inputValue: 'Emergence\\People\\Groups\\Organization', itemId: 'groupRadio' }
			]
		},{
			xtype: 'combo'
			,itemId: 'assigneePeople'
			,name: 'AssigneeID'
			,hidden: true
			,disabled: true
			,hideTrigger: true

			,store: {
				model: 'SlateAdmin.model.person.Person'
			}
			,valueField: 'ID'
			,displayField: 'FullName'
			,queryMode: 'remote'
			,queryParam: 'q'

			,selectOnFocus: true
			,autoSelect: false
			,emptyText: 'Search people'
		},{
			xtype: 'combo'
			,itemId: 'assigneeGroups'
			,name: 'AssigneeID'
			,hideTrigger: true
			,hidden: true
			,disabled: true

			,store: {
				model: 'SlateAdmin.model.person.Group'
			}
			,valueField: 'ID'
			,displayField: 'Name'
			,queryMode: 'remote'
			,queryParam: 'q'

			,selectOnFocus: true
			,autoSelect: false
			,emptyText: 'Search groups'
		}]
	},{
		fieldLabel: 'MfrSerial'
		,name: 'MfrSerial'
		,xtype: 'textfield'
	},{
		fieldLabel: 'MacAddress'
		,name: 'MacAddress'
		,xtype: 'textfield'
	},{
		fieldLabel: 'SDP #'
		,name: 'SDPNumber'
		,xtype: 'textfield'
	},{
		xtype: 'fieldset'
		,title: 'Owner'
		,defaults: {
			anchor: '100%'
		}
		,items: [{
			xtype: 'radiogroup'
			,itemId: 'assigneeRadioGroup'
			,defaults: {
				name: 'OwnerClass'
			}
			,items: [
				{ boxLabel: 'Person', inputValue: 'Emergence\\People\\Person', itemId: 'personRadio'}
				,{ boxLabel: 'Group/Organization', inputValue: 'Emergence\\People\\Groups\\Group', itemId: 'groupRadio' }
			]
		},{
			xtype: 'combo'
			,itemId: 'ownerPeople'
			,name: 'OwnerID'
			,hidden: true
			,hideTrigger: true
			,disabled: true

			,store: {
				model: 'SlateAdmin.model.person.Person'
			}
			,valueField: 'ID'
			,displayField: 'FullName'
			,queryMode: 'remote'
			,queryParam: 'q'

			,selectOnFocus: true
			,autoSelect: false
			,emptyText: 'Search people'
		},{
			xtype: 'combo'
			,itemId: 'ownerGroups'
			,name: 'OwnerID'
			,hideTrigger: true
			,hidden: true
			,disabled: true

			,store: {
				model: 'SlateAdmin.model.person.Group'
			}
			,valueField: 'ID'
			,displayField: 'Name'
			,queryMode: 'remote'
			,queryParam: 'q'

			,selectOnFocus: true
			,autoSelect: false
			,emptyText: 'Search groups'
		}]
	},{
		xtype: 'button'
		,cls: 'editor-submit-btn'
		,action: 'saveAsset'
		,text: 'Save'
		,anchor: 0
		,icon: '/img/icons/fugue/monitor--pencil.png'
	}]
});
