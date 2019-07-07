#!/bin/bash

HOST=${1:-http://v2.slate.is}
FASHION_REGEX='s/^(\$[^:]+:\s*)(.*?)\s+!default;/\1dynamic(\2);/'

wget $HOST/css/main.css -qO main.css

mkdir -p img
wget $HOST/img/logo.png -qO img/logo.png
wget $HOST/img/slate-logo-white.svg -qO img/slate-logo-white.svg
wget $HOST/img/slate-icons/slate-icons.svg -qO img/slate-icons.svg

mkdir -p fonts
wget $HOST/css/fonts/lato.css -qO fonts/lato.css
wget $HOST/css/fonts/sanchez.css -qO fonts/sanchez.css
wget $HOST/css/fonts/font-awesome.css -qO fonts/font-awesome.css

mkdir -p sass/site sass/slate sass/skeleton
(wget $HOST/sass/_variables-all.scss -qO- && echo) | perl -e 'print reverse <>' > sass/_variables-all.scss
wget $HOST/sass/site/_variables.scss -qO- | perl -pe $FASHION_REGEX > sass/site/_variables.scss
wget $HOST/sass/slate/_variables.scss -qO- | perl -pe $FASHION_REGEX > sass/slate/_variables.scss
wget $HOST/sass/skeleton/_variables.scss -qO- | perl -pe $FASHION_REGEX > sass/skeleton/_variables.scss