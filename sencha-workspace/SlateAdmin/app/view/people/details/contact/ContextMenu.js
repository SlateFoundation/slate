/*jslint browser: true, undef: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.people.details.contact.ContextMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'contact-contextmenu',
    requires: [
        'SlateAdmin.model.Person'
    ],


    plain: true,
    cls: 'menu-contact',
    record: false,
    person: null,
    noun: 'contact point',
    isPrimary: false,
    items: [{
        text: 'Mobile Phone',
        ref: 'headline'
    },'-',{
        text: 'Mark primary',
        iconCls: 'icon-contact-primary',
        ref: 'btnPrimary'
    },{
        text: 'Delete contact point',
        iconCls: 'icon-contact-delete',
        ref: 'btnDelete'
    }],


    setRecord: function(record, person) {
        var me = this,
            noun = 'contact point',
            isPrimary = false;

        if (!record) {
            return false;
        }

        me.record = record;

        if (me.person && me.person.getId() == record.get('PersonID')) {
            person = me.person;
        } else {
            me.person = person = person || Ext.getStore('People').getById(record.get('PersonID'));
        }

        if (!person) {
            SlateAdmin.model.Person.load(record.get('PersonID'), {
                callback: function(newPerson) {
                    me.setRecord(record, newPerson);
                }
            });
            return false;
        }

        switch (record.get('Class')) {
            case 'PhoneContactPoint':
                noun = 'phone number';

                if (record.get('ID') == person.get('PrimaryPhoneID')) {
                    isPrimary = true;
                }

                break;

            case 'AddressContactPoint':
                noun = 'address';

                if (record.get('ID') == person.get('PrimaryAddressID')) {
                    isPrimary = true;
                }

                break;

            case 'EmailContactPoint':
                noun = 'email address';

                if (record.get('ID') == person.get('PrimaryEmailID')) {
                    isPrimary = true;
                }

                break;
        }


        me.down('menuitem[ref=headline]').setText(record.get('Label'));
        me.down('menuitem[ref=btnPrimary]').setDisabled(isPrimary).setText('Mark primary '+noun);
        me.down('menuitem[ref=btnDelete]').setText('Delete '+noun);
    }
});