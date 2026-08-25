---
name: specops
description: Spec-driven development workflow where specs are the source of truth, paired with a plan protocol for tracking work-in-flight as a micro-DAG. Use this skill whenever starting new features, planning implementation, writing specs, reviewing code against specs, working in or with a `plans/` directory, closing out a plan, or when the user mentions "spec", "specs/", "spec-first", "plans/", "plan protocol", "closeout commit", or asks how something should work or what to work on next. Also use when creating a new project that will use this development methodology, or when onboarding someone to a spec-driven codebase.
---

# Spec-Driven Development (SpecOps)

## Philosophy

Specs declare the complete desired state of the software. Implementation follows spec. All work begins with a spec update.

This is not documentation-driven development (where docs describe what was built). This is specification-driven development — the spec describes what *should exist*, and the implementation is brought into conformance with it. The spec leads; the code follows.

### Why this matters

When agents or developers implement features, they make hundreds of micro-decisions. Without a spec, each decision is a guess that may or may not match the user's intent. With a spec, those decisions are already made — the implementer's job is execution, not invention. This is especially powerful for AI-assisted development where multiple agents may work on different parts of the same system.

### The core loop

```
1. Spec change  →  propose what should be true
2. Accept       →  reviewer agrees on desired state
3. Implement    →  bring code into conformance
4. Verify       →  compare running software to spec
```

Code without a corresponding spec is unspecified behavior — it may exist for practical reasons, but nothing guarantees it. Spec without corresponding code is a known gap — and on the main branch, a known gap **carries a committed plan**. A spec that has neither implementation nor plan isn't a gap, it's an undeveloped draft, and it lives on a draft planning PR until it's real (see [Where in-development specs live](#where-in-development-specs-live-the-draft-planning-pr)).

## How to write specs

### The right level of detail

Specs declare **what** must be true, not **how** to implement it.

**Right level — declarative state + rules:**
> "Each row shows: from_stop_name, to_stop_name, pathway_mode label, completion fraction (populated field count / applicable field count). Sort: incomplete first, then alphabetical by from_stop_name. A pathway is 'on this level' when both its from_stop and to_stop share the same level_id."

This tells an implementer *what* must be true without dictating *how*. It's testable — you can look at the screen and verify conformance.

**Too vague — feature narratives:**
> "The task list shows pathways grouped by level with completion tracking."

An agent reading this still has to make hundreds of decisions. Which fields? What sort order? What happens when data is missing?

**Too detailed — implementation pseudocode:**
> "Query pathways WHERE from_stop.level_id == to_stop.level_id, LEFT JOIN field_notes, ORDER BY field_complete ASC, render each as a `<li>` with..."

This is just writing the code twice. The spec rots the moment implementation diverges.

### Encode the philosophy, not just the enumerated rules

**Two words, one idea.** A project's *philosophy* is its guiding **stance** — the *why* behind how it behaves ("we're offline-first"; "the field user comes before the desk analyst"). You write that philosophy down as **principles**: individual, decisively-stated rules, each picking a side of a trade-off. The philosophy is the whole; a principle is a unit of it. So "encode the philosophy" concretely means: *capture its principles where implementers will read them.* Throughout this skill, "philosophy" names the stance and "principle" names the written unit — `principles.md` and the `## Principles` section of a spec hold principles.

Recall why this skill exists: implementers make hundreds of micro-decisions, and the spec is what makes those decisions match intent. Enumerated rules can only cover the decisions you anticipated — the cases you thought to write down. A principle covers the rest: it's a generative rule that resolves the cases no enumeration reaches, the same way the author would have.

The two belong together:

- **Enumerated rule** — "Sort incomplete pathways first, then alphabetical by from_stop_name." Resolves one specific case.
- **Principle** — "This is a field-data-entry tool used one-handed on a phone in transit stations. When a display or interaction decision is in tension, optimize for the surveyor mid-walk over the analyst at a desk." Resolves every case the enumeration missed — the same way the author would have.

