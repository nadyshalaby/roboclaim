# Base image
FROM node:23

# Install build dependencies, Tesseract OCR, Leptonica, and comprehensive image format support
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    procps \
    tesseract-ocr \
    libtesseract-dev \
    libleptonica-dev \
    libpng-dev \
    libtiff-dev \
    libjpeg-dev \
    libgif-dev \
    libwebp-dev \
    libopenjp2-7-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

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

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# No CMD here since we're using docker-compose command
