#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ../zkeyFiles
http-server -p 8095 --cors

