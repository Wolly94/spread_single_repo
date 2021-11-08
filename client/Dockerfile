FROM node:16 as spread_client

WORKDIR /usr/src/app

COPY . .

COPY --from=spread_common /usr/src/app/dist /usr/src/spread_game/dist
## this must be added or there will be error on 'npm run start'
COPY --from=spread_common /usr/src/app/package.json /usr/src/spread_game/package.json

RUN npm install || 1
##RUN npm run build

ENTRYPOINT []