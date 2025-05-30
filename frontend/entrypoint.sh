#!/bin/bash
set -e

# Wait for backend to generate certificates in shared volume
echo "Checking for SSL certificates..."
sleep 3

if [ ! -f /app/certs/cert.pem ] || [ ! -f /app/certs/key.pem ]; then
  echo "SSL certificates not found in shared volume. Backend should generate them first."
  sleep 5
fi

# Start the webpack dev server (it will use the HTTPS config from webpack.config.js)
echo "Starting frontend server with HTTPS..."
exec npm run dev