FROM node:22

WORKDIR /app

RUN npm i -g pnpm@9

RUN npx playwright install --with-deps chromium

RUN pnpm config set store-dir /pnpm

