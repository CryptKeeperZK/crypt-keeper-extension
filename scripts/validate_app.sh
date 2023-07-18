#!/bin/bash

containers_running=$(docker ps --format "{{.Status}}" | grep -ci up)
[ $containers_running -eq 2 ] || exit 1

exposed_ports=$(netstat -lnt4 | egrep -cw '8090|1234')
[ $exposed_ports -eq 2 ] || exit 1

exit 0
