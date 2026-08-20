# Stock Lenses Reference

All stock lenses are available as Docker container images at `ghcr.io/hologit/lenses/<name>:latest`.

## Table of Contents

- [shell](#shell)
- [helm3](#helm3)
- [kustomize](#kustomize)
- [k8s-normalize](#k8s-normalize)
- [k8s-patch](#k8s-patch)
- [npm-install](#npm-install)
- [npm-run](#npm-run)
- [mkdocs](#mkdocs)

---

## shell

Execute arbitrary shell scripts to transform the input tree.

**Container**: `ghcr.io/hologit/lenses/shell:latest`

### Configuration

| TOML Field | Env Var | Required | Description |
|------------|---------|----------|-------------|
| `shell.script` | `HOLOLENS_SHELL_SCRIPT` | **yes** | Bash script to execute |

### Behavior

1. Exports input tree to working directory
2. Executes script via `bash -c "$script"`
3. Adds all modified/new files to git index
4. Returns tree hash of modified working directory

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/shell:latest"

[hololens.input]
files = "**"

[hololens.output]
merge = "replace"

[hololens.shell]
script = '''
mv Chart.template.yaml Chart.yaml
sed -i 's/VERSION_PLACEHOLDER/1.0.0/g' Chart.yaml
'''
```

---

## helm3

Render Helm charts into Kubernetes manifests using `helm template`.

**Container**: `ghcr.io/hologit/lenses/helm3:latest`

### Configuration

| TOML Field | Env Var | Default | Description |
|------------|---------|---------|-------------|
| `helm.chart_path` | `HOLOLENS_HELM_CHART_PATH` | `.` | Path to the Helm chart directory (containing Chart.yaml) |
| `helm.namespace` | `HOLOLENS_HELM_NAMESPACE` | — | Kubernetes namespace for manifests |
| `helm.release_name` | `HOLOLENS_HELM_RELEASE_NAME` | — | Helm release name |
| `helm.value_files` | `HOLOLENS_HELM_VALUE_FILES` | — | Values files (TOML array or comma-separated string) |
| `helm.kube_version` | `HOLOLENS_HELM_KUBE_VERSION` | `1.22` | Kubernetes API version for template rendering |
| `helm.kube_apis` | `HOLOLENS_HELM_KUBE_APIS` | `networking.k8s.io/v1/Ingress` | Available API versions (comma-separated) |
| `helm.include_crds` | `HOLOLENS_HELM_INCLUDE_CRDS` | `false` | Include CRDs in output |
| `helm.skip_schema_validation` | `HOLOLENS_HELM_SKIP_SCHEMA_VALIDATION` | `false` | Skip Helm schema validation |
| `helm.namespace_fill` | `HOLOLENS_HELM_NAMESPACE_FILL` | `false` | Fill namespace in resources that are missing it |
| `helm.namespace_override` | `HOLOLENS_HELM_NAMESPACE_OVERRIDE` | `false` | Override namespace in all resources |
| `helm.output_root` | `HOLOLENS_HELM_OUTPUT_ROOT` | `output` | Output directory name |
| `helm.output_filename` | `HOLOLENS_HELM_OUTPUT_FILENAME` | `manifest.yaml` | Output filename |

### Behavior

1. Exports input tree to working directory
2. Runs `helm dependency update` on the chart
3. Executes `helm template` with configured options
4. Generates a Namespace resource if `namespace` is specified
5. Optionally patches namespace fields with `namespace_fill`/`namespace_override`
6. Writes manifest to `{output_root}/{output_filename}`

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/helm3:latest"

[hololens.input]
root = "grafana"
files = "**"

[hololens.output]
merge = "replace"

[hololens.helm]
namespace = "grafana"
release_name = "grafana"
chart_path = "helm-chart"
value_files = [
    "default-values.yaml",
    "provider-values.yaml",
    "release-values.yaml"
]
```

---

## kustomize

Render Kustomize overlays into Kubernetes manifests.

**Container**: `ghcr.io/hologit/lenses/kustomize:latest`

### Configuration

| TOML Field | Env Var | Default | Description |
|------------|---------|---------|-------------|
| `kustomize.directory` | `HOLOLENS_KUSTOMIZE_DIRECTORY` | `.` | Path to kustomization.yaml |
| `kustomize.namespace` | `HOLOLENS_KUSTOMIZE_NAMESPACE` | — | Kubernetes namespace for manifests |
| `kustomize.namespace_fill` | `HOLOLENS_KUSTOMIZE_NAMESPACE_FILL` | `false` | Fill namespace in resources missing it |
| `kustomize.namespace_override` | `HOLOLENS_KUSTOMIZE_NAMESPACE_OVERRIDE` | `false` | Override namespace in all resources |
| `kustomize.output_root` | `HOLOLENS_KUSTOMIZE_OUTPUT_ROOT` | `output` | Output directory name |
| `kustomize.output_filename` | `HOLOLENS_KUSTOMIZE_OUTPUT_FILENAME` | `manifest.yaml` | Output filename |

### Behavior

1. Exports input tree to working directory
2. Runs `kustomize build` on the specified directory
3. Generates a Namespace resource if `namespace` is specified
4. Optionally patches namespace fields
5. Writes manifest to `{output_root}/{output_filename}`

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/kustomize:latest"

[hololens.input]
files = "**"

[hololens.output]
merge = "replace"

[hololens.kustomize]
directory = "overlays/production"
namespace = "my-app"
namespace_fill = true
```

---

## k8s-normalize

Reorganize Kubernetes YAML manifests into a structured directory hierarchy.

**Container**: `ghcr.io/hologit/lenses/k8s-normalize:latest`

### Configuration

No tool-specific configuration options. This lens reads all YAML files from the input and reorganizes them.

### Output Structure

Files are organized as: `{namespace}/{kind}/{name}.yaml`

- Namespaced resources: `{namespace}/Deployment/my-app.yaml`
- Cluster-scoped resources: `_/ClusterRole/admin.yaml` (underscore for no namespace)

### Behavior

1. Reads all YAML files from input tree (operates directly on git objects, no tree export)
2. Parses each YAML document (supports multi-document files)
3. Expands ConfigMapList items
4. Validates each object has `kind`, `metadata.name`
5. Sorts YAML keys alphabetically
6. Writes to structured output: `{namespace or '_'}/{kind}/{name}.yaml`

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/k8s-normalize:latest"
after = "*"

[hololens.input]
files = ["**/*.yaml", "**/*.yml", "!.github/"]

[hololens.output]
merge = "replace"
```

Typically used with `after = "*"` to run after all other lenses (e.g., helm3, kustomize) have generated their manifests.

---

## k8s-patch

Apply JavaScript transformations to Kubernetes manifest objects.

**Container**: `ghcr.io/hologit/lenses/k8s-patch:latest`

### Configuration

| TOML Field | Env Var | Required | Description |
|------------|---------|----------|-------------|
| `k8s_patch.script` | `HOLOLENS_K8S_PATCH_SCRIPT` | **yes** | JavaScript arrow function receiving each manifest object |

### Script Format

The script must be a JavaScript function expression that receives a single `manifest` parameter and modifies it in place:

```javascript
manifest => {
    if (manifest.kind === 'Deployment') {
        manifest.spec.replicas = 3;
    }
}
```

The function:

- Receives each Kubernetes object as the `manifest` parameter
- Modifies the object in place (no return value needed)
- Runs in a sandboxed VM context
- Handles multi-document YAML files (each document processed separately)
- Preserves octal integers (e.g., `0644` for file permissions)

### Behavior

1. Reads all YAML files from input tree (operates directly on git objects)
2. Compiles the script in a sandboxed `vm.runInNewContext()`
3. For each YAML document, applies the patch function
4. Expands ConfigMapList items
5. Writes patched YAML back to output tree
6. Passes through non-YAML files unchanged

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/k8s-patch:latest"

[hololens.input]
files = ["**/*.yaml", "**/*.yml"]

[hololens.output]
merge = "replace"

[hololens.k8s_patch]
script = """
manifest => {
    if (!manifest.metadata) return;
    if (!manifest.metadata.labels) manifest.metadata.labels = {};
    manifest.metadata.labels['managed-by'] = 'hologit';
}
"""
```

---

## npm-install

Install npm dependencies and include `node_modules/` in the output tree.

**Container**: `ghcr.io/hologit/lenses/npm-install:latest`

### Configuration

| TOML Field | Env Var | Default | Description |
|------------|---------|---------|-------------|
| `npm.install_command` | `HOLOLENS_NPM_INSTALL_COMMAND` | `npm ci` | Installation command |
| `npm.install_env` | `HOLOLENS_NPM_INSTALL_ENV` | `production` | NODE_ENV value |

### Behavior

1. Exports input tree to working directory
2. Sets `CI=true` and `NODE_ENV` environment variables
3. Executes the install command (default: `npm ci`)
4. Adds `node_modules/` to git index
5. Returns tree hash containing `node_modules/`

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/npm-install:latest"

[hololens.input]
files = [
    "package.json",
    "package-lock.json"
]
```

---

## npm-run

Execute npm scripts and capture output.

**Container**: `ghcr.io/hologit/lenses/npm-run:latest`

### Configuration

| TOML Field | Env Var | Default | Description |
|------------|---------|---------|-------------|
| `npm_run.command` | `HOLOLENS_NPM_RUN_COMMAND` | — | **Required.** npm script name to run |
| `npm_run.install` | `HOLOLENS_NPM_RUN_INSTALL` | `npm ci` | Pre-install command |
| `npm_run.env` | `HOLOLENS_NPM_RUN_ENV` | `production` | NODE_ENV value |
| `npm_run.output_dir` | `HOLOLENS_NPM_RUN_OUTPUT_DIR` | — | Directory to capture as output tree |

### Behavior

1. Exports input tree to working directory
2. Sets `CI=true` and `NODE_ENV` environment variables
3. Runs the install command (default: `npm ci`)
4. Executes `npm run --silent <command>`
5. If `output_dir` is set: adds that directory to git index and returns its tree hash
6. If `output_dir` is not set: returns the captured stdout of the command

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/npm-run:latest"

[hololens.input]
files = "**"

[hololens.output]
merge = "replace"

[hololens.npm_run]
command = "build"
output_dir = "dist"
```

---

## mkdocs

Build MkDocs documentation sites.

**Container**: `ghcr.io/hologit/lenses/mkdocs:latest`

### Configuration

| TOML Field | Env Var | Default | Description |
|------------|---------|---------|-------------|
| `mkdocs.version` | `HOLOLENS_MKDOCS_VERSION` | latest | Specific MkDocs version (e.g., `1.4.2`) |
| `mkdocs.requirements` | `HOLOLENS_MKDOCS_REQUIREMENTS` | — | Python packages (TOML array or comma-separated string) |
| `mkdocs.output_dir` | `HOLOLENS_MKDOCS_OUTPUT_DIR` | `site` | Output directory name |

### Python Dependency Resolution

Dependencies are resolved in this priority order:

1. `mkdocs.requirements` config: installs MkDocs + listed packages
2. `requirements.txt` file in input tree: installs from file
3. Fallback: installs just MkDocs

### Configuration Merging

The lens automatically discovers files matching `mkdocs.*.yml` and merges them into `mkdocs.yml` in alphabetical order. This enables environment-specific overrides (e.g., `mkdocs.production.yml`).

### Behavior

1. Exports input tree to working directory
2. Merges `mkdocs.*.yml` override files into `mkdocs.yml`
3. Creates Python virtual environment at `./.venv`
4. Installs MkDocs and dependencies
5. Executes `mkdocs build`
6. Returns tree hash of the output directory

### Example

```toml
[hololens]
container = "ghcr.io/hologit/lenses/mkdocs:latest"

[hololens.output]
merge = "replace"

[hololens.mkdocs]
requirements = [
    "mkdocs-material",
    "mkdocs-awesome-pages-plugin",
    "mdx_truly_sane_lists"
]
```
