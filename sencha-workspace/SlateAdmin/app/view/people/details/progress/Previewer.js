/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.Previewer',{
    extend: 'Ext.window.Window'
	,xtype: 'people-details-progress-previewer'

	,layout: 'fit'
	,height: 400
	,report: null
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
		if(!report)
			return false;	
			
		var previewBox = this.getComponent('previewBox')
			,reportClass = report.get('Class')
			,loadingSrc = ''
			,loadMask;
			
		switch(reportClass) {
			case 'Slate\\Progress\\Narratives\\Report':
				this.setTitle('Narrative Preview');
			
				loadMask = {msg: 'Loading Narrative&hellip;'};
				loadingSrc = '/narratives/print/preview?'+Ext.Object.toQueryString({
					narrativeID: report.get('ID')
				});
				
				break;
			
			case 'Standards':
				this.setTitle('Standards Preview');
			
				loadMask = {msg: 'Loading Standards&hellip;'};
				loadingSrc = '/standards/print/preview?'+Ext.Object.toQueryString({
					studentID: report.get('StudentID')
					,sectionID: report.get('CourseSectionID')
					,termID: report.get('TermID')
				});
				break;
				
			case 'Slate\\Progress\\Interims\\Report':
				this.setTitle('Interims Preview');
			
				loadMask = {msg: 'Loading Interims&hellip;'};
				loadingSrc = '/interims/pdf/'+report.get('ID');
				break;
		}
		
		previewBox.setLoading(loadMask);
		previewBox.iframeEl.dom.src = loadingSrc;
		
		this.report = report;
	}
	
	,getReport: function() {	
		return this.report;
	}
});
