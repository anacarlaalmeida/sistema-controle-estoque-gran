FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "app.js"]
