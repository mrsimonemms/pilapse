#!/usr/bin/env bash

if [[ -z "$DOCKER_BUILD_NUMBER" ]]
then
  echo "Please provide a DOCKER_BUILD_NUMBER"
  exit 1
fi

DOCKER_REPO=riggerthegeek/pilapse
DOCKER_COMMIT=$(uname -m)

# Script to be run from a Raspberry Pi
docker build -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_COMMIT-$DOCKER_BUILD_NUMBER
docker push $DOCKER_REPO