A principle earns its place in a spec only if it's **decisive**: it must pick a side of a real trade-off and rule things out. Compare:

- **Not a principle** (platitude — rules nothing out): "The UI should be clean and user-friendly."
- **A principle** (decisive — an implementer can act on it): "Prefer showing stale data with a freshness timestamp over blocking the screen on a refresh. A surveyor underground with no signal must always see the last-known state."

The test is the same as for any spec: could two implementers read it and disagree about whether the code conforms? "User-friendly" — yes, so it's useless. "Stale-with-timestamp beats blocking" — no, so it's enforceable.

Where principles live — **default to the most specific spec the principle governs.** A principle that only shapes one screen belongs in that screen spec's `## Principles` section, right next to the rules it backs, where an implementer reading that spec will actually see it. Reserve `principles.md` for the genuinely project-wide ones that no single feature spec owns. When a local principle turns out to govern decisions beyond its home spec, *promote* it to `principles.md` and leave a pointer behind. The concrete trigger to watch for: **the same or a similar principle showing up in a second spec** — that duplication is the signal it's outgrown any one spec, so lift it once and replace both copies with references rather than letting two near-identical statements drift apart. This keeps `principles.md` short and high-signal instead of a dumping ground — and keeps each principle close to the work it steers. Don't agonize over the placement at capture time: put it on the spec you're in, promote later if it spreads.

**Reference the relevant project principles down into each spec.** Promotion sends principles *up*; this is the flow back *down*. Agents (and people) routinely dive into one or two specs without ever opening `principles.md` — so a project-wide principle that quietly governs a screen is invisible to whoever's working on it. Counter this: in a spec's `## Principles` section, **name the `principles.md` entries that especially bite on this spec**, each with a one-line gloss of *how* it applies here, and link to the full statement. The implementer reading just this one spec then inherits the governing principles instead of missing them. Be selective — reference only the principles that genuinely shape this spec's decisions, not the whole list; a spec that links every principle teaches nothing. When you promote a local principle up to `principles.md`, the pointer you leave behind *is* one of these references.

### What specs should cover

