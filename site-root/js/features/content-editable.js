$(function() {
    var currentEditingEl = null
        ,currentInitialValue = null;

    //create element
    var editorEl = $('<div class="content-editor"></div>').css({
        position:  'absolute',
        display: 'none'
    }).appendTo('body');

    $('<p class="hint hint-markdown">Use <a href="http://daringfireball.net/projects/markdown/basics" target=_blank>Markdown</a> for formatting.<br>You can drag an image into this area to upload and generate a code for it.</p>').appendTo(editorEl);
    $('<p class="hint hint-html">Use <strong>HTML</strong> for formatting.<br>You can drag an image into this area to upload and generate a code for it.</p>').appendTo(editorEl);
    $('<p class="hint hint-text">Use plain text, no formatting is available.</p>').appendTo(editorEl);
    var textareaEl = $('<textarea/>').appendTo(editorEl);
    var saveBtnEl = $('<button>Save</button>').appendTo(editorEl);
    var cancelBtnEl = $('<button>Cancel</button>').appendTo(editorEl);

    // attach drag-drop handler
    editorEl.filedrop({
        url: '/media/json/upload',       // upload handler, handles each file separately, can also be a function taking the file and returning a url
        paramname: 'mediaFile',          // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
        withCredentials: true,          // make a cross-origin request with cookies
        error: function(err, file) {
            switch(err) {
                case 'BrowserNotSupported':
                    alert('browser does not support HTML5 drag and drop');
                    break;
                case 'TooManyFiles':
                    alert('Only one file is supported at a time');
                    // user uploaded more than 'maxfiles'
                    break;
                case 'FileTooLarge':
                    alert('File is over the size limit'); //TODO show limit
                    break;
                case 'FileTypeNotAllowed':
                    alert('File type is not permitted only image files are supported'); //TODO show types of images
                    break;
                case 'FileExtensionNotAllowed':
                    alert('File type is not permitted only image files are supported'); //TODO show types of images
                    break;
                default:
                    break;
            }
        },
        allowedfiletypes: ['image/jpeg','image/png','image/gif'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
        allowedfileextensions: ['.jpg','.jpeg','.png','.gif'], // file extensions allowed. Empty array means no restrictions
        maxfiles: 1,
        maxfilesize: 5,    // max file size in MBs
        dragOver: function() {
            // user dragging files over #dropzone
            editorEl.addClass('drag-over');
        },
        dragLeave: function() {
            // user dragging files out of #dropzone
            editorEl.removeClass('drag-over');
        },
        uploadStarted: function(i, file, len){
            editorEl.addClass('uploading');
        },
        uploadFinished: function(i, file, response, time) {
            var currentContent = textareaEl.val()
                ,imgUrl = '/thumbnail/' + response.data.ID + '/200x200'
                ,imgCaption = response.data.Caption
                ,imgContent;

            if (currentEditingEl.data('content-renderer') == 'html') {
                imgContent = '<img src="'+imgUrl+'" alt="'+_htmlEncode(imgCaption)+'">';
            } else {
                imgContent = '![' + imgCaption + ']('+imgUrl+')';
            }

            editorEl.removeClass('uploading');

            if(response && response.success && response.data) {
                textareaEl.val(currentContent + ' ' + imgContent);
                _syncEditorContent();
            }
        }
    });

    // wire click handler
    $(document).delegate('.content-editable', 'click', function(e) {
        var editableEl = $(this);

        // don't process clicks on links
        if (e.target.tagName === 'A') {
            return;
        }

        if (currentEditingEl) {
            _resetEditing();
        }

        currentEditingEl = editableEl;
        editorEl.addClass('renderer-'+currentEditingEl.data('content-renderer'));
        currentInitialValue = editableEl.data('content-value');
        if (typeof currentInitialValue !== 'string') {
            currentInitialValue = editableEl.text().trim();
        }

        textareaEl.val(currentInitialValue);

        _syncEditorPosition();

        editorEl.show();

        textareaEl.putCursorAtEnd();
    });

    cancelBtnEl.click(function(e) {
        editorEl.hide();
        _resetEditing();
    });

    saveBtnEl.click(function(e) {
        var contentField = currentEditingEl.data('content-field')
            ,contentPhantom = currentEditingEl.data('content-phantom') === true
            ,url = currentEditingEl.data('content-endpoint')
            ,postData = {}
            ,contentHandle;

        editorEl.addClass('saving');

        postData[contentField] = textareaEl.val();
        if (contentPhantom) {
            url += '/create';
            postData['Handle'] = currentEditingEl.data('content-id');
        } else {
            url += '/' + currentEditingEl.data('content-id') + '/edit';
        }

        $.ajax({
            url: url
            ,method: 'POST'
            ,data: postData
            ,headers: {
                Accept: 'application/json'
            }
        }).done(function(responseData) {
            responseData = responseData.data;
            _renderContent(responseData[contentField]);
            currentEditingEl.data('content-value', responseData[contentField]);

            if (contentPhantom) {
                currentEditingEl.data('content-id', responseData.Handle || responseData.ID);
                currentEditingEl.data('content-phantom', false);
            }

            editorEl.hide().removeClass('saving');
            currentEditingEl = null;
        }).fail(function() {
            editorEl.removeClass('saving');
            alert('Unable to save changes, please check your connection and try again');
        });
    });

    textareaEl.bind('input propertychange', function() {
        _syncEditorContent();
    });

    $( window ).resize(_syncEditorPosition);

    // via http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
    jQuery.fn.putCursorAtEnd = function() {

        return this.each(function() {

            $(this).focus();

            // If this function exists...
            if (this.setSelectionRange) {
                // ... then use it (Doesn't work in IE)

                // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
                var len = $(this).val().length * 2;

                this.setSelectionRange(len, len);

            } else {
                // ... otherwise replace the contents with itself
                // (Doesn't work in Google Chrome)

                  $(this).val($(this).val());

            }

            // Scroll to the bottom, in case we're in a tall textarea
            // (Necessary for Firefox and Google Chrome)
            this.scrollTop = 999999;

        });

    };

    function _renderContent(value) {
        switch (currentEditingEl.data('content-renderer')) {
            case 'markdown':
                currentEditingEl.html(value ? markdown.toHTML(value) : '');
                break;
            case 'html':
                currentEditingEl.html(value);
                break;
            default:
                currentEditingEl.html(_htmlEncode(value));
        }
    }

    function _htmlEncode(text) {
        return text.replace(/[&'"<>]/g, function(char) {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&#39;';
            }
            return foo;
        }).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>');
    }

    function _resetEditing() {
        _renderContent(currentInitialValue);
        editorEl.removeClass('renderer-'+currentEditingEl.data('content-renderer'));
        currentEditingEl = null;
    }

    function _syncEditorContent() {

        _renderContent(textareaEl.val());

        _syncEditorPosition();

        // sync position again after any images load
        currentEditingEl.find('img').on('load', _syncEditorPosition);
    }

    function _syncEditorPosition() {
        if (!currentEditingEl) {
            return;
        }

        var offset = currentEditingEl.offset()
            ,height = currentEditingEl.outerHeight();

        editorEl.css({
            top: offset.top + height
            ,left: offset.left
        });
    }
});