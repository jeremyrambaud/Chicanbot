FROM node:lts-alpine
RUN apk add --no-cache --virtual \
  .gyp \
  python3 \
  make \
  g++

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

USER node

RUN yarn install

COPY --chown=node:node dist/. .

CMD ["yarn", "start:prod"]
