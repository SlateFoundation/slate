# Components, views, forms, and screens

Component-level house patterns. The overriding principle: **views are declarative and
announce; controllers react.** A view that contains handler functions, reaches into
global stores from a renderer, or gets poked field-by-field from a controller is a view
to clean up.

## Pure-config views

Most views need no `initComponent` at all — just config: `items`, `columns`, `plugins`,
`features`, `viewConfig`, `tpl`. A screen is composed from small single-purpose files:
one xtype, one file, one job. The 2022 rework's before/after is instructive: a grid that
*was* the app (header, details pane, paging toolbar all in `dockedItems`) became a
32-line border-layout container plus a grid file, a details file, and a header file.

```js
Ext.define('SlateTasksManager.view.TasksManager', {
    extend: 'Ext.Container',
    xtype: 'slate-tasks-manager',
    autoEl: 'main',
    componentCls: 'slate-tasks-manager',
    layout: 'border',
    items: [
        { xtype: 'slate-tasks-manager-appheader', region: 'north' },
        { xtype: 'slate-tasks-manager-grid',      region: 'center' },
        { xtype: 'slate-tasks-manager-details',   region: 'east', width: 240, split: true }
    ]
});
```

Wrap `columns` and grid `items` in the object form so `defaults` apply cleanly:
`columns: { defaults: { align: 'center' }, items: [...] }`.

When a class needs private helpers or constants, use the **function-body define**:

```js
Ext.define('SlateAdmin.view.people.details.contacts.List', function() {
    const CLASS_RELATIONSHIP = 'Emergence\\People\\Relationship';

    return {
        extend: 'Ext.view.View',
        // ...
    };
});
```

No namespace pollution, and `const`/arrows are fine inside (see the frozen-stack
contract for how far ES6 goes).

## The config system is the reactive layer

`config:` + `applyX` + `updateX` replaces data binding in this codebase. The division of
labor is strict:

- **`applyX(newValue, oldInstance)`** — coerce and construct. Returns the value to store.
- **`updateX(newValue, oldValue)`** — side effects: toggle CSS, rewire listeners
  (`un` the old instance, `on` the new — the discipline most old code skips),
  `fireEvent` a semantic event.

The smallest complete form, worth quoting because it's the app's native
"view announces, controller reacts" contract:

```js
config: { loadedPerson: null },

updateLoadedPerson: function(person, oldPerson) {
    var me = this;
    me.onPersonLoaded(person, oldPerson);
    me.fireEvent('personloaded', me, person, oldPerson);
},

/**
 * @template @private
 */
onPersonLoaded: function(person, oldPerson) {}
```

Subclasses override the `@template` hook; controllers `control:` the event. Batch
multi-config updates in `Ext.suspendLayouts()` / `Ext.resumeLayouts(true)`.

### Boolean configs mean visibility; the config-factory triple

Child components are configs whose value can be `false` (hidden), `true` (shown with
defaults), or an object (merged config). The `apply` coerces and runs `Ext.factory`;
`initItems` composes:

```js
config: { grid: false, legend: false },

applyGrid: function(grid, oldGrid) {
    if (typeof grid === 'boolean') {
        grid = { hidden: !grid };
    }
    return Ext.factory(grid, 'SlateStudentCompetenciesAdmin.view.Grid', oldGrid);
},

initItems: function() {
    var me = this;
    me.callParent();
    me.add([ me.getGrid(), me.getLegend() ]);
},

syncVisibleComponents: function() {
    var me = this,
        complete = Boolean(me.getSelectedContentArea() && me.getSelectedStudentsList());
    Ext.suspendLayouts();
    me.setPlaceholderItem(!complete);
    me.setGrid(complete);
    me.setLegend(complete);
    Ext.resumeLayouts(true);
}
```

Empty states use the `placeholderItem` config from `Slate.ui.app.Container` — there is
no separate "empty" card. The `slate-ui-classic` components (`Slate.ui.Window`,
`Slate.ui.form.Panel`, app Container/Header) all implement this same
apply-coerce/`Ext.factory`/`initItems` triple; imitate them when building composites.

### Record managers with detail tabs (the SlateAdmin base)

The recurring SlateAdmin screen shape — a grid of records beside a tab panel of detail
views — is a base class pair, not a copy-paste target:
`SlateAdmin.view.AbstractRecordManager` (the split container) +
`SlateAdmin.view.AbstractRecordDetails` (a detail tab). The contract:

- The subclass declares its module's config vocabulary and points the base at it:

  ```js
  config: { selectedPerson: null },

  selectedRecordGetter: 'getSelectedPerson',
  selectedRecordEvent: 'selectedpersonchange',
  tabRecordGetter: 'getLoadedPerson',
  tabRecordSetter: 'setLoadedPerson',

  updateSelectedPerson: function(person, oldPerson) {
      this.syncSelectedRecord(person, oldPerson);
  }
  ```

