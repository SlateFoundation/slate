# Workspace organization & the shared package ecosystem

Where code lives, and what the vendored `jarvus-*` / `slate-*` Sencha packages provide.
Check here **before writing a helper** — the fix is usually already packaged.

## Thin app over package

The defining organization pattern: apps are 7–17 files; the product package holds
everything reusable. The CBL suite is six apps averaging ~13 files over a 101-file
`slate-cbl` package.

**Stays in the app:** `Application.js`, controllers (routing, event wiring, save
orchestration), the top-level state-owning view, store subclasses pinning
`include`/`extraParams`/`pageSize`, app-specific composites.

**Moves to the package:** models, proxies, base stores, form panels, custom fields and
selectors, shared display components, their `.scss` siblings, deployment-tunable config
singletons, custom `Ext.data.field` types.

Rules of thumb:

- The app's `app.json` requires **one product package** (plus `font-awesome`,
  `jarvus-hotfixes`, `jarvus-routing` when routed); the package's `package.json`
  `requires` fans out to the rest. Never duplicate transitive requires in the app.
- Package `src/` directory depth mirrors the API domain (`tasks/`, `demonstrations/`);
  xtypes flatten it (`slate-cbl-tasks-taskform`).
- Design tokens get their own JS-free package (`slate-cbl-colors`: one
  `sass/etc/all.scss` of `dynamic()` color ramps) so theming swaps independently.
- If the same component/logic is being written in a second app, that's the signal to
  move it into the package.

### Extending a host app from a package (the slate-cbl-admin graft)

A package can add an entire section to SlateAdmin **with zero edits to SlateAdmin**,
via two small `override:` files — this is the house pattern for optional modules:

```js
// overrides/SlateAdmin.js — register a controller
Ext.define('Slate.cbl.admin.overrides.SlateAdmin', {
    override: 'SlateAdmin.Application',
    requires: ['Slate.cbl.admin.controller.Skills'],
    initControllers: function() {
        this.callParent();
        this.getController('Slate.cbl.admin.controller.Skills');
    }
});

// overrides/SettingsNavPanel.js — add a nav link
Ext.define('Slate.cbl.admin.overrides.SettingsNavPanel', {
    override: 'SlateAdmin.view.settings.NavPanel',
    initComponent: function() {
        var me = this;
        me.data = me.data.concat({ href: '#settings/cbl/skills', text: 'CBL Skills' });
        me.callParent(arguments);
    }
});
```

The package controller then owns its route and cooperates with the shell via the
standard card-loading preamble (architecture.md). Note the existing `slate-cbl-admin`
package is 2019-era — right shape, but apply current conventions when imitating it.

## The version-pin hazard

`jarvus-routing`, `jarvus-lazydata`, and `jarvus-hotfixes` are **branched per framework
build** — the vendored checkouts track `ext/6/2/0/981` branches, and the framework
submodule is `workspace/6.2` (6.2.0.981). Their overrides patch framework internals; on
another build they can silently stop applying. One dependency is invisible until it
bites: `jarvus-routing`'s route preprocessing only works because
`jarvus-hotfixes/app/route/RouterOverridable.js` rebinds a History listener by name.
This is the concrete reason the stack is frozen — never bump these pins piecemeal.

Vendored checkouts live under `sencha-workspace/packages.remote/` (submodules or holo
sources — may be unpopulated; `git submodule update --init` before reading) and
first-party packages under `sencha-workspace/packages/`.

## Package catalog

### jarvus-apikit — transport base

- `Jarvus.util.AbstractAPI` — `Ext.data.Connection` subclass; connection singleton
  base. `?apiHost=` query-param override for dev; promise mode (no callback → returns
  `Ext.Promise`); JSON auto-decode into `response.data`; 401 → queued-retry login
  window; status-0 → retry confirm dialog.
- `Jarvus.proxy.API` (`proxy.api`) — REST verb mapping (create POST / read GET /
  update PATCH / destroy DELETE), all stock Ext params disabled; `connection:` is a
  class-name string auto-required via `onClassExtended`. Template methods:
  `getUrlParams`, `getMethod`, `extractResponseData`; plus `abortLastRequest()`.
- `Jarvus.writer.API` — JSON writer, `writePhantomId: false` (pairs with
  `identifier: 'negative'` on models).
- `Jarvus.store.FieldValuesStore` (`store.fieldvalues`) — local store built from a
  model field's `values` enum.
- `Jarvus.util.DAVClient` — WebDAV over the same connection.

### emergence-apikit — Emergence REST conventions

- `Emergence.util.AbstractAPI` — token auth (`?apiToken=`, `Authorization: Token`),
  `login`/`logout`/`loadSessionData`, `uploadMedia`. Callback convention
  `(success, response, data)`.
- `Emergence.proxy.Records` (`proxy.records`) — the workhorse. Emergence URL grammar
  (`/save`, `/delete`, POST for all writes), params `ID`/`offset`/`limit`/`sort`/`dir`/`q`,
  `include`, `relatedTable` client-side joins, `summary`. Errors surface via
  `operation.getError()`.
- `Emergence.proxy.Values` — reads bare `data: []` arrays into `{value}` records (enum
  endpoints feeding combos).
- `Emergence.store.ChainedTree` (`store.emergence-chainedtree`) — TreeStore mirror of a
  flat store with bidirectional field sync; tree state never contaminates the source.
