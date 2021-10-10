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
            'Slate.store.people.Relationships'
        ],


        config: {
            labelEditor: true,

            store: {
                xclass: 'Slate.store.people.Relationships'
            },
        },


        // component properties
        componentCls: 'contacts-list',


        // dataview properties
        loadMask: false,
        emptyText: 'No contacts have been linked or created yet.',
        disableSelection: true,
        itemTpl: [
            '<tpl if="RelatedPerson && RelatedPerson.isModel">',
            '    <i class="relationship-delete fa fa-minus-circle glyph-danger"></i>',
            '    <div class="forward-relationship">',
            '        <tpl if="ID && !RelatedPerson.phantom">',
            '            <a href="#{[this.getSearchRoute(values)]}">',
            '        </tpl>',
            '        <tpl for="RelatedPerson.getData()">{FirstName} {MiddleName} {LastName}</tpl>',
            '        <tpl if="ID && !RelatedPerson.phantom">',
            '            </a>',
            '        </tpl>',
            '        is a',
            '        <span class="relationship-label">{Label}</span>',
            '        <tpl if="Class == this.CLASS_GUARDIAN">',
            '            (<i class="relationship-guardian-toggle fa fa-shield glyph-shield"></i> guardian)',
            '        <tpl else>',
            '            <i class="relationship-guardian-toggle fa fa-shield glyph-inactive"></i>',
            '        </tpl>',
            '        to this person',
            '    </div>',
            '    <tpl for="InverseRelationship">',
            '        <div class="inverse-relationship">',
            '            <strong>Inverse: </strong>',
            '            This person is a',
            '            <span class="relationship-label">{Label}</span>',
            '            <tpl if="Class == this.CLASS_GUARDIAN">',
            '                (<i class="relationship-guardian-toggle fa fa-shield glyph-shield"></i> guardian)',
            '            <tpl else>',
            '                <i class="relationship-guardian-toggle fa fa-shield glyph-inactive"></i>',
            '            </tpl>',
            '            to',
            '            <tpl for="parent.RelatedPerson.getData()">{FirstName} {MiddleName} {LastName}</tpl>',
            '        </div>',
            '    </tpl>',
            '<tpl elseif="!RelatedPerson">',
            '    <i class="fa fa-plus-circle"></i> Add new&hellip;',
            '</tpl>',
            {
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
        applyLabelEditor: function(labelEditor, oldLabelEditor) {
            if (!labelEditor || typeof labelEditor == 'boolean') {
                labelEditor = {
                    disabled: !labelEditor
                };
            }

            if (typeof labelEditor == 'object' && !labelEditor.isComponent && !oldLabelEditor) {
                labelEditor = Ext.apply({
                    alignment: 'l-l',
                    // autoSize: {
                    //     width: 'boundEl'
                    // },
                    field: {
                        xtype: 'textfield',
                        selectOnFocus: true
                    }
                }, labelEditor);
            }

            return Ext.factory(labelEditor, 'Ext.Editor', oldLabelEditor);
        },

        updateLabelEditor: function (labelEditor) {
            labelEditor.on({
                scope: this,
                beforecomplete: 'onBeforeLabelEditorComplete',
                complete: 'onLabelEditorComplete'
            });

            labelEditor.ownerCmp = this;
        },


        // dataview lifecycle
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

            if (targetEl = ev.getTarget('.relationship-guardian-toggle')) {
                this.onRelationshipGuardianToggleClick(relationship, isInverse, targetEl, ev);
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
            var editor = this.getLabelEditor(),
                originalLabel = isInverse
                    ? relationship.get('InverseRelationship').Label
                    : relationship.get('Label');

            editor.activeRelationship = relationship;
            editor.activeIsInverse = isInverse;
            editor.startEdit(targetEl, originalLabel);
        },

        onBeforeLabelEditorComplete: function(editor, value, startValue) {
            console.info('onBeforeLabelEditorComplete(%o, %o, %o)', editor, value, startValue);
        },

        onLabelEditorComplete: function(editor, value, startValue) {
            var relationship = editor.activeRelationship,
                isInverse = editor.activeIsInverse;

            if (isInverse) {
                const inverseRelationship = relationship.get('InverseRelationship');

                relationship.set('InverseRelationship', Ext.applyIf({
                    Label: value
                }, inverseRelationship));
            } else {
                relationship.set('Label', value);
            }
        },

        onRelationshipGuardianToggleClick: function(relationship, isInverse, targetEl, ev) {
            if (isInverse) {
                const inverseRelationship = relationship.get('InverseRelationship');

                relationship.set('InverseRelationship', Ext.applyIf({
                    Class: inverseRelationship.Class == CLASS_GUARDIAN
                        ? CLASS_RELATIONSHIP
                        : CLASS_GUARDIAN
                }, inverseRelationship));
            } else {
                if (relationship.get('Class') == CLASS_GUARDIAN) {
                    relationship.set('Class', CLASS_RELATIONSHIP);
                } else {
                    relationship.set('Class', CLASS_GUARDIAN);
                }
            }
        },
    };
});