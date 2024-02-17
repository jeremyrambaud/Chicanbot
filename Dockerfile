FROM node:16

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node ./ ./

USER node

RUN yarn install

CMD ["yarn", "run", "start:prod"]