- `ModelLoadFieldsConfig` override — static `Model.loadFieldsConfig(cfg)` injecting
  server-supplied defaults/enum values.

### slate-core-data — Slate domain layer

`Slate.API` singleton + `Slate.proxy.API`/`Slate.proxy.Records` (the bases every app
proxy extends), plus shared models/stores for people, groups, relationships, course
sections, participants, terms, locations, and progress reports. Also
`Slate.sorter.Code` (natural sort for dotted codes) and the callback validator
(`data.validator.callback`). Model conventions documented in data-layer.md. The `Terms`
store decorates records with master-term dates and exposes current/reporting terms as
configs with change events.

### slate-ui-classic — shared UI components

`slate-appcontainer` (+ `placeholderItem` mixin), `slate-appheader`, `slate-window`
(the `mainView`/`footer` dialog shell), `slate-formpanel`, `slate-panelfooter`,
`slate-panellegend`, `slate-placeholder`, `slate-simplepanel`, `slate-containerfield`
(composite-field base), `slate-flippablecombobox`, and a `container.addSorted(items)`
override. All follow the config-factory triple (components.md). Slate look and feel —
build screens from these, not raw `Ext.panel.Panel`.

### slate-theme — Neptune-derived theme

Sets FontAwesome as the glyph font (why `font-awesome` leads every `requires` and views
use raw codepoints), global component defaults via one-line overrides, and the
`glyph-color` SCSS mixin system (`cls: 'glyph-star glyph-inactive'`). Design tokens are
`dynamic()` SCSS vars. Keep app styling out of the theme; theme changes affect every
app.

### jarvus-routing — route lifecycle

`redirectTo(modelOrArrayOrString)` with route-component encoding (arbitrary handles
survive hash segments — always build redirects as arrays, never string concat);
cancellable+resumable `beforeroute` / `beforerewrite` / `beforeredirect` app events
(return `false`, call the passed `resume(token)` later — the sanctioned async gate);
per-route `rewrite` hooks. See architecture.md for the declaration surface.

### jarvus-lazydata — load discipline

Framework-level overrides: `proxy.setExtraParam` with dirty tracking
(`isExtraParamsDirty`), `store.loadIfDirty(cb)`, the barrier
`Ext.StoreMgr.requireLoaded([stores], cb)`, incremental `store.mergeData(data, opts)` /
`loadUpdates()`, lazy local combos (`lazyAutoLoad`), `proxy.abortLastRequest(silent)`.
Two known warts: `mergeData` logs `console.groupCollapsed` debug noise on the isModel
branch, and `loadUpdates`' `removeMissing` option can never be `false`. Note the CBL
package hand-rolls its own equivalent `dirty`/`loadIfDirty`/`unload` on its base stores
— both contracts are current; don't mix them within one store.

### jarvus-ext-actionevents — named grid actions

One 11-line override: actioncolumn items with `action: 'foo'` fire `fooclick` on the
**grid** (`view.ownerCt`). Uniform "actions are named strings; controllers bind by
selector". Gotchas in components.md.

### The small ones

- **jarvus-ext-glyphs** — actioncolumn `glyph:` support (FontAwesome codepoints instead
  of image icons); auto-sizes the column.
- **jarvus-ext-searchfield** — `jarvus-searchfield` xtype; native search input, fires
  `clear` on the ⓧ.
- **jarvus-ext-treerecords** — `tree.expandRecord(record, cb)` / `selectRecord(record)`
  — path-free tree navigation for ids that may contain separator chars.
- **jarvus-griderrors** — `markCellInvalid` / `markRowInvalid` / `clearInvalid` +
  error QuickTips on grid views. (Uses a private `view.getCell()`; carries a stale
  5.1.1 version warning — known, harmless on 6.2.)
- **jarvus-hotfixes** — pinned upstream-bug workarounds, each documented with a Sencha
  forum link. Load-bearing: `RouterOverridable` (routing), `ModelProxyTemplates`
  (without it, `proxy: 'alias-string'` on models breaks), `RequestUrlParams`. Never
  remove entries without testing routing and model CRUD.
- **jarvus-aggregrid** — matrix/pivot grids (`Jarvus.aggregrid.Aggregrid`,
  `RollupAggregrid`): rows/columns/data stores, `rowMapper`/`columnMapper`,
  `cellRenderer` with a diffing memo contract.
- **jarvus-fuzzytime** — registers `Ext.util.Format.fuzzyTime(date, short)`; usable in
  tpl format syntax (`{open_time:fuzzyTime(true)}`). Add the class to `requires` before
  using the format.

## Canonical exemplars

| Path (repo-relative) | Demonstrates |
| --- | --- |
| slate-cbl: `sencha-workspace/packages/slate-cbl/` | The product package: full `src/` layout, `package.json` requires fan-out, scss-next-to-js |
| slate-cbl: `sencha-workspace/SlateTasksTeacher/app.json` vs the package's `package.json` | The one-product-package dependency rule |
| slate-cbl: `sencha-workspace/packages/slate-cbl-admin/overrides/` | Grafting a module onto SlateAdmin with zero host edits |
| slate-cbl: `sencha-workspace/packages/slate-cbl-colors/` | The JS-free design-token package |
| slate: `sencha-workspace/SlateAdmin/app.json` `requires` | The canonical full stack order for a large app |
