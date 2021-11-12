#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

docker build -t spread_client .
docker build -t client_prod -f Dockerfile.Production
docker run -p 3000:3000 -it client_prod