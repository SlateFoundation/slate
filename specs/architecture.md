# Architecture

Seed spec, reverse-engineered from the current codebase (specops adopted
2026-08). It records the foundational decisions an implementer needs; it grows
as areas get specced.

## Stack

- **Backend**: PHP application built on the Emergence framework (ActiveRecord
  ORM, class-based request handlers, layered site composition). Slate is the
  product layer; school deployments compose it under their own local layer.
- **Data**: MySQL via the framework's ActiveRecord. Table shapes are declared
  as `$fields` on record classes; the framework creates tables from the class
  definition, and `php-migrations/` evolves existing ones.
- **Routing**: `site-root/` files map URLs to `RequestHandler` classes in
  `php-classes/`. JSON APIs follow the framework's records-API envelope
  (`{"success": bool, "data": …}`).
- **Events**: `event-handlers/` hook framework events (e.g. record save) for
  cross-cutting behavior; connectors under `php-classes/Slate/Connectors/`
  integrate external systems (SIS, LMS, SSO) and record their linkages in
  `connector_mappings`.
- **Admin UI**: SlateAdmin, an ExtJS 6 application in `sencha-workspace/`,
  talking to the JSON APIs. Conventions live in the jarvus-extjs skill
  references (state through the URL, model/proxy statics, requireLoaded
  barriers).
- **Testing**: PHPUnit (`phpunit-tests/`), Cypress e2e (`cypress/`), PHPStan +
  Psalm static analysis.

## Static analysis baseline

PHPStan runs at a fixed level against the framework layers fetched by
`script/fetch-analysis-context`, with pre-existing findings recorded in
`phpstan-baseline.neon`.

- **The baseline only shrinks.** A change may remove entries, never add
  them. New code is fixed, not baselined.
- **Fatal kinds are never baselined.** A finding that fails at run time on
  PHP 8 is fixed wherever it appears: a class that does not exist (including
  a caught one), an invalid binary, unary or assignment operation, a
  non-numeric operand to arithmetic, or a `sprintf`-family format that does
  not match its arguments. `script/check-phpstan-baseline` enforces this in
  CI.
- **Framework facades are typed for analysis.** Where the framework calls
  through `__callStatic` (the mailer facade, `Emergence\Mailer\Mailer`),
  a PHPStan stub under `phpstan-stubs/` declares the forwarded methods and
  their return types, so callers are checked instead of seeing `mixed`. The
  stub follows the framework's interface (`IMailer`); it is analysis-only
  and never loaded at run time.

## Branching

`develop` is the integration branch; feature branches PR into it.
