#!/bin/bash

CONTAINER_VERSION=1.0
DOCKER_DOMAIN=appdynamics

PUSH_MONGO=false
PUSH_BACKEND=false
PUSH_FRONTEND=false

for ARGUMENT in "$@"
do
    if [ "$ARGUMENT" = "backend" ]; then
        PUSH_BACKEND=true
    elif [ "$ARGUMENT" = "frontend" ]; then
        PUSH_FRONTEND=true
    elif [ "$ARGUMENT" = "mongo" ]; then
        PUSH_MONGO=true
    elif [ "$ARGUMENT" = "all" ]; then
        PUSH_MONGO=true
        PUSH_BACKEND=true
        PUSH_FRONTEND=true
    fi
done

export DOCKER_BUILDKIT=1;

if [ $PUSH_BACKEND == true ];then
    echo ""
    echo "==> Building BACKEND"
    (
        rm -rf ./backend/ansible; \
        cp -r ansible backend; \
        cd backend; \
        docker build -t ${DOCKER_DOMAIN}/acc-backend:${CONTAINER_VERSION} -f docker/Dockerfile . ;\
        rm -rf ./backend/ansible
    )
fi

if [ $PUSH_FRONTEND == true ];then
    echo ""
    echo "==> Building FRONTEND"
    (
        cd frontend; \
        docker build -t ${DOCKER_DOMAIN}/acc-frontend:${CONTAINER_VERSION} -f docker/Dockerfile .
    )
fi

if [ $PUSH_MONGO == true ];then
    echo ""
    echo "==> Building MONGO-DB"
    (
        cd mongo-db; \
        docker build -t ${DOCKER_DOMAIN}/acc-mongodb:${CONTAINER_VERSION} -f Dockerfile .
    )
fi

