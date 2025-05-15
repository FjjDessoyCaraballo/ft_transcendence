FROM node:20.13.1-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install system dependencies including OpenSSL and SQLite
# Use apt-get with optimizations for Docker
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    sqlite3 \
    openssl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Node.js dependencies
RUN npm install --no-audit --production

# Create directories
RUN mkdir -p /app/data /app/certs
RUN chmod 700 /app/data

# Copy the application code
COPY . /app/

# Make the scripts executable
RUN chmod +x /app/entrypoint.sh
RUN chmod +x /app/init_sqlite.sh

# Expose the port the server will run on
EXPOSE 3443

# Set the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]