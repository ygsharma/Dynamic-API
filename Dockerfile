FROM node:18-alpine

WORKDIR /app

COPY package* /app/

RUN npm install

COPY . /app/

RUN npm run build

CMD ["npm", "start"]

