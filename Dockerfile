FROM node:12

WORKDIR /usr/src/allbadcards
COPY . .
RUN yarn install
WORKDIR /usr/src/allbadcards/client
RUN yarn install
WORKDIR /usr/src/allbadcards/server
RUN yarn install
WORKDIR /usr/src/allbadcards
RUN yarn build

CMD ["yarn", "start"]