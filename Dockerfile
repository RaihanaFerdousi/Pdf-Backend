# Step 1: Use a base that already has pdf2htmlEX perfectly configured
FROM bwits/pdf2htmlex:latest

# Step 2: Install Node.js 20 (The 'bwits' image is Debian-based)
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://nodesource.com | bash -
RUN apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 3: Standard Node setup
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Step 4: Create directories (AppImage code removed, using native binary)
RUN mkdir -p uploads converted && \
    chmod 777 uploads converted

# Fly.io works best with 8080 or the PORT env var
EXPOSE 8080
ENV PORT=8080

CMD ["node", "index.js"]
