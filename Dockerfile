FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY server/ ./server/
COPY sdk/ ./sdk/

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=5000
ENV DATA_DIR=/app/data

EXPOSE 5000

CMD ["node", "server/server.js"]
