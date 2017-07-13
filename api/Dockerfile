FROM node:8-alpine
MAINTAINER "WangWei" <cnetwei@gmail.com>

# Prepare work directory and copy all files
RUN mkdir /app
WORKDIR /app

COPY . .

# install dependencies
RUN npm install --production

ENV port 80
CMD ["npm", "run", "start"]
