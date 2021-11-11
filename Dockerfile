FROM node:16 as spread_tests


RUN apt-get update \
    && apt-get install -y fonts-freefont-ttf
    #ttf-freefont 

RUN useradd test
USER test

ENTRYPOINT []