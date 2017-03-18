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

sudo rm -Rf node_modules
npm version $1

# Set the Docker version
DOCKER_VERSION=$(json -f ./package.json version)

docker build -t $DOCKER_REPO:$DOCKER_COMMIT .
docker tag $DOCKER_REPO:$DOCKER_COMMIT $DOCKER_REPO:$DOCKER_COMMIT-$DOCKER_VERSION
docker push $DOCKER_REPO

docker run --name pilapse \
  -v /var/image:/var/image \
  -v $PWD/config.json:/opt/app/config.json \
  -v $PWD/pilapse.sql:/opt/app/pilapse.sql \
  --privileged \
  --restart=always \
  -d \
  --log-driver=syslog \
  --log-opt syslog-address=udp://logs.papertrailapp.com:40966 \
  --log-opt tag=pilapse \
  riggerthegeek/pilapse:$(uname -m)
