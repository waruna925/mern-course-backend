#import base image
FROM node:24-alpine

#working directory
WORKDIR /app

#copy the package*.json
COPY package*.json .

#install packages
RUN npm install

#copy source code
COPY . .

#expose the port
EXPOSE 5000

#run program
CMD [ "npm","start" ]