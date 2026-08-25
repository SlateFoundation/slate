# Data layer: models, stores, proxies, saving

How data moves between the ExtJS apps and the Emergence/Slate PHP backend. The layering
is strict and the idioms are few — most bugs in this layer come from bypassing them.

## The layer stack

```
Jarvus.util.AbstractAPI            (jarvus-apikit)    connection base: promise mode, auto-decode
  └─ Emergence.util.AbstractAPI    (emergence-apikit) + token auth, login/session, media upload
       └─ Slate.API  (singleton)   (slate-core-data)  the app-facing connection

Jarvus.proxy.API                   (jarvus-apikit)    REST verb mapping, connection-by-class-name
  └─ Emergence.proxy.Records       (emergence-apikit) Emergence URL grammar, include/relatedTable
       └─ Slate.proxy.Records      (slate-core-data)  bound to Slate.API
            └─ one ~8-line proxy subclass PER ENDPOINT, registered by alias
```

Rules:

- **Models reference proxies by alias string only** (`proxy: 'slate-cbl-tasks'`). Never
  configure a `url` on a model, and never build request URLs by hand in a controller —
  if you need a computed URL, use `Slate.API.buildUrl(...)` or a model static loader.
- **One proxy file per endpoint**, tiny and declarative:

  ```js
  Ext.define('Slate.cbl.proxy.tasks.Tasks', {
      extend: 'Slate.proxy.Records',
      alias: 'proxy.slate-cbl-tasks',
      config: { url: '/cbl/tasks' }
  });
  ```

  Variations stay in the proxy where they're meaningful: a default `include`, a longer
  `timeout` for a heavy endpoint. Use `Slate.proxy.API` (not `.Records`) for
  non-record endpoints, adding a `reader` with `rootProperty: 'data'`.
- **One connection singleton per app.** `Slate.API` is the standard. (SlateAdmin ran
  for years with a second app-local singleton and duplicate proxy aliases; the 2026
  cleanup deleted them. If old code or an old diff shows `SlateAdmin.API` or the
  `slaterecords`/`slateapi` aliases, that's the retired pair — the live ones are
  `Slate.API` and `slate-records`/`slate-api`.)
- **File downloads go through a Blob util** (`SlateAdmin.util.Downloads` in SlateAdmin):
  request via the API singleton with a binary response, build a Blob object URL, click
  a temporary anchor, fire the completion callback. Never the legacy hidden-iframe +
  cookie-polling trick.

### What the base layers give you (so you don't reimplement them)

- `Slate.API.request(options)` returns an `Ext.Promise` when no callback is given, and
  auto-decodes JSON responses into `response.data`. Callback convention is
  `(success, response, data)` for the higher-level helpers.
- 401 responses pop a login window that queues and replays the failed requests; status-0
  failures offer a retry dialog. Don't wrap requests in your own auth/retry handling.
- `Emergence.proxy.Records` speaks the Emergence URL grammar: create/update →
  `.../save`, destroy → `.../delete`, everything non-read is a `POST`. Its params are
  `ID`/`offset`/`limit`/`sort`/`dir`/`q`. `include` expands nested relations
  (`include: ['Attachments', 'Creator.PrimaryEmail']`); `relatedTable` side-loads
  collections and splices matched records onto rows (a client-side join — prefer it
  over N+1 loads).
- Remote filters serialize to the `q=` syntax (`prop:value` joined by spaces). Filters
  with an `operator` are rejected by the backend — when using grid filters, declare
  `filter: { type: 'string', operator: null }` per column.

## Model conventions (Emergence ActiveRecord)

Every model opens the same way, with fields grouped under banner comments in a fixed
order — *ActiveRecord fields → entity fields → subclass fields → optional includes →
virtual fields → writable dynamic fields*:

```js
Ext.define('Slate.cbl.model.tasks.Task', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    identifier: 'negative',       // phantoms get negative IDs; the writer omits them
    proxy: 'slate-cbl-tasks',

    fields: [
        // ActiveRecord fields
        { name: 'ID', type: 'int', allowNull: true },
        { name: 'Class', type: 'string', defaultValue: 'Slate\\CBL\\Tasks\\ExperienceTask' },
        { name: 'Created', type: 'date', dateFormat: 'timestamp', allowNull: true, persist: false },
        { name: 'CreatorID', type: 'int', allowNull: true, persist: false },
        // ...
    ]
});
```

