FROM oven/bun:1 AS builder

WORKDIR /app

# Use wildcards so it won't fail if some lockfiles are absent
COPY package.json package-lock.json* bun.lockb* bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
