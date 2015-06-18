# SlateAdmin
The full-screen ExtJS app powering /manage on Slate V1, extracted from SlateFoundation/slate and upgradet to ExtJS 5

## Getting started with development
1. Install latest 5.x Sencha CMD
2. Clone this repository
3. `cd slate-admin/sencha-workspace`
4. `git clone https://github.com/SlateFoundation/slate-theme.git packages/slate-theme`
4. `git clone -b ext/5/1/1/451 https://github.com/JarvusInnovations/sencha-hotfixes.git packages/jarvus-hotfixes`
5. `cd SlateAdmin`
6. `sencha app build`

Then run a web server from `slate-admin/sencha-workspace` or higher in your file tree and navigate to the
`sencha-workspace/SlateAdmin` folder in your browser. If you don't have a server you can run `sencha web start`
to run a basic local server.

The first time you build the app, it will download the correct version of the framework from Sencha.

## Connecting to a server
You can connect SlateAdmin to any remote Slate instance that has CORS enabled by appending the query
paramater `apiHost` when loading the page. SlateAdmin.Application.init detects it and passes it
to SlateAdmin.API.setHostname. SlateAdmin doesn't (yet) have a way to catch authentication errors
and show a login prompt, so you'll just need to login to the site manually in another browser tab
when you catch an error for now.

Example domain with CORS enabled: `v1-demo.node0.slate.is`

## Build docs
1. `sudo gem install jsduck` (if you don't have jsduck installed already)
2. `cd slate-admin/sencha-workspace/SlateAdmin`
3. `sencha ant docs`
