```markdown
# Docker Deployment Guide

## Docker Architecture

```
┌────────────────────────────────────────────────┐
│              Docker Host                       │
│  ┌──────────────────────────────────────────┐  │
│  │   Docker Network: qr-order-network       │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  |
│  │  │ MySQL   │  │ Redis   │  │ Backend │   │  │  
│  │  │ :3306   │  │ :6379   │  │ :5000   │   │  │
│  │  └─────────┘  └─────────┘  └─────────┘   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │Customer │  │ Admin   │  │ Nginx   │   │  │
│  │  │ :3000   │  │ :3001   │  │ :80     │   │  |
│  │  └─────────┘  └─────────┘  └─────────┘   │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

## 1. Docker Images

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Add build steps if needed
# RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 5000

CMD ["node", "server.js"]
```

### Frontend Customer Dockerfile

```dockerfile
# frontend-customer/Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Frontend Admin Dockerfile

```dockerfile
# frontend-admin/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 2. Docker Compose Files

### Development (docker-compose.yml)

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: qr-order-mysql-dev
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${DB_NAME:-qr_order_db}
      MYSQL_USER: ${DB_USER:-qruser}
      MYSQL_PASSWORD: ${DB_PASSWORD:-qrpassword}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - qr-order-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: qr-order-redis-dev
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - qr-order-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: base
    container_name: qr-order-backend-dev
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME:-qr_order_db}
      DB_USER: ${DB_USER:-qruser}
      DB_PASSWORD: ${DB_PASSWORD:-qrpassword}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - qr-order-network
    command: npm run dev

  frontend-customer:
    build:
      context: ./frontend-customer
      dockerfile: Dockerfile
      target: base
    container_name: qr-order-customer-dev
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000/api/v1
      NEXT_PUBLIC_SOCKET_URL: http://localhost:5000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-customer:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - qr-order-network
    command: npm run dev

  frontend-admin:
    build:
      context: ./frontend-admin
      dockerfile: Dockerfile.dev
    container_name: qr-order-admin-dev
    environment:
      VITE_API_URL: http://backend:5000/api/v1