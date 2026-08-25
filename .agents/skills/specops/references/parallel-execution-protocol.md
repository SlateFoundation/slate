# The Parallel Execution Protocol

Companion to [plans-protocol.md](plans-protocol.md). That protocol is how you **author** a plan DAG (frontmatter, body, dependencies, closeout). This one is how you **execute** it: turn a batch of `planned` plans into merged code by dispatching one isolated **worktree subagent per plan**, fanned out as wide as the dependency graph allows, with a human-or-orchestrator **review/merge gate** between waves.

The orchestrator (you, the driving agent) never writes the implementation. You compute what's ready, dispatch subagents, **review every PR before it merges**, fix what needs fixing directly, merge, and let each merge unlock the next wave. Subagents build; you gate.

## Explicitly triggered — never automatic

**Do not enter this protocol on your own.** Authoring a plan DAG and executing it are two separate decisions, and *finishing the plans is not consent to build them.* After a batch of plans is authored or reviewed, you may **offer** to execute it this way — but you must not begin (no worktrees, no subagents, no PRs, no merges) until the human explicitly triggers it. The blast radius is the reason: many parallel subagents spending real budget, many branches, many PRs and merges against a live repo. That go/no-go is the human's to make.

The established trigger phrase is **"drain the DAG"** — when the human says it (or gives an equivalent explicit go-ahead), start executing; until then, offer and wait.

## When to use this

