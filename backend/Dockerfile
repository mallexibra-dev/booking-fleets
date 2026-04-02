# Backend Dockerfile - Fleet Management API
FROM oven/bun:1 AS base

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3000

# Run development server
CMD ["bun", "run", "dev"]