- **Detail tabs are declared explicitly in the manager's `items`**, in order. Never
  have controllers inject tabs into a foreign view on `beforerender` — that makes tab
  order an accident of controller registration order (the historic SlateAdmin defect
  this base removed).
- The base's `syncSelectedRecord` propagates the record into the active tab (via the
  `tabRecordSetter`), fires the module's semantic change event, and handles **phantom
  records by disabling the non-active tabs** — create-record flows get correct tab
  semantics for free.
- Other modules interact with the tab panel only through the manager's API
  (`setActiveDetailTab(name)` / `getActiveDetailTab()`), never by reaching for
  `manager.detailTabs` or cached `me.down('#detailCt')` handles.

## Forms

Base on `Slate.ui.form.Panel` (`slate-formpanel`: `trackResetOnLoad`, sensible field
defaults) inside a `Slate.ui.Window` (`slate-window`: `mainView` + `footer` configs;
it adopts a nested panel footer and keeps footer fields in the form). Dialogs are
created by controller `autoCreate` refs — see architecture.md.

### Every field is a config (the TaskForm pattern)

The mature form declares each field as a config with the `merge`/`$value` hook, so
consumers can retarget, restyle, or remove any field **from outside, with no
subclassing**:

```js
Ext.define('Slate.cbl.view.tasks.TaskForm', function() {
    var mergeFn = function(newValue, oldValue) {
            if (typeof newValue === 'boolean') {
                newValue = { hidden: !newValue };
            }
            return Ext.merge(oldValue ? Ext.Object.chain(oldValue) : {}, newValue);
        },
        applyFn = function(config, instance) {
            return Ext.factory(config, null, instance);
        };

    return {
        extend: 'Slate.ui.form.Panel',
        xtype: 'slate-cbl-tasks-taskform',

        config: {
            task: null,
            parentTaskField: {
                merge: mergeFn,
                $value: {
                    name: 'ParentTaskID',
                    xtype: 'slate-cbl-taskselector',
                    fieldLabel: 'Subtask of',
                    allowBlank: true
                }
            }
            // ... one config per field
        },

        applyParentTaskField: applyFn,

        initItems: function() {
            var me = this;
            me.callParent();
            me.insert(0, [ me.getSectionField(), me.getTitleField(), me.getParentTaskField() /* ... */ ]);
        }
    };
});
```

A consumer then reconfigures the whole form inline in its dialog ref:

```js
mainView: {
    xtype: 'slate-cbl-tasks-taskform',
    parentTaskField: { store: 'ParentTasks' },   // merged into the field config
    sectionField: false,                          // hidden
    assignmentsField: false
}
```

Extend the string coercion when useful — the house `mergeFn` variants also accept a
string meaning "set text and show" (`me.setSaveBtn('Assign Task')` /
`me.setSaveBtn(false)`).

### Permission-driven form UI

The server ships an `availableActions` map on the record; the form's `updateRecord`-side
config handler translates it into visibility/readOnly/labels in one
`Ext.suspendLayouts()` block — `me.setReassignField(availableActions.reassign)`,
`ratingsField.setReadOnly(!canRate)`, etc. Authorization decisions stay on the server;
the client only renders them.

### The include contract

A form declares the API includes its screen needs as a static, and controllers pass it
to load/save calls (`record.save({ include: formPanel.self.modelInclude })`):

```js
statics: {
    modelInclude: [ 'availableActions', 'Attachments', 'Skills', 'Comments.Creator' ]
},
```

## Grids

