# Use Node.js as the base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Fastify and other required packages
RUN npm install fastify @fastify/cors @fastify/static @fastify/jwt
RUN npm install sqlite3 better-sqlite3
RUN npm install bcrypt
RUN npm install fastify-socket.io

# Create directory for the SQLite database
RUN mkdir -p /app/data
RUN chmod 777 /app/data

# Copy the rest of the application code
COPY . .

# Expose the port the server will run on
EXPOSE 3000

# Command to run the server
CMD ["node", "src/server.js"]