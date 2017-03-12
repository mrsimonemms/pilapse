############################################
# Docker                                   #
#                                          #
# A container that enables the application #
# to run                                   #
############################################

FROM alexellis2/raspistill:latest

MAINTAINER Simon Emms <simon@simonemms.com>

# Set the work directory and add the project files to it
WORKDIR /opt/app
ADD . /opt/app
ENTRYPOINT []

VOLUME /var/image

ENV LOG_LEVEL=info

# Install NodeJS and AVConv
RUN apt-get update
RUN apt-get -y install libav-tools curl
RUN curl https://nodejs.org/dist/v6.10.0/node-v6.10.0-linux-$(uname -m).tar.xz -o /tmp/nodejs.tar.xz
RUN tar -xf /tmp/nodejs.tar.xz -C /tmp
RUN mv /tmp/node-v6.10.0-linux-$(uname -m) /opt/nodejs
RUN ln -s /opt/nodejs/bin/node /usr/bin/node
RUN ln -s /opt/nodejs/bin/npm /usr/bin/npm
RUN echo "node version: $(node --version)"
RUN echo "npm version: $(npm --version)"

RUN npm install --production

# Run run run
CMD npm start
