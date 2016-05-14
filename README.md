# SlateAdmin
This [Ext JS 5.1](http://docs.sencha.com/extjs/5.1/) app provides a user interface for administrators of Slate.

## Getting started with client-side UI application development
1. [Install latest 6.x Sencha CMD](https://www.sencha.com/products/extjs/cmd-download/)
2. `git clone --recursive -b develop git@github.com:SlateFoundation/slate-admin.git`
3. `cd ./slate-admin/sencha-workspace/SlateAdmin`
4. `sencha app build`

If you have a version of GIT older than 1.6, get a newer version of git.

To load the UI, run a web server from `sencha-workspace` or higher in your file tree and navigate to the subdirectory
for the app you want to run in your browser. If you don't have a server you can run `sencha web start` to run a basic
local server at [http://localhost:1841](http://localhost:1841).

## Connecting to a server
You can connect SlateAdmin to any remote Slate instance that has CORS enabled by appending the query
paramater `apiHost` when loading the page. `SlateAdmin.Application.init` detects it and passes it
to `SlateAdmin.API.setHostname`. SlateAdmin doesn't (yet) have a way to catch authentication errors
and show a login prompt, so you'll just need to login to the site manually in another browser tab
when you catch an error for now.

Example domain with CORS enabled: `v1-demo.node0.slate.is`

## Build docs
1. `sudo gem install jsduck` (if you don't have jsduck installed already)
2. `cd slate-admin/sencha-workspace/SlateAdmin`
3. `sencha ant docs`
