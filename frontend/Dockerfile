FROM node:20.13.1-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install dependencies
RUN npm install

# Install webpack and other dev dependencies
RUN npm install i --save-dev @types/node webpack webpack-cli webpack-dev-server html-webpack-plugin ts-loader style-loader css-loader postcss-loader

# Install React and TypeScript definitions
RUN npm install react react-dom @types/react @types/react-dom --save

# Install Chart.js for Dashboard data graphs
RUN npm install chart.js react-chartjs-2 

# Install React Router DOM for back and forward functionality
RUN npm install react-router-dom

# Install i18next and react-i18nect for multi-language support
RUN npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend

# Copy the rest of the application code
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port the app will run on
EXPOSE 9000

# Set the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]