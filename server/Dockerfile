# --- BUILD STAGE ---
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:24-slim

WORKDIR /app

COPY package*.json .
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

RUN useradd -m appuser && chown -R appuser:appuser /app

USER appuser

# HTTP
EXPOSE 3010
# WS
EXPOSE 3020

CMD [ "node", "dist/app.js" ]
