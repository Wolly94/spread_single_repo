FROM node:16 as spread_integration_tests

RUN apt-get update
# these are used in scripts
RUN apt-get install -y gettext-base lsof
RUN apt-get install -y chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true    

## required for setup
COPY --from=spread_common /usr/src/app/dist /usr/src/spread_game/dist
## this must be added or there will be error on 'npm run start'
COPY --from=spread_common /usr/src/app/package.json /usr/src/spread_game/package.json

COPY --from=spread_client /usr/src/app/ /usr/src/client/
COPY --from=spread_client /usr/src/app/package.json /usr/src/client/package.json

COPY --from=spread_server /usr/src/app/ /usr/src/server/
COPY --from=spread_server /usr/src/app/package.json /usr/src/server/package.json

#RUN ./setup_integration_tests.sh

#RUN useradd test
#USER test

WORKDIR /usr/src/app

COPY . .

RUN npm install

ENTRYPOINT []