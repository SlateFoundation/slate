/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.Previewer',{
    extend: 'Ext.window.Window'
	,xtype: 'people-details-progress-previewer'
    
    ,config: {
        report: null
    }

	,layout: 'fit'
	,height: 400
	,width: 1200
	,modal: true
	,title: 'Report Preview'
	,items: [{
        xtype: 'component'
        ,itemId: 'previewBox'
        ,cls: 'print-preview'
        ,flex: 1
        ,disabled: true
        ,renderTpl: '<iframe width="100%" height="100%"></iframe>'
        ,renderSelectors: {
            iframeEl: 'iframe'
        }
        ,listeners: {
            afterrender: {
                fn: function(previewBox) {
                    this.mon(previewBox.iframeEl, 'load', function() {
                    	previewBox.setDisabled(false);
                        previewBox.setLoading(false);
                    }, this);
                }
                ,delay: 10
            }
        }
	}]
//	,tpl: [
//		'<h3 class="Subject">{[values[0].CourseTitle]}</h3>'
//		,'<tpl for=".">'
//			,'<span>{PromptTitle} - <b>{Grade}</b></span><br>'
//		,'</tpl>'
//	]
	
	
	//helper functions
	,updateReport: function(report){
		var me = this
            ,previewBox = me.getComponent('previewBox')
			,reportClass = report.get('Class')
			,loadingSrc = ''
			,loadMask
            ,params;
			
		switch(reportClass) {
			case 'Slate\\Progress\\Narratives\\Report':
                me.setTitle('Narrative Preview');
                
				loadingSrc = '/standards/print/preview';
				loadMask = {msg: 'Loading Narrative&hellip;'};
                loadingSrc = '/narratives/print/preview';
				params = {
					narrativeID: report.get('ID')
				}
				
				break;
			
			case 'Standards':
				me.setTitle('Standards Preview');
			
				loadMask = {msg: 'Loading Standards&hellip;'};
				loadingSrc = '/standards/print/preview'
                params = {
					studentID: report.get('StudentID')
					,sectionID: report.get('CourseSectionID')
					,termID: report.get('TermID')
				}
				break;
				
			case 'Slate\\Progress\\Interims\\Report':
				me.setTitle('Interims Preview');
			
				loadMask = {msg: 'Loading Interims&hellip;'};
				loadingSrc = '/interims/pdf/'+report.get('ID');
				break;
		}
		
		previewBox.setLoading(loadMask);

        SlateAdmin.API.request({
            url: loadingSrc,
            params: params,
            success: function(res) {
                var previewBox = me.getComponent('previewBox'),
                    doc = document.getElementById(previewBox.iframeEl.dom.id).contentWindow.document;
                doc.open();
                doc.write(res.responseText);
                doc.close();
            }
        });
		
		me.setReport(report);
	}
});
