/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.model.asset.Asset', (function() {

	function _convertIdentifier(v, r) {
		if(v) {
			return v;
		}

		var aliases = r.get('Aliases') || []
			,i = 0;

		for(; i < aliases.length; i++) {
			if(aliases[i].Type == this.name) {
				return aliases[i].Identifier;
			}
		}

		return null;
	}

	function _convertEntity(v, r) {
		var entityType = this.entityType
			,cls = r.get(entityType+'Class')
			,entity = r.get(entityType)
			,userClasses = ['Emergenc\\People\\Person', 'Emergence\\People\\User', 'Slate\\People\\Student'];
        console.log()
		if(Ext.Array.contains(userClasses, cls)) {
			return entity.FirstName + ' ' + entity.LastName;
		}

		if(cls == 'Group') {
			return entity.Name;
		}

		return null;
	}

	return {
		extend: 'Ext.data.Model'
		,requires: [
			'SlateAdmin.proxy.Records'
		]

		,idProperty: 'ID'
		,proxy: {
			type: 'slaterecords'
			,url: '/assets'
            ,include: [
                'Aliases',
                'Status',
                'Location',
                'Assignee',
                'Owner'
            ]
		}
		,fields: [
			{
				name: 'ID'
				,type: 'integer'
			}
			,{
				name: 'Name'
				,type: 'string'
				,useNull: true
			}
			,{
				name: 'OwnerClass'
				,type: 'string'
				,useNull: true
			}
			,{
				name: 'OwnerID'
				,type: 'integer'
				,useNull: true
			}
			,{
				name: 'AssigneeID'
				,type: 'integer'
				,useNull: true
			}
			,{
				name: 'LocationID'
				,type: 'integer'
				,useNull: true
			}
			,{
				name: 'StatusID'
				,type: 'integer'
				,useNull: true
			}
			,'Data'
			,'Class'
			// embedded relations
			,'Location'
			,'Status'
			,'Assignee'
			,'Owner'
			,'Aliases'

			// virtual fields
            ,{
                name: 'AssigneeClass',
                convert: function (v, r) {
                    var assignee = r.get('Assignee');

                    return assignee ? assignee.Class : null;
                }
            }
			,{
				name: 'AssigneeName'
				,convert: function (v, r) {
                    var assignee = r.get('Assignee');

                    return assignee ? assignee.FirstName + " " + assignee.LastName: '';
                }
			}
			,{
				name: 'OwnerName'
				,entityType: 'Owner'
				,convert: _convertEntity
			}
			,{
				name: 'MfrSerial'
				,convert: _convertIdentifier
			}
			,{
				name: 'MacAddress'
				,convert: _convertIdentifier
			}
			,{
				name: 'SDPNumber'
				,convert: _convertIdentifier
			}
			,{
				name: 'UUID'
				,convert: _convertIdentifier
			}
			,{
				name: 'SearchDisplayName'
				,convert: function(v,r) {
					var name  = r.get('Name');

					return r.get('MfrSerial') + (name ?' - '+name : '');
				}
			}

			// standard data fields
			,{
				name: 'Manufacturer'
				,mapping: 'Data.Manufacturer'
			}
			,{
				name: 'Model'
				,mapping: 'Data.Model'
			}

//			,'Activity'
//			,'Tickets'
//			,{
//				name: 'AssigneeName'
//				,convert: function(v,r) {
//					var assignee = r.get('Assignee');
//
//					return (assignee.FirstName && assignee.LastName) ? assignee.FirstName + " " + assignee.LastName : 'No Assignee';
//				}
//			}
//			,{
//				name: 'SearchDisplayName'
//				,convert: function(v,r) {
//					return (r.get('MfrSerial') ? r.get('MfrSerial') : '') + '-' + r.get('AssigneeName');
//				}
//			}
		]
	};
}()));
