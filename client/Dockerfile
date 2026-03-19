# --- BUILD STAGE ---
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

RUN --mount=type=cache,target=/app/.next/cache npm run build

# --- PRODUCTION STAGE --- 
FROM node:24-slim

WORKDIR /app

COPY package*.json .
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD [ "npm", "run", "start" ]