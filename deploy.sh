#!/usr/bin/env bash

echo "Docker version:"
docker --version

# Login to Docker
docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD

# Build and publish
DOCKER_COMMIT=${TRAVIS_COMMIT::8}
DOCKER_REPO=riggerthegeek/pilapse
DOCKER_TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo "latest"; else echo $TRAVIS_BRANCH ; fi`
docker build -f Dockerfile -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_TAG
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$TRAVIS_BUILD_NUMBER
docker push $DOCKER_REPO
