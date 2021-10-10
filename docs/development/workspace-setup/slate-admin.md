# SlateAdmin webapp

## Code layout

- `html-templates/`
    - `webapps/SlateAdmin/sencha.tpl`: Configuration wrapper for the template that renders the SlateApp when accessed through the site
- `php-classes/`
    - `SlateAdmin/`
        - `RequestHandler.php`: Wrapper that handles authenticating access to SlateAdmin webapp and the loading it
        - `WebApp.php`: Wrapper SlateAdmin webapp instance that hosts site-level configuration
- `php-config/`
    - `Emergence/`
        - `WebApps/`
            - `App.config.d/`
                - `SlateAdmin.php`: Registers the SlateAdmin webapp's custom PHP WebApp wrapper class for its name so that accessing it through `/webapps/SlateAdmin` will be loaded with the subclass (and the config it hosts)
    - `SlateAdmin/`
        - `WebApp.config.d/`
            - `*.php`: Downstream projects can place config snippets here that, for example, register plugins
- `sencha-workspace/`
    - `packages/`
        - `slate-core-data/`: Shareable model/store/proxy/sorter classes for the Slate namespace
        - `slate-theme/`: Shareable theme for Slate apps using the classic UI toolkit
        - `slate-ui-classic/`: Shareable UI components for apps using the classic UI toolkit
    - `SlateAdmin/`: Entrypoint and all app-specific assets for the SlateAdmin webapp, hosted at `/manage` on Slate instances
- `site-root/`
    - `manage.php`: Route that maps `/manage` to RequestHandler

## Running live changes

The frontend Sencha application needs to be built at least once with the Sencha CMD build tool to scaffold/update a set of loader files. After that, you can just edit files the working tree and reload the browser. The two exceptions where you need to build again are changing the list of packages or changing the list of override files.

Before the frontend application can be built to run from live changes, you'll need to ensure all submodules are initialized:

```bash
git submodule update --init
```

Then, use the shortcut studio command for building the frontend application:

```bash
build-admin
```

Once built, the live-editable version of the app can be accessed via the static web server that the studio runs on port `{{ studio.static_port }}`. The backend host must be provided to the apps via the `?apiHost` query parameter. Any remote backend with CORS enabled will work, or you can use the local backend:

[`localhost:{{ studio.static_port }}/SlateAdmin/?apiHost=localhost:{{ studio.web_port }}`](http://localhost:{{ studio.static_port }}/SlateAdmin/?apiHost=localhost:{{ studio.web_port }})

## Working with breakpoints

By default, the Sencha framework will automatically append random cache buster values to every loaded `.js` source. This helps ensures that your latest code always runs, but will also prevent any breakpoints you set from persisting across reloads.

With the **Disable cache** option of the network inspector activated, you can disable this built-in cache buster by appending `&cache=1` to the current page's query string.

## Connecting to remote server

You can connect to any remote instance that has CORS enabled by appending a query parameter in the format `?apiHost=https://slate.example.org` when loading the page. A session token may be provided via another query string in the format `&apiToken=abcdef1234567890`
