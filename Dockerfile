# This Dockerfile is hyper-optimized to minimize layer changes

FROM jarvus/habitat-compose:latest as habitat

ARG HAB_LICENSE=no-accept
ENV HAB_LICENSE=$HAB_LICENSE
ENV STUDIO_TYPE=Dockerfile
ENV HAB_ORIGIN=slate
RUN hab origin key generate

# pre-layer all external runtime plan deps
COPY habitat/plan.sh /habitat/plan.sh
RUN hab pkg install \
    core/bash \
    emergence/php-runtime \
    $({ cat '/habitat/plan.sh' && echo && echo 'echo "${pkg_deps[@]/$pkg_origin\/*/}"'; } | hab pkg exec core/bash bash) \
    && hab pkg exec core/coreutils rm -rf /hab/cache/{artifacts,src}/

# pre-layer all external runtime composite deps
COPY habitat/composite/plan.sh /habitat/composite/plan.sh
RUN hab pkg install \
    jarvus/habitat-compose \
    emergence/nginx \
    $({ cat '/habitat/composite/plan.sh' && echo && echo 'echo "${pkg_deps[@]/$pkg_origin\/*/} ${composite_mysql_pkg}"'; } | hab pkg exec core/bash bash) \
    && hab pkg exec core/coreutils rm -rf /hab/cache/{artifacts,src}/


FROM habitat as projector

# pre-layer all build-time plan deps
RUN hab pkg install \
    core/hab-plan-build \
    jarvus/hologit \
    jarvus/toml-merge \
    $({ cat '/habitat/plan.sh' && echo && echo 'echo "${pkg_build_deps[@]/$pkg_origin\/*/}"'; } | hab pkg exec core/bash bash) \
    && hab pkg exec core/coreutils rm -rf /hab/cache/{artifacts,src}/

# pre-layer all build-time composite deps
RUN hab pkg install \
    jarvus/toml-merge \
    $({ cat '/habitat/composite/plan.sh' && echo && echo 'echo "${pkg_build_deps[@]/$pkg_origin\/*/}"'; } | hab pkg exec core/bash bash) \
    && hab pkg exec core/coreutils rm -rf /hab/cache/{artifacts,src}/

# build application
COPY . /src
ARG SITE_TREE
ENV SITE_TREE=$SITE_TREE
ARG SITE_VERSION
ENV SITE_VERSION=$SITE_VERSION
RUN hab pkg exec core/hab-plan-build hab-plan-build /src
RUN hab pkg exec core/hab-plan-build hab-plan-build /src/habitat/composite


FROM habitat as runtime

# configure persistent volumes
RUN hab pkg exec core/coreutils mkdir -p '/hab/svc/mysql/data' '/hab/svc/site/data' '/hab/svc/nginx/files' \
    && hab pkg exec core/coreutils chown hab:hab -R '/hab/svc/mysql/data' '/hab/svc/site/data' '/hab/svc/nginx/files'

# configure entrypoint
VOLUME ["/hab/svc/mysql/data", "/hab/svc/site/data", "/hab/svc/nginx/files"]
ENTRYPOINT ["hab", "sup", "run"]
CMD ["slate/site-composite"]

# install .hart artifact from builder stage
COPY --from=projector /hab/cache/artifacts/$HAB_ORIGIN-* /hab/cache/artifacts/
RUN hab pkg install /hab/cache/artifacts/$HAB_ORIGIN-* \
    && hab pkg exec core/coreutils rm -rf /hab/cache/{artifacts,src}/

# add source metadata to environment
ARG SOURCE_TAG
ENV SOURCE_TAG=$SOURCE_TAG
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