- `Class` carries the PHP FQCN so the server instantiates polymorphically. On models
  spanning subclasses, `classes: [...]` on a field marks it subclass-only.
- **Derived fields** use `persist: false` + `depends` + `convert`. The
  inherited-with-override chain is the house pattern for records embedding a parent:

  ```js
  { name: 'InheritedDueDate', persist: false, depends: ['Task'], convert: convertInheritedFn },
  { name: 'EffectiveDueDate', persist: false, depends: ['DueDate', 'InheritedDueDate'],
    convert: function(v, r) { return r.get('DueDate') || r.get('InheritedDueDate'); } },
  ```

- **Validators are declarative** (`validators: { Title: 'presence', ... }`), including
  the callback validator from slate-core-data for cross-field rules. Before saving,
  `record.validate()` and `field.markInvalid(message)` per error (see save flow below).
- **Custom field flags travel on the field def** and are read back generically — e.g.
  `clonable: true` fields, iterated via `record.getFields()` by the clone flow. Prefer
  this over hardcoded field lists in controllers.
- **Loaders live on the model as `inheritableStatics`** (`loadByCode`, `loadByQuery`)
  using `options.recordHandle` / params, so controllers never assemble URLs. Pair with
  an instance `readOperationData(operation)` that pulls side-loaded records out of the
  raw response and sets them with `{ dirty: false }`.
- Custom `Ext.data.field.Field` subclasses handle value semantics the framework can't
  infer — e.g. an `isEqual` that masks server-stamped subfields so re-serialized
  arrays don't false-dirty a form.
- Models used in navigation implement `toUrl()` (consumed by `redirectTo(record)`).
  Anything returning HTML from a model must `Ext.util.Format.htmlEncode` interpolated
  values.

## Stores: the dirty contract

App stores are thin subclasses of package base stores. The **base** store declares
behavior; the **app** subclass declares payload only:

```js
// package: behavior
Ext.define('Slate.cbl.store.tasks.Tasks', {
    extend: 'Ext.data.Store',
    alias: 'store.slate-cbl-tasks',
    model: 'Slate.cbl.model.tasks.Task',
    config: {
        section: null,
        remoteFilter: true, remoteSort: true, pageSize: 0,
        proxy: 'slate-cbl-tasks'
    },
    constructor: function() { this.callParent(arguments); this.dirty = true; },
    updateSection: function(section) {
        this.getProxy().setExtraParam('course_section', section || null);
        this.dirty = true;
    },
    loadIfDirty: function() {
        if (!this.dirty) { return; }
        this.dirty = false;
        this.load();
    },
    unload: function() { this.loadCount = 0; this.removeAll(); }
});

// app: payload
Ext.define('SlateTasksManager.store.Tasks', {
    extend: 'Slate.cbl.store.tasks.Tasks',
    config: {
        pageSize: 20,
        proxy: {
            type: 'slate-cbl-tasks',
            include: ['Attachments', 'Creator', 'ParentTask', 'Skills'],
            extraParams: { 'include_archived': 'false' }
        }
    }
});
```

The contract, in order of importance:

1. **Config setters change proxy params and mark dirty; they never load.** Controllers
   call `setX(); loadIfDirty();` unconditionally on every state change and get exactly
   one request, only when the filter set actually moved. (`jarvus-lazydata` provides a
   framework-level `loadIfDirty`/`isExtraParamsDirty` on all stores — SlateAdmin relies
   on it; the CBL packages hand-roll the same contract locally. Either is fine; don't
   mix both in one store.)
2. **App subclasses may tighten the precondition** — override `loadIfDirty` to return
   early until required params are set, then `callParent()`.
3. **`unload()`** exists for the two-stores-must-render-together case: unload both, set
   params, reload both, so a grid doesn't paint half-fresh data.
4. **Multi-store barriers use `Ext.StoreMgr.requireLoaded([stores], cb)`** (from
   jarvus-lazydata, accepts ids or instances) — never hand-rolled boolean flags or
   `Ext.defer` timing. Wrap cross-store decoration in `beginUpdate()`/`endUpdate()`.
5. **After a save, `store.mergeData([savedRecord])` — never reload.** `mergeData`
   diffs by id, updates clean, and repaints once.
6. Graph decoration (building `SubTasks` arrays, back-referencing parents) happens in
   the store's `loadRecords`, in one `beginUpdate`/`endUpdate` pass, always with
   `{ dirty: false }`.
