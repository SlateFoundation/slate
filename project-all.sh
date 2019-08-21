#!/bin/bash

git holo project emergence-skeleton \
    --fetch \
    --ref=origin/releases/v2 \
    --commit-to=emergence/skeleton/v2

git holo project emergence-vfs-site \
    --fetch \
    --ref=origin/releases/v2 \
    --commit-to=emergence/vfs-site/v2

git holo project emergence-vfs-skeleton \
    --fetch \
    --ref=origin/releases/v2 \
    --commit-to=emergence/vfs-skeleton/v2
