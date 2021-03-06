#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

echo "$CLIENT_PORT"
echo "$WEB_API_PORT_RANGE_LOWER_BOUND"

cd ../client/
./run_client.sh "$CLIENT_PORT" &> /dev/null &
echo running client on port $CLIENT_PORT
./run_client.sh "$CLIENT_2_PORT" &> /dev/null &
echo running client on port $CLIENT_2_PORT

cd ../server/
./run_server.sh "$WEB_API_PORT" "$WEB_API_PORT_RANGE_LOWER_BOUND" "$WEB_API_PORT_RANGE_UPPER_BOUND" &> /dev/null &
echo running server on ports $WEB_API_PORT and $WEB_API_PORT_RANGE_LOWER_BOUND to $WEB_API_PORT_RANGE_UPPER_BOUND