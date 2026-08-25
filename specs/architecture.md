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

## Branching

`develop` is the integration branch; feature branches PR into it.
