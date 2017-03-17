#!/usr/bin/env bash

DOCKER_BUILD_NUMBER=$(git rev-parse --short HEAD)
DOCKER_REPO=riggerthegeek/pilapse
DOCKER_COMMIT=$(uname -m)

# Script to be run from a Raspberry Pi
docker build -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_COMMIT-$DOCKER_BUILD_NUMBER
docker push $DOCKER_REPO
