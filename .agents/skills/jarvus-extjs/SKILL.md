---
name: jarvus-extjs
description: 'Maintain, stabilize, and clean up the Jarvus/Slate ExtJS 6.2 classic-toolkit web apps — SlateAdmin, the Slate CBL apps (SlateTasksTeacher/Student/Manager, SlateDemonstrations*, SlateStudentCompetenciesAdmin), and anything else living in a sencha-workspace/. Use this whenever the task touches Ext.define, Ext.app.Controller, a Sencha workspace, app.json, an ExtJS view/store/model/proxy, jarvus-* or slate-* Sencha packages, writing or debugging Cypress e2e specs for these apps, or fixing bugs and jank in these apps — even if the user just says "the admin UI" or "the teacher dashboard". The stack is frozen on Ext 6.2.0.981: this skill encodes the house patterns to converge on and the upgrades/migrations to explicitly NOT attempt.'
---

# Jarvus ExtJS (Slate classic apps)

House conventions for the ExtJS **6.2.0.981 classic-toolkit** apps built by Jarvus for the
Slate ecosystem, distilled from the most mature code in the fleet (the Slate CBL apps,
2016–2023, and the best parts of SlateAdmin). ExtJS is legacy here: no new apps will be
built on it, and it will eventually be removed. Until then, the goal is **stability and
convergence** — make old code look like the house style, squeeze out state/component jank,
and fix bugs without expanding the surface area.

## The frozen-stack contract

These are hard constraints, not preferences. The framework and its ecosystem are pinned,
and several load-bearing override packages (`jarvus-routing`, `jarvus-lazydata`,
`jarvus-hotfixes`) live on branches named for the exact framework build
(`ext/6/2/0/981`). Their overrides patch framework internals by name; on any other build
they may silently stop applying.

1. **Never upgrade Ext, Sencha Cmd, or the toolkit.** No `ext` submodule bumps, no
   `workspace.json`/`app.json` framework changes, no classic→modern migration.
2. **No MVVM migration.** The mature house style deliberately uses `Ext.app.Controller`
   plus the class config system (`config:` / `applyX` / `updateX` + semantic events) as
   its reactive layer. Across the entire CBL suite there are zero ViewModels and zero
   `bind:` expressions — that's a decision, refined over seven years, not an accident.
   Do not introduce ViewControllers, ViewModels, or bindings; converge on the
   controller+config idiom instead.
3. **Prefer what the vendored packages already provide.** Before writing a helper, check
   `references/packages.md` — the fix is often already in `jarvus-*`/`slate-*`.
4. **ES6 at the edges only.** Arrow functions in short callbacks, `const` in
   function-body `Ext.define` closures, template literals in `tpl` strings — fine, the
   newest house code does this. But `var me = this` remains the norm, and never introduce
   modules, classes, or async/await; Sencha Cmd must still be able to compile the build.
5. **Don't churn working code for style alone.** Convergence happens when you're already
   in a file for a bug fix or a planned cleanup pass — not as drive-by reformatting.

## The house style in one page

The architecture every app converges toward (details and exemplars in the references):

- **One direction, always through the URL.** The top-level view owns app state as
  declarative configs. A UI selection never mutates state directly — it calls
  `redirectTo(...)`; the route handler sets the view config; the config's `updateX`
  fires a semantic event; controllers react and push state into stores and selectors.
  Distinguish `selectedX` (user intent from the URL, possibly invalid) from `loadedX`
  (the resolved record).
- **Controllers are `Ext.app.Controller`** with a fixed file layout: doc-block with
  Responsibilities, then `requires` → `views`/`stores`/`models` → `refs` → `routes` →
  `listen` → `control`, then route handlers, event handlers, custom methods — each
  section under a banner comment. Refs are named once, fully qualified from the
  top-level view down, and `control:` is keyed by ref name, not repeated selectors.
- **`autoCreate` refs are the only view factory.** Exactly one autoCreate root
  (the viewport) per app, plus autoCreate refs as lazy dialog factories (the whole
  `slate-window` config lives in the ref). Views are otherwise never `Ext.create`d.
