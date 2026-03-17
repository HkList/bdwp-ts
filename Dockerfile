FROM oven/bun:latest AS builder

WORKDIR /app

# 先复制依赖清单，尽量利用 Docker 层缓存
COPY package.json bun.lock ./
COPY patches ./patches
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend-vue/package.json ./apps/frontend-vue/package.json

RUN bun install --frozen-lockfile

COPY . .

# 构建前后端
RUN bun run build

# 将前端构建产物复制到后端的 public 目录
RUN rm -rf apps/backend/public/* && cp -r apps/frontend-vue/dist/* apps/backend/public/

FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/apps/backend/dist/app ./app
COPY --from=builder /app/apps/backend/public ./public

ENV NODE_ENV=production
ENV APP_PORT=3000

EXPOSE 3000

CMD ["./app"]
