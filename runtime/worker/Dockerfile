FROM node:22-bookworm-slim
RUN useradd --create-home --uid 10001 worker
WORKDIR /app
COPY package.json ./
COPY worker ./worker
RUN mkdir -p /tmp/gitpilot-runs && chown -R worker:worker /tmp/gitpilot-runs /app
USER worker
CMD ["node", "worker/server.js"]
