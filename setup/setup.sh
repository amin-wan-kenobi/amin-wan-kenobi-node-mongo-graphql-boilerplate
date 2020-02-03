#!/bin/bash
echo "*********************************************"
echo "Starting ReplicaSet"
echo "*********************************************"

sleep 5 | echo Sleeping
mongo mongodb://mongo replicaSet.js
