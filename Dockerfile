FROM node:10.15

WORKDIR /app

ARG node_env='production'
ENV NODE_ENV=$node_env

COPY ./src /app/src
COPY ./config /app/config
COPY ./migrations /app/migrations
COPY ./package.json /app/package.json

RUN npm install --silent

RUN git clone https://github.com/vishnubob/wait-for-it.git

CMD ["npm", "run", "start"]
