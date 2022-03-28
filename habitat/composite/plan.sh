composite_app_pkg_name=site
pkg_name="${composite_app_pkg_name}-composite"
pkg_origin=slate
pkg_maintainer="Jarvus Innovations <hello@jarv.us>"
pkg_scaffolding=emergence/scaffolding-composite
composite_mysql_pkg=core/mysql

pkg_version() {
  scaffolding_detect_pkg_version
}
