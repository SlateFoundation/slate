#!/bin/bash
for package in ./* ; do
    if [ -d "$package/.git" ]; then
        echo "Pulling $package from git"
        cd "$package"
        git pull
        cd ..
    fi
done
