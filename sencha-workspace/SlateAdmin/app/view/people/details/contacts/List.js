/**
 * Renders a list of demonstration skills
 */
 Ext.define('SlateAdmin.view.people.details.contacts.List', function() {
    const CLASS_RELATIONSHIP = 'Emergence\\People\\Relationship';
    const CLASS_GUARDIAN = 'Emergence\\People\\GuardianRelationship';

    return {
        extend: 'Ext.view.View',
        xtype: 'people-details-contacts-list',
        requires: [
            'SlateAdmin.view.people.details.contacts.RelationshipEditor',
            'SlateAdmin.widget.field.Person',
            'Slate.store.people.Relationships',
            'Ext.Editor',
        ],


        config: {
            person: null,
            relationshipEditor: true,
            personEditor: true,

            session: true,
            store: {
                xclass: 'Slate.store.people.Relationships',
                remoteSort: true,
                autoSync: false
            },
        },


        // component properties
        componentCls: 'contacts-list',


        // dataview properties
        loadMask: false,
        emptyText: 'No contacts have been linked or created yet.',
        disableSelection: true,
        itemSelector: '.x-dataview-item',
        tpl: [`
            <tpl for=".">
                <div class="x-dataview-item <tpl if="ID &lt; 0">relationship-phantom</tpl>" role="option">
                    <div class="forward-relationship">
                        <tpl if="ID && !RelatedPerson.phantom">
                            <a href="#{[this.getSearchRoute(values)]}">
                        </tpl>
                        <tpl for="RelatedPerson.getData()">{FirstName} {MiddleName} {LastName}</tpl>
                        <tpl if="ID && !RelatedPerson.phantom">
                            </a>
                        </tpl>
                        <br>
                        <span class="relationship-label">
                            <tpl if="Class == this.CLASS_GUARDIAN">
                                <i class="label-icon fa fa-shield glyph-shield" title="Guardian"></i>
                            </tpl>
                            <span class="label-text">{Label:defaultValue('&varnothing;')}</span>
                        </span>
                    </div>
                    <i class="relationship-icon fa fa-exchange muted"></i>
                    <tpl for="InverseRelationship">
                        <div class="inverse-relationship">
                            <tpl for="parent.Person.getData()">
                                <div class="muted">
                                    {FirstName} {MiddleName} {LastName}
                                </div>
                            </tpl>
                            <span class="relationship-label">
                                <tpl if="Class == this.CLASS_GUARDIAN">
                                    <i class="label-icon fa fa-shield glyph-shield" title="Guardian"></i>
                                </tpl>
                                <span class="label-text">{Label:defaultValue('&varnothing;')}</span>
                            </span>
                        </div>
                    </tpl>
                    <tpl if="ID &gt; 0">
                        <div class="relationship-delete">
                            <button type="button" class="relationship-delete-btn" data-action="delete-relationship">
                                <i class="fa fa-minus-circle glyph-danger"></i>
                            </button>
                        </div>
                    </tpl>
                </div>
            </tpl>
            <div class="relationship-creator">
                <i class="fa fa-plus-circle"></i> Add a related person&hellip;
            </div>
            `,{
                CLASS_RELATIONSHIP,
                CLASS_GUARDIAN,
                getSearchRoute: function (relationship) {
                    var path = ['people', 'search', 'related-to-id:' + relationship.PersonID],
                        relatedPerson = relationship.RelatedPerson,
                        relatedUsername = relatedPerson.get('Username');

                    if (relatedUsername) {
                        path.push(relatedUsername);
                    } else {
                        path.push('?id=' + relatedPerson.getId());
                    }

                    path.push('contacts');

                    return Ext.util.History.encodeRouteArray(path);
                }
            }
        ],


        // config handlers
        updatePerson: function(person) {
            this.getStore().setPerson(person.getId());
        },

        applyRelationshipEditor: function(relationshipEditor, oldRelationshipEditor) {
            if (!relationshipEditor || typeof relationshipEditor == 'boolean') {
                relationshipEditor = {
                    disabled: !relationshipEditor
                };
            }

            return Ext.factory(relationshipEditor, 'SlateAdmin.view.people.details.contacts.RelationshipEditor', oldRelationshipEditor);
        },

        updateRelationshipEditor: function (relationshipEditor) {
            relationshipEditor.on({
                scope: this,
                beforecomplete: 'onBeforeRelationshipEditorComplete',
                complete: 'onRelationshipEditorComplete'
            });

            relationshipEditor.ownerCmp = this;
        },

        applyPersonEditor: function(personEditor, oldPersonEditor) {
            if (!personEditor || typeof personEditor == 'boolean') {
                personEditor = {
                    disabled: !personEditor
                };
            }

            if (Ext.isSimpleObject(personEditor)) {
                Ext.applyIf(personEditor, {
                    updateEl: false,
                    allowBlur: true,
                    alignment: 'l-l?',
                    autoSize: {
                        width: 'boundEl',
                        height: 'field'
                    },
                    field: {
                        xtype: 'slate-personfield',
                        forceSelection: false,
                        displayField: 'FullName',
                        emptyText: 'Select existing contact, or name a new contact',
                    },
                });
            }

            return Ext.factory(personEditor, 'Ext.Editor', oldPersonEditor);
        },

        updatePersonEditor: function(personEditor) {
            personEditor.field.on('select', 'onPersonSelect', this);

            personEditor.on({
                scope: this,
                beforecomplete: 'onBeforePersonEditorComplete',
                complete: 'onPersonEditorComplete'
            });

            personEditor.ownerCmp = this;
        },


        // dataview lifecycle
        afterRender: function() {
            var me = this;

            me.callParent(arguments);
            me.mon(me.el, 'click', 'onRelationshipCreatorClick', me, { delegate: '.relationship-creator' });
        },

        // disable built-in focus manipulation that can interfere with editing
        onFocusEnter: Ext.emptyFn,
        onFocusLeave: Ext.emptyFn,

        prepareData: function(data) {
            var data = this.callParent(arguments);
            data.Person = this.getPerson();
            return data;
        },

        onBeforeItemClick: function(relationship, item, index, ev) {
            var targetEl;

            // clicks on people link should go through
            if (ev.getTarget('a[href^="#people/"')) {
                return false;
            }

            if (ev.getTarget('.relationship-delete')) {
                this.onRelationshipDeleteClick(relationship, ev);
                return false;
            }

            // delegate clicks on editable bits
            var isInverse = Boolean(ev.getTarget('.inverse-relationship'));

            if (targetEl = ev.getTarget('.relationship-label')) {
                this.onRelationshipLabelClick(relationship, isInverse, targetEl, ev);
                return false;
            }

            // default: don't block selection
            return true;
        },


        // contacts-list methods
        onRelationshipDeleteClick: function(relationship, ev) {
            var me = this,
                relatedPerson = relationship.get('RelatedPerson');

            Ext.Msg.confirm('Delete relationship', `Are you sure you want to delete the "${relationship.get('Label')}" relationship with ${relatedPerson.get('FullName')}?`, function (btn) {
                if (btn != 'yes') {
                    return;
                }

                me.setLoading('Deleting relationship&hellip;');

                var deleteSession = new Ext.data.Session(),
                    inverseData = relationship.get('InverseRelationship'),
                    inverseRelationship,
                    deleteBatch;

                deleteSession.adopt(relationship);
                relationship.drop();

                if (inverseData) {
                    inverseRelationship = deleteSession.createRecord(relationship.self, inverseData);
                    inverseRelationship.drop();
                }

                deleteBatch = deleteSession.getSaveBatch();
                deleteBatch.on('complete', function() {
                    me.setLoading(false);
                });
                deleteBatch.start();
            });
        },

        onRelationshipLabelClick: function(relationship, isInverse, targetEl, ev) {
            var editor = this.getRelationshipEditor();

            editor.activeRelationship = relationship;
            editor.setIsInverse(isInverse);
            editor.activeIsInverse = isInverse;
            editor.alignment = isInverse ? 'tl-tl?' : 'tr-tr?';
            editor.offsets = isInverse ? [-6, -6] : [5, -6];
            editor.startEdit(targetEl, {
                Class: isInverse
                    ? relationship.get('InverseRelationship').Class
                    : relationship.get('Class'),
                Label: isInverse
                    ? relationship.get('InverseRelationship').Label
                    : relationship.get('Label')
            });
        },

        onRelationshipCreatorClick: function(ev, target) {
            var editor = this.getPersonEditor(),
                editorStore = editor.field.getStore(),
                excludedPeopleIds = this.getStore().collect('RelatedPersonID');

            // add currently loaded person to excluded IDs
            excludedPeopleIds.push(this.getPerson().getId());

            // filter existing related people and currently loaded person from list
            editorStore.clearFilter(true);
            editorStore.addFilter(function (comboRecord) {
                return excludedPeopleIds.indexOf(comboRecord.getId()) == -1;
            });

            // open and position editor
            editor.startEdit(target, editor.field.getSelection());
        },

        onBeforeRelationshipEditorComplete: function(editor, value, startValue) {
            console.info('onBeforeRelationshipEditorComplete(%o, %o, %o)', editor, value, startValue);
        },

        onRelationshipEditorComplete: function(editor, value, startValue) {
            var me = this,
                relationship = editor.activeRelationship,
                isInverse = editor.activeIsInverse;

            if (isInverse) {
                const inverseRelationship = relationship.get('InverseRelationship');

                relationship.set('InverseRelationship', Ext.applyIf(value, inverseRelationship));
            } else {
                relationship.set(value);
            }

            if (relationship.dirty && relationship.isValid()) {
                me.setLoading('Updating relationship&hellip;');
                relationship.save({
                    callback: function (savedRecord, operation, success) {
                        if (success) {
                            me.setLoading(false);
                        }
                    }
                });
            }
        },

        onPersonSelect: function(personField) {
            personField.up('editor').completeEdit();
        },

        onBeforePersonEditorComplete: function(editor, value, startValue) {
            console.info('onBeforePersonEditorComplete(%o, %o, %o)', editor, value, startValue);
        },

        onPersonEditorComplete: function(editor, value, startValue) {
            var me = this,
                person = me.getPerson(),
                session = me.getSession(),
                editorField = editor.field,
                editorStore = editorField.getStore(),
                editorModel = editorStore.getModel(),
                selectedRecord = editorField.getSelection(),
                relationship, relationshipNode;

            console.info('onPersonEditorComplete(%o, %o, %o)', editor, value, startValue);

            if (selectedRecord) {
                value = selectedRecord;
            } else if (Ext.isString(value)) {
                value = editorModel.createFromName(value);

                if (!value.isValid()) {
                    // TODO: show error somewhere
                }

                editorStore.add(value);
            }

            // ensure selected record remains available
            session.adopt(value);

            // create new relationship record
            relationship = me.getStore().add({
                Class: CLASS_RELATIONSHIP,
                Label: '',
                Person: person,
                PersonID: person.getId(),
                RelatedPerson: value,
                RelatedPersonID: value.phantom ? null : value.getId(),
                InverseRelationship: {
                    Class: CLASS_RELATIONSHIP,
                    Label: ''
                }
            })[0];

            // reset editor for next use
            editorField.clearValue();

            // activate relationship editor
            relationshipNode = me.getNodeByRecord(relationship);
            me.onRelationshipLabelClick(
                relationship,
                false,
                Ext.fly(relationshipNode).down('.forward-relationship .relationship-label')
            );
        },
    };
});
