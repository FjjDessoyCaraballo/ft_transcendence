# Use Node.js as the base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install SQLite CLI tool
RUN apt-get update && apt-get install -y sqlite3

# Install Fastify and other required packages
RUN npm install fastify @fastify/cors @fastify/static @fastify/jwt
RUN npm install sqlite3 better-sqlite3
RUN npm install fastify-socket.io
RUN npm install bcrypt

# Install bcrypt for password hashing
RUN npm install bcrypt

# Create directory for the SQLite database
RUN mkdir -p /app/data
RUN chmod 700 /app/data

# Copy the rest of the application code
COPY init_sqlite.sh /app/init_sqlite.sh
RUN chmod +x /app/init_sqlite.sh

# Expose the port the server will run on
EXPOSE 3000

# Command to run the server
CMD ["/bin/bash", "-c", "/app/init_sqlite.sh && node src/server.js"]