- A set of plans is authored, reviewed, and `planned`, and their specs are already merged (spec-first is done — see [plans-protocol.md §Relationship to `specs/`](plans-protocol.md#relationship-to-specs)).
- The target repo has a CI + pull-request flow you can gate on.
- The batch is big enough that serial hand-implementation is the bottleneck.

**Don't** use it for a single small plan (just implement it inline), or before the plans/specs are reviewed. And never let it become a way to skip the review gate — the whole point is that a reviewer sees every diff before it lands.

## The core loop

```
1. Compute the ready set from the DAG + merge state              (specops next)
2. For each ready plan: create its worktree, then dispatch its subagent   (in parallel)
3. As each PR lands: review → fix directly → verify CI → merge → clean up
4. Recompute the ready set (the merge just unlocked more) → go to 2
```

Repeat until the DAG is drained. The only things that serialize work are **genuine dependencies** and **your merge gate** — everything else runs concurrently.

## Compute waves from the DAG — and recompute after every merge

A plan is **ready** when every plan in its `depends:` is **merged into the integration branch**, not merely `done` on some unmerged branch. Readiness is a property of merge state, so it changes every time you merge — recompute it, don't pre-commit to a fixed wave schedule.

- Use `specops next` for the readiness view (ready / awaiting-external / blocked-by-deps) and `specops dag` to see the shape.
- **Maximize width:** dispatch *every* ready plan at once, not one at a time. "Waves" are just the successive ready-sets; a wave can be one plan (a foundation everything hangs off) or several (an independent fan-out).
- Why merged-not-just-done: each subagent branches its worktree off the current integration branch (`origin/develop` or equivalent), so a dependency's code must physically be there. A plan whose dep is only on an open PR would branch off code that doesn't include it.
- `awaits:` external blockers ([plans-protocol.md §External blockers](plans-protocol.md#external-blockers-awaits)) don't gate a *dev* build if the plan notes the block is only for a later validation step — build against a stand-in and leave that validation box unchecked.

## One subagent per plan, in an isolated worktree

**The orchestrator creates the worktree; the subagent works inside it.** Before dispatching a plan's agent, the orchestrator gives that plan its own git worktree, branched off the current integration branch — so parallel agents never touch each other's checkout and every plan builds on the latest merged base:

```bash
cd <target-repo> && git fetch origin
git worktree add -b <plan-slug> <path>/<plan-slug> origin/<integration-branch>
```

Then dispatch the agent *into* that path: its brief names the directory to work in. **The agent does not create or choose its own branch or worktree, and does not merge** — the orchestrator owns git topology at the ends (worktree + branch creation up front, merge + teardown after), the agent owns everything in between (implement → push → open PR).

- **Why the orchestrator owns worktree creation, not the agent:** branching off the *correct, latest* integration branch is a dependency-correctness concern — the orchestrator is the one that just merged this plan's dependencies and knows the integration HEAD. Centralizing it (unique path, right base) removes a whole class of "agent branched off a stale/wrong base or collided on a path" failures, and keeps git topology with the same actor that owns the merge gate. *(Variant: letting each agent run its own `git worktree add` from setup steps in its brief also works and is less orchestration, but it's less defensive — prefer orchestrator-owned unless the extra orchestration cost matters.)*
- **Manage worktrees explicitly in the target repo** — do not rely on a harness's generic "isolate this task" mode. The repo you're implementing in is often *not* the orchestrator's working directory, and explicit `git worktree add … origin/<branch>` guarantees both the right repo and the latest base.
- Run agents **in the background** so a wave's plans execute concurrently; you get a notification per completion.
- **Isolate shared live dependencies per agent.** Parallel agents that need a running service to test against — a database, a bound port — must each get their *own* (a per-agent container on a unique port), never one shared instance. Concurrent test runs otherwise collide with each other and with the orchestrator's own dev services, producing flaky, misleading failures.
- **Use Sonnet for the implementation subagents** by default — it's the right capability/cost point for plan-sized coding work (reasoning + long tool-use budgets; implementing a plan is a many-hundred-tool-call task). Reach for a different model only with a specific reason, or when the human explicitly requests one. The orchestrator stays on the stronger model to do the reviews.
- One plan → one branch → one worktree → one PR. Never fold two plans into one agent.

## The agent brief

Every dispatch must pin the same shape, or the results won't be reviewable or mergeable. Include:

1. **Where to work** — the path to the **prepared worktree** the orchestrator already created for this plan (a branch off the latest integration branch). `cd` there and do all work there; the agent does not create its own branch or worktree.
2. **Read-first (hard preconditions)** — the project's `CLAUDE.md` (conventions), `specs/README.md`, **the plan file itself** (its scope/approach/validation are the contract), the specs it `implements:`, and the **already-merged building blocks it consumes** (name them — the modules/functions from earlier waves it must reuse rather than re-invent).
3. **Implement to spec** — match the specs' contracts *exactly* (endpoint paths, field names, error shapes, enums). Don't invent behavior the spec doesn't state; if the spec is ambiguous, amend the spec first (spec-first still applies mid-execution).
4. **Build + test** — the project's real toolchain must be clean (typecheck/lint/format/build) and tests pass or self-skip deterministically. Run the project's own automated **self-review** pass too (its review/lint-of-record loop — e.g. a `roborev` cycle) to convergence *before* opening the PR, so the orchestrator reviews an already-self-checked diff. State explicitly what could not be verified locally (e.g. anything needing a live external system).
5. **Conventional commits, no secrets, specific staged paths** (never `git add -A`).
6. **Push + open a PR against the integration branch — and DO NOT MERGE.** The lead reviews and merges. Merging is never the subagent's job.
7. **Close out the plan** in a final commit per [plans-protocol.md §The closeout commit](plans-protocol.md#the-closeout-commit): `status: done`, `pr: <n>`, check only the Validation boxes actually verified (unverified stay `[ ]` with a Notes line). Because the closeout records the PR number, sequence it: push the branch → open the PR → commit the closeout referencing that number → push again (the PR updates in place).
8. **Concurrency note** — when sibling plans in the same wave will append to the *same* shared files (a proto/schema, a route registry, a client wrapper, a server dispatch), tell each agent so, and ask it to keep its additions cohesively grouped. You'll resolve the conflicts at integration; forewarning keeps them mechanical.
9. **Report back** — the PR number/URL, a **review guide** (key files, design decisions, deviations from the plan), test evidence, and anything unverified. This is what you review against.

## The review/merge gate

This is the load-bearing half of the protocol. A subagent's confidence is not a merge criterion — **your review is.**

- **Read every PR before merging; never rubber-stamp.** Budget the deepest reading for correctness-critical logic — authentication/authorization, database migrations, concurrency/locking, money, anything irreversible. Pull the diff and read the sensitive files, not just the agent's summary.
- **Make fixes directly.** For a clear defect or improvement, edit the branch, commit, and push yourself rather than round-tripping the agent — you're already in the diff. Reserve sending it back for large or ambiguous rework. Real bugs get caught here: a safeguard with a concurrency (write-skew) hole, a revoke that isn't scoped to the caller's own resource, an enforcement path that trusts a token's claim instead of live state.
- **CI is the authoritative gate — not your local run.** Integration/DB tests routinely fail locally for environmental reasons (no database up, a stale schema, a port already taken) yet pass or self-skip in CI. Push, then confirm CI is green (`mergeStateStatus: CLEAN`, all checks pass) before merging. Don't merge on a local pass alone, and don't reject on a local-only failure without confirming CI reproduces it.
- **Merge with a real merge commit — never squash.** Squash-merges rewrite branch commits into a new one, so the branch tip is never an ancestor of the target and merge-detection (`git branch --merged`, ancestry checks) can't tell what actually landed. Use the merge-commit method, delete the remote branch on merge.
- **Clean up:** remove the worktree, delete the local branch, prune. Note that a PR merge tool often *can't* delete the local branch while its worktree still exists — remove the worktree first, then delete the branch.
- After merging, **recompute readiness** and dispatch whatever just unblocked.

## Conflicts between parallel plans

Sibling plans that both append to a shared surface (a `.proto`, a route table, a generated-client wrapper, a central server switch) will merge clean for the *first* one and conflict for the *second*. Resolve by integrating the later branch onto the updated base, not by weakening the isolation:

1. In the later plan's worktree: `git rebase origin/<integration-branch>`.
2. Resolve the conflicts. Append-conflicts are almost always **"keep both"** — two independent additions to the same region; take both sides and order them sanely.
3. **Fix integration breakage the rebase exposes** — the most common is a test double or fixture written against the *pre-extension* interface that no longer satisfies it once the other plan widened it. Add the missing stubs; make the merged tree compile.
4. Verify the merged result: build + typecheck + the fast test suites, then push (`--force-with-lease`) and let **CI** re-run as the real gate.
5. Merge.

Prefer rebase over merging the base into the branch — it keeps the feature branch a clean linear delta and avoids a merge-of-a-merge. (Plan the *order* to minimize this: merge the plan that owns the most shared-surface changes first, rebase the lighter ones onto it.)

## Plans that aren't auto-completable

Not every plan can be built-and-merged headless. Some are **operational** (need a deployed system, real credentials, or a human action) or **cross-repo** (require coordinated changes and secrets in another repository). A destructive one — retiring a shared credential that other systems still authenticate with, cutting over a live integration — will *break things* if a subagent "completes" it in isolation.

Recognize these and **do not force an auto-merge.** Keep the plan `planned`, and instead produce the **runbook**: the exact ordered operational steps, what's a prerequisite (a deploy, a secret, another repo's PR), and what stays in place transitionally until the cutover. Surface it to the human who can execute it. The framework being *ready* for the change (the code paths exist, the transitional accommodation is in place) is a real result; the flip is a separate, gated act.

## Hygiene checklist

- [ ] Ready set recomputed from **merge state** before each wave (not a fixed upfront schedule).
- [ ] For each ready plan the **orchestrator creates the worktree** off the latest integration branch, then dispatches its agent **concurrently**.
- [ ] Each brief pins: read-first list, implement-to-spec, build+test, push+PR, **do-not-merge**, close-out, concurrency note, report-back.
- [ ] Every PR **reviewed** (deepest on correctness-critical code); fixes applied directly.
- [ ] **CI green** confirmed before every merge; local-only failures reconciled against CI.
- [ ] **Real merge commit**, remote branch deleted, worktree removed, local branch deleted, remote pruned.
- [ ] Parallel-plan conflicts resolved by **rebase + keep-both + fix-integration + CI**, not by serializing away the parallelism.
- [ ] Operational/cross-repo plans left `planned` with a **runbook**, never force-merged.
