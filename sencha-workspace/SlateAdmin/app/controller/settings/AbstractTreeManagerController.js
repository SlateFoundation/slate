/**
 * Settings managers backed by a tree panel + tree store (terms, groups,
 * locations): root/child node creation via inline cell editing, and
 * deletes that keep the parent's leaf flag in sync.
 */
Ext.define('SlateAdmin.controller.settings.AbstractTreeManagerController', {
    extend: 'SlateAdmin.controller.settings.AbstractManagerController',


    // event handlers
    onCreateClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel(),
            record = managerPanel.getRootNode().insertChild(0, Ext.apply({
                leaf: true
            }, me.buildNodeData(null)));

        managerPanel.getPlugin('cellediting').startEdit(record, 0);
    },

    onCreateChildClick: function(managerPanel, parentRecord) {
        var cellEditing = managerPanel.getPlugin('cellediting'),
            record = parentRecord.insertChild(0, Ext.apply({
                ParentID: parentRecord.getId(),
                leaf: true
            }, this.buildNodeData(parentRecord)));

        managerPanel.expandRecord(parentRecord, function() {
            Ext.defer(cellEditing.startEdit, 50, cellEditing, [record, 0]);
        });
    },

    onDeleteRecordClick: function(grid, record) {
        var me = this,
            parentNode = record.parentNode;

        grid.setSelection(record);

        Ext.Msg.confirm(me.deleteConfirmTitle, me.deleteConfirmMessage, function(btn) {
            if (btn != 'yes') {
                return;
            }

            record.erase({
                success: function() {
                    parentNode.set('leaf', 0 == parentNode.childNodes.length);
                }
            });
        });
    },


    // subclass contract

    /**
     * @template
     * Extra field values for a node created at the root (parentRecord
     * null) or under parentRecord; ParentID/leaf are handled by the base
     */
    buildNodeData: function(parentRecord) {
        return {};
    }
});
