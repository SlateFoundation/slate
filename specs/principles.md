# Principles

The project's philosophy, written down as decisive rules. Each picks a side of
a real trade-off so an implementer can resolve an unspecified case the way the
project would.

## Product-level over per-deployment

A capability useful to more than one school lands in Slate itself (or the
framework below it), never in a deployment's local layer. Local layers are for
genuine local policy — branding, local rules — not for features. When in doubt,
build it shared and make the school-specific part configuration.

## Never destroy identity data

Person records are never hard-deleted by tooling. Retiring an account means
disabling it and renaming its username aside; consolidating duplicates means
moving data to the surviving record and leaving the source as a disabled
tombstone plus an audit trail. Disk is cheap; a student's history is not
recoverable from a backup nobody can find.

## Slate owns its rows; external systems get explicit actions

An operation on Slate data (a merge, a retirement) must not silently mutate
external systems (LMS, email/identity provider, SIS). Cross-system effects are
surfaced as an explicit checklist or queued actions for a human or connector
sync to carry out — visible, auditable, and separately authorized.
