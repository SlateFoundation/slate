---
status: in-progress
depends: [preview-deploy-revival]
specs: []
---

# Plan: GC preview image tags from GHCR on PR close

## Scope

`preview-deploy.yml` pushes `ghcr.io/slatefoundation/slate:pr-<n>-<shortsha>`
on every PR sync and nothing ever deletes them — the deferral recorded in
`preview-deploy-revival` ("tags are cheap; revisit if the package bloats")
has come due. Extend `preview-teardown.yml` so closing a PR also deletes
that PR's preview image versions from GHCR via the packages API.

Out of scope: cleaning up legacy exact `pr-<n>` tags from the retired
Habitat-era pipeline, untagged versions (manifest children/attestations),
and any scheduled full-package GC.

## Implements

No specs — CI hygiene on the preview pipeline.

## Approach

- New teardown step enumerates
  `GET /orgs/{org}/packages/container/{name}/versions` (paginated) and
  deletes each version whose tag set is non-empty and consists entirely of
  tags with the exact `pr-<n>-` prefix — release tags, `latest`, other PRs'
  previews, and untagged versions can never match.
- Add `packages: write` to the workflow's permissions (teardown previously
  had only `deployments: write`).
- A PR that never deployed a preview (fork PRs aside, e.g. a package that
  doesn't exist yet or no matching versions) exits the step cleanly.

## Validation checklist

- [ ] Enumerate/filter/delete calls verified manually with `gh api` against
      the live package (closed PRs' leftover tags deleted; open PR's tags
      and release/legacy tags untouched)
- [ ] Teardown workflow runs green on a real PR close and the closed PR's
      `pr-<n>-*` versions disappear from GHCR

## Notes

- `GITHUB_TOKEN` can delete versions because the package is linked to this
  repo by the preview-deploy pushes; no PAT needed.
