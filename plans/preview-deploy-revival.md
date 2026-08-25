---
status: done
depends: []
specs: []
issues: [385]
pr: 397
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

- `preview-deploy.yml` on `pull_request` `[opened, reopened, synchronize]`
  (deploy), `preview-teardown.yml` on `pull_request_target` `[closed]`
  (teardown); deploy keeps a `preview-<branch>` concurrency group with
  cancel-in-progress. Teardown was originally a `closed`-type job in the
  same workflow, but the repo auto-deletes merged head branches and GitHub
  cancels a plain `pull_request` run when its head branch disappears — the
  merge of #397 cancelled its own teardown live. `pull_request_target` runs
  in base-repo context and survives the deletion; it never checks out PR
  code, so secrets exposure is safe.
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

- [x] Workflow runs on PR open/sync and is green end-to-end (run
      32899378763 on PR #397)
- [x] Preview serves the Slate home page over HTTPS at
      `https://pr-<n>.slate.sandbox.k8s.jarv.us/` (200 with a Let's
      Encrypt cert issued for the per-PR host)
- [x] Login form renders (fixtures + migrations applied — 34 seeded people
      confirmed in the live DB)
- [x] Pushing a new commit to the PR rolls the preview to the new image
      (deployment observed moving `pr-397-5138078` → `pr-397-63e4e31`)
- [x] Closing the PR deletes the deployment/service/ingress/TLS secret and
      deactivates the GitHub deployment environment (exercised by this
      PR's own merge closing its preview; confirmed from the cluster
      post-merge)
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

- The stored `KUBECONFIG_BASE64` deployer credential had gone stale (the
  namespace's legacy `deployer-token-lrhv5` long-lived token 401s against
  the API server) — the first credentialed run only became possible after
  minting a fresh token for the `slate/deployer` service account
  (namespace-admin Role, intact) and updating the repo secret. If previews
  start 401ing again, that's the first thing to re-check.
- The framework's auth prompt serves the login form with a **401** status —
  a `curl -f` health check silently discards the body, so the smoke test
  greps a plain `curl -s` of `/login`.
- The GHCR package `ghcr.io/slatefoundation/slate` is public, so preview
  pods pull without imagePullSecrets.
- Wildcard DNS `*.slate.sandbox.k8s.jarv.us` already pointed at the
  cluster's ingress-nginx load balancer, and the `letsencrypt-prod`
  cluster-issuer handles per-PR hosts — no DNS or TLS setup was needed.

## Follow-ups

- **fix-forward** — GHCR accumulates one `pr-<n>-<sha>` tag per PR sync
  with no garbage collection; add a cleanup (workflow step on close, or a
  scheduled prune) if the package bloats.
- **fix-forward** — a pod reschedule loses the seeded bundled-MySQL DB
  until the next PR sync re-seeds; if that bites, bake the fixture SQL
  into the preview image at `/opt/seed/` (the skeleton-v3 entrypoint
  already imports it on first init) so fresh pods self-seed.
