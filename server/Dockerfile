FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

EXPOSE 3030

EXPOSE 3040

CMD [ "npm", "run", "dev" ]