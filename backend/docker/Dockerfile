# BUILDER FOR NODE.JS BACKEND
FROM node:18-slim AS builder

WORKDIR /builder
COPY . .
RUN npm install --save-dev --save-exact prettier
RUN npm install
RUN npm run build

FROM alpine:3.16
RUN apk update
RUN apk add --no-cache ansible
RUN apk --update --no-cache add \
    ca-certificates \
    git \
    openssh-client \
    openssl \
    python3 \
    g++ gcc \
    libxslt-dev \
    py3-pip \
    py3-cryptography \
    rsync \
    sshpass \
    ansible \
    nodejs \
    npm \
    jq

WORKDIR /app

RUN mkdir -p ./node_modules
RUN mkdir -p ./templates
RUN mkdir -p ./ansible/github

COPY --from=builder /builder/bin .
COPY --from=builder /builder/node_modules ./node_modules
COPY ./ansible ./ansible
COPY ./src/templates ./templates

RUN rm -rf ./ansible/acc
RUN rm -rf ./ansible/agent-files

RUN mkdir -p ./ansible/acc
RUN mkdir -p ./ansible/agent-files

RUN pip3 install lxml

ENV NODE_ENV production
ENV TS_NODE_FILES true
ENV ANSIBLE_PROJECT /app/ansible/github
ENV ANSIBLE_ACC_HOME /app/ansible/acc
ENV ANSIBLE_APPD_HOME /app/ansible/appd
ENV TEMPLATES_FOLDER /app/templates
ENV FOLDER_AGENT_FILES /app/ansible/agent-files

EXPOSE 8080
CMD [ "node", "-r", "ts-node/register/transpile-only", "server.js"]