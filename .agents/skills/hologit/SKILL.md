---
name: hologit
description: "Configure and use hologit, a Git-native framework for declarative code automation. Use when working with .holo/ directories, holobranches, holosources, holomappings, hololenses, TOML configuration files under .holo/, the git holo CLI, or stock lenses (helm3, kustomize, k8s-normalize, k8s-patch, npm-install, npm-run, mkdocs, shell). Triggers on: configuring .holo/, adding sources, creating holobranches, setting up mappings, applying lenses, projecting branches, or any hologit-related task."
---

# Hologit

## Overview

Hologit is a Git-native framework for declarative code automation. It projects virtual "holobranches" by combining content from multiple Git sources and applying transformations (lenses), all operating directly on Git's object database without creating intermediate files.

Install: `npm install -g hologit`
Invoke: `git holo <command>`
Requires: Node.js >=20.19.0, Git

Core operation: Define sources, branches, mappings, and lenses in `.holo/` TOML config files. Run `git holo project <holobranch>` to compute a composite output tree.

## Key Concepts

**Holospace**: A workspace defined by `.holo/config.toml` with a canonical `name`. The name enables self-references — when a mapping's holosource matches the workspace name, the current workspace tree is used as the source.

**Holosource**: A named reference to an external Git repository/branch, configured in `.holo/sources/<name>.toml`. Specifies a `url` and `ref` to track. Can optionally project a holobranch within the source via `project.holobranch`.

**Holobranch**: A virtual branch defined in `.holo/branches/<name>.toml`. Declares what content to include (via mappings) and how to transform it (via lenses). Can inherit from another branch using `extend`.

**Holomapping**: A content inclusion rule at `.holo/branches/<branch>/<key>.toml`. Specifies which files from which source to include, where to place them in the output, and ordering via `before`/`after` layer constraints.

**Hololens**: A transformation applied via a Docker container or Habitat package. There are two types:

- **Internal lenses** (`.holo/lenses/<name>.toml`): Defined within source content and discovered in the projected composite output tree. These travel with the source — when downstream projects include this source, they inherit its internal lenses. Use for transformations that should apply everywhere the source is consumed.
- **External lenses** (`.holo/branches/<branch>.lenses/<name>.toml`): Defined alongside a branch config in the consuming workspace. These are branch-specific and do not travel with sources. Use for transformations applied to external content that shouldn't be inherited downstream.

During projection, internal lenses execute first, then external lenses.

**Projection**: The process of computing a holobranch's output:

1. Resolve `extend` chain (parent branches merged first)
2. Composite all mappings in topological order (by `before`/`after`)
3. Strip `.holo/branches` and `.holo/sources` from output
4. Apply internal lenses (from projected output tree)
5. Apply external lenses (from branch config)
6. Strip `.holo/lenses` from output
7. Strip empty `.holo/` if only `config.toml` remains

## Directory Structure

```
.holo/
├── config.toml                          # [holospace] name = "my-project"
├── sources/
│   └── <name>.toml                      # [holosource] url, ref
├── branches/
│   ├── <branch>.toml                    # [holobranch] extend, lens
│   ├── <branch>/
│   │   └── <key>.toml                   # [holomapping] holosource, files, root, output
│   └── <branch>.lenses/
│       └── <lens>.toml                  # [hololens] external/branch-specific lens
└── lenses/
    ├── <name>.toml                      # [hololens] internal/inheritable lens
    └── <name>/                          # companion data tree for lens
```

## CLI Quick Reference

| Command | Description |
|---------|-------------|
| `git holo init [--name]` | Initialize `.holo/config.toml` |
| `git holo source create <url> [--name] [--ref]` | Add a holosource |
| `git holo source fetch [<name>] [--all]` | Fetch source(s) |
| `git holo source ls [<name>] [--fetch]` | List sources with URLs and commits |
| `git holo source checkout [<name>] [--all] [--submodule]` | Check out source worktrees |
| `git holo branch create <name> [--template]` | Create a holobranch |
| `git holo branch pull [<name>] [--all] [--force]` | Pull projected branches from remotes |
| `git holo inspect [<holobranch>]` | Display fully resolved config (sources, mappings, lenses) |
| `git holo project <holobranch> [options]` | Project a holobranch, output tree hash |
| `git holo lens exec <spec-hash>` | Execute a lens spec |
| `git holo lens export-tree <treeish>` | Export tree to working directory (destructive) |
| `git holo lens merge-trees <base> <input>` | Merge two trees |
| `git holo watch [--ref] [--working]` | Watch for changes and output updates |

