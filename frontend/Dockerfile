# Use Node.js as the base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Tailwind CSS
RUN npm install tailwindcss postcss autoprefixer

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install a simple server to serve the built files
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 80

# Command to run the application
CMD ["serve", "-s", "build", "-l", "80"]