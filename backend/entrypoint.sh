#!/bin/bash
set -e

# Generate SSL certificates if they don't exist
if [ ! -f /app/certs/cert.pem ] || [ ! -f /app/certs/key.pem ]; then
  echo "Generating SSL certificates..."
  mkdir -p /app/certs
  cd /app/certs
  openssl genrsa -out key.pem 2048
  openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj '/CN=localhost'
  cd /app
fi

# Initialize the SQLite database
echo "Initializing database..."
/app/init_sqlite.sh

# Start the application
echo "Starting server..."
exec node src/server.js