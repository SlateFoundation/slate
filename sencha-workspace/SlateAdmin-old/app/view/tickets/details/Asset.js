Ext.define('SlateAdmin.view.tickets.details.Asset',{
    extend: 'Ext.panel.Panel',
    
    xtype: 'tickets-details-asset',
    
    title: 'Asset Details',
    
    config: {
        ticket: null  
    },
    
    bodyCls: 'asset-details-ct',
    bodyPadding: '15 10',
    bodyStyle: {
    	border: 0,
    },
    
    items: [{
        xtype: 'component',
        itemId: 'asset-details',
        tpl: new Ext.XTemplate(
        '<tpl if="Asset">',
            '<tpl for="Asset">',
				'<a class="remove-asset" href="#removeAsset" title="Unlink Asset"><i class="fa fa-times"></i></a>',
                '<h3 class="asset-title">',
	                '<a href="#assets/lookup/{ID}">',
                		'<tpl if="Name">{Name}<tpl else>Asset</tpl>&nbsp; <small class="muted">#{ID}</small>',
					'</a>',
                '</h3>',
				'<div class="asset-short-info">',
					'<span class="asset-info-item"><i class="fa fa-fw fa-tag"></i> {[this.getAssetStatus(values)]}</span>',
	            	'<span class="asset-info-item"><i class="fa fa-fw fa-map-marker"></i> {[this.getAssetLocation(values)]}</span>',
	            	'<span class="asset-info-item"><i class="fa fa-fw fa-user"></i> {[this.getAssetAssignee(values)]}</span>',
            	'</div>',
            '</tpl>',
        '</tpl>',
        
        {
            getAssetStatus: function(asset) {
                var status, statusText = '(Status Unknown)';
  
                if (asset.StatusID) {
                    status = Ext.getStore('assets.Statuses').findRecord('ID', asset.StatusID);
                }
                
                if (status) {
                    statusText = status.get('Title');
                }
                     
                return statusText;
            },
            
            getAssetLocation: function(asset) {
                var status, statusText = '(Location Unknown)';
  
                if (asset.LocationID) {
                    status = Ext.getStore('Locations').findRecord('ID', asset.LocationID);
                }
                
                if (status) {
                    statusText = status.get('Title');
                }
                     
                return statusText;
            },
            
            getAssetAssignee: function(asset) {
                var status, statusText = '(No Assignee)';
  
                if (asset.AssigneeID) {
                    status = new SlateAdmin.model.person.Person(asset.Assignee);
                }
                
                if (status) {
                    statusText = status.get('FullName');
                }
                     
                return statusText;
            }
        })
    },{
    	xtype: 'form',
    	bodyStyle: { border: 0 },
    	items: [{
	        xtype: 'combo',
	        itemId: 'asset-search',
	        margin: '3 0 0',
	        store: {
	            model: 'SlateAdmin.model.Asset',
	
	            proxy: {
	                type: 'ajax',
	                url: '/assets/search',
	                extraParams: {
	                    format: 'json'
	                },
	                reader: {
	                    type: 'json',
	                    root: 'data'
	                }
	            }
	        },
	        
	        queryCaching: false,
	        queryParam: 'q',
	        
	        valueField: 'ID',

			labelAlign: 'right',
	        anchor: '100%',
	
	        fieldLabel: 'Link an Asset',
	        hideTrigger: true,
	        
	        tpl: [
	            '<tpl for=".">',
	                '<div class="x-boundlist-item asset-search-item">',
	                    '<tpl if="Assignee"><tpl for="Assignee"><span class="assignee">{[this.getAssignee(values)]}</span></tpl></tpl>',
	                    '<tpl if="Data.Model"><span class="model">{Data.Model}</span> - </tpl>',
	                    '<span class="serial">{[this.getSerialNumber(values)]}</span>',
	                '</div>',
	            '</tpl>',
	            
	            {
	                
	                getAssignee: function(v) {
	                    var assignee;
	
	                    switch (v.Class.split('\\').pop()) {
	                        case 'Person':
	                        case 'User':
	                            assignee = v.FirstName + ' ' + v.LastName;
	                            break;
	                        case 'Group':
	                            assignee = v.Name;
	                            break;
	                    }
	                    
	                    return assignee ? assignee + ' - ' : '';
	                },
	                
	                getSerialNumber: function(v) {
	                    var serial;
	                    
	                    Ext.each(v.Aliases, function(alias) {
	                        if (alias.Type == 'MfrSerial') {
	                            serial = alias.Identifier;
	                            return false; 
	                        }
	                    });
	                    
	                    return serial;
	                },
	                
	                getMatchedValue: function(v) {
	                    var value;
	                    
	                    switch (v.matches.Class.split('\\').pop()) {
	                        case 'Alias':
	                            value = v.matches.Identifier;
	                            break;
	                        case 'User':
	                        case 'Person':
	                            //value = v.matches.FirstName + ' ' + v.matches.LastName;
	                            break;
	                    }
	                    
	                    return value ? 'matched: ' + value : '';
	                }
	            }
	        ]
    	}]
    }],
    
    initEvents: function() {
        var me = this,
            detailsCmp = me.down('#asset-details'),
            searchCombo = me.down('#asset-search');
        
        detailsCmp.getEl().on('click', function(e, t) {
            return me.onRemoveAssetClick(e, t);
        }, me, {delegate: 'a.remove-asset'});
        
        searchCombo.on('select', me.onAssetSelect, me);
        searchCombo.on('change', me.onAssetSearchChange, me);
        
        me.callParent();
        
    },
    
    onAssetSearchChange: function(combo, value, oldValue) {
        var me = this;
        
        if ((!value || value.length <= 3) && combo.lastValue) {
            combo.getStore().removeAll();
            delete combo.lastValue;
        }
    },
    
    onAssetSelect: function(combo, records) {
        var me = this,
            ticket = me.getTicket(),
            asset = records[0];
        
        ticket.set('AssetID', asset.get('ID'));
        me.setLoading({
            xtype: 'loadmask',
            message: 'Attaching Asset&hellip;'
        });
        
        ticket.save({
            callback: function(ticket, opts, success) {
                me.setLoading(false);
                if (success) {
                    me.up('tickets-manager').updateSelectedTicket(ticket);
                } else {
                    Ext.Msg.alert('Error', 'There was an error attaching the asset. Please try again.');
                }
            }
        });
        
        
        
    },
    
    onRemoveAssetClick: function(evt, target) {
        var me = this,
            ticket = me.getTicket();
        
        evt.preventDefault();
        
        Ext.MessageBox.confirm({
            title: 'Are you sure?',
            msg: 'Are you sure you want to remove the asset?',
            callback: function(response) {
                if (response === 'yes') {
                    return me.doRemoveAsset();
                }
            },
            scope: me,
            buttons: Ext.MessageBox.YESNO 
        });
        
    },
    
    doRemoveAsset: function() {
        var me = this,
            ticket = me.getTicket();
            
        ticket.set('AssetID', null);
        
        me.setLoading({
            xtype: 'loadmask',
            message: 'Removing Asset&hellip;'
        });
        
        ticket.save({
            callback: function(ticket, opts, success) {
                me.setLoading(false);
                if (success) {
                    me.up('tickets-manager').updateSelectedTicket(ticket);
                } else {
                    Ext.Msg.alert('Error', 'There was an error removing the asset. Please try again.');
                }
            },
            scope: me
        });
    },
    
    updateTicket: function(ticket, oldTicket) {
        var me = this,
            search = me.down('#asset-search'),
            detailsCmp = me.down('#asset-details'),
            asset;
        
        if (!ticket) {
            me.ticket = null;
            detailsCmp.update({});
            return false;
        }
        
        if (ticket.phantom){
            me.disable();
        } else {
            me.enable();
        }
        
        me.ticket = ticket;
        asset = ticket.get("Asset");
        
        if (!asset) {
            search.show();
            detailsCmp.update({});
            detailsCmp.hide();
        } else {
            search.hide();
            detailsCmp.show();
            detailsCmp.update(ticket.getData());    
        }
        
    }
    
});