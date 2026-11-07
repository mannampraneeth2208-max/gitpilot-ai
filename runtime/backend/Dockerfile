FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY backend ./backend
CMD ["node", "backend/server.js"]
