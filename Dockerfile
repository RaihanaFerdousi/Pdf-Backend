FROM node:20-slim

# Install ONLY the essential libraries for PDF rendering & font support
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 \
    libglib2.0-0 \
    libxrender1 \
    libxext6 \
    libx11-6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Ensure the AppImage is executable
RUN chmod +x ./pdf2htmlEX.AppImage && \
    mkdir -p uploads converted && \
    chmod 777 uploads converted

EXPOSE 3001
CMD ["node", "index.js"]