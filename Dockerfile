FROM gcr.io/distroless/nodejs:18

WORKDIR /var/server

COPY dist ./dist
COPY build ./build
COPY node_modules ./node_modules
COPY package.json .

ENV NODE_ENV production
EXPOSE 9000
CMD ["--es-module-specifier-resolution=node", "build/backend/server.js"]
