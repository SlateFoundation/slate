Ext.define('SlateAdmin.store.people.progress.NoteRecipients', {
    extend: 'Ext.data.Store',


    model: 'SlateAdmin.model.person.progress.NoteRecipient',
    config: {
        grouper: {

            /**
             * Higher indexes are higher priority
             */
            groupsPriority: [
                'Related Contacts',
                'Teachers',
                'School Contacts'
            ],

            property: 'RelationshipGroup',
            sorterFn: function (record1, record2) {
                return (
                    this.groupsPriority.indexOf(record1.get('RelationshipGroup'))
                    > this.groupsPriority.indexOf(record2.get('RelationshipGroup'))
                        ? -1
                        : 1
                );
            }
        },

        sorters: [{

            /**
             * Higher indexes are higher priority
             */
            labelsPriority: [
                'Student',
                'Advisor'
            ],

            sorterFn: function (record1, record2) {
                var label1 = record1.get('Label'),
                    label2 = record2.get('Label'),
                    labelPriority1 = this.labelsPriority.indexOf(label1),
                    labelPriority2 = this.labelsPriority.indexOf(label2);

                if (labelPriority1 == labelPriority2) {
                    if (label1 == label2) {
                        return 0;
                    }

                    return label1 < label2 ? -1 : 1;
                }

                return labelPriority1 > labelPriority2 ? -1 : 1;
            }
        }]
    }
});