FROM node:16

USER root

RUN apt-get update && \
    apt-get -y install curl && \
    apt-get -y install git

RUN npm install -g npm@latest

RUN node --version && yarn --version

WORKDIR /app/

RUN yarn
