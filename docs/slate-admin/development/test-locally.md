# Testing slate-admin locally
- `cd` into `slate-admin` repository root directory
- execute `sencha web start &`
- execute `cd sencha-workspace/SlateAdmin`
- execute `sencha app build`
- ensure you're logged in to whatever Slate API host you're testing against in the same browser session
- navigate browser to [http://localhost:1841/sencha-workspace/SlateAdmin/?apiHost=v1-demo.node0.slate.is](http://localhost:1841/sencha-workspace/SlateAdmin/?apiHost=v1-demo.node0.slate.is)