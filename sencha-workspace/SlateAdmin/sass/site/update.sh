#!/bin/bash

HOST=${1:-http://v2.slate.is}
FASHION_REGEX='s/^(\$[^:]+:\s*)(.*?)\s+!default;/\1dynamic(\2);/'

mkdir -p site slate skeleton
(wget "${HOST}/sass/_variables-all.scss" -qO- && echo) | perl -e 'print reverse <>' > _variables-all.scss
wget "${HOST}/sass/site/_variables.scss" -qO- | perl -pe "${FASHION_REGEX}" > site/_variables.scss
wget "${HOST}/sass/slate/_variables.scss" -qO- | perl -pe "${FASHION_REGEX}" > slate/_variables.scss
wget "${HOST}/sass/skeleton/_variables.scss" -qO- | perl -pe "${FASHION_REGEX}" > skeleton/_variables.scss