Global options: `-d`/`--debug` (debug logging), `-q`/`--quiet` (errors only)

For complete CLI documentation with all options: [references/cli.md](references/cli.md)

## Configuration Quick Reference

All config uses TOML with uppercase section headers matching the config kind.

| File | Key Section | Key Fields |
|------|-------------|------------|
| `.holo/config.toml` | `[holospace]` | `name` |
| `.holo/sources/<name>.toml` | `[holosource]` | `url`, `ref`, `project.holobranch` |
| `.holo/branches/<name>.toml` | `[holobranch]` | `extend`, `lens` |
| `.holo/branches/<branch>/<key>.toml` | `[holomapping]` | `holosource`, `files`, `root`, `output`, `layer`, `before`, `after` |
| `.holo/lenses/<name>.toml` | `[hololens]` | `container`/`package`, `input`, `output`, `before`, `after` |
| `.holo/branches/<branch>.lenses/<name>.toml` | `[hololens]` | Same schema as above |

For complete field schemas with types and defaults: [references/toml-configuration.md](references/toml-configuration.md)

## Mapping Key Naming Convention

The mapping filename (key) controls default behavior:

- **`_name.toml`** (leading underscore): Output merges to the branch root (`/`). The `holosource` defaults to `name` (underscore stripped). Use for sources whose files should be at the top level. **Self-reference**: if `name` matches the holospace name from `.holo/config.toml`, the current workspace tree is used as the source — no `holosource` field or `.holo/sources/` file needed.
- **`name.toml`** (no underscore): Output goes to a subdirectory matching the key (`/name/`). The `holosource` defaults to `name`. Use for sources that should be namespaced.
- **Nested keys**: `subdir/name.toml` outputs to `subdir/name/` (or `subdir/` if `_name.toml`).

The `holosource` field can use `=>` syntax for in-mapping projection:

- `"source-name=>branch-name"` — project `branch-name` within source
- `"=>branch-name"` — project `branch-name` within the source derived from the key

## Common Workflows

### Initialize a workspace

```bash
git holo init --name my-project
```

Creates `.holo/config.toml` with `[holospace] name = "my-project"`.

### Add a remote source

```bash
git holo source create https://github.com/org/repo --ref refs/tags/v1.0.0
```

Creates `.holo/sources/repo.toml`:

```toml
[holosource]
url = "https://github.com/org/repo"
ref = "refs/tags/v1.0.0"
```

### Create a passthrough holobranch

```bash
git holo branch create my-branch --template=passthrough
```

Creates a mapping `_<workspace-name>.toml` with `files = "**"` that includes all workspace files.

### Filter the current repo to specific paths

The simplest holobranch: select specific paths from the current workspace. Name the mapping `_<workspace-name>.toml` so the key auto-resolves to the holospace as a self-referencing source — no `holosource` field or `.holo/sources/` file needed.

Given a workspace named `my-project` (from `.holo/config.toml`):

```toml
# .holo/branches/my-branch/_my-project.toml
[holomapping]
files = [".claude-plugin/**", "skills/**"]
```

This projects only `.claude-plugin/` and `skills/` from the workspace, preserving their original directory structure. Verify with:

```bash
git ls-tree -r --name-only $(git holo project my-branch --working)
```

Since projection produces a git tree hash, it composes with any git command that accepts a tree-ish — for example, creating a distributable archive:

```bash
git archive --format=zip $(git holo project my-branch --working) > /tmp/my-project.zip
```

### Add a mapping manually

Create `.holo/branches/my-branch/_my-source.toml`:

```toml
[holomapping]
files = ["src/**", "!test/**"]
root = "packages/core"
```

This maps `packages/core/src/**` (excluding tests) from source `my-source` to the branch root.

### Verify configuration

After editing `.holo/` config files, run `inspect` to verify the resolved state before projecting:

```bash
git holo inspect my-branch --working
```

This shows the fully resolved mappings (auto-resolved source names, output paths, layer ordering) and lenses without running a projection. Use it to catch config mistakes early.

