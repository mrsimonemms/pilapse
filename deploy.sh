#!/usr/bin/env bash

DOCKER_BUILD_NUMBER=$(git rev-parse --short HEAD)
DOCKER_REPO=riggerthegeek/pilapse
DOCKER_COMMIT=$(uname -m)

if [[ -z "$1" ]]
then
  echo "Please provide a version as the first argument"
  exit 1
fi

# Script to be run from a Raspberry Pi
npm version $1
docker build -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_COMMIT-$DOCKER_BUILD_NUMBER
docker push $DOCKER_REPO
