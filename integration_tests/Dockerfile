FROM node:16 as spread_integration_tests

WORKDIR /usr/src/app

COPY . .

#RUN npm install

RUN apt-get update
RUN apt-get install gettext-base

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst \
    fonts-freefont-ttf \
#ttf-freefont \
        --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /etc/apt/sources.d.list/google.list

#RUN apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
#    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 \
#    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
#    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
#    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

#RUN apk add --no-cache \
#    udev \
#    ttf-freefont \
#    chromium

## required for setup
COPY --from=spread_common /usr/src/app/dist /usr/src/spread_game/dist
## this must be added or there will be error on 'npm run start'
COPY --from=spread_common /usr/src/app/package.json /usr/src/spread_game/package.json

COPY --from=spread_client /usr/src/app/ /usr/src/client/
COPY --from=spread_client /usr/src/app/package.json /usr/src/client/package.json

COPY --from=spread_server /usr/src/app/ /usr/src/server/
COPY --from=spread_server /usr/src/app/package.json /usr/src/server/package.json

RUN ./setup_integration_tests.sh

#RUN useradd test
#USER test

# Install node modules
RUN npm i\
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    && groupadd -r runner && useradd -r -g runner -G audio,video runner \
    && mkdir -p /home/runner/Downloads \
    && chown -R runner:runner /usr/src/app \
    && chown -R runner:runner /usr/src/app/node_modules

USER runner

ENTRYPOINT []