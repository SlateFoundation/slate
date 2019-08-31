/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Provides for marking rows or cells as invalid and displaying an error via QuickTip
 */
Ext.define('Jarvus.view.TableErrors', {
    override: 'Ext.view.Table',

    invalidCellCls: Ext.baseCSSPrefix + 'grid-cell-invalid',
    invalidRowCls: Ext.baseCSSPrefix + 'grid-row-invalid',

    markCellInvalid: function(record, headerId, error) {
        var me = this,
            header = me.ownerCt.getColumnManager().getHeaderById(headerId),
            cell = me.getCell(record, header); // CAUTION: getCell is a private method

        cell.addCls(me.invalidCellCls);

        if (error) {
            cell.set({
                'data-errorqtip': me.formatErrorTip(error)
            });
        }
    },

    markRowInvalid: function(record, error) {
        var me = this,
            row = Ext.fly(me.getNode(record));

        row.addCls(me.invalidRowCls);

        if (error) {
            row.set({
                'data-errorqtip': me.formatErrorTip(error)
            });
        }
    },

    clearInvalid: function(record, headerId) {
        var me = this,
            invalidCellCls = me.invalidCellCls,
            header, targetEl;

        if (headerId) {
            header = me.ownerCt.getColumnManager().getHeaderById(headerId);
            targetEl = me.getCell(record, header);
            targetEl.removeCls(invalidCellCls).set({'data-errorqtip': ''});
        } else {
            targetEl = Ext.fly(me.getNode(record));
            targetEl.removeCls(me.invalidRowCls).set({'data-errorqtip': ''}).select('.'+invalidCellCls).removeCls(invalidCellCls).set({'data-errorqtip': ''});
        }
    },

    formatErrorTip: function(error) {
        if (Ext.isObject(error)) {
            error = Ext.Object.getValues(error);
        }

        if (Ext.isArray(error)) {
            error = Ext.String.format('<ul><li>{0}</li></ul>', error.join('</li><li>'));
        }

        return error;
    }
}, function() {
    //<debug>
    if (!Ext.getVersion().match('5.1.1.451')) {
        console.warn('This override has not been tested with this framework version');
    }
    //</debug>
});