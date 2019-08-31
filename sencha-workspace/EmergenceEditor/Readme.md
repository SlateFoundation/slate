# EmergenceEditor

## Getting started with development

- `sencha app build development`
- `sencha app refresh`

## TODO

### High priority

Editor isn't useful without these features:

- [X] Push all submodules
- [X] Route to already-open diff tabs
- [X] Wire toolbar
- [X] Resize ace editors
- [X] Wire revisions grid to diff views

### Medium priority

These should be completed before the editor is widely deployed:

- [X] Keep revisions navigated on diff tabs if paths same
- [X] Highlight/select current revision in revisions grid
- [X] Defer loading file content until tab is active
- [X] Eliminate store.DAVClient
- [X] Replace menu with toolbar
- [X] Push #activity path on activate
- [X] Support opening file at specific revision
- [X] Support opening file to specific line
- [X] Fix file tree menus
- [X] Test/restore rename file
- [X] Test/restore delete file
- [X] Restore file create
- [X] Restore collection create
- [X] Handle refresh collection
- [X] erase dead code
- [X] Restore site search
- [ ] Implement multi-file options
- [ ] Handle file(s) not found in file/diff open
- [ ] Warn on close without save
- [ ] Redirect to local path on save of _parent file
- [ ] Save tab reorder to state
- [ ] Ignore open on phantom files (double clicking on editor tries to open)

### Low priority

Editor can ship without these:

- [ ] Uncollapse deletes in activity tree, let create+edit+delete for same file coallesce
- [ ] Add "Save Current As..." to collection context menu -- enter a name and then your current editor saves to it. Defaults to current file's name selected
- [X] Select mode for diff view
- [ ] Implement file properties view
- [ ] Update revisions grid on save
- [ ] Highlight left diff revision in revisions grid
- [X] Fix fullscreen mode
- [X] Update controller ref and control syntax
- [X] Try out ace searchbox extension -- windout find command being killed?
- [X] Try out ace whitespace extension
- [X] Replace icons with fontawesome
- [X] Restore / get rid of transfers log
- [X] Try to remove images from builds by changing theme and adding post-build delete task to build.xml
- [ ] Minify ace / ace-diff
- [ ] Overwrite protection
- [X] Open and mask diff panel before content loads
- [ ] Get ace-diff using existing acepanels
- [ ] Enable comparing arbitrary rows from the revisions grid with multiselection?
- [ ] Stateful sharable editor config a-la bill clinton's class
- [ ] Cache revisions list for return to tab
- [ ] Track current revision loaded into editor, send on save
  - [ ] warn if revisions reloads and a newer revision exits
- [ ] Load full local+remote trees and cache them
-  [ ] Add "sources" grid docked to top of filesystem tree with stats and checkboxs for "remote", "parent", and "local" to filter
-  [ ] Add option to update parent from remote
- [ ] Prevent opening binary files in editor (maybe go by ace being able to detect a mode? block open or show placeholder tab?)
- [ ] More advanced filter options in bbar for activity stream (date range, author, tree, include parent)
- [ ] Tree helper plugins architecture
  - [ ] site-root launcher + versioned URL getter
  - [ ] html-templates previewer + cache clearer
  - [ ] site-tasks launcher
  - [ ] php-migrations status check + runner + re-runner
  - [ ] sencha-workspace app launcher + tree icons + build commands
  - [ ] sencha-builds app build launcher + tree icons
- [ ] Search within or load activity for any collection from tree context menu
- [ ] Support a "developer-templates/" tree in the app FS, read it when it's detected and offer a menu of templates to create files from in the collection context menu