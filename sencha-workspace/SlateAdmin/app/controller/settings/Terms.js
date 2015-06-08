/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'settings.terms.Manager',
        'settings.terms.Menu'
    ],
    
    stores: [
        'settings.TermsTree'
    ],
    
    models: [
        'Term'
    ],
    
    routes: {
        'settings/terms': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'settings-terms-manager',
        autoCreate: true,
        
        xtype: 'settings-terms-manager'
    },{
        ref: 'menu',
        selector: 'settings-terms-menu',
        autoCreate: true,
        
        xtype: 'settings-terms-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'settings-terms-manager': {
                show: me.onManagerShow
            },
            'settings-terms-manager treeview': {
                beforedrop: me.onBeforeTermDrop
            },
            'settings-terms-manager button[action=create-term]': {
                click: me.onCreateTermClick
            }
        });
    },
    
    
    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/terms');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();
        
        if (!rootNode.isLoaded()) {
            managerPanel.setLoading('Loading terms&hellip;');
            
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/terms', 'Terms &mdash; Settings');
    },
    
    onBeforeTermDrop: function(node, data, overDropModel) {
        var treeStore = Ext.getStore('settings.TermsTree'),
            overDragModel;

        Ext.Msg.confirm('Moving Term', ('Are you sure you want to move this term to "' + overDropModel.get('Title') + '"'), function (btnId) {
            if (btnId == 'yes') {
                
                if (data.records[0].get('ParentID')) {
                    overDragModel = treeStore.getNodeById(data.records[0].get('ParentID'));
                } else {
                    overDragModel = this.getManager().getRootNode();
                }
                
                data.records[0].beginEdit();
                data.records[0].set('ParentID', overDropModel.get('ID'));
                
                data.records[0].save({
                    callback: function() {
                        treeStore.read({
                            node: overDragModel,
                            callback: function(records) {
                                if (!records.length) {
                                    overDragModel.set('leaf', true);
                                }
                                
                                overDropModel.set('leaf', false);
                                
                                if (!overDropModel.isExpanded()) {
                                    overDropModel.expand();
                                    return false;
                                }
                                
                                overDropModel.appendChild(data.records[0]);
                            }
                        });
                    }
                });
            }    
        }, this);
        
        //returning false to prevent unnecesary re-ordering
        return false;
    },

    onCreateTermClick: function() {
        var selModel = this.getManager().getSelectionModel(),
            selection = selModel.getSelection()[0],
            headerText = selection ? 'Create subterm' : 'Create Term',
            bodyText = 'Enter a name for the new term',
            treeStore = Ext.getStore('settings.TermsTree'),
            newTerm;
            
        bodyText += selection ? (' under "' + selection.get('Title') + '"') : '';
        
        Ext.Msg.prompt(headerText, (bodyText+':'), function(btn, text) {
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newTerm = Ext.create('SlateAdmin.model.Term', {
                    Title: text,
                    ParentID: selection ? selection.get('ID') : null,
                    namesPath: '/' + text
                });

                newTerm.save({
                    success: function() {
                        if(selection) {
                            selection.set('leaf', false);
                            selection.appendChild(newTerm);
                            selection.expand();
                        } else {
                            treeStore.getRootNode().appendChild(newTerm);
                        }
                    }
                });
            }
        });
    }
});