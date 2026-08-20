# CLI Reference

## Table of Contents

- [Global Options](#global-options)
- [git holo init](#git-holo-init)
- [git holo source create](#git-holo-source-create)
- [git holo source fetch](#git-holo-source-fetch)
- [git holo source ls](#git-holo-source-ls)
- [git holo source checkout](#git-holo-source-checkout)
- [git holo branch create](#git-holo-branch-create)
- [git holo branch pull](#git-holo-branch-pull)
- [git holo inspect](#git-holo-inspect)
- [git holo project](#git-holo-project)
- [git holo lens exec](#git-holo-lens-exec)
- [git holo lens export-tree](#git-holo-lens-export-tree)
- [git holo lens merge-trees](#git-holo-lens-merge-trees)
- [git holo watch](#git-holo-watch)
- [git holo studio](#git-holo-studio)

## Global Options

| Option | Description |
|--------|-------------|
| `-d`, `--debug` | Enable debug logging |
| `-q`, `--quiet` | Suppress non-error output |

## git holo init

Initialize hologit for the current repository.

```
git holo init [--name <name>]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name` | string | auto | Canonical name for the workspace. Auto-derived from directory name if not provided. |

Creates `.holo/config.toml` with `[holospace] name = "<name>"` and stages the change to the index.

## git holo source create

Add a holosource for a remote repository.

```
git holo source create <url> [--name <name>] [--ref <ref>]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<url>` | string | *required* | Repository URL |
| `--name` | string | auto | Name for the holosource. Auto-derived from URL (last path segment, stripping `.git`). |
| `--ref` | string | `HEAD` | Git ref to track. Resolved to full ref path (e.g., `refs/heads/main`). |

Queries the remote to discover the absolute ref, fetches objects, and creates `.holo/sources/<name>.toml`. Fails if a source with that name already exists.

## git holo source fetch

Fetch one or all sources.

```
git holo source fetch [<name>] [--all]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<name>` | string | — | Specific source to fetch |
| `--all` | boolean | `false` | Fetch all configured sources |

One of `<name>` or `--all` is required.

## git holo source ls

List configured sources with their URLs, refs, and HEAD commit hashes.

```
git holo source ls [<name>] [--fetch]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<name>` | string | — | Show only the named source |
| `--fetch` | boolean | `false` | Fetch sources before listing |

Output format (tab-separated): `name<TAB>hash<TAB>url#ref`

## git holo source checkout

Check out source repository worktrees locally.

```
git holo source checkout [<name>] [--all] [--submodule]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<name>` | string | — | Specific source to checkout |
| `--all` | boolean | `false` | Checkout all configured sources |
| `--submodule` | boolean | `false` | Create a Git submodule tracking the source |

One of `<name>` or `--all` is required.

Creates a worktree at `.holo/sources/<name>/` with bidirectional object sharing between the sub-repository and the superproject. When `--submodule` is used, also configures `.gitmodules`.

## git holo branch create

Create a new holobranch.

```
git holo branch create <name> [--template <template>]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<name>` | string | *required* | Holobranch name |
| `--template` | string | `empty` | Starting template: `empty`, `passthrough`, or `emergence-site` |

Templates:

- **`empty`**: Creates only the branch directory, no mappings.
- **`passthrough`**: Creates `_<workspace-name>.toml` with `files = "**"` — includes all workspace files at the root.
- **`emergence-site`**: Creates `_<workspace-name>.toml` (with `after = "*"`) and `_skeleton-v2.toml` (with `before = "*"`) — skeleton base layer with workspace content overlaid on top.

Fails if the holobranch is already defined.

## git holo branch pull

Pull projected branches from remotes.

```
git holo branch pull [<name>] [--all] [--force]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<name>` | string | — | Specific holobranch to pull |
| `--all` | boolean | `false` | Pull all holobranches |
| `--force` | boolean | `false` | Force update even if local isn't an ancestor of the pulled ref |

One of `<name>` or `--all` is required.

Scans remote refs for commits with a `Source-holobranch` trailer matching the requested branch name. Only pulls from remotes that share a common ancestor with the current branch. Updates local refs to match remote refs.

## git holo inspect

Display the fully resolved hologit configuration. Shows workspace name, sources, branches with their resolved mappings and lenses. No network calls — reads only local config.

```
git holo inspect [<holobranch>] [--ref <ref>] [--working]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<holobranch>` | string | — | Specific holobranch to inspect. If omitted, shows full workspace. |
| `--ref` | string | `HEAD` | Commit ref to read configuration from |
| `--working` | boolean | `false` | Use working tree contents (possibly uncommitted) |

Output includes:

- **Workspace mode** (no argument): workspace name, all sources, all branches with their mappings and lenses
- **Branch mode** (with argument): single branch with resolved mappings (source, files, root, output, layer, before/after) and lenses (container/package, input, output, merge mode)

All implicit values are resolved in the output: auto-derived source names, `_` prefix output paths, layer defaults, and topological ordering.

## git holo project

Project a holobranch and output the resulting tree hash.

```
git holo project <holobranch> [options]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<holobranch>` | string | *required* | Holobranch to project |
| `--ref` | string | `HEAD` | Commit ref to read holobranch config from |
| `--working` | boolean | `false` | Use working tree contents (possibly uncommitted) |
| `--lens` | boolean | `null` | Override lensing. `null` = auto-detect from branch config (defaults to `true`). |
| `--fetch` | string | — | Sources to fetch: `*` for all, or comma/space/colon-separated names |
| `--watch` | boolean | `false` | Continuously output updated tree hashes on changes |
| `--commit-to` | string | — | Target branch/ref to commit the projected tree to |
| `--commit-message` | string | auto | Custom commit message (requires `--commit-to`) |
| `--commit-source-parent` | boolean | `true` | Include source commit as second parent in projection commit |
| `--cache-from` | string | `origin` | Remote to pull cached lens results from |
| `--cache-to` | string | — | Remote to push cached lens results to |

Output: Prints the resulting tree hash (or commit hash when `--commit-to` is used).

The `--fetch` option combines with the `HOLO_FETCH` environment variable (additive). Cache options can also be set via `HOLO_CACHE_FROM` and `HOLO_CACHE_TO` environment variables.

## git holo lens exec

Execute a lens spec and output the result hash.

```
git holo lens exec <spec-hash>
```

| Argument | Type | Description |
|----------|------|-------------|
| `<spec-hash>` | string | Hash of a git blob containing a TOML lens spec |

Primarily used internally. Executes the spec with `refresh: true` (bypasses cache). Exits 0 on success with tree hash on stdout, exits 1 on failure.

## git holo lens export-tree

Export a git tree to the current index and working tree.

```
git holo lens export-tree <treeish>
```

| Argument | Type | Description |
|----------|------|-------------|
| `<treeish>` | string | Tree-ish to export |

**Warning**: This is destructive — it overwrites the current index and working tree, then cleans untracked files. Must be run in a working tree.

## git holo lens merge-trees

Merge two trees and output the resulting tree hash.

```
git holo lens merge-trees <treeish-base> <treeish-input> [--method <method>]
```

| Argument/Option | Type | Default | Description |
|-----------------|------|---------|-------------|
| `<treeish-base>` | string | *required* | Base tree |
| `<treeish-input>` | string | *required* | Input tree to merge into base |
| `--method` | string | `overlay` | Merge strategy |

Currently only `overlay` is supported as the merge method.

## git holo watch

Watch the current working tree and output updated tree hashes.

```
git holo watch [--ref <ref>] [--working]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--ref` | string | `HEAD` | Commit ref to watch |
| `--working` | boolean | `false` | Watch the working tree contents |

Uses watchman to detect filesystem and ref changes, outputting new tree hashes continuously.

## git holo studio

Start the studio API server (internal/experimental).

```
git holo studio [--socket <path>]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--socket` | string | `/var/run/holo.sock` | Unix socket path for API |

Listens on a Unix socket for HTTP requests. This is a hidden command.
