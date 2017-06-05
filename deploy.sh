#!/usr/bin/env bash

# This script should be run from a Raspberry Pi so uses
# correct Node version
#
# Requires json to be installed globally

DOCKER_REPO=riggerthegeek/pilapse
DOCKER_COMMIT=$(uname -m)

if [[ -z "$1" ]]
then
  echo "Please provide a version as the first argument"
  exit 1
fi

json --help
if [ $? \> 0 ]
then
  echo "json must be installed"
  exit 1
fi

sudo rm -Rf node_modules
npm version $1

if [ $? \> 0 ]
then
  echo "npm must be installed"
  exit 1
fi

# Set the Docker version
DOCKER_VERSION=$(json -f ./package.json version)

docker build -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_COMMIT-$DOCKER_VERSION
docker push $DOCKER_REPO
