Ext.define('SlateAdmin.view.template.Activity', {
    extend: 'Ext.XTemplate',
    requires: [
        'Jarvus.ux.LightBox'  
    ],
    constructor: function(config) {
        var me = this,
            html = [
            
            '<div class="ct">',
	            '<tpl for=".">',

	                '<article class="activity-item {verb}-activity {noun}-activity">',
	
	                    '<header class="activity-header">',
	                        '<img class="activity-avatar" src="{avatar}" width=36 height=36 alt="">',
	                        '<div class="activity-meta">',
	                            '<strong class="activity-subject">{subject}</strong> ',
	                            '<span class="activity-action">{action} </span>',
	                            '<span class="activity-object"><tpl if="link"><a class="ticket-id" href="javascript:void(0)">{object}</a></tpl></span>',
	                            '<div><time class="activity-timestamp" datetime="{Created:date("Y-m-d H:i")}" dt="2014-05-23 13:43">{Created:date("D, M j, Y")}&nbsp;&nbsp;&middot;&nbsp;&#32;{Created:date("g:i a")}</time></div>',
	                        '</div>',
	                    '</header>',
	
	                    '<tpl if="body">',
	                        '<div class="activity-body">',
	                            '<tpl if="changes">',
	                                '<dl class="activity-changes">',
	                                    '<tpl for="changes">',
	                                        '<div class="dli">',
	                                            '<dt>{property}</dt>',
	                                            '<dd>',
	                                                '<tpl if="before">',
                                                        '<tpl for="before">',
	                                                        '<del>',
                                                                '<tpl if="displayValue == 0 || displayValue == null">',
                                                                    '(none)',
                                                                '<tpl elseif="displayValue">',
                                                                    '{displayValue}',
                                                                '<tpl elseif="value == 0 || value == null">',
                                                                    '(none)',
                                                                '<tpl else>',
                                                                    '{value}',
                                                                '</tpl>',
                                                            '</del> <span class="arrow">&rarr;</span> ',
	                                                    '</tpl>',
                                                    '</tpl>',
                                                    '<ins>',
                                                        '<tpl if="after">',
                                                            '<tpl for="after">',
                                                                '<tpl if="displayValue == 0 || displayValue == null">',
                                                                    '(none)',
                                                                '<tpl elseif="displayValue">',
                                                                    '{displayValue}',
                                                                '<tpl elseif="value == 0 || value == null">',
                                                                    '(none)',
                                                                '<tpl else>',
                                                                    '{value}',
                                                                '</tpl>',
                                                            '</tpl>',
                                                        '</tpl>',
	                                                '</ins>',
	                                            '</dd>',
	                                        '</div>',
	                                    '</tpl>',
	                                '</dl>',
	                            '<tpl elseif="note">',
                                    '<div class="activity-note">{note}</div>',
                                                                
                                    '<tpl if="Media">',
                                        '<ul class="upload-previews">',
                                            '<tpl for="Media">',
                                                '<li class="activity-note-photo upload-preview" style="background-image: url(/media/open/{[values.ID]})">',
                                                    '<a class="preview-photo preview-button fa fa-eye fa-2x" title="{[values.Caption]}" href="/media/open/{[values.ID]}" target="_blank">',
                                                    '</a>',
                                                '</li>',
                                            '</tpl>',
                                        '</ul>',
                                    '</tpl>',
                                    
                                '</tpl>',
	                        '</div>',
	                    '</tpl>',
	
	                '</article>',
	            '</tpl>',
	        '</div>'
	    ];
        
        me.callParent(html);
        
        Jarvus.ux.LightBox.register('.preview-photo');
    }
});