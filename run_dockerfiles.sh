#!/bin/bash

cd spread_game
docker build . -t spread_common

cd ../server
docker build . -t spread_server
docker run --expose=9010 -p 9010:9010 -d spread_server ./run_server.sh 9010 &

cd ../client
docker build . -t spread_client
docker run --expose=9000 -p 9000:9000 -dit spread_client ./run_client.sh 9000