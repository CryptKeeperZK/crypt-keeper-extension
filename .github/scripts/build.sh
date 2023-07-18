#!/bin/bash

build=$1

[ $build = "enable" ] || exit 0

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -f apps/demo/Dockerfile -t crypt-keeper-extension-demo .
docker tag crypt-keeper-extension-demo:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/crypt-keeper-extension-demo:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/crypt-keeper-extension-demo:latest

docker build -f apps/merkle/Dockerfile -t crypt-keeper-extension-merkle .
docker tag crypt-keeper-extension-merkle:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/crypt-keeper-extension-merkle:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/crypt-keeper-extension-merkle:latest

exit 0
