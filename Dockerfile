FROM oven/bun:1-slim
WORKDIR /app
COPY package*.json bun.lock ./
RUN bun install
COPY . .
# Build the frontend
RUN bun run build
# No TypeScript build needed - Bun runs it directly
ENV NODE_ENV=production
EXPOSE 8080
CMD ["bun", "run", "server.ts"]