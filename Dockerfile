FROM node:20

WORKDIR /app

# Archivos necesarios
COPY package.json ./
COPY mongo-node-lab/package.json ./mongo-node-lab/
COPY server.js ./
COPY mongo-node-lab ./mongo-node-lab

RUN npm install

EXPOSE 3001

CMD ["node", "server.js"]