7. Server-side filtering beats client-side: a filter toggle sets
   `proxy.setExtraParam(...)` and `store.load({ page: 1 })`. For a second view over the
   same records, use `Ext.data.ChainedStore` with `source:` — don't load twice.
8. Search-as-you-type reloads call `proxy.abortLastRequest(true)` first.

## Save flows

Three shapes cover everything. Copy them exactly — every element is a convention.

**(a) Single record from a form:**

```js
formPanel.updateRecord(record);

// ensure record doesn't become dirty when no changes were made
if (!record.dirty) { return; }

// validate client-side, marking fields from model validators
errors = record.validate();
if (errors.length) {
    Ext.each(errors.items, function(item) {
        var itemField = form.down('[name=' + item.field + ']');
        if (itemField) { itemField.markInvalid(item.message); }
    });
    return;
}

formWindow.setLoading('Saving assignment&hellip;');   // mask the WINDOW, not the form
record.save({
    include: formPanel.self.modelInclude,             // the form declares what it needs back
    success: function(savedRecord, operation) {
        Ext.toast(
            Ext.XTemplate.getTpl(me, 'saveNotificationBodyTpl').apply(tplData),
            Ext.XTemplate.getTpl(me, 'saveNotificationTitleTpl').apply(tplData)
        );
        savedRecord.readOperationData(operation);
        recordsStore.mergeData([savedRecord]);        // merge, never reload
        formWindow.hide();
        formWindow.setLoading(false);
    },
    failure: function(savedRecord, operation) {
        formWindow.setLoading(false);
        Ext.Msg.show({
            title: 'Failed to save student task',
            message: Ext.util.Format.htmlEncode(operation.getError()),
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR
        });
    }
});
```

Notification copy lives as `saveNotificationTitleTpl`/`saveNotificationBodyTpl`
XTemplate arrays at the top of the controller, rendered via
`Ext.XTemplate.getTpl(me, 'name')`. The `modelInclude` static on the form keeps the
include contract next to the UI that consumes it.

**(b) Batch sync of accumulated changes** (phantoms built up by grid interaction):
count changes off a buffered `datachanged` listener to drive the save button's disabled
state and a live counter; on click, disable the button and `store.sync({ success, failure })`;
toast the summed record count on success, re-enable and `Ext.Msg.show` the first
operation's error on failure. Deletes are `store.remove(rec); store.sync();` behind an
`Ext.Msg.confirm`.

**(c) Complex cross-entity saves belong in the store, not the controller.** When one
save must update sibling entities (e.g. a demonstration save refreshing a progress
grid), the base store exposes `saveX`/`mergeX`/`buildXInclude` methods that compute the
compound `include` list and re-merge the server's affected-records payload. Controllers
call one method.

For a rare atomic multi-record write, use an ad-hoc `Ext.data.Session`: `adopt` the
records, `drop()`/`createRecord(...)`, then `session.getSaveBatch().start()`.

**Server-side validation errors** render into the UI, not a generic alert, when a grid
is the editor: after save, read `proxy.getReader().rawData.failed` and call the
`jarvus-griderrors` methods `gridView.markCellInvalid(record, field, validationErrors)` /
`clearInvalid`.

## Canonical exemplars (ranked)

| File (repo-relative) | Demonstrates | Era |
| --- | --- | --- |
| slate-cbl: `sencha-workspace/SlateTasksTeacher/app/controller/StudentTasks.js` | The full save/load flow: `modelInclude`, dirty guard, `mergeData`, toast templates, `requireLoaded` joins | 2022 |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/store/tasks/Tasks.js` and `src/store/StudentCompetencies.js` | The dirty contract; store-orchestrated compound saves | 2018–2022 |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/model/tasks/StudentTask.js` | Model conventions end-to-end: banner groups, `depends`/`convert` inheritance, `inheritableStatics` loaders, `readOperationData` | 2022 |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/proxy/` | One-file-per-endpoint discipline | 2016–2022 |
| slate: `sencha-workspace/SlateAdmin/app/controller/people/Contacts.js` | Grid-cell server-validation rendering, `{ dirty: false }` discipline, statics lookup maps. (Its 4-boolean load barrier is the anti-pattern `requireLoaded` replaces.) | 2021 |
| slate: `sencha-workspace/SlateAdmin/app/store/courses/SectionCohorts.js` | What an app store should look like: real `config:` block, reader `transform`, self-rewiring proxy URL | 2017 |
