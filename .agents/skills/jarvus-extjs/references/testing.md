# Testing: the Cypress e2e harness

How changes to these apps get verified. There is no JS unit-test suite and none should
be added — the apps are tested end-to-end, in a real browser, against a real backend
with fixture data. The slate repo runs a containerized Cypress suite as a **required
check (`test-e2e`) on every PR**, so a behavior change to an admin surface should ride
with a spec change, and a regression someone ships next month is caught by the specs
you write today.

## The harness

The permanent home is the **`EmergencePlatform/skeleton-v3`** repo: its `cypress/`
workspace holds the base config, support commands, and skeleton-level specs, and its
`docker/` context builds the PHP-8 runtime image the tests run against. The slate repo
**layers** onto that: hologit composes a combined cypress workspace (skeleton base +
slate's `cypress/integration/` specs) and a fixtures holobranch (SQL + media), and
`.github/workflows/test-e2e.yml` is the authoritative recipe — it builds the site
container from the PR's HEAD, starts it, projects the workspace, and runs Cypress
against it. Read that workflow before touching the harness; with lens caching warm the
whole job runs in ~5–6 minutes.

Key mechanics:

- The support commands run in **`SITE_CONTAINER` mode**: `cy.resetDatabase()` drops and
  reloads the fixture database via `docker exec` into the site container, so every spec
  file starts from the same known state. Resets cost seconds, not milliseconds — default
  to one per spec file — but where the reset goes depends on how the spec's tests
  interact with **test retries** (CI runs `retries=2`, and Cypress re-runs `beforeEach`
  but NOT `before` hooks on a retry attempt):
  - read-only or convergent tests: reset once in `before()`;
  - tests that mutate server state non-convergently: reset in `beforeEach()`, so a
    retried attempt starts from fixture state instead of compounding the failed
    attempt's mutations into garbage errors ("Found 6, expected 3") that hide the real
    failure;
  - chain suites whose tests build on earlier tests' mutations: a middle test can never
    be safely retried — declare `describe('...', { retries: 0 }, () => ...)` with a
    comment so the true first failure surfaces.
- The site must be served on **port 80** — the backend issues absolute redirects that
  drop non-standard ports.
- `cy.loginAs()` posts the real login form (`TEST_USER` env; fixture users include a
  teacher account with username = password).
- Local runs mirror CI: build the image from your branch, run it on `127.0.0.1:80`,
  then `xvfb-run -a npx cypress run --config baseUrl=http://localhost,video=false
  --env SITE_CONTAINER=<container>,SITE_REPO=<slate-checkout>,TEST_USER=teacher`.
  Remember the container serves the **lens-built** bundle projected from HEAD — an app
  fix needs a commit and an image rebuild before a spec can see it; spec-only changes
  just need copying into the projected workspace.

## Writing specs for ExtJS screens

Raw-DOM-only testing fights the framework and loses. The house approach drives the app
through the same component APIs and semantic events the controllers use, and asserts
against both component state and the URL. The existing `cypress/integration/SlateAdmin/`
specs (people, settings, progress, course-sections, contacts) are the exemplars — copy
their shape.

### Reach Ext through `cy.withExt()`

The app runs in Cypress's AUT frame; never touch a bare global. The support helper
yields the app window's namespaces plus a component-query shorthand:

```js
cy.withExt().then(({ Ext, extQuerySelector }) => {
    cy.wrap(null).should(() => {
        expect(extQuerySelector('people-grid').getStore().getCount()).to.be.greaterThan(0);
    });
});
```

### Barriers are retrying `.should()` callbacks

There is no `cy.waitUntil` plugin and no fixed `cy.wait(ms)` sleeps. Any "wait for the
app to settle" step is a `cy.wrap(null).should(() => { expect(...); })` — Cypress
retries the callback until it passes. Chain the action in a following `.then()` so it
runs exactly once after the barrier clears. Give slow barriers an explicit timeout
(`cy.wrap(null, { timeout: 15000 })`).

### Drive components, assert URLs

- **Selection**: `grid.getSelectionModel().select(0)`, `combo.setSelection(record)` —
  then assert `cy.location('hash')` matches the route the selection should produce.
  The URL is the app's state contract; every spec should exercise at least one
  deep-link entry and one back-button return (`cy.go('back')`).
- **Semantic events**: fire the same events views fire —
  `manager.fireEvent('deletetermclick', manager, record)` — rather than hunting for
  actioncolumn cells in the DOM. This tests the controller contract directly and
  survives markup changes.
- **Forms**: `formPanel.getForm().findField('Notes').setValue(...)`, then click the
  real button (`extQuerySelector('... button#saveDraftBtn').el.dom.click()`).
- **Saves**: `cy.intercept('POST', '/endpoint/save*')` + assert the response status,
  then verify persistence server-side with `cy.request('/endpoint?format=json')` —
  client-side store state can lag the truth.
- **Message boxes** are global DOM: `cy.contains('.x-message-box .x-btn', 'Yes')`.
  Always scope inputs with `.filter(':visible')` — `Ext.Msg` is a reused singleton and
  stale hidden elements match otherwise.

### The gotchas (each cost a debugging session)

1. **Cross-frame `Date` fails Ext's `instanceof` check.** A `new Date(...)` built in
   the spec frame silently converts to `null` in a date model field (Ext parses it as
   a string against `dateFormat`). Pass date values as the field's string format
   (`'2030-09-01'` for `'Y-m-d'`) instead.
2. **Selection-driven redirects re-dispatch the route.** A grid select calls
   `redirectTo(...)`; the hashchange then re-runs the route handler asynchronously,
   re-asserting things like the active detail tab ~10ms later. A spec that clicks a
   tab in that window gets clobbered — a race no human can hit. Structure tab walks to
   **enter via the URL** (deep-link `cy.visit`, or assert the selection→URL contract
   then `cy.reload()`), so the route dispatches exactly once before you interact.
3. **Cell editors start deferred.** Tree-manager child creation expands the parent
   node and calls `startEdit` inside a callback plus an `Ext.defer` — gate on
   `manager.getPlugin('cellediting').getActiveEditor()` before `cy.focused().type(...)`.
4. **Card layouts fire `activate`, not `show`, on first `loadCard`.** Both an
   app-binding rule (a controller bound to its card's `show` never runs on a cold deep
   link) and a testing lesson: it took a spec with a strict title assertion to catch
   three controllers that five manual browser walks had missed.
5. **Fixture terms are date-relative** (computed from `CURRENT_TIMESTAMP` at load), so
   never select a term by handle or absolute title — match by pattern
   (`Ext.getStore('Terms').findBy(r => /1st Quarter$/.test(r.get('Title')))`). During
   the summer gap a "no current term" alert on progress screens is correct fixture
   behavior; dismiss it, don't fix it.
6. **Prefer `{selectall}` over `.clear()`** when replacing field text — `.clear()` has
   raced ExtJS field internals (time fields especially).

## Manual verification still matters

Specs guard contracts; a refactor still deserves a browser walk of the affected screens
against the same container (deep link, interact, back button, refresh). When scripting
that walk with browser automation, mind the same singleton hazard as specs: out-of-order
programmatic clicks can wedge `Ext.Msg` for the rest of the page's life — reload and
redo the sequence cleanly rather than debugging ghost state.

## Canonical exemplars

| File (repo-relative) | Demonstrates |
| --- | --- |
| slate: `cypress/integration/SlateAdmin/people.js` | Deep-link entry, tab-switch URL enrichment, back-button, phantom-record semantics, advanced-search URL round-trip |
| slate: `cypress/integration/SlateAdmin/settings.js` | Tree + flat manager CRUD through semantic events; message-box confirm flows; the date-string and deferred-editor gotchas in situ |
| slate: `cypress/integration/SlateAdmin/progress.js` | Term-by-pattern selection, form authoring, intercepted save + server-side `cy.request` verification |
| slate: `cypress/integration/SlateAdmin/course-sections.js` | The selection→URL contract and the URL-entry tab walk (gotcha 2 in situ) |
| slate: `.github/workflows/test-e2e.yml` | The authoritative harness recipe: container build, hologit projections, guarded lens caching |
| skeleton-v3: `cypress/support/commands.js` | `loginAs`/`resetDatabase`/`withExt` and the `SITE_CONTAINER` execution mode |
