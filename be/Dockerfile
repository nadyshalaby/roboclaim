# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start:prod"]
