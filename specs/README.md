# Specs

This directory declares the **desired state** of Slate — what should be true of
the running software. Implementation follows spec: work begins with a spec
update, and spec↔code drift is a bug, not debt. The full methodology is the
**specops** skill (`.claude/skills/specops/SKILL.md`); work-in-flight lives in
`plans/`.

## Layout

```
specs/
├── README.md         This file
├── architecture.md   Stack, project structure, foundational decisions
├── principles.md     Project-wide decisive principles (the "why")
├── api/              One file per endpoint group
├── screens/          One file per SlateAdmin screen/route
└── behaviors/        Cross-cutting rules spanning screens/endpoints
```

## Incremental adoption

Slate is a mature codebase adopting specops incrementally. Specs cover **new
and changed behavior**; pre-existing behavior is reverse-engineered into specs
as it gets touched. A missing spec for legacy behavior is expected — not a
drift finding. Every spec that merges is either implemented or carries a
committed plan in `plans/`.
