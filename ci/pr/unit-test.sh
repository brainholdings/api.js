#!/bin/bash

set -ex

: "${IMAGE_NAME:?IMAGE_NAME is required}"

docker run -t --rm \
       --entrypoint bash \
       $IMAGE_NAME \
       -c "npx lerna run test:unit"