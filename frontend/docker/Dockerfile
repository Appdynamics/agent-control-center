# BUILDER
FROM node:18-slim AS builder
WORKDIR /builder
COPY . .
RUN npm install
RUN npm run build

# APP
FROM nginx:latest
RUN apt-get update
RUN apt-get install -y procps binutils vim curl iputils-ping telnet unzip -y

ENV NODE_ENV production
ENV TS_NODE_FILES true
ENV ACC_API_SERVER /api

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /builder/build /usr/share/nginx/html
# COPY --from=builder /builder/node_modules /usr/share/nginx/html/node_modules

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/scripts/env.template.js > /usr/share/nginx/html/assets/scripts/env.js && exec nginx -g 'daemon off;'"]

