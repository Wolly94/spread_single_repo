FROM node:16 as build

WORKDIR /usr/src/app

COPY . .

RUN npm install || 1
##RUN npm run build

ENTRYPOINT ["./run_client.sh"]