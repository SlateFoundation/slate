Ext.define('EmergencePullTool.view.DiffPanel', {
    extend: 'Ext.Panel',
    xtype: 'app-diffpanel',


    //  ,tbar: [{
    //      xtype: 'button'
    //      ,text: 'Edit Mode'
    //      ,enableToggle: true
    //      ,toggleHandler: function(button, toggled) {
    //          // Switch between showing editors and viewers
    //
    //          var panel = this.up('emergence-diff-viewer');
    //
    //          panel.items.get(0).layout.setActiveItem(toggled ? 1 : 0);
    //          panel.items.get(1).layout.setActiveItem(toggled ? 1 : 0);
    //
    //          // If switching back to viewers, re-render
    //          if (!toggled) {
    //              panel.resetViewerCode();
    //          }
    //      }
    //  }]

    componentCls: 'emergence-diff-container',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    defaults: {
        xtype: 'panel',
        flex: 1,
        cls: 'ux-codeViewer',
        autoScroll: true,
        dockedItems: [{
            xtype: 'component',
            dock: 'bottom',
            itemId: 'authorBar',
            tpl: [
                'Authored by ',
                '<tpl if="author">',
                '<a href="mailto:{author:htmlEncode}">{author:htmlEncode}</a>',
                '<tpl else>',
                '[Unknown Author]',
                '</tpl>',
                ' on {timestamp}'
            ]
        }]
    },

    items: [{
        itemId: 'leftSide',
        title: 'Left File'
        //      ,margins: "6 3 6 6"
    }, {
        itemId: 'rightSide',
        title: 'Right File'
        //      ,margins: "6 6 6 3"
    }],


    // template methods
    initComponent: function() {
        var me = this;

        me.callParent();

        if (me.queuedJob) {
            me.syncTitles();
        }

        me.lineTpl = new Ext.Template(
            '<div class=\'ux-codeViewer-line\'>'
            , '<span class=\'ux-codeViewer-lineNumber\'>'
            , '{0:htmlEncode}'
            , '</span>'
            , '<span class=\'ux-codeViewer-lineText\'>'
            , '{1}'
            , '</span>'
            , '</div>'
            , {
                compiled: true
            }
        );

        me.emptyLineTpl = new Ext.Template(
            '<div class=\'ux-codeViewer-line ux-codeViewer-empty\'>'
            , '<span class=\'ux-codeViewer-lineNumber\'>'
            , '</span>'
            , '</div>'
            , {
                compiled: true
            }
        );

        me.tokenTpl = new Ext.Template(
            '<span class=\'ux-codeViewer-token-{0}\'>{1:htmlEncode}</span>'
            , {
                compiled: true
            }
        );
    },

    afterRender: function() {
        var me = this,
            leftCodeViewerEl, rightCodeViewerEl;

        me.callParent();

        leftCodeViewerEl = me.down('#leftSide').getTargetEl();
        rightCodeViewerEl = me.down('#rightSide').getTargetEl();

        // synchronize scrolling
        leftCodeViewerEl.on('scroll', function() {
            rightCodeViewerEl.dom.scrollTop = this.dom.scrollTop;
            rightCodeViewerEl.dom.scrollLeft = this.dom.scrollLeft;
        });

        rightCodeViewerEl.on('scroll', function() {
            leftCodeViewerEl.dom.scrollTop = this.dom.scrollTop;
            leftCodeViewerEl.dom.scrollLeft = this.dom.scrollLeft;
        });

        //      me.initDiffViewer();
    },

    getCurrentJob: function() {
        return this.queuedJob || this.loadingJob || this.loadedJob;
    },

    syncTitles: function() {
        var me = this,
            job = me.getCurrentJob(),
            leftTitle, rightTitle;

        if (!job) {
            return;
        }

        // set titles
        leftTitle = Ext.isArray(job.leftPath) ? job.leftPath.join('/') : job.leftPath;
        rightTitle = Ext.isArray(job.rightPath) ? job.rightPath.join('/') : job.rightPath;

        if (job.leftRevisionId) {
            leftTitle += '@' + job.leftRevisionId;
        }

        if (job.rightRevisionId) {
            rightTitle += '@' + job.rightRevisionId;
        }

        me.down('#leftSide').setTitle(leftTitle);
        me.down('#rightSide').setTitle(rightTitle);
    },

    //  ,initDiffViewer: function()
    //  {
    //      if(this.path && this.sideAid && this.sideBid)
    //          this.loadFiles();
    //  }
    //  ,loadFiles: function()
    //  {
    //      this.setLoading({msg: 'Opening Revisions: ' + this.sideAid + ',' + this.sideBid + ' /' + this.path});
    //
    //      this.setSideTitle('A','Revision ' + this.sideAid);
    //      this.setSideTitle('B','Revision ' + this.sideBid);
    //
    //      EmergenceEditor2.API.getRevision(this.path, this.sideAid, this.readyCodeARequestHandler, this);
    //      EmergenceEditor2.API.getRevision(this.path, this.sideBid, this.readyCodeBRequestHandler, this);
    //  }
    //  ,readyCodeARequestHandler: function(response) {
    //      this.codeA = response.responseText.replace(/\r\n?/g, '\n');
    //
    //      this.setCodeEditor('A',this.codeA);
    //
    //      this.linesA = this.codeA.split('\n');
    //
    //      if(this.codeB && this.linesB)
    //      {
    //          this.updateViewCode();
    //      }
    //  }
    //  ,readyCodeBRequestHandler: function(response) {
    //      this.codeB = response.responseText.replace(/\r\n?/g, '\n');
    //
    //      this.setCodeEditor('B',this.codeB);
    //
    //      this.linesB = this.codeB.split('\n');
    //
    //      if(this.codeA && this.linesA)
    //      {
    //          this.updateViewCode();
    //      }
    //  }
    //  ,updateViewCode: function() {
    //      var diffdata = this.diff(this.linesA, this.linesB);
    //
    //      // Give code to viewer for rendering
    //      this.setCode('A', this.codeA, diffdata);
    //      this.setCode('B', this.codeB, diffdata);
    //
    //      this.setLoading(false);
    //  }
    //  ,setSideTitle: function(side,title)
    //  {
    //      this.items.get( side == 'A'?0:1 ).setTitle(title);
    //  }
    //  ,setCodeEditor: function(side,code) {
    //      this.items.get(side == 'A'?0:1).items.get(1).el.dom.value = code;
    //  }
    //  ,getCodeEditor: function(side) {
    //      return this.items.get(side == 'A'?0:1).items.get(1).el.dom.value;
    //  }
    //  ,resetViewerCode: function() {
    //      // Grab code and normalize line breaks
    //      var codeA = this.getCodeEditor('A').replace(/\r\n?/g, '\n')
    //          ,codeB = this.getCodeEditor('B').replace(/\r\n?/g, '\n')
    //          ,// Split code into lines
    //          linesA = codeA.split('\n')
    //          ,linesB = codeB.split('\n')
    //          ,// Perform diff
    //          diff = this.diff(linesA, linesB);
    //
    //      // Give code to viewer for rendering
    //      this.setCode('A', codeA, diff);
    //      this.setCode('B', codeB, diff);
    //  }
    setCode: function(side, codeLines, diff) {
        // Create copies of the edit script
        var codeBox = this.down(side=='A' ? '#leftSide' : '#rightSide'),
            insertions = diff.insertions.slice(0),
            deletions = diff.deletions.slice(0),

            // Obtain reference to HTML templates
            lineTpl = this.lineTpl,
            emptyLineTpl = this.emptyLineTpl,

            // Create a "pre" tag to hold the code
            pre = codeBox.preEl || (codeBox.preEl = codeBox.getContentTarget().insertFirst({ tag: 'pre' })),

            // Cursors/flags for walking the edit script
            sideAIndex = 0,
            sideBIndex = 0,
            sideAChangeIndex = deletions.shift(),
            sideBChangeIndex = insertions.shift(),
            prevWasModified = false;

        // clear existing content in pre
        pre.dom.innerHTML = '';

        // Loop over each line
        for (var i = 0, n = codeLines.length; i<n; i++) {
            // Create the HTML for the line, including highlighting
            var el = lineTpl.append(pre, [i+1, this.highlightLine(codeLines[i])]);

            // By default we want to move both cursors forward
            var advanceA = true,
                advanceB = true;

            // If both cursors indicate a change, consider it to be a modification
            if (sideAIndex === sideAChangeIndex && sideBIndex === sideBChangeIndex) {
                Ext.fly(el).addCls('ux-codeViewer-modified');

                // Get next changes
                sideAChangeIndex = deletions.shift();
                sideBChangeIndex = insertions.shift();

                // Set modified flag so that following lines
                // are marked accordingly
                prevWasModified = true;
            } else {
                // Different logic for side A vs side B
                // For instance, an insert means an empty line on side A
                // and highlighting on side B
                if (side == 'A') {
                    // If there was a deletion
                    if (sideAIndex === sideAChangeIndex) {
                        // Either highlight as deleted or modified depending
                        // on the previous line
                        Ext.fly(el).addCls(prevWasModified ? 'ux-codeViewer-modified' : 'ux-codeViewer-deleted');

                        // Get next change
                        sideAChangeIndex = deletions.shift();

                        // Don't advance B cursor
                        advanceB = false;
                    } else {
                        // If there were insertions, generate empty lines
                        while (sideBIndex === sideBChangeIndex) {
                            // Insert empty line
                            emptyLineTpl.insertBefore(el);

                            // Get next change
                            sideBChangeIndex = insertions.shift();

                            // Keep advancing as long as there was an insertion
                            sideBIndex++;
                        }
                    }
                }
                // Side B
                else {
                    //  If there was an insertation
                    if (sideBIndex == sideBChangeIndex) {
                        // Either highlight as inserted or modified depending
                        // on the previous line
                        Ext.fly(el).addCls(prevWasModified ? 'ux-codeViewer-modified' : 'ux-codeViewer-inserted');

                        // Get next change
                        sideBChangeIndex = insertions.shift();

                        // Don't advance A cursor
                        advanceA = false;
                    } else {
                        // If there were deletions, generate empty lines
                        while (sideAIndex === sideAChangeIndex) {
                            // Insert empty line
                            emptyLineTpl.insertBefore(el);

                            // Get next change
                            sideAChangeIndex = deletions.shift();

                            // Keep advancing as long as there was a deletion
                            sideAIndex++;
                        }
                    }
                }

                // Reset modified flag
                prevWasModified = false;
            }

            // Advance cursors
            if (advanceA) {
                sideAIndex++;
            }
            if (advanceB) {
                sideBIndex++;
            }
        }
    },
    highlightLine: function(line) {
        var scope = this;

        var matches = [];

        var between = function(idx, length) {
            for (var i = 0; i < matches.length; i++) {
                var m = matches[i],
                    s = m[0],
                    e = m[1];

                if (s <= idx && idx + length <= e) {
                    return true;
                }
            }
            return false;
        };

        var highlight = function(str, regex, cls, fn) {
            regex.compile(regex);
            var match;

            while (match = regex.exec(str)) {
                var mdata = fn ? fn(match) : [match.index, match[0]],
                    midx = mdata[0],
                    mstr = mdata[1];

                if (!between(midx, mstr.length)) {
                    var replacement = scope.tokenTpl.apply([cls, mstr]),
                        diff = replacement.length - mstr.length;

                    str = str.slice(0, midx) + replacement + str.slice(midx + mstr.length);
                    regex.lastIndex = midx + replacement.length;
                    for (var i = 0; i < matches.length; i++) {
                        var m = matches[i];

                        if (m[1] < midx) {
                            continue;
                        }

                        m[0] += diff;
                        m[1] += diff;
                    }
                    matches.push([midx, regex.lastIndex]);
                }
            }
            return str;
        };

        // String literals
        line = highlight(line, /("|')[^\1]*?\1/ig, 'string');

        // Integers and Floats
        line = highlight(line, /\d+\.?\d*/ig, 'number');

        // Function names
        line = highlight(line, /(\w+)\s*\:\s*function/ig, 'function', function(match) {
            return [match.index, match[1]];
        });
        line = highlight(line, /function (\w+)/ig, 'function', function(match) {
            return [match.index + 9, match[1]];
        });

        // Keywords
        line = highlight(line, /\b(this|function|null|return|true|false|new|int|float|break|const|continue|delete|do|while|for|in|switch|case|throw|try|catch|typeof|instanceof|var|void|with|yield|if|else)\b/ig, 'keyword');

        // Operators
        line = highlight(line, /\.|\,|\:|\;|\=|\+|\-|\&|\%|\*|\/|\!|\?|\<|\>|\||\^|\~/ig, 'operator');

        return line;
    }
});