#!/bin/bash

cd server
docker build . -t myapp_server
docker run --expose=9010 -p 9010:9010 -d myapp_server ./run_server.sh 9010

cd ../client
docker build . -t myapp_client
docker run --expose=9000 -p 9000:9000 -dit myapp_client ./run_client.sh 9000