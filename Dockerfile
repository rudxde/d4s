FROM docker:dind

RUN apk add nodejs npm


# FROM node:14

WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY ./tsconfig.json ./
COPY ./src ./src
RUN npm run build

CMD [ "npm", "start" ]
