/* jslint browser: true, undef: true *//* global Ext*/
/**
 * people.Contacts controller
 */
Ext.define('SlateAdmin.controller.people.Contacts', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.data.Session',
        'Ext.window.MessageBox',
        'Jarvus.view.TableErrors'
    ],


    statics: {
        contactClassPrimaryFieldMap: {
            'Emergence\\People\\ContactPoint\\Email': 'PrimaryEmailID',
            'Emergence\\People\\ContactPoint\\Phone': 'PrimaryPhoneID',
            'Emergence\\People\\ContactPoint\\Postal': 'PrimaryPostalID'
        }
    },


    // controller config
    views: [
        'people.details.Contacts'
    ],

    stores: [
        'people.ContactPointTemplates',
        'people.RelationshipTemplates@Slate.store'
    ],

    refs: {
        contactsPanel: {
            selector: 'people-details-contacts',
            autoCreate: true,

            xtype: 'people-details-contacts'
        },
        relationshipsList: 'people-details-contacts-list',
        contactsGrid: 'people-details-contacts grid#contactPoints'
    },

    control: {
        'people-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'people-details-contacts': {
            personloaded: 'onPersonLoaded'
        },
        'people-details-contacts grid#contactPoints': {
            beforeedit: 'onBeforeContactsGridEdit',
            edit: 'onContactsGridEdit',
            deleteclick: 'onContactsGridDeleteClick',
            primaryclick: 'onContactsGridPrimaryClick'
        }
    },


    // event handlers
    onBeforeTabsRender: function (detailTabs) {
        detailTabs.add(this.getContactsPanel());
    },

    onPersonLoaded: function (contactsPanel, person) {
        var me = this,
            contactPointTemplatesStore = me.getPeopleContactPointTemplatesStore(),
            contactPointTemplatesStoreLoaded = contactPointTemplatesStore.isLoaded(),
            relationshipTemplatesStore = me.getPeopleRelationshipTemplatesStore(),
            relationshipTemplatesStoreLoaded = relationshipTemplatesStore.isLoaded(),
            relationshipsList = me.getRelationshipsList(),
            relationshipsStoreLoaded = false,
            contactsGrid = me.getContactsGrid(),
            contactsStore = contactsGrid.getStore(), contactsStoreLoaded = false;

        Ext.defer(function () {
            contactsPanel.setLoading('Loading contacts&hellip;');
            Ext.suspendLayouts();

            // resume rendering and finish when all 3 stores are loaded
            function _onStoresLoaded() {
                if (contactPointTemplatesStoreLoaded && relationshipTemplatesStoreLoaded && contactsStoreLoaded && relationshipsStoreLoaded) {
                    me.injectBlankContactRecords();
                    contactsPanel.setLoading(false);
                    Ext.resumeLayouts(true);
                }
            }

            // load contact point templates only if needed
            if (!contactPointTemplatesStoreLoaded) {
                contactPointTemplatesStore.load({
                    callback: function () {
                        contactPointTemplatesStoreLoaded = true;
                        _onStoresLoaded();
                    }
                });
            }

            // load relationship templates only if needed
            if (!relationshipTemplatesStoreLoaded) {
                relationshipTemplatesStore.load({
                    callback: function () {
                        relationshipTemplatesStoreLoaded = true;
                        _onStoresLoaded();
                    }
                });
            }

            // load contacts
            contactsStore.getProxy().setExtraParam('person', person.getId());
            contactsStore.load({
                callback: function () {
                    contactsStoreLoaded = true;
                    _onStoresLoaded();
                }
            });

            // load relationships
            relationshipsList.setPerson(person);
            relationshipsList.getStore().loadIfDirty(false, () => {
                relationshipsStoreLoaded = true;
                _onStoresLoaded();
            });

        }, 1);
    },

    onBeforeContactsGridEdit: function (editingPlugin, context) {
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
        } else if (fieldName == 'String') {
            if (record.phantom && !record.get('Label')) {
                return false;
            }

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
        placeholder = templateRecord && templateRecord.get('placeholder') || '';
        valueField.setEmptyText(placeholder);
    },

    onContactsGridEdit: function (editingPlugin, context) {
        var me = this,
            editedRecord = context.record,
            gridView = context.view,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            primaryFieldName;

        if (context.field == 'Label' && !editedRecord.get('String')) {
            // auto advance to value column if the editor isn't already active after a short delay
            // this delay is necessary in case this completeEdit was already spawned by a startEdit on another field that's not finished yet
            Ext.defer(function () {
                if (!editingPlugin.editing) {
                    editingPlugin.startEdit(editedRecord, context.grid.getColumnManager().getHeaderById('value'));
                }
            }, 50);
            return;
        }

        if (editedRecord.dirty && editedRecord.isValid()) {
            gridView.clearInvalid(editedRecord, 'value');

            editedRecord.save({
                callback: function () {
                    // render any server-side validation errors
                    Ext.Array.each(editedRecord.getProxy().getReader().rawData.failed || [], function (result) {
                        gridView.markCellInvalid(editedRecord, 'value', result.validationErrors);
                    });

                    primaryFieldName = me.self.contactClassPrimaryFieldMap[editedRecord.get('Class')];
                    if (primaryFieldName && editedRecord.get('Primary')) {
                        loadedPerson.set(primaryFieldName, editedRecord.getId(), { dirty: false });
                    }

                    // ensure each class has a phantom row
                    me.injectBlankContactRecords();
                }
            });
        }
    },

    onContactsGridDeleteClick: function (grid, record) {
        var editingPlugin = grid.getPlugin('cellediting');

        editingPlugin.cancelEdit();

        if (record.phantom) {
            if (record.dirty) {
                record.reject();
            }

            return;
        }

        Ext.Msg.confirm('Delete contact point', Ext.String.format('Are you sure you want to delete the contact point labeled "{0}"?', record.get('Label')), function (btn) {
            if (btn == 'yes') {
                record.erase();
            }
        });
    },

    onContactsGridPrimaryClick: function (grid, record) {
        var me = this,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            primaryFieldName, originalValue, newValue, originalRecord;

        primaryFieldName = me.self.contactClassPrimaryFieldMap[record.get('Class')];
        if (!primaryFieldName) {
            return false;
        }

        originalValue = loadedPerson.get(primaryFieldName);
        newValue = record.getId();

        if (newValue == originalValue) {
            return false;
        }

        loadedPerson.set(primaryFieldName, newValue);
        loadedPerson.save({
            callback: function (records, operation, success) {
                var contactsStore = grid.getStore();

                if (success) {
                    contactsStore.beginUpdate();

                    originalRecord = contactsStore.getById(originalValue);
                    if (originalRecord) {
                        originalRecord.set('Primary', false, { dirty: false });
                    }

                    record.set('Primary', true, { dirty: false });

                    contactsStore.endUpdate();
                }
            }
        });
    },


    // controller methods
    injectBlankContactRecords: function () {
        var me = this,
            loadedPerson = me.getContactsPanel().getLoadedPerson(),
            pointsStore = me.getContactsGrid().getStore(),
            templatesStore = me.getPeopleContactPointTemplatesStore(),
            pointClasses = templatesStore.collect('class'),
            pointClassesLen = pointClasses.length, i = 0, pointClass, phantomIndex;

        pointsStore.beginUpdate();

        for (; i < pointClassesLen; i++) {
            pointClass = pointClasses[i];
            phantomIndex = pointsStore.findBy(function (record) {
                return record.phantom && record.get('Class') == pointClass;
            });

            if (phantomIndex == -1) {
                pointsStore.add({
                    Class: pointClass,
                    PersonID: loadedPerson.getId()
                });
            }
        }

        pointsStore.endUpdate();
    },
});
