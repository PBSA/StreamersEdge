#!/bin/bash
rm -rf $PROJECT || true
git clone -b $BRANCH $REPO
sh /usr/local/bin/$PROJECT/deploy.sh