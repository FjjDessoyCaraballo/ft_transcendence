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

# Start the application with HTTPS
echo "Starting frontend server with HTTPS..."
exec npm run dev -- --host 0.0.0.0 --port 9000 --https --cert /app/certs/cert.pem --key /app/certs/key.pem