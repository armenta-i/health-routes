FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install expo --save

RUN npm install -g expo@52.0.46

COPY . .

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

CMD ["npx", "expo", "start"]