> **Note:** Pass `--working` so hologit reads uncommitted `.holo/` files from the working tree. Without it, hologit reads from the git index and won't see unstaged changes. Once `.holo/` files are committed, `--working` is no longer needed.

### Project and commit

```bash
git holo project my-branch --commit-to=refs/heads/projected --fetch="*"
```

Fetches all sources, projects the branch, and commits the result.

### Add an internal lens (inheritable)

Create `.holo/lenses/normalize.toml`:

```toml
[hololens]
container = "ghcr.io/hologit/lenses/k8s-normalize:latest"
after = "*"

[hololens.input]
files = ["**/*.yaml", "**/*.yml"]

[hololens.output]
merge = "replace"
```

This lens travels with the source content and applies in any project that consumes it.

### Add an external lens (branch-specific)

Create `.holo/branches/my-branch.lenses/helm.toml`:

```toml
[hololens]
container = "ghcr.io/hologit/lenses/helm3:latest"

[hololens.input]
root = "my-chart"
files = "**"

[hololens.output]
merge = "replace"

[hololens.helm]
namespace = "production"
release_name = "my-release"
chart_path = "helm-chart"
value_files = ["values.yaml", "prod-values.yaml"]
```

This lens only applies to `my-branch` in the current workspace.

### Layer ordering

```toml
# .holo/branches/site/_skeleton.toml
[holomapping]
files = "*/**"
before = "*"

# .holo/branches/site/_app.toml
[holomapping]
files = "*/**"
after = "*"
```

The skeleton layer merges first, app layer merges last (overriding skeleton files).

### Branch extension

```toml
# .holo/branches/production.toml
[holobranch]
extend = "base"
```

The `production` branch inherits all mappings from `base`, then applies its own.

## Lens Caching

Hologit caches lens execution results using Git's own object database, enabling instant reruns and shared caches across machines.

**How it works**: Before executing a lens, hologit builds a deterministic "spec" — a TOML blob containing the container image's manifest digest, the input tree hash, and lens configuration. The spec blob's git hash becomes the cache key. Results are stored as git refs at `refs/holo/lens/<spec-hash>`.

**Cache lookup flow**:

1. Check local ref `refs/holo/lens/<spec-hash>` → if exists, return cached output tree
2. If miss and `--cache-from` is set, fetch the ref from the remote → if found, return it
3. If still no hit, execute the lens in its container, save output to local ref
4. If `--cache-to` is set, push the ref to the remote for other machines to use

**Why it's deterministic**: Container images are pinned by manifest digest (queried from the registry via `docker buildx imagetools inspect`), not by mutable tags. The same input tree + same image digest + same config always produces the same spec hash, guaranteeing cache correctness even when `:latest` tags are updated.

**CLI options**:

- `--cache-from <remote>` (default: `origin`) — pull cached lens results before executing
- `--cache-to <remote>` — push cached lens results after executing
- Also configurable via `HOLO_CACHE_FROM` / `HOLO_CACHE_TO` environment variables

**CI/CD pattern**: Use `--cache-from=origin --cache-to=origin` so the first CI run computes and pushes results, and subsequent runs with identical inputs get instant cache hits:

```bash
git holo project my-branch --commit-to=projected --fetch="*" --cache-from=origin --cache-to=origin
```

## Environment Variables

Key overrides (see [references/environment-variables.md](references/environment-variables.md)):

- `HOLO_SOURCE_<NAME>` — Override source URL/ref/holobranch
- `HOLO_FETCH` — Sources to fetch during projection (`*` for all)
- `HOLO_CACHE_FROM` / `HOLO_CACHE_TO` — Cache remotes for lens results

## Reference Files

- [references/cli.md](references/cli.md) — Complete CLI command documentation with all options and defaults
- [references/toml-configuration.md](references/toml-configuration.md) — Complete TOML schema for all configuration file types
- [references/stock-lenses.md](references/stock-lenses.md) — All 8 stock lenses (helm3, kustomize, k8s-normalize, k8s-patch, npm-install, npm-run, mkdocs, shell) with full configuration options
- [references/environment-variables.md](references/environment-variables.md) — Environment variable overrides and debug options
- [references/github-action.md](references/github-action.md) — GitHub Action for CI/CD projection workflows
