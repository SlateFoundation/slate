/*jslint browser: true, undef: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.controller.courses.Participants', {
    extend: 'Ext.app.Controller',
    requires: [
        'SlateAdmin.API'
    ],


    // controller config
    views: [
        'courses.sections.details.Participants'
    ],

    refs: [{
        ref: 'participantsPanel',
        selector: 'courses-sections-details-participants',
        autoCreate: true,
        
        xtype: 'courses-sections-details-participants'
    },{
        ref: 'participantsGrid',
        selector: 'courses-sections-details-participants grid'
    },{
        ref: 'roleField',
        selector: 'courses-sections-details-participants #roleField'
    },{
        ref: 'personField',
        selector: 'courses-sections-details-participants #personField'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'courses-sections-manager #detailTabs': {
                beforerender: me.onBeforeTabsRender
            },
            'courses-sections-details-participants': {
                sectionloaded: me.onSectionLoaded
            },
            'courses-sections-details-participants field': {
                specialkey: me.onFieldSpecialKey
            },
            'courses-sections-details-participants button[action=add-participant]': {
                click: me.onAddParticipantClick
            }
        });
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getParticipantsPanel());
    },

    onSectionLoaded: function(participantsPanel, section) {
        var me = this,
            participantsStore = me.getParticipantsGrid().getStore();

        // configure proxy and load store
        participantsStore.getProxy().url = '/sections/' + section.get('Code') + '/participants';
        participantsStore.load();
    },
    
    onFieldSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER && Ext.isNumber(this.getPersonField().getValue())) {
            this.doAddParticipant();
        }
    },
    
    onAddParticipantClick: function() {
        this.doAddParticipant();
    },


    // internal methods
    doAddParticipant: function() {
        var me = this,
            participantsStore = me.getParticipantsGrid().getStore(),
            participantsPanel = me.getParticipantsPanel(),
            section = participantsPanel.getLoadedSection(),
            roleField = me.getRoleField(),
            personField = me.getPersonField(),
            role = roleField.getValue(),
            personId = personField.getValue();

        if (!personId) {
            personField.focus();
            return;
        }

        participantsPanel.setLoading('Adding participant&hellip;');
        SlateAdmin.API.request({
            method: 'POST',
            url: section.toUrl() + '/participants',
            params: {
                CourseSectionID: section.getId(),
                PersonID: personId,
                Role: role
            },
            success: function(response) {
                var responseData = response.data,
                    particpant = responseData.data;
                
                if (responseData.success && particpant) {
                    particpant.Person = personField.findRecordByValue(personId).getData();
                    particpant = participantsStore.getProxy().getReader().readRecords([particpant]);
                    participantsStore.add(particpant.records[0]);
                    personField.reset();
                    personField.focus();
                    
                    if (role == 'Student') {
                        section.set('StudentsCount', section.get('StudentsCount') + 1);
                        section.commit(false, ['StudentsCount']);
                    }
                } else {
                    Ext.Msg.alert('Not added', responseData.message || 'This person could not be added as a participant.');
                }
                
                participantsPanel.setLoading(false);
            }
        });
    }
});