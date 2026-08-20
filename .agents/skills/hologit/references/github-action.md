# GitHub Action Reference

## Action

`JarvusInnovations/hologit@<ref>` (uses the `github-actions/projector` action)

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `holobranch` | **yes** | — | Name of holobranch to project |
| `ref` | no | — | Branch/ref to read source tree from |
| `fetch` | no | `true` | Whether to fetch configured refs |
| `commit-to` | no | — | Branch/ref to commit the projected tree to |
| `commit-message` | no | auto | Custom commit message (requires `commit-to`) |
| `commit-source-parent` | no | `true` | Include source commit as second parent |
| `author-from-ref` | no | `true` | Set git author from source ref commit (set to `false` to use pre-configured author) |
| `cache` | no | `true` | Whether to use lens result caching |

## Outputs

| Output | Description |
|--------|-------------|
| `tree` | Tree hash of the projected holobranch |
| `commit` | Commit hash (only if `commit-to` is configured) |

## Example Workflow

```yaml
name: Project holobranch
on:
  push:
    branches: [main]

jobs:
  project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: JarvusInnovations/hologit@v1
        with:
          holobranch: my-branch
          commit-to: gh-pages
```

## Example: Project and Push

```yaml
name: Deploy docs
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: JarvusInnovations/hologit@v1
        id: project
        with:
          holobranch: docs-site
          commit-to: gh-pages

      - name: Push projected branch
        run: git push origin gh-pages
```

## Example: Multiple Holobranches

```yaml
jobs:
  project:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        holobranch: [k8s-manifests, docs-site]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: JarvusInnovations/hologit@v1
        with:
          holobranch: ${{ matrix.holobranch }}
          commit-to: ${{ matrix.holobranch }}
```
