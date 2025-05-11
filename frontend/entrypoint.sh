#!/bin/bash
set -e

# Generate SSL certificates if they don't exist
if [ ! -f /app/certs/cert.pem ] || [ ! -f /app/certs/key.pem ]; then
  echo "Generating SSL certificates for frontend..."
  mkdir -p /app/certs
  cd /app/certs
  openssl genrsa -out key.pem 2048
  openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj '/CN=localhost'
  cd /app
fi

# Start the webpack dev server (it will use the HTTPS config from webpack.config.js)
echo "Starting frontend server with HTTPS..."
exec npm run dev