# jarvus-extjs

House conventions for maintaining the Jarvus/Slate **ExtJS 6.2 classic-toolkit** apps —
SlateAdmin, the Slate CBL suite, and anything else in a `sencha-workspace/`. The stack
is frozen (no framework upgrades, no MVVM migration); the skill encodes the mature
patterns to converge on — distilled from the CBL apps' 2016–2023 evolution and
SlateAdmin's 2026 modernization — plus the Cypress e2e harness and the ExtJS-specific
spec-writing idioms that verify changes to these apps.

## When you'd want it

Any work on the legacy Slate ExtJS apps: fixing bugs, stabilizing screens, cleaning up
state/component jank, extending an existing screen, or writing/debugging their Cypress
e2e specs. The guidance keeps agents from improvising against the grain — or
"modernizing" toward framework features these apps deliberately don't use.

## Install

**Recommended scope: per-project.** Install in the repos that carry a
`sencha-workspace/` (e.g. the slate repo) so every contributor's agent shares the same
guidance.

```bash
npx skills add JarvusInnovations/agent-skills --skill jarvus-extjs
```

(Add `--global` if you'd rather have it available everywhere.) See `SKILL.md` for the
doctrine and `references/` for architecture, data-layer, component, package, and
testing guides.
