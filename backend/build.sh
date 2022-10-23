#!/bin/bash

# rm -rf bin
# npm run build

rm -rf ansible
cp -r ../ansible .

source ../container-version.sh

docker_user=$1

docker buildx build \
    --progress auto \
    --pull \
    --tag ${docker_user}/agent-control-center-backend:${CONTAINER_VERSION} \
    -o type=docker \
    --platform=linux/arm64 \
    -f Dockerfile .

    # -o type=image \

rm -rf ansible