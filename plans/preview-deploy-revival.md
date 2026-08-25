---
status: in-progress
depends: []
specs: []
issues: [385]
---

# Plan: Rebuild PR preview deploys on the container runtime

## Scope

Replace the parked `workflow_dispatch`-only `preview-deploy.yml` with a
working PR-preview pipeline built on the container runtime: build the PR's
site image the way `test-e2e` does (skeleton-v3 `docker/` context + lensed
`emergence-site` projection), push it to GHCR, deploy a per-PR
deployment/service/ingress to the `slate` namespace on the sandbox cluster
at `pr-<n>.slate.sandbox.k8s.jarv.us`, seed the `fixtures` holobranch and
run migrations the way the retired `deploy-site-preview` action did, surface
the URL via the GitHub deployments API, and tear everything down when the
PR closes. Also removes the dead `helm-chart` holobranch (composited
entirely from the removed `skeleton-v2` holosource; the retired action was
its only consumer).

Out of scope: GHCR tag garbage collection for closed PRs (tags are cheap;
revisit if the package bloats), previews for fork PRs (no secrets), and any
change to the skeleton-v3 runtime image (its existing `/opt/seed` hook is
not needed — seeding stays workflow-side like the old action).

## Implements

No specs — CI/deployment infrastructure, not platform behavior. Tracks
issue #385.

## Approach

- Single workflow on `pull_request` `[opened, reopened, synchronize,
  closed]`; `deploy` job for open/sync, `teardown` job for close; shared
  `preview-<branch>` concurrency group with cancel-in-progress so closing a
  PR also cancels an in-flight deploy.
- Build arc copied from `test-e2e.yml`: hologit projection of
  `emergence-site` (lensed, cached via `HOLO_CACHE_FROM/TO=origin`, guarded
  tree assertion) extracted into the skeleton-v3 `docker/` context, composer
  auth via BuildKit secret. Image tagged `ghcr.io/slatefoundation/slate:pr-
  <n>-<shortsha>` so every sync forces a rollout.
- Plain manifests applied with `kubectl apply` (no Helm): one
  deployment (strategy Recreate, readiness on HTTP 200 `/` — the entrypoint
  initializes bundled MySQL on first boot), service, and ingress
  (nginx class, `letsencrypt-prod` cert-manager issuer, wildcard DNS
  `*.slate.sandbox.k8s.jarv.us` already points at the cluster).
- Fixture seeding carried forward from the old action + the e2e cypress
  harness: drop/recreate the DB, concatenate the projected `fixtures`
  holobranch SQL wrapped in autocommit/unique_checks/foreign_key_checks
  guards, `sed` `ENGINE=MyISAM` to `InnoDB` (the bundled MySQL 8 disables
  MyISAM), pipe through `kubectl exec -i ... mysql`, then
  `console-run.php migrations:execute --all`.
- Deployment environments via `bobheadxi/deployments@v1` (start/finish with
  `env_url`, `deactivate-env` on teardown) — same as the old action.
- Not a required check; fork PRs are skipped.

## Validation

- [x] Workflow runs on PR open/sync and is green end-to-end
- [x] Preview serves the Slate home page over HTTPS at
      `https://pr-<n>.slate.sandbox.k8s.jarv.us/`
- [x] Login form renders (fixtures + migrations applied)
- [x] Pushing a new commit to the PR rolls the preview to the new image
- [x] Closing the PR deletes the deployment/service/ingress/TLS secret and
      deactivates the GitHub deployment environment
- [x] Required checks (`test-e2e`, `Static analysis`, `ESLint (SlateAdmin)`)
      unaffected and green

## Risks / unknowns

- **KUBECONFIG_BASE64 secret freshness** — the repo secret dates from the
  old arc; the cluster and `slate` namespace are confirmed live, but the
  credential itself is only provable from a run. First PR run validates it.
- **Let's Encrypt issuance latency** — first deploy of a new PR host waits
  on http-01; the smoke test polls up to 5 minutes.
- **Pod rescheduling loses the seeded DB** (bundled MySQL lives in the
  container filesystem). Acceptable for transient previews: the next push
  re-seeds; noted rather than solved.

## Notes

(closeout)

## Follow-ups

(closeout)
