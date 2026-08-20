# Environment Variables Reference

## Table of Contents

- [Source Overrides](#source-overrides)
- [Fetch Control](#fetch-control)
- [Cache Control](#cache-control)
- [Debug Options](#debug-options)

## Source Overrides

### HOLO_SOURCE_\<NAME\>

Override a source's URL, ref, and/or holobranch projection at runtime.

**Name transformation**: The source name is uppercased with hyphens converted to underscores. For example, source `my-source` becomes `HOLO_SOURCE_MY_SOURCE`.

**Syntax**: `<url>#<ref>[=>holobranch]`

All parts are optional — you can override just the URL, just the ref, or any combination:

| Example | Effect |
|---------|--------|
| `HOLO_SOURCE_MY_SOURCE=https://github.com/fork/repo` | Override URL only |
| `HOLO_SOURCE_MY_SOURCE=#refs/heads/feature` | Override ref only |
| `HOLO_SOURCE_MY_SOURCE=#refs/heads/feature=>release` | Override ref and project holobranch |
| `HOLO_SOURCE_MY_SOURCE=https://github.com/fork/repo#refs/heads/main` | Override URL and ref |
| `HOLO_SOURCE_MY_SOURCE=https://github.com/fork/repo#refs/heads/main=>release` | Override all |

The override merges with the existing TOML config — unspecified fields retain their configured values.

## Fetch Control

### HOLO_FETCH

Specify which sources to fetch during projection. Combines additively with the `--fetch` CLI option.

**Values**:

- `*` — Fetch all sources
- Source names separated by commas, spaces, or colons (e.g., `source1,source2` or `source1 source2`)

**Example**:

```bash
HOLO_FETCH="*" git holo project my-branch
```

## Cache Control

### HOLO_CACHE_FROM

Remote to pull cached lens results from. Overrides the `--cache-from` CLI option.

**Default**: `origin` (when neither env var nor CLI option is set)

```bash
HOLO_CACHE_FROM=upstream git holo project my-branch
```

### HOLO_CACHE_TO

Remote to push cached lens results to. Overrides the `--cache-to` CLI option.

**Default**: none (caching is push-disabled unless set)

```bash
HOLO_CACHE_TO=origin git holo project my-branch
```

Lens results are cached at `refs/holo/lens/<spec-hash>` refs. The spec hash is deterministic based on input tree + container image digest, so identical inputs always hit the cache.

## Debug Options

### DEBUG

Set to `1` to enable debug logging inside lens containers.

```bash
DEBUG=1 git holo project my-branch
```

### HOLO_DEBUG_PERSIST_CONTAINER

Set to a container name to reuse a named Docker container across lens executions instead of creating/destroying one each time. Useful for debugging lens behavior.

```bash
HOLO_DEBUG_PERSIST_CONTAINER=my-debug-lens git holo project my-branch
```

### HOLO_SCRATCH

Override the scratch directory for Habitat lens execution. Default: `/hab/cache/hololens`.
