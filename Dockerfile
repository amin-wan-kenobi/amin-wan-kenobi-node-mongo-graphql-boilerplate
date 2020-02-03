FROM node:10-alpine
WORKDIR /boilerplate_apis
EXPOSE 3000
COPY . .

CMD [ "npm", "start" ]
