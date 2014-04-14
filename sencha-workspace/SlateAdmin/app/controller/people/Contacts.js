/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.people.Contacts', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.MessageBox'
    ],


    // controller config
    views: [
        'people.details.Contacts',
        'people.details.contact.ContextMenu'
    ],

    stores: [
        'people.ContactPointTemplates'
    ],
//    stores: [
//        'people.ContactPoints',
//        'people.Relationships'
//    ],

    refs: [{
        ref: 'personDetailTabs',
        selector: 'people-manager #detailTabs'
    },{
        ref: 'contactsPanel',
        selector: 'people-details-contacts',
        autoCreate: true,

        xtype: 'people-details-contacts'
    },{
        ref: 'relationshipsGrid',
        selector: 'people-details-contacts grid#relationships'
    },{
        ref: 'contactsGrid',
        selector: 'people-details-contacts grid#contactPoints'
    },{
        ref: 'contactContextMenu',
        selector: 'contact-contextmenu',
        autoCreate: true,

        xtype: 'contact-contextmenu'
    }],


    // controller template methods
    init: function() {
        // Start listening for events on views
        var me = this;

        me.control({
            'people-manager #detailTabs': {
                beforerender: me.onBeforeTabsRender
            },
            'people-details-contacts': {
                personloaded: me.onPersonLoaded
            },
            'people-details-contacts grid#relationships': {
                beforeedit: me.onBeforeRelationshipsGridEdit,
                edit: me.onRelationshipsGridEdit
//                deleteclick: me.onRelationshipsGridDeleteClick
            },
            'people-details-contacts grid#contactPoints': {
                beforeedit: me.onBeforeContactsGridEdit,
                edit: me.onContactsGridEdit,
                deleteclick: me.onContactsGridDeleteClick,
                primaryclick: me.onContactsGridPrimaryClick
            }
//            'people-details-contacts': {
//                show: me.onContactsShow,
//                afterrender: me.onContactsReady,
//                edit: me.onCellEdit,
//                cellclick: me.onCellClick,
//                itemcontextmenu: me.onItemContextMenu
//            },
//            'people-details-contacts button[name=relationshipAdd]': {
//                click: me.onRelationshipAdd
//            },
//            'contact-contextmenu menuitem[ref=btnDelete]':{
//                click: me.onContactDelete
//            },
//            'contact-contextmenu menuitem[ref=btnPrimary]':{
//                click: me.onContactPrimary
//            }
        });

//        me.listen({
//            store: {
//                '#people.ContactPointTemplates': {
//                    load: me.onTemplatesStoreLoad
//                }
//            }
//        });

//        me.application.on('personselected', me.onPersonSelected, me);
//        me.application.on('login', me.syncContacts, me);
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getContactsPanel());
    },

    onPersonLoaded: function(contactsPanel, person) {
        var me = this,
            templatesStore = me.getPeopleContactPointTemplatesStore(),
            templatesStoreLoaded = templatesStore.isLoaded(),
            relationshipsGrid = me.getRelationshipsGrid(),
            relationshipsStore = relationshipsGrid.getStore(),
            relationshipsStoreLoaded = false,
            contactsGrid = me.getContactsGrid(),
            contactsStore = contactsGrid.getStore(),contactsStoreLoaded = false;

        Ext.defer(function() {
            contactsPanel.setLoading('Loading contacts&hellip;');
            Ext.suspendLayouts();
    
            // resume rendering and finish when all 3 stores are loaded
            function _onStoresLoaded() {
                if (templatesStoreLoaded && relationshipsStoreLoaded && contactsStoreLoaded) {
                    me.injectBlankRelationshipRecord();
                    me.injectBlankContactRecords();
                    contactsPanel.setLoading(false);
                    Ext.resumeLayouts(true);
                }
            }
    
            // load templates only if needed
            if (!templatesStoreLoaded) {
                templatesStore.load({
                    callback: function() {
                        templatesStoreLoaded = true;
                        _onStoresLoaded();
                    }
                });
            }
    
            // load relationships
            relationshipsStore.getProxy().setExtraParam('person', person.getId());
            relationshipsStore.load({
                callback: function() {
                    relationshipsStoreLoaded = true;
                    _onStoresLoaded();
                }
            });
    
            // load contacts
            contactsStore.getProxy().setExtraParam('person', person.getId());
            contactsStore.load({
                callback: function() {
                    contactsStoreLoaded = true;
                    _onStoresLoaded();
                }
            });

        }, 1);
    },
    
    onBeforeRelationshipsGridEdit: function(editingPlugin, context) {
        if (context.column.getItemId() == 'person' && !context.record.phantom) {
            return false;
        }
    },
    
    onRelationshipsGridEdit: function(editingPlugin, context) {
        var me = this,
            value = context.value,
            record = context.record;

        if (context.column.getItemId() == 'person') {
            if (Ext.isString(value)) {
                value = value.split(/\s+/);
                record.set('RelatedPerson', {
                    LastName: value.pop(),
                    MiddleName: value.length == 1 ? null : value.pop(),
                    FirstName: value.join(' ')
                });
            } else if (Ext.isNumber(value)) {
                record.set('RelatedPersonID', value);
            }
    
            if (!record.get('Relationship')) {
                editingPlugin.startEdit(record, context.grid.getColumnManager().getHeaderById('relationship'));
                return;
            }
        }
        
        me.injectBlankRelationshipRecord();
    },

    onBeforeContactsGridEdit: function(editingPlugin, context) {
        var me = this,
            masterLabelStore = me.getPeopleContactPointTemplatesStore(),
            cm = context.grid.getColumnManager(),
            fieldName = context.field,
            record = context.record,
            editor = context.column.getEditor(record),
            labelEditor, valueEditor, labelStore, templateRecord, valueField, placeholder;

        // get both components
        if (fieldName == 'Label') {
            labelEditor = editor;
            valueEditor = cm.getHeaderById('value').getEditor(record);
        } else if(fieldName == 'String') {
            labelEditor = cm.getHeaderById('label').getEditor(record);
            valueEditor = editor;
        }

        // populate templates store for label combo
        labelStore = labelEditor.getStore();

        if (!labelStore.isLoaded()) {
            labelStore.loadRecords(masterLabelStore.getRange());
        }

        labelStore.clearFilter(true);
        labelStore.filter('class', record.get('Class'));

        // configure value editor
        valueField = valueEditor.field;

        templateRecord = labelEditor.findRecordByValue(record.get('Label')) || labelStore.getAt(0);
        placeholder = (templateRecord && templateRecord.get('placeholder')) || '';
        valueField.emptyText = placeholder;
        valueField.applyEmptyText();
    },

    onContactsGridEdit: function(editingPlugin, context) {
        var me = this,
            editedRecord = context.record,
            view = context.view,
            store = view.getStore();
//            templateRecord, placeholder, valueColumn, valueField;

        if (context.field == 'Label' && !editedRecord.get('String')) {
            editingPlugin.startEdit(editedRecord, context.grid.getColumnManager().getHeaderById('value'));
            return;
        }

        editedRecord.save({
            callback: function() {
                // render any server-side validation errors
                Ext.Array.each(editedRecord.getProxy().getReader().rawData.failed || [], function(result) {
                    var node = view.getNode(editedRecord);

                    if (node) {
                        Ext.fly(node).down('.contact-cell-value')
                            .addCls('x-grid-invalid-cell')
                            .set({
                                'data-errorqtip': Ext.String.format('<ul><li>{0}</li></ul>', Ext.Object.getValues(result.validationErrors).join('</li><li>'))
                            });
                    }
                });

                // ensure each class has a phantom row
                me.injectBlankContactRecords();
            }
        });
    },

    onContactsGridDeleteClick: function(grid, record) {

        if (record.phantom) {
            return;
        }

        Ext.Msg.confirm('Delete contact point', Ext.String.format('Are you sure you want to delete the contact point labeled "{0}"?', record.get('Label')), function(btn) {
            if (btn == 'yes') {
                record.destroy();
            }
        });
    },

    onContactsGridPrimaryClick: function(grid, record) {
        var me = this,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            primaryFieldName, originalValue, newValue, originalRecord;

        switch (record.get('Class')) {
            case 'Emergence\\People\\ContactPoint\\Email':
                primaryFieldName = 'PrimaryEmailID';
                break;
            case 'Emergence\\People\\ContactPoint\\Phone':
                primaryFieldName = 'PrimaryPhoneID';
                break;
            case 'Emergence\\People\\ContactPoint\\Postal':
                primaryFieldName = 'PrimaryPostalID';
                break;
            default:
                return false;
        }

        originalValue = loadedPerson.get(primaryFieldName);
        newValue = record.getId();

        if (newValue == originalValue) {
            return false;
        }

        grid.setLoading('Changing primary contact point&hellip;');
        Ext.suspendLayouts();
        loadedPerson.set(primaryFieldName, newValue);
        loadedPerson.save({
            callback: function(records, operation, success) {
                if (success) {
                    originalRecord = grid.getStore().getById(originalValue);
                    if (originalRecord) {
                        originalRecord.set('Primary', false);
                    }

                    record.set('Primary', true);
                }

                grid.setLoading(false);
                Ext.resumeLayouts(true);
            }
        });
    },


    // controller methods
    injectBlankContactRecords: function() {
        var me = this,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            pointsStore = me.getContactsGrid().getStore(),
            templatesStore = me.getPeopleContactPointTemplatesStore(),
            pointClasses = templatesStore.collect('class'),
            pointClassesLen = pointClasses.length, i = 0, pointClass, phantomIndex;

        Ext.suspendLayouts();

        for (; i < pointClassesLen; i++) {
            pointClass = pointClasses[i];
            phantomIndex = pointsStore.findBy(function(record) {
                return record.phantom && record.get('Class') == pointClass;
            });

            if (phantomIndex == -1) {
                pointsStore.add({
                    Class: pointClass,
                    PersonID: loadedPerson.getId()
                });
            }
        }

        Ext.resumeLayouts(true);
    },

    injectBlankRelationshipRecord: function() {
        var me = this,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            relationshipsStore = me.getRelationshipsGrid().getStore();

        if (relationshipsStore.getNewRecords().length === 0) {
            relationshipsStore.add({
                PersonID: loadedPerson.getId()
            });
        }
    }

