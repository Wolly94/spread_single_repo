#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

kill_process()
{
    echo killing process on port $1
    kill $(lsof -t -i:$1) &> /dev/null
}

# kill processes started in setup_integration_tests.sh
kill_process $CLIENT_PORT
kill_process $CLIENT_2_PORT
kill_process $WEB_API_PORT
for i in $(seq $WEB_API_PORT_RANGE_LOWER_BOUND $WEB_API_PORT_RANGE_UPPER_BOUND); 
    do kill_process $i; 
done

exit 0