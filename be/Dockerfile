# Base image
FROM node:23-slim

# Create app directory
WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy app source
COPY . .

# Build app
RUN pnpm build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start app
CMD ["pnpm", "start:dev"]
