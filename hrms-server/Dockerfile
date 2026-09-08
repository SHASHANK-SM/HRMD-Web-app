FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads logs
ENV NODE_ENV=PRODUCTION
EXPOSE 5000
CMD ["node", "app.js"]
