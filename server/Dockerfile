FROM node:16 as spread_server 

WORKDIR /usr/src/app

COPY . .

COPY --from=spread_common /usr/src/app/dist /usr/src/spread_game/dist

RUN npm install
RUN npm run build

ENTRYPOINT []