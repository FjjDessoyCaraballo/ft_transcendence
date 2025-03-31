# Use Node.js as the base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript files
RUN npx tsc

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 9000

# Command to run the application
CMD ["npm", "run", "dev"]