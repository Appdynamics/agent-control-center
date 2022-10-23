#!/bin/bash

DOMAIN_PARAM=appdynamics
echo "============================================"
echo "Stopping docker-compose with images from [${DOMAIN_PARAM}]"
(  export DOMAIN=${DOMAIN_PARAM} && export VERSION=${VERSION} && docker-compose -f docker-compose.yml down )
echo "============================================"
