/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.assets.Editor', {
	extend: 'Ext.app.Controller'

    ,views: [
        'assets.details.Editor'
    ]
    ,refs: [{
        ref: 'assetsManager'
        ,selector: 'assets-manager'
	},{
		ref: 'assetEditor'
		,selector: 'assets-details-editor'
	},{
		ref: 'assigneePeopleCombo'
		,selector: 'assets-details-editor #assigneePeople'
	},{
		ref: 'assigneeGroupsCombo'
		,selector: 'assets-details-editor #assigneeGroups'
	},{
		ref: 'ownerPeopleCombo'
		,selector: 'assets-details-editor #ownerPeople'
	},{
		ref: 'ownerGroupsCombo'
		,selector: 'assets-details-editor #ownerGroups'
	},{
		ref: 'assigneeRadioGroup'
		,selector: 'assets-details-editor fieldset[title=Assignee] radiogroup'
	},{
		ref: 'ownerRadioGroup'
		,selector: 'assets-details-editor fieldset[title=Owner] radiogroup'
	}]

	,init: function() {
		var me = this;

		me.control({
			'assets-details-editor':{
				activate: {fn:me.onEditorActivate, delay: 10}
            }
            ,'assets-details-editor radio[name=AssigneeClass]':{
				change: me.onAssigneeClassChange
            }
            ,'assets-details-editor radio[name=OwnerClass]':{
				change: me.onOwnerClassChange
            }
            ,'assets-details-editor button[action=saveAsset]':{
				click: me.saveAsset
            }
            ,'assets-details-editor datafield':{
            	nodeadded: me.onDataNodeAdded
            	,nodedeleted: me.onDataNodeDeleted
            }
		});

		me.application.on('assetselected', me.loadAsset, me);
	}


	//event handlers
	,onEditorActivate: function(){
		var asset = this.getAssetsManager().getAsset();

		if(asset) {
			this.loadAsset(asset);
		}
	}

	,onAssigneeClassChange: function(radio, newValue) {
		if(!newValue) {
			return;
		}

		this.adjustAssigneePicker(radio.inputValue);
	}

	,onOwnerClassChange: function(radio, newValue) {
		if(!newValue) {
			return;
		}

		this.adjustOwnerPicker(radio.inputValue);
	}

	,onDataNodeAdded: function(node) {
		this.saveAsset();
	}

	,onDataNodeDeleted: function(node) {
		this.saveAsset();
	}


	//helper functions
	,loadAsset: function(asset){
		var formPanel = this.getAssetEditor()
			,form = formPanel.getForm()
			,datafield = formPanel.down('datafield');

		this.adjustAssigneePicker(asset.get('AssigneeClass'), asset.get('Assignee'));
		this.adjustOwnerPicker(asset.get('OwnerClass'), asset.get('Owner'));
//		debugger;

		form.loadRecord(asset);

		formPanel.enable();
	}

	,adjustAssigneePicker: function(assigneeClass, selectedData) {
		var me = this;

		me.adjustEntityPicker(me.getAssigneePeopleCombo(), me.getAssigneeGroupsCombo(), 'AssigneeClass', assigneeClass, selectedData);
	}

	,adjustOwnerPicker: function(ownerClass, selectedData) {
		var me = this;

		me.adjustEntityPicker(me.getOwnerPeopleCombo(), me.getOwnerGroupsCombo(), 'OwnerClass', ownerClass, selectedData);
	}

	,adjustEntityPicker: function(peopleCombo, groupsCombo, entityClassField, entityClass, selectedData) {
		var selectedGroupRadio = this.getAssetEditor().down('radio[name='+entityClassField+'][value]')
			,activeCombo, disabledCombo
			,userClasses = ['Emergence\\People\\Person', 'Emergence\\People\\User', 'Slate\\People\\Student']
			,groupClasses = ['Emergence\\People\\Groups\\Group', 'Organization'];

		if(Ext.Array.contains(userClasses, entityClass)) {
			this.adjustRadioValue('Person', entityClassField, entityClass);
			activeCombo = peopleCombo;
			disabledCombo = groupsCombo;
		}
		else if(Ext.Array.contains(groupClasses, entityClass)) {
			this.adjustRadioValue('Group', entityClassField, entityClass);
			activeCombo = groupsCombo;
			disabledCombo = peopleCombo;
		}
		else {
			groupsCombo.hide();
			groupsCombo.disable();
			peopleCombo.hide();
			peopleCombo.disable();

			if(selectedGroupRadio) {
				selectedGroupRadio.setValue(false);
			}

			return;
		}

		disabledCombo.disable();
		disabledCombo.hide();

		activeCombo.enable();
		activeCombo.show();

		if(selectedData) {
			activeCombo.getStore().loadData([selectedData]);
			activeCombo.setValue(parseInt(selectedData.ID, 10));
		}
	}
	,adjustRadioValue: function(entityType, entityClassField, inputValue) {
		var radioGroup
			,radio
			,userClasses = ['Emergence\\People\\Person', 'Emergence\\People\\User', 'Slate\\People\\Student']
			,groupClasses = ['Emergence\\People\\Groups\\Group', 'Emergence\\People\\Groups\\Organization'];

		switch(entityClassField)
		{
			case 'AssigneeClass':
				radioGroup = this.getAssigneeRadioGroup();
				break;

			case 'OwnerClass':
				radioGroup = this.getOwnerRadioGroup();
				break;
		}

		switch(entityType)
		{
			case 'Person':
				radio = radioGroup.down('#personRadio')
				break;

			case 'Group':
				radio = radioGroup.down('#groupRadio')
				break;
		}

		radio.inputValue = inputValue;
	}

	,saveAsset: function() {
		var form = this.getAssetEditor()
			,values = form.getValues(false, true)
			,asset = form.getRecord()
			,manager = this.getAssetsManager()
			,oldAsset = manager.getAsset()
			,dataField = form.down('datafield');


		form.setLoading('Saving&hellip;');

		form.getForm().updateRecord(asset);
		asset.set('Data', dataField.getValue());

		asset.save({
			success: function(record){
				manager.updateAsset(record);
				form.setLoading(false);
			}
			,failure: function(record, operation){
				var r = Ext.decode(operation.response.responseText);

				if(r.error == 'aliasAssigned')
				{
					Ext.Msg.alert('Serial In Use', 'This serial is already assigned to another asset. Please choose another.');
				}

				form.setLoading(false);
			}
		});
	}
});
