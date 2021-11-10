#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

echo running server on port $1
echo game ports on $2 to $3

PORT=$1 PORT_RANGE_LOWER_BOUND=$2 PORT_RANGE_UPPER_BOUND=$3 npm run start