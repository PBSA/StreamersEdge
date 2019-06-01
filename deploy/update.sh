#!/bin/bash
rm -rf $PROJECT || true
git clone -b $BRANCH ssh://git@github.com/pbsa/streamersedge
sh /usr/local/bin/$PROJECT/deploy.sh