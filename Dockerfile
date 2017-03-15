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
RUN apt-get update && \
  apt-get -y install libav-tools curl python && \
  curl https://nodejs.org/dist/v6.10.0/node-v6.10.0-linux-$(uname -m).tar.xz -o /tmp/nodejs.tar.xz && \
  tar -xf /tmp/nodejs.tar.xz -C /tmp && \
  mv /tmp/node-v6.10.0-linux-$(uname -m) /opt/nodejs && \
  ln -s /opt/nodejs/bin/node /usr/bin/node && \
  ln -s /opt/nodejs/bin/npm /usr/bin/npm && \
  echo "node version: $(node --version)" && \
  echo "npm version: $(npm --version)" && \
  npm install --production

# Run run run
CMD npm start
