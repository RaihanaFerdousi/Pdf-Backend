# Stage 1: Build/Setup
FROM node:20-slim AS builder

# Install system dependencies for Puppeteer and PDF tools
# libgbm1, nss, and fontconfig are essential for headless chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgbm1 \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    libpangocairo-1.0-0 \
    libxss1 \
    fonts-liberation \
    libappindicator3-1 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libnspr4 \
    libpango-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    lsb-release \
    xdg-utils \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of your application
COPY . .

# Ensure the AppImage and upload directories have correct permissions
RUN chmod +x ./pdf2htmlEX.AppImage && \
    mkdir -p uploads converted && \
    chmod 777 uploads converted

# Set Environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "index.js"]