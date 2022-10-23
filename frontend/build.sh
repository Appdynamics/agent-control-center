#!/bin/bash

source ../container-version.sh

docker_user=$1

docker buildx build --tag ${docker_user}/agent-control-center-frontend:${CONTAINER_VERSION} -o type=image --platform=linux/arm64 -f Dockerfile .