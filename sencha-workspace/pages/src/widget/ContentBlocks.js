Ext.define('Site.widget.ContentBlocks', {
    requires: [
        'Ext.DomHelper'
    ],

    config: {
        currentEditingEl: null,
        currentInitialValue: null,

        editorEl: null,

        textareaEl: null,
        submitBtnEl: null,
        cancelBtnEl: null
    },

    constructor: function() {
        Ext.onReady(this.onDocReady, this);
    },

    onDocReady: function() {
        var me = this,
            contentEl = Ext.get('content'),
            body = Ext.getBody(),
            contentEditorBlock,
            editorEl = Ext.get(Ext.DomHelper.createDom({
                tag: 'div',
                cls: 'content-editor'
            })),
            textareaEl, submitBtnEl, cancelBtnEl, hints = [];

        editorEl.setStyle({position: 'absolute', display: 'none'}).appendTo(Ext.getBody());
//        body.appendChild(editorEl);
//        debugger;
        //create hints
        hints.push(Ext.DomHelper.createDom('<p class="hint hint-markdown">Use <a href="https://www.markdownguide.org/cheat-sheet" target=_blank>Markdown</a> for formatting.<br>You can drag an image into this area to upload and generate a code for it.</p>'));
        hints.push(Ext.DomHelper.createDom('<p class="hint hint-html">Use <strong>HTML</strong> for formatting.<br>You can drag an image into this area to upload and generate a code for it.</p>'))
        hints.push(Ext.DomHelper.createDom('<p class="hint hint-text">Use plain text, no formatting is available.</p>'));

        editorEl.appendChild(hints);

        textareaEl = Ext.get(Ext.DomHelper.createDom('<textarea />'));//.appendTo(editorEl);
        submitBtnEl = Ext.get(Ext.DomHelper.createDom('<button class="save">Save</button>'));//.appendTo(editorEl);
        cancelBtnEl = Ext.get(Ext.DomHelper.createDom('<button class="cancel">Cancel</button>'));//.appendTo(editorEl);

        editorEl.appendChild(textareaEl);
        editorEl.appendChild(submitBtnEl);
        editorEl.appendChild(cancelBtnEl);

        me.initConfig({
            textareaEl: textareaEl,
            submitBtnEl: submitBtnEl,
            cancelBtnEl: cancelBtnEl,
            editorEl: editorEl
        });

        body.on('click', me.onContentClick, me, {Xdelegate: '.content-editable'});

        editorEl.on('drop', me.onEditorElDrop, me);
        editorEl.on('dragover', me.onEditorElDragOver, me);
        editorEl.on('dragleave', me.onEditorElDragLeave, me);
        editorEl.on('dragenter', me.onEditorElDragEnter, me);

        cancelBtnEl.on('click', function(ev, t) {
            editorEl.hide();
            me.resetEditing();
        }, me);
        //
        submitBtnEl.on('click', function(ev, t) {
            ev.preventDefault();
            me.submitContent();
        }, me);

        textareaEl.on({
            input: Ext.bind(me.syncEditorContent, me),
            propertychange: Ext.bind(me.syncEditorContent, me),
            scope: me
        });

        Ext.get(window).on('resize', Ext.bind(me.syncEditorPosition, me));


    },

    onContentClick: function(ev, t) {
        var me = this,
            editorEl = me.getEditorEl(),
            textareaEl = me.getTextareaEl(),
            currentEditingEl = me.getCurrentEditingEl(),
            editableEl = Ext.fly(t).findParent('.content-editable', null, true),
            currentInitialValue;

        if (editableEl && t.tagName != 'A') {

            if (currentEditingEl) {
                me.resetEditing();
        	}

            me.setCurrentEditingEl(editableEl);

            editorEl.addCls('renderer-'+editableEl.getAttribute('data-content-renderer'));

            currentInitialValue = editableEl.getAttribute('data-content-value');

            if (typeof currentInitialValue !== 'string') {
                currentInitialValue = editableEl.getHtml().trim();
            }

            me.setCurrentInitialValue(currentInitialValue);

        	textareaEl.dom.value = currentInitialValue;

        	me.syncEditorPosition();

        	editorEl.show();

            me.putCursorAtEnd(textareaEl);

        }
    },

    resetEditing: function() {
        var me = this,
            editorEl = me.getEditorEl(),
            currentEditingEl = me.getCurrentEditingEl(),
            currentInitialValue = me.getCurrentInitialValue();

        me.renderContent(currentInitialValue);

        editorEl.removeCls('renderer-'+currentEditingEl.getAttribute('data-content-renderer'));

        me.setCurrentEditingEl(null);
    },

    renderContent: function(value) {
        var me = this,
            currentEditingEl = me.getCurrentEditingEl(),
            renderer = currentEditingEl.getAttribute('data-content-renderer');

        switch (renderer) {
    		case 'markdown':
				currentEditingEl.setHtml(markdown && value ? markdown.toHTML(value) : (value||''));
				break;
			case 'html':
				currentEditingEl.setHtml(value);
				break;
			default:
				currentEditingEl.setHtml(_htmlEncode(value));
		}
    },

    syncEditorContent: function() {
        var me = this,
            textareaEl = me.getTextareaEl(),
            currentEditingEl = me.getCurrentEditingEl();

        me.renderContent(textareaEl.getValue());

		me.syncEditorPosition();

		// sync position again after any images load
//		currentEditingEl.find('img').load(Ext.bind);
    },

    htmlEncode: function(text) {
        var me = this;

        return text.replace(new RegExp("[&'\"<>]", "g"), function(t) {
			switch (t) {
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '&': return '&amp;';
				case '"': return '&quot;';
				case "'": return '&#39;';
			}
			return foo;
		}).replace(new RegExp("([^>\r\n]?)(\r\n|\n\r|\r|\n)","g"), '$1<br>');
    },

    syncEditorPosition: function() {
        var me = this,
            editorEl = me.getEditorEl(),
            currentEditingEl = me.getCurrentEditingEl();

        if (!currentEditingEl) {
    		return;
		}

        editorEl.show().anchorTo(currentEditingEl, 'tl-bl?');

    },

    putCursorAtEnd: function(el) {
        var me = this,
            pos = el.dom.value.length,
            range;

        if (el.dom.createTextRange !== undefined) {
    		range = el.dom.createTextRange();
			range.move("character", pos);
			range.select();
		} else if (el.dom.selectionStart !== undefined) {
			el.focus(1000);
			el.dom.setSelectionRange(pos, pos);
		}

    },

    submitContent: function() {
//        debugger;
        var me = this,
            currentEditingEl = me.getCurrentEditingEl(),
            editorEl = me.getEditorEl(),
            textareaEl = me.getTextareaEl(),
            contentField = currentEditingEl.getAttribute('data-content-field'),
            contentPhantom = currentEditingEl.getAttribute('data-content-phantom') === "true",
            url = currentEditingEl.getAttribute('data-content-endpoint') + '/json',
    		postData = {},
            contentHandle;

		editorEl.addCls('saving');

		postData[contentField] = textareaEl.getValue();
        if (contentPhantom) {
            url += '/create';
            postData['Handle'] = currentEditingEl.getAttribute('data-content-id');
        } else {
            url += '/' + currentEditingEl.getAttribute('data-content-id') + '/edit';
        }

		Ext.Ajax.request({
			url: url,
			method: 'POST',
			params: postData,
            scope: me,
            success: function(res, opts) {
                var r = Ext.decode(res.responseText);

                me.renderContent(r.data[contentField]);
                currentEditingEl.dom.setAttribute('data-content-value', r.data[contentField]);

                if (contentPhantom) {
                    currentEditingEl.dom.setAttribute('data-content-id', r.Handle || r.ID);
                    currentEditingEl.dom.setAttribute('data-content-phantom', false);
                }

                editorEl.hide().removeCls('saving');
                me.setCurrentEditingEl(null);
            },
            failure: function(res, opts) {
                editorEl.removeCls('saving');
                Ext.Msg.alert('Unable to save changes, please check your connection and try again');
            }
		});

    },

    onEditorElDrop: function(ev, t) {
        ev.preventDefault();
        var me = this,
            editorEl = me.getEditorEl(),
            textareaEl = me.getTextareaEl(),
            currentEditingEl = me.getCurrentEditingEl(),
            formData = new FormData(),
            xhr = new XMLHttpRequest(),
            file = ev.event.dataTransfer.files[0],
            validTypes = ['image/png', 'image/jpeg'],
            _onPhotoUploaded;

        _onPhotoUploaded = function(event) {
            var response =  Ext.decode(event.currentTarget.response)
                ,currentContent = textareaEl.getValue()
    			,imgUrl = '/thumbnail/' + response.data.ID + '/200x200'
				,imgCaption = response.data.Caption || ''
				,imgContent;

			if (currentEditingEl.getAttribute('data-content-renderer') == 'html') {
				imgContent = '<img src="'+imgUrl+'" alt="'+me.htmlEncode(imgCaption)+'">';
			} else {
				imgContent = '![' + imgCaption + ']('+imgUrl+')';
			}

	        editorEl.removeCls('uploading');

	        if(response && response.success && response.data) {
		        textareaEl.dom.value = currentContent + ' ' + imgContent;
		        me.syncEditorContent();
	        } else {
                return Ext.Msg.alert('Error', 'There was an error updating the activity. Please try again.');
            }

        };

        editorEl.addCls('uploading');

        if (validTypes.indexOf(file.type) === -1) {
            Ext.Msg.alert('Error', 'File type invalid. Please try again with a different file.');
            return;
        }

         //append photo
        formData.append('mediaFile', file);
        //make request
        xhr.open('POST', '/media?format=json');
        xhr.onload = Ext.bind(_onPhotoUploaded, me);
//        xhr.onprogress = Ext.bind(me.updateProgress, me);
        xhr.send(formData);

    },

    onEditorElDragOver: function() {
        var me = this,
            editorEl = me.getEditorEl();

        editorEl.addCls('drag-over');
//        debugger;
    },

    onEditorElDragEnter: function() {
//        debugger;
    },

    onEditorElDragLeave: function() {
        var me = this,
            editorEl = me.getEditorEl();

        editorEl.removeCls('drag-over');
//        debugger;
    }
});