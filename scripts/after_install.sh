#!/bin/bash
set -e
 
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com
 
exit 0