- **Named actions everywhere.** Views declare `button[action=save]` and actioncolumn
  items with `action: 'delete'` (which `jarvus-ext-actionevents` turns into a
  `deleteclick` event **on the grid**); controllers bind declaratively. Views contain
  no handler functions.
- **Components react through configs.** `config:` + `applyX` (coerce/`Ext.factory`) +
  `updateX` (side effects, `fireEvent`) is the reactive mechanism. Boolean config values
  mean visibility (`false` = hidden); object values reconfigure; the config-factory
  `merge`/`$value` pattern makes whole form fields externally replaceable.
- **Data flows through the layered proxy stack** (`Jarvus.proxy.API` →
  `Emergence.proxy.Records` → `Slate.proxy.Records` → one ~8-line proxy per endpoint,
  referenced by alias). Stores carry the dirty contract: config setters call
  `setExtraParam` and mark dirty; controllers call `loadIfDirty()` unconditionally;
  saves `mergeData([saved])` back instead of reloading; multi-store screens gate on
  `Ext.StoreMgr.requireLoaded([...], cb)`.
- **Apps stay thin over packages.** An app is `Application.js`, a few controllers, a
  top-level state-owning view, and store subclasses that pin `include`/`extraParams`/
  `pageSize`. Everything reusable — models, proxies, base stores, forms, fields,
  shared views, their `.scss` siblings — lives in a Sencha package.
- **Repeated screen shapes are base classes.** When two modules share a screen shape
  (settings managers, record-manager + detail tabs, report/print/email flows), the
  behavior lives in an abstract base parameterized by contract properties, and each
  module is a thin subclass declaring its vocabulary. SlateAdmin converged on this in
  2026 — extend its bases rather than copying a sibling module.

## References

| When you're... | Read |
| --- | --- |
| Writing or refactoring a controller, wiring routes/refs/events, structuring app state | [architecture.md](references/architecture.md) |
| Touching models, stores, proxies, loading, saving, filtering, or error handling | [data-layer.md](references/data-layer.md) |
| Building or cleaning up views, forms, grids, fields, dialogs, templates, or SCSS | [components.md](references/components.md) |
| Deciding where code lives, adding a package dependency, or using a `jarvus-*`/`slate-*` package API | [packages.md](references/packages.md) |
| Verifying a change, writing or fixing Cypress e2e specs, touching the test harness | [testing.md](references/testing.md) |

Each reference ends with its canonical exemplar files — real paths in the
`SlateFoundation/slate`, `SlateFoundation/slate-cbl`, and
`EmergencePlatform/skeleton-v3` repos, ranked. When in doubt about an idiom, open the
exemplar and imitate it; when two eras of code disagree, the newer exemplar wins (the
references date them).

## Working practices

- **Verify in the workspace you're in.** Repos check these apps out with vendored
  packages under `sencha-workspace/packages.remote/` — sometimes as unpopulated
  submodules. If a package directory is empty, `git submodule update --init` before
  reading or blaming its code.
- **Dev builds run against a live backend** via `dev-loader.js` and `?apiHost=` /
  `?apiToken=` query params — the loader grafts the remote page's chrome into the local
  document. Don't "fix" that mechanism; it's load-bearing.
- **Test end-to-end; there is no unit-test suite and none should be added.** The slate
  repo runs a containerized Cypress suite as a required PR check; a behavior change to
  an admin surface should ride with a spec change, and any change is verified by
  walking the affected screens (including the URL round-trip: deep-link, back button,
  refresh). See [testing.md](references/testing.md) for the harness and the
  ExtJS-specific spec idioms.
- **ESLint is enforced in CI for SlateAdmin** (required check, zero-error baseline;
  `.eslintrc.js` at the slate repo root, tuned for this codebase including
  XTemplate-array indent rules). Run it on files you touch; don't add `eslint-disable`
  to dodge a fixable rule. The house idiom for the app namespace is a
  `/* globals SlateAdmin */` directive inside the `requires` array of files that
  reference it — and an unused globals directive is itself an error, so only declare
  it where the bare namespace actually appears.
- **Commit conventionally** (`feat:`/`fix:`/`refactor:` — the CBL repos adopted
  Conventional Commits in 2022) and keep refactor commits behavior-neutral: the 2022
  rework's cleanest commits changed 70+ lines with zero behavior change and said so.
