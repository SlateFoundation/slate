/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'people-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.selection.CheckboxModel'
    ],


    // people-grid config
//    exportItems: null,
//    firstRefill: true,
//    exportFieldsLoaded: false,
//    pendingCheckedFields: false,


    // grid config
    store: 'people.People',
    viewConfig: {
        emptyText: 'Search or select a group on the left to find people',
        deferEmptyText: false
    },
    selType: 'checkboxmodel',
    multiSelect: true,
    selModel: {
        pruneRemoved: false
    },

    bbar: [{
        xtype: 'tbtext',
        itemId: 'selectionCount',
        text: ''
    },{
        xtype: 'tbfill'
    },{
        xtype: 'button',
        text: 'Export Results',
        itemId: 'exportResultsBtn',
        glyph: 0xf064,
        menu: {
//            showSeparator: true,
            //plain: true,
            stateId: 'people-grid-exportmenu',
            // TODO: store selected columns in state
//            stateful: true,
//            stateEvents: [
//                'exportformatchange'
//            ],
//            getState: function() {
//                var state = {},
//                    checkedFields = this.query('#exportFieldsMenu menucheckitem[checked=true]'),
//                    checkedValues = !Ext.isEmpty(checkedFields) ? Ext.Array.map(checkedFields, function(field) {
//                        return field.value;
//                    }) : false;
//
//                state.exportType = this.down('#exportTypeMenu menucheckitem[checked=true]').value;
//                state.exportFields = checkedValues;
//
//                return (state.exportFields && state.exportType) ? state : Ext.state.Manager.get('exportResultsMenu');
//            },
//            applyState: function(state) {
//                var me = this;
//
//                if(state) {
//                    if(state.exportType) {
//                        me.down('#exportTypeMenu menucheckitem[value='+state.exportType+']').setChecked(true);
//                    }
//
//                    if(state.exportFields) {
//                        if(!me.exportFieldsLoaded) {
//                            me.pendingCheckedFields = state.exportFields;
//                        }
//
//                        setTimeout(function() {
//                            me.fireEvent('exportfieldsrefill', (!me.pendingCheckedFields ? state.exportFields: me.pendingCheckedFields));
//                        }, 1000);
//                    }
//                }
//            },
            items: [{
                text: 'JSON',
                exportFormat: 'json'
            },{
                text: 'PDF',
                exportFormat: 'pdf'
            },{
                text: 'CSV',
                exportFormat: 'csv',
                menu: {
                    plain: true,
                    itemId: 'csvExportColumns',
                    items: [
                        '<b class="menu-title">Choose columns</b>',
                        {
                            itemId: 'columnsPlaceholder',
                            cls: 'export-columns-loading'
                        },
                        '-',
                        {
                            text: 'Export',
                            exportFormat: 'csv'
                        }
                    ]
                }
            }]
        },
        action: 'export-people'
    },{
        xtype: 'button',
        itemId: 'sendInvitationsBtn',
        // icon: '/img/icons/fugue/mail--arrow.png',
        glyph: 0xf003,
        text: 'Send Login Invitations'
    }],

    columns: {
        defaults: {
            menuDisabled: true
        },
        items: [{
            dataIndex: 'PrimaryPhotoID',
            width: 30,
            resizable: false,
            renderer: function(v, metaData, record) {
                if(v) {
                    metaData.style = 'background: url(/thumbnail/'+v+'/30x30/cropped) no-repeat center center; background-size: cover';
                }
            }
        },{
            text: 'First Name',
            dataIndex: 'FirstName',
            sortable: true,
            width: 100
        },{
            text: 'Last Name',
            dataIndex: 'LastName',
            sortable: true,
            width: 100
        },{
            text: 'Username',
            dataIndex: 'Username',
            flex: 1
        },{
            text: 'Email',
            dataIndex: 'Email',
            hidden: true,
            flex:1,
            renderer: function(v) {
                return v ? '<a href="mailto:'+v+'">'+v+'</a>' : '';
            }
        },{
            text: 'Student #',
            dataIndex: 'StudentNumber',
            width: 100
        },{
            text: 'Advisor',
            dataIndex: 'Advisor',
            xtype: 'templatecolumn',
            tpl: '<tpl for="Advisor">{LastName}</tpl>'
        },{
            text: 'Grad. Year',
            dataIndex: 'GraduationYear',
            width: 90
        }]
    }


    // people-grid methods
    // TODO: move these to controller
//    setExportItems: function(exportItems) {
//        if(!exportItems)
//            return false;
//
//        this.exportItems = exportItems;
//        this.updateExportItems(exportItems);
//
//    },
//
//    getExportItems: function() {
//        return this.exportItems;
//    },
//
//    updateExportItems: function(exportItems) {
//        var menu = this.down('#exportResultsBtn #exportFieldsMenu'),
//            checkItemCmps = [], checkItem, i;
//
//        menu.removeAll();
//
//        for (i = 0;i<exportItems.length; i++) {
//            checkItem = {xtype: 'menucheckitem', checked: true, value: exportItems[i].columnId};
//
//            checkItem.text = exportItems[i].title;
//
//            checkItemCmps.push(checkItem);
//        }
//
//        menu.add(checkItemCmps);
//        this.exportFieldsLoaded = true;
//    },
//
//    checkExportItems: function(exportItems) {
//        var exportBtn = this.down('#exportResultsBtn'),
//            checkItems = exportBtn.menu.query('#exportFieldsMenu menucheckitem'),
//            key;
//
//        for(key in checkItems) {
//            checkItems[key].setChecked(Ext.Array.contains(exportItems, checkItems[key].value), true);
//        }
//    }
});