- **Display rules** — what data appears and under what conditions
- **Data requirements** — where data comes from (API, local DB, derived)
- **Actions** — what the user can do and what each action causes
- **Navigation** — where you can go from here, where you came from
- **Business rules** — calculations, state machines, validation logic
- **API contracts** — request/response shapes, auth, error cases
- **Principles** — the decisive rules that resolve the unspecified micro-decisions consistently — your philosophy, written down (see [Encode the philosophy](#encode-the-philosophy-not-just-the-enumerated-rules) above)

### What specs should NOT cover

- **Visual design** — colors, spacing, fonts. That's wireframes + theme constants.
- **Widget/component decomposition** — how screens break into classes. Implementation decision.
- **Test cases** — tests derive from specs but aren't the spec.
- **Variable names, file paths** — implementation details that change freely.

## Spec directory structure

Organize specs by what they describe, not by when they were written:

```
specs/
├── README.md              # Workflow docs, directory layout, format conventions
├── principles.md          # Project-wide principles — the decisive rules (your philosophy, written down) that resolve unspecified decisions
├── architecture.md        # Tech stack, project structure, foundational decisions
├── data-model.md          # Schema, field definitions, relationships
├── api/                   # One file per endpoint or endpoint group
│   ├── conventions.md     # Auth, versioning, error envelope, content types
│   └── <endpoint>.md
├── screens/               # One file per screen/route
│   └── <screen-name>.md
└── behaviors/             # Cross-cutting rules that span multiple screens
    └── <behavior>.md
```

**principles.md** — the project's philosophy written down as principles: the decisive, cross-cutting rules that resolve micro-decisions no enumerated rule reaches. Distinct from `architecture.md` (concrete tech and structure choices) — principles are the value judgments that pick a side when two reasonable implementations conflict. A principle local to one screen or behavior lives in that spec's `## Principles` section; `principles.md` holds the ones that apply everywhere — and feature specs reference those down into their own `## Principles` sections.

**screens/** — one file per screen/route. What the user sees and can do at that URL.

**behaviors/** — rules that span multiple screens. When a screen spec says "completion fraction", the completion behavior spec defines how it's calculated.

**api/** — the contract between client and server. Both sides implement to these specs.

## Spec file templates

### Screen spec

```markdown
# Screen: <Name>

## Route
The path/URL for this screen.

## Data Requirements
What data this screen needs and where it comes from.

## Display Rules
Declarative description of what appears and under what conditions.
This is what a reviewer checks the implementation against.

## Actions
What the user can do and what each action causes.

## Navigation
Where you can go from here, where you came from.

## Principles (optional)
The decisive rules governing this screen — what to favor for any case the rules
above don't enumerate.

**Inherited** — project principles from `principles.md` that especially bite here:
- [Offline-first beats fresh](../principles.md#offline-first-beats-fresh) — this screen
  must render last-known state instantly; treat the live refresh as a background nicety.

**Local** — principles owned by this screen (promote to `principles.md` if they spread):
- ...

Omit either subsection if empty. Reference only principles that genuinely shape this
screen's decisions — not the whole list.
```

### Behavior spec

```markdown
# Behavior: <Name>

## Rule
The invariant or rule, stated declaratively.

## Applies To
Which screens or components this behavior affects.

## Details
Edge cases, calculations, timing, error handling.

## Principles (optional)
Same two-part shape as the screen template: **Inherited** — linked `principles.md`
entries that especially govern this behavior, each with a one-line gloss of how it
applies; **Local** — the decisive trade-off behind this rule, if any (promote if it
spreads). Omit either subsection if empty.
```

### API spec

```markdown
# API: <Name>

## Endpoint
Method, path, auth requirements.

## Request
Parameters, body shape with field types.

## Response
Success body shape with field types. Error cases.

## Notes
Caching, idempotency, offline implications.

## Principles (optional)
Same two-part shape as the screen template: **Inherited** — linked `principles.md`
entries that especially govern this endpoint, each with a one-line gloss; **Local** —
the decisive trade-off for this endpoint (e.g. what to favor when consistency and
latency conflict), promoted if it spreads. Omit either subsection if empty.
```

### Principles (`principles.md`)

```markdown
# Principles

The project's philosophy, written down as principles. Each is decisive: it picks a
side of a real trade-off so an implementer can resolve an unspecified case the way
the author would.

## <Principle name>
The principle, stated as a rule that rules something out. Include the *why* — the
context that makes the trade-off land — so a future reader applies it correctly.

> Example: **Offline-first beats fresh.** This tool runs in stations with no signal.
> When freshness and availability conflict, always show last-known state with a
> timestamp rather than block on a network round-trip.
```

Give each principle a short, stable `## <Name>` heading — that heading is its anchor, and feature specs link to it (`principles.md#<name>`) from their `## Principles` sections. References run one direction only: specs point *up* at `principles.md`. Don't maintain a "governed by these specs" list inside `principles.md` — like a hand-drawn DAG, it would rot the moment a spec changed. To find what a principle governs, grep for links to its anchor.

Any screen, behavior, or API spec may also carry an optional `## Principles` section for a principle local to that one spec — same bar (decisive, rules something out). Promote it to `principles.md` once it starts governing decisions beyond that one file.

## How agents use specs

When implementing a feature or fixing a bug:

1. **Read the relevant spec first.** Every screen, endpoint, and behavior has a spec file. Read it before writing code.
2. **The spec answers "what", not "how".** It says what data appears, what actions exist, what rules apply. It does not dictate widget trees or class hierarchies.
3. **If the spec is ambiguous, clarify the spec** — don't guess and code. Propose a spec amendment.
4. **If the spec is wrong, fix the spec** — don't work around it in code.
5. **When done, check your work against the spec** — every display rule, every action, every conditional.

### When starting a new feature

First decide what *kind* of work this is — it changes whether a plan comes now, later, or in tandem with the spec (see [When (and when not) to author a plan](#when-and-when-not-to-author-a-plan)). The steps below are the default path for the common case: **one bounded feature in a project whose surrounding specs are stable.**

1. Write or update the spec files first
2. Get the spec reviewed and accepted
3. Author the plan that brings code to the spec — scope, the specs it implements, dependencies, validation criteria (for this one-bounded-feature case, draft the spec change and its plan in tandem and present both)
4. Implement to match the spec
5. Verify the running software matches the spec, then close the plan out — it freezes as the record of what got built

### Where in-development specs live: the draft planning PR

The invariant that keeps a `specs/` tree auditable: **every spec on the main branch is either implemented or carries a committed plan.** Under that invariant, spec auditing stays meaningful — a Table-1 "specified but not implemented" finding is always either expected motion (a plan exists; cite it) or a genuine violation. Without it, the auditor can't tell a gap the team is driving toward from a sketch someone parked, and its gap tables decay into noise.

So a spec whose desired state is **still being negotiated** doesn't merge. It lives on a **draft planning PR** — a branch holding the in-development spec (and eventually its plan set) that converts from draft and merges only when the finalized spec(s) and the plan(s) to implement them ride together. The PR body carries the countdown: design questions still open, companion specs to amend, plans to author.

Why a draft PR beats a `status: draft` marker on the main branch:

- **Absence is the only unambiguous marker.** A draft on main still pollutes grep results and reading context, and an implementer (or agent) diving into `specs/` has no reliable reflex to check a status field before building against it.
- **Every tool would need to know the marker** — the drift auditor, `grep`-based spec references, plan `specs:` fields. Absence requires nothing from anyone.
- **The review conversation happens where review lives anyway** — on the PR, threaded against the diff, instead of as edits to a half-real file on main.

Hygiene: rebase a long-lived spec branch onto main periodically so the eventual merge is clean, and keep one draft PR per design arc (a batch of related specs shares one PR; unrelated arcs don't).

**Distinguish this from a [proposal plan](references/plans-protocol.md#proposal-plans)**, which handles the *next* stage: a contract that's already agreed but can't be built until an external party acts. A proposal plan **merges** — spec plus a `blocked` plan with `awaits:` — because the design is settled and the record needs to be versioned and shareable; the invariant holds because the plan rides along. The draft planning PR is upstream of agreement: design still churning, no plan yet, nothing to hold the invariant with — so it stays off main entirely. One converts to the other: when a draft's design settles but its build is externally gated, land it as a proposal plan.

### When fixing a bug

1. Check if the behavior is specified — if so, the spec is right and the code is wrong
2. If the behavior is unspecified, decide: should the spec be updated to cover this case, or is the fix obvious enough to just code?
3. For non-trivial fixes, update the spec first so the fix is documented

### When reviewing code

Compare the implementation against the spec, not against your own ideas of how it should work. The spec is the acceptance criteria.

### ALWAYS: watch for decisions and principles that belong in a spec

This is a standing responsibility, not a phase you enter and leave. While doing *any* work — implementing, debugging, reviewing, or just talking a problem through with the user — **stay alert for the moment a key decision gets made or a principle gets resolved** (the project's philosophy crystallizing into a rule you could write down). These moments are easy to miss because they feel like progress, not like spec work:

- The user explains *why* they want something a certain way, revealing a principle that will govern future decisions.
- A trade-off gets settled in conversation ("always favor X over Y when they conflict").
- You hit an unspecified case, pick an answer, and that answer implies a general rule.
- A review comment establishes a convention the whole codebase should follow.
- A "we'll always / we'll never" sentiment surfaces — almost always a principle in disguise.
- **You write — or notice — the same (or a barely-reworded) principle in a second spec.** Duplication across specs is the loudest promotion signal there is: the principle has outgrown any one spec. Don't leave two copies to drift apart. Lift it to `principles.md` once, then replace both copies with `## Principles` references to that single entry (see [Encode the philosophy](#encode-the-philosophy-not-just-the-enumerated-rules)). Watch for *similar*, not just identical — two specs that each say "favor the field user over the desk analyst" in different words are the same principle.

When you notice one, **stop and surface it**: name the decision, say whether it reads as an enumerated rule or a principle, and propose exactly where it should be operationalized — defaulting to the most specific spec it governs (a screen/behavior/API spec's rules or its `## Principles` section), and reaching for `principles.md` only when it's genuinely project-wide (see [Encode the philosophy](#encode-the-philosophy-not-just-the-enumerated-rules)). Then make (or propose) that spec change through the normal spec-first flow before it evaporates.

The bar for flagging: **if a decision would change how a *future* implementer resolves a micro-decision, it belongs in a spec.** If it only affected this one line, let it go.

Why this is load-bearing: a decision that lives only in code, a commit message, or a chat scrollback is unspecified behavior the moment the context window closes. The next agent will re-litigate it — possibly differently — and the codebase drifts. This vigilance is what keeps specs *generative* rather than merely descriptive. Specs aren't written once at feature-kickoff and frozen; they accrete the project's resolved judgment, and most of that judgment gets resolved in the middle of doing something else.

## Plans: the work DAG that bridges specs to code

Specs describe **state** (what should be true forever). Plans describe **motion** (how we're getting there next). Every chunk of feature work starts with a plan file in `plans/` declaring its scope, the specs it implements, its dependencies on other plans, and concrete validation criteria. The plan files together form a micro-DAG that is the project's working plan.

Plans are temporal — once merged, they freeze as historical record. Their merged-PR links plus completed validation criteria are the project's working memory of what got built, how, and what was deferred.

A plan's frontmatter:

```yaml
---
status: planned          # planned | in-progress | done | blocked | cancelled
depends: [other-plan-slug]
specs:                   # spec files in THIS repo that this plan implements
  - specs/architecture.md
upstream-specs:          # (optional) specs in OTHER repos this plan consumes
  - other-repo:specs/behaviors/transactions.md
issues: [128]
pr: 42                   # set at closeout
---
```

A plan's body has a fixed template: **Scope**, **Implements**, **Approach**, **Validation** (load-bearing checkbox list — converts "in-progress" to "done"), **Risks / unknowns**, **Notes** (populated at closeout), **Follow-ups** (populated at closeout).

The full protocol — frontmatter schema, body template, status lifecycle, the closeout-commit ritual, the Follow-ups taxonomy (Issue / Deferred to plan / Tracked as / None), and the deferral-absorption rule — is in [references/plans-protocol.md](references/plans-protocol.md). Read it before authoring or closing out a plan.

### When (and when not) to author a plan

**In a specops project, the `plans/` DAG is the planning system.** Don't substitute an agent's built-in "plan mode" or a throwaway planning scratchpad for it — those evaporate when the turn ends, leaving the DAG with no record of what was built or why. If you use a scratchpad to think, the artifact still has to land as a plan file. Watch for one failure mode in particular: drafting an ephemeral plan that reads "write spec X, then build it," then doing exactly that — and leaving behind *neither* a reviewed spec change *nor* a plan. Split it instead: the spec change goes through the spec-first flow, and the work to execute it gets a plan file.

**When the plan gets authored depends on what the user is doing:**

- **Mapping out a batch of specs** — sketching desired state across several specs, not building yet. **Don't author plans as you go.** Plans are motion; while the desired state is still settling, a plan-per-spec churns and rarely partitions the work well. Wait until the batch is complete, then step back and **propose a *set* of plans** that carves the work into sensible, dependency-ordered chunks. The good partition usually doesn't map one-to-one onto the spec files. While it settles, the batch accumulates on a **draft planning PR**, not on the main branch — see [Where in-development specs live](#where-in-development-specs-live-the-draft-planning-pr); the PR converts and merges when the batch and its plan set are finalized together.

- **Speccing and building one bounded feature in a mature project** — surrounding specs are stable, scope is small. **Build the spec change and its plan in tandem:** write the spec update and the plan to execute it together, present both, and proceed once they're accepted.

- **Intent unclear** — if it isn't obvious whether the user is building up a batch of specs or writing one to execute right now, **ask** before defaulting: "Are we mapping out specs first and planning the build after, or is this one thing to build now?" The answer picks the mode above.

**Even quick one-off work leaves a plan behind.** The urge to skip a plan because a change is "small" is exactly what hollows out the DAG. A bounded change still gets a plan file that freezes to `done` — that frozen record (merged PR + checked validation) is the project's working memory of what got built. Skipping it trades a few seconds now for an undocumented change later.

### Executing a plan DAG

Once a batch of plans is authored, reviewed, and `planned`, building them out is a **separate, explicitly-triggered step** — not something to fold into the same turn. *Finishing the plans is not consent to build them.* **Offer** to execute the DAG and wait for the human to trigger it — the trigger phrase is **"drain the DAG"** (or any equivalent explicit go-ahead); never start dispatching implementation work on your own.

When triggered, the way to execute a multi-plan DAG at scale is **dependency-gated waves of isolated worktree subagents (Sonnet) with a review/merge gate between them**: the orchestrator computes the ready set (`specops next`), creates a worktree per ready plan off the latest integration branch, dispatches a subagent into each to implement → push → open a PR (**never merge**), then **reviews every PR, fixes directly, confirms CI, and merges** — each merge unlocking the next wave. The full protocol — the agent brief, the review/merge gate, parallel-conflict resolution, per-agent live-dependency isolation, and which plans (operational or cross-repo) must *not* be auto-executed — is in [references/parallel-execution-protocol.md](references/parallel-execution-protocol.md). Read it before driving an execution run.

### When a spec changes, revisit the plans it touches

A spec edit can strand work that's already planned or in flight against the old desired state. **Whenever you change a spec, review the plans that implement it and offer to update them.** Find them by grepping the `specs:` frontmatter for the file you touched:

```sh
grep -l 'specs/path/to/changed.md' plans/*.md
```

For each hit: a `planned` plan may need its scope, approach, or validation revised; an `in-progress` plan's owner should be flagged that the target moved (don't silently rewrite a plan someone is mid-implementation on). This is the mirror of "specs come first" — the spec moves, then the plans chasing it catch up.

### Querying the plans DAG

`plans/README.md` deliberately does **not** maintain a hand-drawn DAG or a status table — they'd rot the moment someone forgot to update them. The bundled **`specops` CLI** queries the authoritative plan frontmatter on demand and emits agent-friendly [TOON](https://toonformat.dev/) output:

<!-- BEGIN GENERATED: command-reference -->

### Plans

- `scripts/specops next [--include-in-progress] [--slugs-only] [--dir <path>]` — Plans ordered by readiness — ready (deps met, nothing awaited) first, then awaiting-external and blocked, with what unblocks the most work on top.
- `scripts/specops dag [--direction TB|LR|BT|RL] [--fence] [--include-cancelled] [--dir <path>]` — Mermaid graph of the plans DAG, nodes styled by status, external blockers dashed.

### Session

- `scripts/specops hook install [--scope project|global] [--dir <path>] | hook status | hook uninstall [--scope project|global]` — Manage the SessionStart hook that loads this repo's plans dashboard at the start of every agent session.

<!-- END GENERATED: command-reference -->

Run with no command (`scripts/specops`) for the current repo's plans dashboard — a readiness summary, what's in progress, what's ready, what's blocked, and the last few plans completed (their dates read from git history, when the repo is a git checkout). Hygiene warnings (dangling deps, a `status: blocked` plan with nothing recorded as blocking it) are surfaced on stdout where the agent will see them.

The CLI is a **thin determinism layer over a files-first workflow**: it computes readiness, ordering, the dependency graph, and warnings *across all plan files* — work an agent can't reliably do by eye. To read or edit a single plan, open its file directly; there is deliberately no `view`/`show` command.

It ships as a self-contained bundle at `scripts/specops.mjs` (invoked through the `scripts/specops` shim), runs on `node ≥ 20` with no `npm install` and no `node_modules`, and is rebuilt from the TypeScript in `src/cli/` with `bun run build`. Run `scripts/specops hook install` once in a repo to load the plans dashboard into every agent session automatically.

## Setting up spec-driven development in a new project

**First, vendor this skill into the target project so the methodology travels with the codebase.** A project-level install means every contributor — and every agent they run — works against the same spec-and-plan practices, and the bundled `specops` CLI resolves from inside the repo with nothing to configure. From the project root:

```bash
mkdir -p .claude && npx skills add JarvusInnovations/specops -y --skill specops --agent claude-code universal
```

This installs the skill to `.agents/skills/specops/` (an agent-neutral canonical store) and symlinks `.claude/skills/specops` to it, then writes a `skills-lock.json`. Commit all three so the install is reproducible. The `universal` agent alongside `claude-code` is what selects this symlink layout — installing for `claude-code` alone copies the skill straight into `.claude/skills/` with no shared `.agents/` store; the `mkdir -p .claude` ensures the per-agent symlink is created rather than skipped. To add another agent later (e.g. Codex), re-run with its name appended and it symlinks to the same canonical store. Prefer `--global` only for solo use across many repos, where vendoring per-project doesn't apply.

Then:

1. Create a `specs/` directory at the project root
2. Write `specs/README.md` documenting the workflow and directory layout
3. Write `specs/architecture.md` with foundational tech decisions
4. Write `specs/principles.md` capturing the principles you already hold — your project philosophy written down as decisive "always favor X over Y" trade-offs that should steer every implementer. Seed it with what you know now; it grows as decisions get resolved (see [keeping specs alive](#keeping-specs-alive))
5. For each feature area, create the relevant spec files before coding
6. Add the specops hook to the project's CLAUDE.md (see [The CLAUDE.md hook](#the-claudemd-hook) below) — this is the always-loaded steer that gets agents to the skill and the plan protocol
7. Establish the convention: PRs that add features should include spec updates
8. Set up the spec drift auditor (see below)
9. Set up the plans protocol (see below)

### The CLAUDE.md hook

`SKILL.md` and the reference docs carry the full methodology, but they only load **when the skill triggers**. The project's CLAUDE.md is the one thing in context *every* turn — so it's where you counteract the default agent reflexes that specops overrides: shipping code without a spec, and dropping into built-in "plan mode" instead of writing a plan file. Keep this block **minimal** — its job is to hook those behaviors and route to the skill for everything else, not to restate the methodology.

Insert this block (adjusting `<specops-skill-path>` to the install path) into the project's CLAUDE.md. It's the *only* specops content CLAUDE.md needs — it subsumes the separate auditor and plans notes the older setup steps described:

```markdown
## Spec-driven development (specops)

This project uses spec-driven development. `specs/` is the source of truth for what
*should be true*; `plans/` is the work-in-flight DAG that bridges specs to merged code.
The **specops** skill carries the full methodology — invoke it (the skill triggers on
"spec", "plan", starting a feature, etc.) before writing specs, planning, or building.

- **Specs lead.** Before changing behavior, change the spec; bring code into conformance
  after. Spec↔code drift is a bug, not debt. Specs merge implemented-or-planned; a spec
  still being designed rides a draft planning PR, not the main branch.
- **`plans/` is the planning system — not your built-in plan mode.** Every chunk of work
  lands as a file in `plans/` that freezes to `done` as the durable record of what got
  built. Don't let an ephemeral plan substitute for it, and don't skip it for "small"
  changes. (Classic trap: an ad-hoc plan of "write spec X, then build it" that ends with
  neither a reviewed spec nor a plan file — split those into the two real artifacts.)
- **When to author a plan depends on intent:** mapping out a batch of specs → finish the
  batch first, then propose a *set* of plans; speccing one bounded feature in a mature
  project → draft the spec change and its plan in tandem; intent unclear → ask. The skill
  details each mode.
- **A spec change ripples to its plans.** After editing a spec, review the plans that
  implement it (`grep -l '<spec-path>' plans/*.md`) and offer to update them.

Query the DAG: `<specops-skill-path>/scripts/specops next` (what to work on next) and
`<specops-skill-path>/scripts/specops dag` (graph). Run `/audit-spec-drift` to compare
specs against the implementation.
```

### Setting up the spec drift auditor

The spec drift auditor is a specialized agent that does an exhaustive comparison of your `specs/` directory against the actual implementation, producing tables of gaps, undocumented implementations, and conflicts. To set it up in a project:

1. **Copy the agent definition** from this skill's `references/spec-drift-auditor.md` into your project at `.claude/agents/spec-drift-auditor.md`. Customize the "Methodology" phases to match your project's structure — for example, update Phase 3 ("Inventory the Implementation") to list the specific directories and key files in your codebase (source directories, migration paths, frontend code, infrastructure files, etc.).

2. **Copy the command definition** from this skill's `references/audit-spec-drift.md` into your project at `.claude/commands/audit-spec-drift.md`. This gives users a `/audit-spec-drift` slash command that launches the auditor agent.

3. **Reference in CLAUDE.md** — the `/audit-spec-drift` pointer is already part of [The CLAUDE.md hook](#the-claudemd-hook) block, so there's nothing separate to add here once that block is in place.

The reference files are located at:

- `references/spec-drift-auditor.md` — the agent definition (goes in `.claude/agents/`)
- `references/audit-spec-drift.md` — the command definition (goes in `.claude/commands/`)

Note: the auditor checks the `specs:` field of plan files and the `specs/` tree. It does **not** check `upstream-specs:` (those are owned by other repos by design — see the plans protocol).

### Setting up the plans protocol

The plans protocol gives a project a structured way to track work-in-flight without it rotting. To set it up:

1. **Create the `plans/` directory** at the project root.
2. **Write `plans/README.md`** that briefly states what plans are (motion vs state) and points at [references/plans-protocol.md](references/plans-protocol.md) for the full spec. Resist the urge to maintain a DAG drawing or status table inside it — both rot. The `specops` CLI regenerates that view on demand.
3. **Document the protocol in the project's CLAUDE.md** — covered by [The CLAUDE.md hook](#the-claudemd-hook) block, which already states the plans-are-the-planning-system rule and points at the skill for the full protocol (statuses, closeout commit, Follow-ups taxonomy). Don't restate the protocol in CLAUDE.md — keep it lean and let the skill carry the detail.
4. **Use the `specops` CLI in-place from the skill.** `scripts/specops` is the self-contained bundle shipped with this skill; run it from the skill's install directory against the project's `plans/` — there's nothing to copy, symlink, or vendor, and no `npm install` (it runs on `node ≥ 20`). Claude resolves the skill path automatically when specops triggers; from the project root the invocation is `<specops-skill-path>/scripts/specops next` (or `dag`). Optionally run `<specops-skill-path>/scripts/specops hook install` once so every session in the repo opens with the plans dashboard.
5. **Establish the convention** in the team: a new chunk of work starts with a plan file; the last commit before merge flips it to `done`. Quick-reference checklist for closeout is in [references/plans-protocol.md](references/plans-protocol.md#quick-checklist-for-a-closeout-pr).

## Keeping specs alive

Specs rot when they diverge from reality. Prevent this by:

- Making spec updates part of the PR process — if the code changes behavior, the spec should change too
- Periodically auditing specs against the running software
- Treating spec-code divergence as a bug, not technical debt
- Having agents read specs before implementing, which creates a natural feedback loop when specs are wrong
- Capturing decisions and principles *as they're resolved* (see [ALWAYS: watch for decisions and principles that belong in a spec](#always-watch-for-decisions-and-principles-that-belong-in-a-spec)) — most of a project's durable judgment gets resolved mid-task, and a spec only stays alive if that judgment lands in it instead of in a scrollback
