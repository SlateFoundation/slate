# TOML Configuration Reference

## Table of Contents

- [Workspace Config](#workspace-config)
- [Source Config](#source-config)
- [Branch Config](#branch-config)
- [Mapping Config](#mapping-config)
- [Lens Config](#lens-config)
- [Companion Data Trees](#companion-data-trees)
- [Merge Modes](#merge-modes)

## Workspace Config

**Path**: `.holo/config.toml`

```toml
[holospace]
name = "my-project"    # Required. Canonical name for the workspace.
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Canonical name used for self-references. When a mapping's `holosource` matches this name, the current workspace tree is used as the source instead of fetching from a remote. |

## Source Config

**Path**: `.holo/sources/<name>.toml`

```toml
[holosource]
url = "https://github.com/org/repo"
ref = "refs/heads/main"

[holosource.project]
holobranch = "release"
lens = true
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | string | yes* | — | Repository URL (HTTPS, SSH, or local path starting with `/`). *Not required for workspace self-reference sources. |
| `ref` | string | yes* | — | Full Git ref path (must start with `refs/`). Examples: `refs/heads/main`, `refs/tags/v1.0.0`. |
| `project.holobranch` | string | no | — | Project a holobranch within the source repo. The source output will be the projected branch instead of the raw source tree. |
| `project.lens` | boolean | no | `true` | Whether to apply lenses during sub-projection. Only relevant when `project.holobranch` is set. |

**Source name**: Derived from the filename (without `.toml`).

**Workspace self-reference**: When the source name matches the workspace `name` in `config.toml`, the source implicitly references the current workspace tree. No `url` or `ref` is needed.

**Environment override**: Source config can be overridden via `HOLO_SOURCE_<NAME>` environment variables. See [environment-variables.md](environment-variables.md).

## Branch Config

**Path**: `.holo/branches/<name>.toml`

```toml
[holobranch]
extend = "base-branch"
lens = true
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `extend` | string | no | — | Name of another holobranch to inherit mappings from. The extended branch's mappings are composited first, then this branch's mappings are applied on top. Supports chaining (extended branches can extend others). |
| `lens` | boolean | no | `true` | Whether to apply lensing to the composite tree. Set to `false` to skip all lens transformations. |

A branch is considered defined if it has a `.toml` config file or a mappings directory (`.holo/branches/<name>/`).

## Mapping Config

**Path**: `.holo/branches/<branch>/<key>.toml`

```toml
[holomapping]
holosource = "source-name"
files = ["src/**", "!test/**"]
root = "packages/core"
output = "."
layer = "source-name"
before = ["other-layer"]
after = ["base-layer"]
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `holosource` | string | no | derived from key | Source to map from. Derived from key name (with leading `_` stripped). Supports `=>` syntax for sub-projection. |
| `files` | string or string[] | **yes** | — | Glob patterns of files to include. Supports negation patterns (`"!pattern"`). |
| `root` | string | no | `.` | Path within the source tree to read from. |
| `output` | string | no | derived from key | Output path in the projected tree. See key naming conventions below. |
| `layer` | string | no | `holosource` value | Layer name for ordering. Mappings with the same layer are grouped together. |
| `before` | string or string[] | no | — | Layers that must come after this one. Use `"*"` for all other layers. |
| `after` | string or string[] | no | — | Layers that must come before this one. Use `"*"` for all other layers. |

### Key Naming Conventions

The key (filename without `.toml`) determines default `holosource` and `output`:

| Key Pattern | holosource | output |
|-------------|-----------|--------|
| `_name` | `name` | `.` (root) |
| `name` | `name` | `name/` |
| `subdir/_name` | `name` | `subdir/` |
| `subdir/name` | `name` | `subdir/name/` |

### Holosource `=>` Syntax

The `holosource` field supports in-mapping projection:

- `"source-name=>branch-name"` — Use source `source-name` and project its `branch-name` holobranch
- `"=>branch-name"` — Use the source derived from the key and project its `branch-name` holobranch. The key-derived source name is prepended automatically.

## Lens Config

**Paths**:

- Internal: `.holo/lenses/<name>.toml`
- External: `.holo/branches/<branch>.lenses/<name>.toml`

Both use the same schema.

```toml
[hololens]
container = "ghcr.io/hologit/lenses/shell:latest"
# OR
package = "origin/name/version/build"
command = "lens-tree {{ input }}"

before = "*"
after = ["other-lens"]

[hololens.input]
files = ["**"]
root = "subdir"

[hololens.output]
root = "subdir"
merge = "overlay"

# Tool-specific configuration (passed as env vars to container)
[hololens.tool_name]
option1 = "value"
option2 = ["a", "b"]
```

### Core Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `container` | string | one of container/package | — | Docker container image. Use tag (e.g., `:latest`); hologit resolves to digest automatically for caching. |
| `package` | string | one of container/package | — | Habitat package identifier (e.g., `origin/name/version/build`). |
| `command` | string | no | `lens-tree {{ input }}` | Command template (Handlebars). Only used with `package`. |
| `before` | string or string[] | no | — | Lens names or `"*"` — this lens runs before the specified lenses. |
| `after` | string or string[] | no | — | Lens names or `"*"` — this lens runs after the specified lenses. |

### Input Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `input.files` | string or string[] | `["**"]` | Glob patterns to select files from the composite tree as lens input. |
| `input.root` | string | `.` | Subdirectory within the composite tree to use as the input root. |

### Output Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `output.root` | string | `input.root` | Where in the output tree to place lens results. Defaults to the same path as `input.root`. |
| `output.merge` | string | `overlay` | How to merge lens output into the projection tree. See [Merge Modes](#merge-modes). |

### Tool-Specific Sections

Additional `[hololens.<tool>]` sections are flattened into environment variables and passed to the container. For example:

```toml
[hololens.helm]
namespace = "production"
release_name = "my-app"
```

Becomes environment variables: `HOLOLENS_HELM_NAMESPACE=production`, `HOLOLENS_HELM_RELEASE_NAME=my-app`.

Array values are joined with commas. Nested objects are flattened with `_` separator. Keys are uppercased and hyphens become underscores.

### Internal vs External Lenses

**Internal** (`.holo/lenses/<name>.toml`):

- Discovered in the projected composite output tree (after mapping composition)
- Travel with source content — inherited by downstream projects
- Applied first during projection
- Stripped from output after execution

**External** (`.holo/branches/<branch>.lenses/<name>.toml`):

- Defined in the consuming workspace alongside the branch config
- Branch-specific, not inherited by downstream projects
- Applied after internal lenses
- Use for transformations on external sources

## Companion Data Trees

**Path**: `.holo/lenses/<name>/` (directory matching the lens TOML name)

A lens can have a companion data directory containing static files. When present, the directory's tree hash is included in the lens spec as `data`. The lens container receives the data tree and can use it during processing.

Use cases: patch scripts, additional configuration files, templates that the lens needs during execution.

## Merge Modes

Used in `output.merge` for lenses and the `--method` flag for `merge-trees`:

| Mode | Behavior |
|------|----------|
| `overlay` (default) | Input files overwrite base files at matching paths. Unmatched base files are preserved. |
| `replace` | The input tree completely replaces the target subtree. All previous content at the output root is removed. |
