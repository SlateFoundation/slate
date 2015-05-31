/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Activity', {
    extend: 'Ext.data.Model',

    parentNode: null,

    // model config
    idProperty: 'ID',
    
    fields: [{
        name: 'ID',
        type: 'integer'
    },
    {
        name: 'Class',
        defaultValue: 'Activity'
    },
    {
        name: 'Created',
        type: 'date',
        dateFormat: 'timestamp',
        useNull: true
    },
    {
        name: 'ActorID',
        type: 'integer',
        useNull: true
    },
    {
        name: 'ActorClass',
        defaultValue: 'Person'
    },
    {
        name: 'Actor',
        useNull: true
    },
    {
        name: 'ObjectID',
        type: 'integer',
        useNull: true
    },
    {
        name: 'ObjectClass'
    },
    {
        name: 'Actor',
        useNull: true
    },
    {
        name: 'Verb',
        type: 'string'
    },
    
    'Data',
    'changes',
    'Media',
    'error',
    {
        name: 'verb',
        persist: false,
        convert: function(v, r) {
            if (v) {
                return v;
            } else {
                return v = r.getActivityVerb();
            }
            
        }
    },{
        name: 'noun',
        persist: false,
        convert: function(v, r) {
            if (!v) {
                v = r.get('ObjectClass').split('\\').pop().toLowerCase();
            }
            
            return v;
        }
    },{
        name: 'object',
        persist: false,
        convert: function(v, r) {
            var determiner;
            if (!v) {
                switch(r.get('ObjectClass').split('\\').pop()) {
                    case 'Alias':
                        determiner = 'an';
                        break;
                    default:
                        determiner = 'this';
                }
                
                v = [determiner, r.get('noun')].join(' ');
            }
            
            return v;
        }
    },{
        name: 'link',
        persist: false,
        convert: function(v, r) {
//            if (v === undefined) {
//                switch (r.get('noun')) {
//                    case 'asset':
//                    case 'alias':
//                        v = false;
//                        
//                }
//            }            
            return v = true;
        }
    },{
        name: 'avatar',
        persist: false,
        convert: function(v, r) {
            if (!v) {
                if (r.get('Actor') && r.get('Actor').PrimaryPhotoID) {
                    v = '//' + document.location.host + '/thumbnail/'+r.raw.Actor.PrimaryPhotoID+'/72x72/cropped';
                } else {
                    v = '//fillmurray.com/72/72';
                }
            }
            
            return v;
        }
    },{
        name: 'subject',
        persist: false,
        convert: function(v, r) {
            var actor = r.get('Actor');
            if (!v && actor) {
                v = actor.FirstName + ' ' + actor.LastName;
            } else {
                v = '(unknown)';
            }
            return v;
        }
    },{
        name: 'action',
        persist: false,
        convert: function(v, r) {
            if (!v) {
                v = r.getActivityAction();
            }
            
            return v;
        }
    },{
        name: 'note',
        persist: false,
        convert: function(v, r) {
            if (!v && r.get('Class') == 'CommentActivity') {
                v = r.get('Data');
            } else if (!v && r.get('Class') == 'MediaActivity') {
                v = null;
            } else if(!v && r.get('Class') == 'DeltaActivity' && r.get('Verb') == 'create') {
                if (!r.data.changes.length)
                    r.data.changes = [];
                    r.data.changes.push({property: r.get('Data').Type, before: {displayValue: null}, after: {displayValue: r.get('Data').Identifier}});
            }
            
                    //replace escaped line breaks & apostrophe's
            return v ? v.replace(/\\r?\\n/g, '<br />').replace(/\\'/g, "'") : null;
        }
    },{
        name: 'body',
        persist: false,
        convert: function(v, r) {
            if (typeof v != 'boolean') {
                v = r.get('Verb') == 'update' || r.get('note') || r.get('Class') == 'MediaActivity' || (r.get('Verb') == 'create' && r.data.changes.length);
            }
            
            return v;
        }
    }
    ],
    
    //model methods
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    
    getActivityAction: function() {
        var r = this,
            cls = r.get('Class'),
            verb = r.get('Verb'),
            v;
        
        switch (cls) {
            case 'DeltaActivity':
                v = verb + 'd';
                break;
            case 'CommentActivity':
                if (verb == 'comment') {                    
                    v = verb + 'ed on';
                } else if (verb == 'update') {
                    v = verb + 'd a comment on';
                } else if (verb == 'delete') {
                    v = verb + 'd a comment on';
                }
                break;
            case 'MediaActivity':
                v = verb + ' media on';
                break;
        }
    
        return v;
    },
    
    getActivityVerb: function() {
        var r = this,
            v;
        
        switch (r.get('Class')) {
            case 'DeltaActivity':
                switch (r.get('Verb')) {
                    case 'create':
                    case 'delete':
                        v = r.get('Verb');
                        break;
                    case 'update':
                        v = 'edit';
                        break;
                }
                break;
            case 'CommentActivity':
                v = 'note';
                break;
            
            case 'MediaActivity':
                v = 'media';
                break;
        }
        
        return v;
    }
});