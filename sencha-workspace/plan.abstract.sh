pkg_origin=slate
pkg_maintainer="Chris Alfano <chris@jarv.us>"
pkg_license=("MIT")
pkg_build_deps=(
  core/git
  jarvus/sencha-cmd/6.5.2.15
)


# implement git-based dynamic version strings
pkg_version() {
  if [ -n "${pkg_last_tag}" ]; then
    echo "${pkg_last_version}-git+${pkg_last_tag_distance}.${pkg_commit}"
  else
    echo "${pkg_last_version}-git+${pkg_commit}"
  fi
}

do_before() {
  do_default_before

  # configure git repository
  export GIT_DIR="/src/.git"

  # load version information from git
  pkg_commit="$(git rev-parse --short HEAD)"
  pkg_last_tag="$(git describe --tags --abbrev=0 ${pkg_commit} || true 2>/dev/null)"

  if [ -n "${pkg_last_tag}" ]; then
    pkg_last_version=${pkg_last_tag#v}
    pkg_last_tag_distance="$(git rev-list ${pkg_last_tag}..${pkg_commit} --count)"
  else
    pkg_last_version="0.0.0"
  fi

  # initialize pkg_version
  update_pkg_version
}


# implement build workflow
do_build() {
  pushd "${PLAN_CONTEXT}" > /dev/null

  sencha ant \
    -Dapp.output.base="${CACHE_PATH}" \
    -Dbuild.temp.dir="/tmp" \
    -Dapp.cache.deltas=false \
    -Dapp.output.microloader.enable=false \
    -Dbuild.enable.appmanifest=false \
    -Denable.standalone.manifest=true \
    production \
    build

  popd > /dev/null
}

do_install() {
  cp -r "${CACHE_PATH}" "${pkg_prefix}/app"
}

do_strip() {
  return 0
}