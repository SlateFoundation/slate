/**
 * Handles exporting people search results (JSON/CSV) from the people grid,
 * including building the CSV column-selection menu from the server's field
 * catalog. Split out of the People controller, which owns routing/search/
 * selection.
 */
Ext.define('SlateAdmin.controller.people.Export', {
    extend: 'Ext.app.Controller',
    requires: [
        /* globals Slate */
        'Slate.API'
    ],


    // controller config
    refs: {
        exportColumnsMenu: 'people-grid menu#csvExportColumns'
    },

    control: {
        'people-grid button#exportResultsBtn menuitem[exportFormat]': {
            click: 'onExportFormatButtonClick'
        },
        'people-grid menu#csvExportColumns': {
            beforeshow: 'onBeforeCsvExportColumnsMenuShow'
        }
    },


    // event handlers

    /**
     * Exports data in the requested format.
     * @param {Ext.menu.Item} menuItem The menuitem specifying the desired format
     * @return {void}
     */
    onExportFormatButtonClick: function(menuItem) {
        var me = this,
            exportColumnsMenu = me.getExportColumnsMenu(),
            exportFormat = menuItem.exportFormat,
            params = Ext.applyIf({
                format: exportFormat
            }, Ext.getStore('People').getProxy().extraParams),
            url;

        if (exportFormat == 'json') {
            params.include = '*';
        } else if (exportFormat == 'csv') {
            params.columns = Ext.Array.pluck(exportColumnsMenu.query('menuitem[checked]'), 'itemId').join(',');
        }

        url = Slate.API.buildUrl('/people?' + Ext.Object.toQueryString(params));

        if (exportFormat == 'json') {
            window.open(url, '_blank');
        } else {
            location.href = url;
        }
    },

    /**
     * Generates the column options for the CSV export sub menu from the results
     * of a server request to /people/*fields.
     * @param {Ext.menu.Menu} menu The CSV export column selection menu
     * @return {void}
     */
    onBeforeCsvExportColumnsMenuShow: function(menu) {
        var columnsPlaceholder = menu.down('#columnsPlaceholder'),
            selectedFieldKeys = ['FirstName', 'LastName', 'Username', 'StudentNumber', 'GraduationYear', 'Advisor', 'PrimaryEmail'];

        if (menu.loaded) {
            return;
        }

        menu.loaded = true;

        columnsPlaceholder.show();

        Slate.API.request({
            method: 'GET',
            url: '/people/*fields',
            success: function(response) {
                var recordData = response.data,
                    fields = recordData.fields,
                    dynamicFields = recordData.dynamicFields,
                    menuItems = [],
                    key, keyBits;

                for (key in fields) {
                    if (!fields.hasOwnProperty(key)) {
                        continue;
                    }

                    if (key == 'RevisionID') {
                        continue;
                    }

                    keyBits = key.match(/(\w+)ID(s?)/);
                    if (keyBits && dynamicFields.hasOwnProperty(keyBits[1]+keyBits[2])) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: fields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'field'
                    });
                }

                for (key in dynamicFields) {
                    if (!dynamicFields.hasOwnProperty(key)) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: dynamicFields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'dynamicField'
                    });
                }

                Ext.suspendLayouts();
                menu.insert(menu.items.indexOf(columnsPlaceholder)+1, menuItems);
                columnsPlaceholder.hide();
                Ext.resumeLayouts(true);
            }
        });
    }
});