- **Actions are named, never inline handlers.** Actioncolumn items declare
  `{ action: 'delete', glyph: 0xf056, tooltip: 'Remove' }`; `jarvus-ext-actionevents`
  fires `deleteclick` **on the grid** (so the controller selector must match the grid
  panel, not the inner view; an item without `action` fires generic `actionclick`;
  don't name an action after an existing grid event). `jarvus-ext-glyphs` renders the
  glyphs — FontAwesome codepoints, since the theme sets the glyph font family.
- **Filtering is the stock `gridfilters` plugin** declared per column — third-party
  search/filter plugins were purged in 2022. Against Slate backends set
  `operator: null` in each column's filter config (the API rejects operators).
  Toolbar-level toggles are `menucheckitem[name=...]` entries in a settings menu button
  whose handlers set proxy extra params and `load({ page: 1 })` — filtering is
  server-side.
- Result counts render via a `datachanged` listener updating a small `tpl`-backed
  component; enable/disable of header buttons hangs off `selectionchange`;
  a clear-filters button shows/hides off `filterchange`.
- Custom column types beat inline renderers: a column class with `defaultRenderer`
  encapsulates rendering plus tooltip markup (pull shared templates off the model
  prototype with `Ext.XTemplate.getTpl`). Same for repeated editors: a custom field
  class wrapping a dedicated lookup store, reused across screens.
- Server-side cell validation errors: `jarvus-griderrors` (`markCellInvalid` /
  `markRowInvalid` / `clearInvalid`) — see data-layer.md.
- Matrix/pivot screens use `Jarvus.aggregrid.Aggregrid` / `RollupAggregrid`
  (rows/columns/data stores + mappers + `cellRenderer` diffing contract) rather than
  hand-built table markup.

## Selectors and composite fields

- Dropdowns extend the shared `ClearableSelector` base (adds a clear trigger and a
  `clear` event controllers listen for alongside `select`), contributing only `tpl` and
  value/display fields.
- Composite inputs extend `Slate.ui.form.ContainerField` (Container +
  `Ext.form.Labelable` + `Field` mixins) with sub-components as polymorphic configs —
  each with the apply-coerce/factory/`update`-rewires-listeners discipline. No
  controller, no global store assumptions: a widget must be instantiable in isolation.
- Search fields are `jarvus-searchfield` (fires `clear` on the native ⓧ) — controllers
  bind `specialkey` + `clear`.

## Templates and DOM

- `tpl` member functions and XTemplate `{% %}` blocks are fine for presentation logic,
  but **never reach into the global store registry from a template or renderer**
  (`Ext.getStore(...)` per cell is an O(rows) global lookup and couples the view to
  boot order — some older SlateAdmin grids still do this; don't imitate them). Give
  the view the data it needs via configs or record fields.
- Delegated DOM events use managed listeners:
  `me.mon(me.el, 'click', 'onAddClick', me, { delegate: '[data-action="add-related-person"]' })`
  — and `data-action` attributes, mirroring the named-action convention.
- Wrapping foreign DOM: `renderTpl` + `renderSelectors` on an `Ext.Component`, not
  `initComponent` + DomHelper.
- **HTML-encode everything interpolated** (`Ext.util.Format.htmlEncode`, or
  `Ext.String.htmlEncode` in templates) — user-sourced names, search queries, and error
  messages all flow through templates here.
- No `Ext.getCmp` / global ids. If a view must expose an internal component, give the
  controller a fully-qualified ref instead of caching `me.down('#x')` handles as
  instance properties for other modules to reach through.

## SCSS and structure conventions

- **Every component's `.scss` lives next to its `.js`** (`app/view/Viewport.js` +
  `app/view/Viewport.scss`), not in `sass/src/` mirrors. Sencha Cmd picks both up;
  the 2022 rework deleted the mirror trees.
- Themes stay thin: design tokens (color ramps) go in a token-only package
  (`slate-cbl-colors` — four files, no JS) so products can restyle independently;
  component defaults go in tiny theme overrides; component styling goes in the
  component's own `.scss`.
- xtype prefixes follow the namespace, flattened: `Slate.cbl.view.tasks.TaskForm` →
  `slate-cbl-tasks-taskform`. One prefix per app/package — never two dialects.
- `app/view/` is screen-level (named for its place in the nav tree); `app/widget/` (or
  a package `src/field/`) is reusable and self-contained. If a component needs no
  controller and could serve two screens, it's a widget/package component.

## Canonical exemplars (ranked)

| File (repo-relative) | Demonstrates | Era |
| --- | --- | --- |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/view/tasks/TaskForm.js` | Config-driven form: `merge`/`$value`/factory, every field externally replaceable | 2022 |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/view/tasks/StudentTaskForm.js` | Permission-driven UI from server `availableActions`; string/boolean config coercion; `modelInclude` | 2022 |
| slate: `sencha-workspace/SlateAdmin/app/view/people/details/contacts/List.js` | The most modern file in SlateAdmin: function-body define, config handlers with `Ext.factory`, delegated DOM events, template literals | 2022 |
| slate: `sencha-workspace/SlateAdmin/app/widget/field/contact/Relationship.js` | Composite ContainerField with polymorphic sub-component configs and correct listener rebinding | 2022 |
| slate-cbl: `sencha-workspace/packages/slate-cbl/src/view/CompetenciesGrid.js` | Filters-as-configs (`applyQueryFilter` returning `Ext.util.Filter`), semantic `competencyselect` event | 2018 |
| slate: `sencha-workspace/SlateAdmin/app/view/AbstractRecordManager.js` + `app/view/people/Manager.js` | The record-manager base contract: getter/event indirection, explicit tab declaration, phantom tab-disabling — and a minimal subclass | 2026 |
| slate: `sencha-workspace/SlateAdmin/app/view/settings/locations/Manager.js` | The pure-config view: zero logic, chained store, inline editors, action columns | 2019 |
| slate-spark: `sencha-workspace/SparkRepositoryManager/app/column/Sparkpoint.js` and `app/field/SparkpointLookup.js` | Custom column with `defaultRenderer` + model-owned tooltip tpl; 18-line reusable lookup field | 2016 |
