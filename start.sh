#!/bin/bash

DOMAIN_PARAM=appdynamics
VERSION=1.0

echo "============================================"
echo "Starting docker-compose with images from [${DOMAIN_PARAM}]"
echo ""
( export DOMAIN=${DOMAIN_PARAM} && export VERSION=${VERSION} && docker-compose -f docker-compose.yml up -d )
echo ""
echo "============================================"