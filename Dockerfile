FROM gcr.io/distroless/nodejs20-debian12

USER root
user apprunner
ENV TZ="Europe/Oslo"
WORKDIR /var/server

COPY assets ./assets
COPY dist ./dist
COPY build ./build
COPY node_modules ./node_modules
COPY package.json .

ENV NODE_ENV production
EXPOSE 9000
CMD ["--es-module-specifier-resolution=node", "build/backend/server.js"]