//    onCellEdit: function(editor, e) {
//        var me = this;
//        if(e.value == e.originalValue) {
//            return;
//        }
//
//        switch(e.field) {
//            case 'Label':
//                if(e.value.search(/phone/i) != -1) {
//                    me.changeRecordClass(e.record, 'PhoneContactPoint');
//                } else if(e.value.search(/address/i) != -1) {
//                    me.changeRecordClass(e.record, 'AddressContactPoint');
//                } else if(e.value.search(/email/i) != -1) {
//                    me.changeRecordClass(e.record, 'EmailContactPoint');
//                }
//
//                if(e.record.phantom) {
//
//                    var column = e.grid.columns[4],
//                        phantomEditor = e.grid.plugins[0];
//
//                    if(column && phantomEditor) {
//                        phantomEditor.startEdit(e.record, column);
//                    }
//                }
//
//                break;
//
//            case 'Class':
//                var str = me.prepareValueForEdit(e.record, e.originalValue);
//                e.record.set('Data', me.prepareValueForSave(e.record, str));
//
//                break;
//        }
//
//        me.injectInsertRecords();
//
//    },
//
//    onCellClick: function(grid, cell, cellIndex, record, row, rowIndex, e){
//        var me = this,
//            fieldName = me.getPersonContacts().headerCt.gridDataColumns[cellIndex].dataIndex;
//
//        if (fieldName == "Class") {
//            me.classMenu = me.classMenu || Ext.create('Ext.menu.Menu', {
//                items: [{
//                    text: 'Phone',
//                    iconCls: 'icon-contact-phone',
//                    contactClass: 'PhoneContactPoint'
//                },{
//                    text: 'Address',
//                    iconCls: 'icon-contact-address',
//                    contactClass: 'AddressContactPoint'
//                },{
//                    text: 'Email',
//                    iconCls: 'icon-contact-email',
//                    contactClass: 'EmailContactPoint'
//                }],
//                defaults: {
//                    scope: me,
//                    handler: function(item, e) {
//                        me.changeRecordClass(item.parentMenu.targetRecord, item.contactClass);
//                    }
//                }
//            });
//
//            me.classMenu.targetRecord = record;
//            me.classMenu.showAt(Ext.fly(cell).getXY());
//        }
//    },
//
//    onContactsShow: function() {
//        var me = this,
//            manager = me.getPeopleManager(),
//            currentPerson = manager.getPerson(),
//            contactsView = me.getPersonContacts();
//
//        if (currentPerson && !contactsView.getLoaded()) {
//            me.loadPerson(currentPerson);
//        }
//    },
//
//    onRelationshipAdd: function(btn, evt) {
//        var me = this,
//            grid = me.getPersonContacts(),
//            toolbar = grid.down('#relationshipAddBar'),
//            contact = grid.down('combo[name="ContactName"]').getValue(),
//            relationship = grid.down('combo[name="ContactRelationship"]').getValue();
//
//        if(contact && relationship) {
//            toolbar.setLoading(true);
//            Ext.Ajax.request({
//                method: 'POST',
//                url: '/relationships/json/create',
//                params: {
//                    PersonID: me.getPeopleManager().getPerson().get('ID'),
//                    relatedPerson: contact,
//                    Relationship: relationship
//                },
//                success: function(res, opts){
//                    var r = Ext.decode(res.responseText);
//
//                    var contacts = me.getPersonContacts();
//
//                    contacts.down('combo[name="ContactName"]').reset();
//                    contacts.down('combo[name="ContactRelationship"]').reset();
//                    toolbar.setLoading(false);
//                    me.loadPerson(me.getPeopleManager().getPerson());
//
//                }
//            });
//        }
//
//
//    },
//
//    onContactsReady: function(grid) {
//        var me = this;
//
//        me.getPeopleContactPointsStore().on('update', 'injectInsertRecords', me);
//
//        grid.mon(grid.el, 'click', function(evt, t){
//            if(Ext.get(t).hasCls('groupRelationship')) {
//                var relationshipEditor = new Ext.Editor({
//                     updateEl: true, // update the innerHTML of the bound element when editing completes
//                     ignoreNoChange: true,
//                     alignment: 'r-r',
//                     field: {
//                         xtype: 'combobox',
//                        emptyText: 'Relationship',
//                        name: 'ContactRelationship',
//                        selectOnFocus: true,
//                        width: 100,
//                        autoSelect: false,
//                        typeAhead: true,
//                        triggerAction: 'all',
//                        queryMode: 'local',
//                        store: ['Mother','Father','Guardian','Aunt','Uncle','Grandmother','Grandfather','Foster Mother','Foster Father','Stepmother','Stepfather','Sister','Brother','Unknown'],
//                        allowBlank: false,
//                        blankText: 'Select or type the contact\'s relationship with this person'
//                     },
//                     listeners: {
//                        scope: me,
//                        beforecomplete: function(editor, newValue, oldValue) {
//                            if(newValue == oldValue) {
//                                editor.cancelEdit();
//                            } else {
//                                var personID = editor.boundEl.id.substr(13),
//                                    relationship = me.getRelationshipsStore().findRecord('RelatedPersonID', parseInt(personID, 10));
//
//                                relationship.set('Relationship', newValue);
//                            }
//                        }
//                    }
//                });
//
//                relationshipEditor.startEdit(Ext.get(t));
//            }
//        },this,{
//            delegate: '.edit-link'
//        });
//    },
//
//    onItemContextMenu: function(view, record, item, number, evt){
//        if(!evt.getTarget('a')) {
//            evt.stopEvent();
//            var contextMenu = this.getContactContextMenu();
//
//            contextMenu.setRecord(record, null);
//            contextMenu.showAt(evt.getXY());
//        }
//    },
//
//    onContactPrimary: function(menuItem, e) {
//        var me = this,
//            grid = me.getPersonContacts(),
//            contextMenu = me.getContactContextMenu(),
//            record = contextMenu.record,
//            person = contextMenu.person,
//            primaryField = false;
//
//        switch(record.get('Class')) {
//            case 'PhoneContactPoint':
//                primaryField = 'PrimaryPhoneID';
//                break;
//
//            case 'AddressContactPoint':
//                primaryField = 'PrimaryAddressID';
//                break;
//
//            case 'EmailContactPoint':
//                primaryField = 'PrimaryEmailID';
//                break;
//        }
//
//        if(primaryField) {
//            grid.setLoading('Setting primary contact point&hellip;');
//
//            person.set(primaryField, record.getId());
//            person.save({
//                callback: function() {
//                    grid.setLoading(false);
//                }
//            });
//
////          var data = [{}];
////          data[0][primaryField] = record.get('ID');
////          data[0].ID = person.get('ID');
////
////          Ext.Ajax.request({
////              url: '/people/json/save'
////              ,jsonData: {
////                  data: data
////              }
////              ,success: function(res){
////
////              }
////              ,scope: this
////          });
//        }
//    },
//
//    onContactDelete: function(menuItem, e) {
//        var me = this;
//
//        Ext.Msg.confirm('Deleting Contact', 'Are you sure you want to delete this contact?', function(btn) {
//            var contextMenu = me.getContactContextMenu(),
//                record = contextMenu.record,
//                store = me.getPeopleContactPointsStore();
//
//            if(btn != "yes") {
//                return;
//            }
//
//            store.remove(record);
//        });
//    },
//
//
//    // controller methods
//    addBlankContact: function(personID) {
//        this.getPeopleContactPointsStore().add({
//            PersonID: personID,
//            Label: '',
//            Data: ''
//        });
//    },
//
//    onPersonSelected: function(person) {
//        var me = this,
//            activeProfileView = me.getPersonTabs().getActiveTab(),
//            activeXtype = activeProfileView.xtype,
//            contactsView = me.getPersonContacts();
//
//        contactsView.enable();
//        contactsView.setLoaded(false);
//
//        if(activeXtype == contactsView.xtype) {
//            me.loadPerson(person);
//        }
//    },
//
//    loadPerson: function(personRecord) {
//        var me = this,
//            contactView = me.getPersonContacts(),
//            personData = personRecord.getData();
//
//        contactView.enable();
//
//        contactView.setLoading('Loading&hellip;');
//
//        Ext.Ajax.request({
//            url: '/contacts/json/related',
//            method: 'GET',
//            params: {
//                personID: personRecord.get('ID')
//            },
//            success: function(response,o) {
//                var r = Ext.decode(response.responseText),
//                    relationshipsStore = me.getPeopleRelationshipsStore(),
//                    contactPointsStore = me.getPeopleContactPointsStore(),
//                    self = relationshipsStore.getProxy().getReader().read({data: {
//                        PersonID: personData.ID,
//                        RelatedPersonID: personData.ID,
//                        Relationship: 'Self',
//                        RelatedPerson: {
//                            FirstName: personData.FirstName,
//                            LastName: personData.LastName,
//                            ID: personRecord.ID,
//                            Username: personData.Username ? personData.Username : ''
//                        }}
//                    }),
//                    record = self.records[0];
//
//                record.commit();
//                relationshipsStore.loadRawData(r.relationships);
//                relationshipsStore.insert(0 , record);
//
//                contactPointsStore.loadData(r.data);
//                contactPointsStore.group('PersonID');
//                me.injectInsertRecords();
//
//                contactView.setLoaded(true);
//                contactView.setLoading(false);
//            },
//            failure: function() {
//                contactView.setLoading(false);
//            }
//        });
//    },
//
//    prepareValueForSave: function(record, value) {
//
//        var string = Ext.String.trim(value);
//
//        switch (record.get('Class')) {
//            case 'AddressContactPoint':
//                var r = {
//                    Address: null,
//                    City: null,
//                    State: null,
//                    Postal: null
//                };
//
//                if(!string)
//                    return r;
//
//                var segments = string.split(/\s*[,\n]\s*/);
//
//                r.Address = segments.shift();
//
//                while (segments.length) {
//                    var segment = segments.shift();
//                    var m;
//
//                    if (m == segment.match(/([a-zA-Z]{2,})\s+(\d{5}(-\d{4})?)/)) {
//                        r.State = m[1];
//                        r.Postal = m[2];
//                    } else if(segment.match(/\d{5}(-\d{4})?/)) {
//                        r.Postal = segment;
//                    } else if(!r.City) {
//                        r.City = segment;
//                    }
//                }
//
//                return r;
//
//            case 'PhoneContactPoint':
//                return string.replace(/\D/g,'');
//
//            default:
//                return string;
//        }
//    },
//
//    prepareValueForEdit: function(record, value) {
//        if (record.get('Class')) {
//            switch (record.get('Class')) {
//                case 'AddressContactPoint':
//                    var s = record.get('Data').Address;
//
//                    if (record.get('Data').City) {
//                        s += ', '+record.get('Data').City;
//                    }
//
//                    if (record.get('Data').State || record.get('Data').Postal) {
//                        s += ',';
//                    }
//
//                    if (record.get('Data').State) {
//                        s += ' '+record.get('Data').State;
//                    }
//
//                    if (record.get('Data').Postal) {
//                        s += ' '+record.get('Data').Postal;
//                    }
//
//                    return s;
//
//                default:
//                    return record.get('Data');
//            }
//        }
//    },
//
//    injectInsertRecords: function() {
//        var me = this,
//            personID = me.getPeopleManager().getPerson().get('ID'),
//            relationshipsStore = me.getPeopleRelationshipsStore(),
//            contactPointsStore = me.getPeopleContactPointsStore(),
//            people = relationshipsStore.collect('RelatedPersonID');
//
//        Ext.each(people, function(personID) {
//            var phantomIndex = contactPointsStore.findBy(function(record) {
//                return record.phantom && record.get('PersonID')==personID;
//            });
//
//            if (phantomIndex == -1) {
//                me.addBlankContact(personID);
//            }
//        });
//
//        contactPointsStore.sort({
//            sorterFn: function(c1, c2){
//                var r1 = relationshipsStore.findRecord('RelatedPersonID', c1.get('PersonID')),
//                    r2 = relationshipsStore.findRecord('RelatedPersonID', c2.get('PersonID'));
//
//                if (r1.get('Relationship') == 'Self' && r2.get('Relationship') != 'Self') {
//                    return 1;
//                }
//
//                if (r2.get('Relationship') == 'Self' && r1.get('Relationship') != 'Self') {
//                    return -1;
//                }
//
//
//                if (c1.phantom && !c2.phantom) {
//                    return 1;
//                }
//                if (c2.phantom  && !c1.phantom) {
//                    return -1;
//                }
//
//                return -1;
//            }
//        });
//    },
//
//    changeRecordClass: function(record, newClass) {
//        var me = this,
//            origClass = record.get('Class');
//
//        if (newClass != origClass) {
//            record.set('Class', newClass);
//        }
//
//        me.injectInsertRecords();
//    },
//
//    syncContacts: function() {
//        var me = this,
//            contactsView = me.getPersonContacts();
//
//        if(contactsView) {
//            contactsView.setLoading('Syncing&hellip;');
//
//            me.getPersonContactPointsStore().sync({
//                success: function() {
//                    me.getPersonContacts().setLoading(false);
//                }
//            });
//        }
//    }
});