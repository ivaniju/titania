FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.js ./
COPY lib ./lib
COPY migrations ./migrations
COPY scripts ./scripts
COPY data ./data
COPY public ./public

# El banco se valida al construir: una imagen con preguntas inválidas no llega a existir.
RUN node scripts/check-bank.js

USER node
EXPOSE 3000

# Las migraciones se aplican antes de arrancar; si fallan, el contenedor no sirve tráfico.
CMD ["sh", "-c", "node scripts/migrate.js && exec node server.js"]
