FROM node:16

USER root

RUN add-apt-repository ppa:ethereum/ethereum

RUN apt-get update && \
    apt-get -y install curl && \
    apt-get -y install git && \
    apt-get -y install solc


RUN npm install -g npm@latest

RUN node --version && yarn --version

WORKDIR /app/

RUN yarn