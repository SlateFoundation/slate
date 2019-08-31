Ext.define('EmergenceEditor.view.menu.Multiple', {
    extend: 'Ext.menu.Menu',
    xtype: 'emergence-menu-multiple',


    config: {
        selectedNodes: null
    },

    items: [
        {
            text: 'Open',
            action: 'open',
            iconCls: 'x-fa fa-files-o'
        },
        {
            text: 'Delete',
            action: 'delete',
            iconCls: 'x-fa fa-trash'
        }
    ],


    // config handlers
    updateSelectedNodes: function(selectedNodes) {
        var openItem = this.child('[action=open]'),
            deleteItem = this.child('[action=delete]'),
            containsCollection = Ext.Array.findBy(selectedNodes, function(node) {
                return !node.isLeaf();
            }),
            containsFile = Ext.Array.findBy(selectedNodes, function(node) {
                return node.isLeaf();
            }),
            noun = 'nodes';

        if (containsCollection && !containsFile) {
            noun = 'collections';
        } else if (containsFile && !containsCollection) {
            noun = 'files';
        }

        openItem.setText('Open '+selectedNodes.length+' '+noun);
        openItem.setVisible(!containsCollection);
        deleteItem.setText('Delete '+selectedNodes.length+' ' + noun);
    }
});