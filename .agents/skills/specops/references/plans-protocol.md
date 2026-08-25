# The Plan Protocol

If `specs/` is the architecture document (timeless: what should be true), `plans/` is the project plan (motion: how we get there). Each plan declares a scope, the specs it implements, its dependencies, and concrete validation criteria. Together, the plan files form a **micro-DAG of work** that bridges specs to running code.

This doc defines the protocol. It is meant to be portable across projects that adopt the [specops](../SKILL.md) workflow.

## What plans are — and are not

Plans are temporal. They describe a chunk of work to be done now: scope, dependencies, approach, and how we'll know it's finished. Once merged, a plan freezes — its merged-PR link plus its completed validation criteria become the project's working memory of what got built, how, and what was left for later.

| Plans are                                      | Plans are not                                                  |
| ---------------------------------------------- | -------------------------------------------------------------- |
| A micro-DAG of work bridging specs → code      | Specs (which are timeless, frozen by review, not by merge)     |
| One scope-bounded chunk of work per file       | Commits (a plan produces several commits, usually one PR)      |
| Dependency-aware (`depends:` is load-bearing)  | Tickets (flatter, more granular, live in your issue tracker)   |
| Validated by checkbox criteria at close        | Roadmap entries ("ship X by Y" — that's a different artifact)  |

Specs answer **what must be true**. Plans answer **how we're getting there next**.

## Directory layout

```
plans/
├── README.md              # Protocol index — usually just points to this reference
└── <slug>.md              # One file per plan
```

- **Location**: `plans/` at repo root.
- **Filenames**: kebab-case slugs, descriptive (e.g., `storage-foundation.md`, `github-oauth.md`, `auth-jwt-substrate.md`). No numeric prefixes — the slug *is* the plan ID, referenced by `depends:` entries in other plans.
- **No maintained DAG drawing or status table** in `plans/README.md`. The per-plan frontmatter is the single source of truth for both status and graph shape; a redrawn DAG or status dashboard would rot the moment anyone forgot to update both. Use the [`plans` script](#visualization-and-status) to query both on demand from the authoritative frontmatter. For ad-hoc queries:
  - In flight: `grep -l '^status: in-progress' plans/*.md`
  - Done: `grep -l '^status: done' plans/*.md`
  - Trace dependencies: `grep '^depends:' plans/*.md` or open the plan whose downstream you're tracing

## Frontmatter schema

Every plan begins with YAML frontmatter:

```yaml
---
status: planned          # planned | in-progress | done | blocked | cancelled
depends: [other-plan-slug, another-plan-slug]
specs:                   # spec files in THIS repo that this plan implements
  - specs/architecture.md
  - specs/behaviors/storage.md
upstream-specs:          # (optional) specs in OTHER repos this plan consumes
  - other-repo:specs/behaviors/transactions.md
awaits:                  # (optional) external blockers — see "External blockers" below
  - "other-org/library@v1.0 — consumed via Foo / Bar / openThing API"
issues: [128, 129]       # (optional) related issue numbers
pr: 42                   # (optional) merged PR — added at closeout, knowable only after `gh pr create`
---
```

Field semantics:

- **`status`** — see [Status lifecycle](#status-lifecycle) below.
- **`depends`** — list of plan slugs (filenames without `.md`) that must be `done` before this plan can start. Empty list (`[]`) for plans with no prerequisites. Update mid-stream if a new prerequisite is discovered.
- **`specs`** — specs in *this* repo that this plan implements. The [spec-drift auditor](./spec-drift-auditor.md) treats these as a contract: the implementation must match.
- **`upstream-specs`** *(optional)* — specs in *other* repos that this plan consumes. Format: `<repo-name>:<path-from-repo-root>`. **Informational only** — the spec-drift auditor does *not* check these; we don't promise to implement specs we don't own. The distinction exists so dangling references to dependency specs don't show up as drift findings.
- **`awaits`** *(optional)* — list of external blockers. Each entry is a one-line pointer + reason for an upstream release, vendor delivery, partner decision, or anything else not represented by an in-repo plan. Distinct from `depends:` (in-repo plan slugs) and `upstream-specs:` (specs owned by another repo). See [External blockers](#external-blockers).
- **`issues`** *(optional)* — related issue numbers in your tracker.
- **`pr`** *(optional)* — the PR that closed the plan. Set only when `status: done`.

## Body template

```markdown
# Plan: <title>

## Scope
Bounded statement of what's in and what's explicitly out. Out-of-scope items should
point to where they will land (other plan, future spec, deferred).

## Implements
Bullet list mapping each spec file to the specific behaviors/endpoints implemented.
Use sub-headings for "Own specs" / "Upstream specs" when both are present.

## Approach
Step-by-step strategy. Code sketches, key algorithms, module layout, interfaces.
Detailed enough that someone else could pick it up; not so detailed it's just the
code written twice.

## Validation
- [ ] Concrete, testable criterion 1
- [ ] Concrete, testable criterion 2
- [ ] ...
The load-bearing section. Converts `in-progress` to `done`. Each box flips to `[x]`
only when verified. Never silently rewrite a criterion to match what was built —
that's an amendment in its own earlier commit.

## Risks / unknowns
- **Named risk** — short description and how it'll be mitigated or watched.
Not prescriptive; helps the implementer know what to watch for.

## Notes
(Populated at closeout. Non-actionable carry-forwards: decisions made, gotchas
discovered, dependency surprises, version pins worth remembering. But if a decision
recorded here is actually a *governing principle* that will shape future work, it
doesn't belong frozen in a plan — promote it to a spec; see "Relationship to specs/".)

## Follow-ups
(Populated at closeout. See "Follow-ups taxonomy" below.)
```

## Status lifecycle

```
planned  ──►  in-progress  ──►  done   (frozen)
                  │
                  └──►  blocked         (waiting on a prerequisite or external event)
                  └──►  cancelled       (work abandoned)
```

Transitions are commits with specific message conventions:

- **Start work**: `chore(plans): mark <slug> in-progress`
  - Skippable for tiny plans — going straight to `done` at the end is fine.
- **Close**: `chore(plans): mark <slug> done (PR #<n>)` (see [The closeout commit](#the-closeout-commit) below).

`blocked` and `cancelled` are edge cases — most plans go directly from `planned` to `done`.

**Parallel work**: multiple plans can be `in-progress` simultaneously across contributors. One plan per contributor at a time is the norm — keeps each plan's branch and PR coherent — but the protocol doesn't forbid more.

**Splitting a plan**: if a `planned` plan grows too big, rename it and add the new plan(s) with `depends:` updated to reflect the new partitioning. Do this as its own PR (not mid-implementation) so the DAG change is reviewable on its own. If the plan is already `in-progress`, finish or abandon it before splitting — don't restructure under your own feet.

<a id="external-blockers"></a>

## External blockers (`awaits:`)

A plan often depends on something outside its repo's DAG — an upstream library release, a partner sign-off, a vendor delivery, a customer decision. Capture each as a one-line entry in the optional `awaits:` frontmatter field:

```yaml
awaits:
  - "JarvusInnovations/gitsheets@v1.0 — consumed via Repository / Sheet / openStore"
  - "https://github.com/example-org/api-vendor/issues/42 — need their decision on the auth header format before we can wire the client"
  - "staff decision on Slack channel rename (#governance)"
```

Each entry is free-form text — a URL, a `repo@tag`, "vendor X delivery Q3 2026", or any other pointer specific enough that a future reader (or `grep`) can chase it. Each entry should carry enough context to make the block self-explanatory; a trailing em-dash clause for the *why* keeps entries useful when grep surfaces them out-of-context. Keep entries short; one line each.

### Why `awaits:` exists alongside `depends:` and `upstream-specs:`

| Field            | Points at                                      | DAG-traversal | Auditor reads |
| ---------------- | ---------------------------------------------- | :-----------: | :-----------: |
| `depends`        | In-repo plan slugs that must be `done` first   |       ✓       |      n/a      |
| `upstream-specs` | Specs in another repo this plan consumes       |       —       |       —       |
| `awaits`         | Anything else external — releases, decisions, vendor deliveries | — | — |

These three fields are **orthogonal axes**, not mutually exclusive categories. The same upstream relationship can appear in two fields at once. Canonical example: a plan that consumes gitsheets carries both `upstream-specs: [gitsheets:specs/behaviors/transactions.md, ...]` (the specs we'll implement against) *and* `awaits: ["JarvusInnovations/gitsheets@v1.0 — ..."]` (the release we're waiting for). The first describes what we promise to conform to; the second describes what has to ship before we can. Both are true simultaneously.

Without `awaits:`, external blockers had to live in prose inside the body — invisible to scripts, ungreppable across the project, and at risk of being lost when the plan freezes.

### Relationship to `status`

`awaits:` is the *structural fact* of an external block. `status:` is the *lifecycle state* of the plan. They're independent:

- `status: planned` + non-empty `awaits:` — we haven't started; we already know an external block exists. Work may begin once the block clears, or partially if some of the plan's scope is independent of the block.
- `status: in-progress` + non-empty `awaits:` — we've done what we can without the awaited thing; the rest of the plan is paused until it lands.
- `status: blocked` + non-empty `awaits:` — work cannot proceed at all; `awaits:` says why.
- `status: blocked` + empty `awaits:` — smell. A blocked plan should always say what's blocking it (either via `awaits:`, or unfinished `depends:`, or both). `specops next` and `specops dag` surface a warning (on stdout, where the agent sees it) when they find `status: blocked` with no `awaits:` *and* no unfinished `depends:` — the strongest form of this smell, where nothing structural explains the block.

### Resolution

When the awaited thing happens, delete the matching entry from `awaits:`. Git history is the audit trail. If a plan closes with entries still present, add a Notes entry explaining why (rare — usually means the plan worked around the block, or the block stopped being load-bearing).

### How the scripts treat it

`specops next` treats `awaits:` as a blocker independent of `depends:`. A plan with non-empty `awaits:` never appears under `ready` — it surfaces under a separate `awaiting` section, with each `awaits:` entry called out. If the plan is *also* blocked by unfinished `depends:`, both reasons are shown.

`specops dag` styles nodes with non-empty `awaits:` distinctly (dashed border) so the external dependency is visible in the rendered graph.

## Proposal plans

Sometimes the deliverable is a *decision*, not code: a spec or contract authored for a downstream or cross-team consumer to implement, or a design that needs sign-off before anyone builds against it. (A proposal is *agreed* state awaiting an external actor — distinct from a spec whose design is still churning, which stays off the main branch entirely on a [draft planning PR](../SKILL.md#where-in-development-specs-live-the-draft-planning-pr) and has no plan yet.) These are first-class plans — the proposal artifact (a `specs/api/*.md` contract, an ADR, a data-model sketch) is the thing that ships and goes on the record — but they are deliberately scoped-not-built.

- **Status + `awaits:`.** A proposal that cannot be built until an external party acts is `status: blocked` with a non-empty `awaits:` naming what's awaited (the downstream team's implementation, a partner sign-off, an upstream release). If part of the scope can proceed now, `status: planned`/`in-progress` + `awaits:` is fine. Either way `awaits:` must be present — `status: blocked` with an empty `awaits:` is the smell the scripts flag (see [Relationship to `status`](#relationship-to-status)).
- **Body.** Keep the section headings, but a proposal legitimately has a thin Approach (there's no implementation yet) and folds most of its substance into Scope, Implements, and Risks. Don't delete the headings — an explicit `## Approach` reading "n/a until <blocker> clears" is clearer than a missing one.
- **Shipping it.** The proposal lands as a record so the contract is versioned and shareable; merging the plan/spec does **not** imply the work is built — the plan stays `blocked`. Signal intent on the PR: open it as a draft and title it so reviewers see it's a proposal, e.g. `docs(specs): PROPOSAL — <feature>`. Cross-team agreement gates *implementation*, not the merge of the record.
- **Closing the loop.** When the awaited thing lands, clear the matching `awaits:` entry and either flip the plan to `in-progress`, or spawn the implementation plan(s) with `depends:` on the now-merged contract and let the proposal freeze as the historical record of the decision.

## The closeout commit

The last commit on the implementation branch, before merge, does **five things in one shot** under the message `chore(plans): mark <slug> done (PR #<n>)`:

1. **Frontmatter**: flip `status` to `done`, add `pr: <PR number>` (knowable once `gh pr create` returns).
2. **Validation checklist**: flip each `- [ ]` to `- [x]` for criteria you actually verified. If a criterion can't be verified at merge time (depends on a downstream plan, requires production deploy, etc.), **leave it unchecked** and add a one-line Notes entry explaining why and where it'll close out. **Never silently rewrite a criterion to match what you ended up doing** — that's a plan amendment in its own earlier commit.
3. **Notes** section: non-actionable carry-forwards — decisions, surprises, gotchas, learnings. Things future-you would want to know.
4. **Follow-ups** section: actionable items that didn't ship with this plan (see taxonomy below).
5. **Any downstream plans referenced by `Deferred to`** entries get edited in the *same commit* to absorb the deferral (see [Follow-ups taxonomy](#follow-ups-taxonomy)).

After merge: the plan is frozen. Historical record, no further edits.

## Follow-ups taxonomy

Each Follow-up entry takes one of four shapes. Pick deliberately — the shape encodes who owns the work next.

### `Issue [#N](link) — short description`

Use when the work is actionable but **not owned by any planned-or-in-progress plan**. File the issue first (e.g., via your issue tracker CLI) and link it. Example:

```markdown
- Issue [#48](https://github.com/org/repo/issues/48) — add CI check that EnvSchema and `.env.example` stay in lockstep
```

### `Deferred to [`<plan>`](<plan>.md) — short description`

Use when an **unstarted (`status: planned`) downstream plan** should own the work. **The same closeout commit must also edit that downstream plan to absorb the deferral** — typically a new bullet under Approach and a new criterion under Validation, cross-linked back to the deferring plan.

Example (in the closing plan's Follow-ups):

```markdown
- Deferred to [`api-skeleton`](api-skeleton.md) — `.env.example` lands when `EnvSchema` is introduced
```

…and in the *same* commit, `api-skeleton.md` grows:

```markdown
## Approach
…
Ship a `.env.example` file at the repo root that enumerates every `EnvSchema` field…

## Validation
…
- [ ] `.env.example` exists at the repo root with one entry per `EnvSchema` field (deferred from [`workspace`](workspace.md))
```

**Why the absorption rule**: without it, "Deferred to <plan>" is just a pointer that doesn't oblige anyone to do anything — the downstream plan can ship without ever absorbing the deferred work, and the deferral rots in place. Requiring same-commit absorption converts the pointer into a binding commitment.

If the downstream plan is already `in-progress` or `done`, use the `Issue` shape instead. **Never modify a plan that's actively being implemented or already frozen.**

### `Tracked as: <free-form pointer>`

Use for anything that's neither an issue nor another plan — waiting on community input, a vendor response, a design decision pending review. Example:

```markdown
- Tracked as: waiting on upstream maintainer to ship v2.1 (see thread linked in #channel)
```

### `None.`

Use when there are no follow-ups. Be explicit. A future reader can see the section was considered, not just absent.

```markdown
## Follow-ups

None.
```

## Relationship to `specs/`

Plans implement specs. Concretely:

- **A plan's `specs:` field lists what it implements.** The implementation must match those specs — the spec-drift auditor will hold it accountable.
- **Specs come first.** If you realize a spec needs to change mid-plan, the spec change is its own PR before the plan continues. Don't quietly drift the spec to match what you ended up coding.
- **A spec change ripples to its plans.** When a spec changes, the plans that list it in `specs:` may no longer describe correct motion. Review them and update those affected — revise a `planned` plan in place; flag the owner of an `in-progress` one rather than rewriting under them. Find them with `grep -l '<spec-path>' plans/*.md`.
- **Plans don't propose specs.** Specs are decided through their own review process. A plan's job is execution against an already-agreed-on state.
- **A merged spec is implemented or planned — never merely drafted.** On the main branch, every spec either matches the implementation or is claimed by a committed plan's `specs:` field (a `blocked` [proposal plan](#proposal-plans) counts). Specs still being designed live on a [draft planning PR](../SKILL.md#where-in-development-specs-live-the-draft-planning-pr) and merge together with their plan set. This is what lets the auditor treat every Table-1 gap as either planned motion or a violation — with no third "maybe it's just a draft" bucket.
- **The spec-drift auditor reads `specs/`, never `plans/`.** Plans rot fast and are expected to. Specs are the auditable source of truth.
- **Durable judgment belongs in specs, not frozen in plan Notes.** Closeout Notes capture decisions and gotchas — but a plan freezes, and a *governing principle* buried in a frozen plan is invisible to the next agent, who will re-litigate it. If a decision made during the plan will shape *future* work (not just record what happened in this one), promote it to the relevant spec or `principles.md` through the spec's own PR (per "Specs come first" above), and let the plan Note just point to it. This is the plans-side of the standing vigilance in [specops: ALWAYS watch for decisions and principles that belong in a spec](../SKILL.md#always-watch-for-decisions-and-principles-that-belong-in-a-spec).

## After spec-complete

Plans don't go away once the initial DAG completes. They become the standing workflow for every future feature:

1. Update or add the relevant specs (own PR).
2. Add a new plan declaring how to bring code to the spec.
3. Implement, close out, freeze.

Completed plans stay as historical record. Their merged-PR links plus completed-validation criteria are the project's working memory.

<a id="visualization-and-status"></a>

## Visualization and status

`plans/README.md` deliberately does not maintain a hand-drawn DAG or status table — they'd rot the moment someone forgot to update them. Instead, the bundled **`specops` CLI** queries the authoritative frontmatter on demand and emits [TOON](https://toonformat.dev/) (a compact, agent-friendly format). It ships as a self-contained bundle (`scripts/specops.mjs` + a `scripts/specops` shim), runs on `node ≥ 20` with no install, and is built from `src/cli/` with `bun run build`.

### `specops dag` — DAG visualization

```sh
# print Mermaid syntax to stdout
scripts/specops dag

# wrap in a code fence ready to paste into a Markdown doc
scripts/specops dag --fence

# horizontal layout
scripts/specops dag --direction LR
```

Reads each plan's `status`, `depends`, `pr`, and `awaits` fields and emits a Mermaid `graph` with nodes styled by status (`planned`, `in-progress`, `done`, `blocked`). Plans with non-empty `awaits:` get a dashed border so external blockers are visible at a glance. Use it in code review, in stand-ups, or pasted (and dated) into a wiki snapshot. Don't commit a static rendering into `plans/README.md` — the next status flip will make it lie.

### `specops next` — what to work on next

```sh
# show plans that are ready to start (deps met) and plans blocked on unfinished deps
scripts/specops next

# include in-progress plans in the listing
scripts/specops next --include-in-progress
```

Skips `done` and `cancelled` plans, then lists what's left in TOON sections:

- **`ready`** — `depends:` all `done` AND `awaits:` empty (with an `unblocks` count).
- **`awaiting`** — `awaits:` non-empty (regardless of `depends:` state). Each `awaits:` entry is shown so the blocker is clear.
- **`blocked_by_deps`** — `depends:` has unfinished entries AND `awaits:` is empty. Each unfinished dep is called out.
- **`blocked`** — `status: blocked` plans (lifecycle explicitly blocked).

Within each section, plans are topologically sorted so the plans that unblock the most downstream work appear first. Running `specops` with no command prints a condensed dashboard of the same data (and is what the optional `specops hook install` SessionStart hook loads each session).

Both commands compute over a shared parser/DAG-walker in `src/cli/plans.ts`. See [`src/cli/`](../src/cli/) in this skill; the determinism layer is files-first — to read a single plan, open its file.

## Worked example: closing a plan

Suppose `workspace.md` ships scaffolding and discovers `.env.example` is naturally owned by the future `api-skeleton` plan. At PR-merge time, the closeout commit does this in one shot:

```diff
--- a/plans/workspace.md
+++ b/plans/workspace.md
@@ -1,7 +1,8 @@
 ---
-status: planned
+status: done
 depends: []
 specs:
   - specs/architecture.md
 issues: []
+pr: 9
 ---
@@ Validation
-- [ ] `git clone … && npm install && npm run dev` works on a fresh machine
+- [x] `git clone … && npm install && npm run dev` works on a fresh machine
… (each verified box flipped)
@@ end of file
+## Notes
+
+- ESM-only dep landmines, dedupe quirk in Vite — workarounds documented inline.
+- Pinned versions as of cutover commit: <list>.
+
+## Follow-ups
+
+- Deferred to [`api-skeleton`](api-skeleton.md) — `.env.example` lands when `EnvSchema` is introduced.
```

…and in the *same* commit, `api-skeleton.md` grows a bullet in Approach and a Validation criterion absorbing the deferral. One commit, message `chore(plans): mark workspace done (PR #9)`. After merge, `workspace.md` is frozen forever.

## Quick checklist for a closeout PR

- [ ] Frontmatter: `status: done`, `pr: <n>` added
- [ ] Any `awaits:` entries either resolved (deleted) or explicitly justified in Notes (rare — usually means the block stopped being load-bearing or was worked around)
- [ ] Every Validation box reflects reality (`[x]` only if verified; unverified stays `[ ]` with a Notes entry)
- [ ] Notes section populated (decisions, gotchas, version pins — not action items)
- [ ] Any decision in Notes that's actually a durable governing principle has been promoted to a spec / `principles.md` (or filed as a follow-up to do so), not left to rot in the frozen plan
- [ ] Follow-ups section populated (Issue / Deferred to plan / Tracked as / None)
- [ ] Every `Deferred to <plan>` has an accompanying edit to that downstream plan, in the same commit, and the downstream plan is still `planned`
- [ ] Commit message: `chore(plans): mark <slug> done (PR #<n>)`
- [ ] No silent rewrites of Validation criteria to match what was built
