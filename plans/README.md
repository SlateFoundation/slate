# Plans

Work-in-flight for Slate, as a micro-DAG: one file per bounded chunk of work,
declaring its scope, the specs it implements, its dependencies, and validation
criteria. Once merged and `done`, a plan freezes as the durable record of what
got built.

The full protocol (frontmatter schema, body template, status lifecycle,
closeout ritual) is the specops skill's
[plans-protocol reference](../.claude/skills/specops/references/plans-protocol.md).

Query the DAG: `.claude/skills/specops/scripts/specops next` /
`… specops dag`. No hand-maintained status table here — it would rot.
