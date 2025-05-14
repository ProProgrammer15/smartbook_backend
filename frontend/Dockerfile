# Use the official Node.js image
FROM node:18-slim

# Set the working directory
WORKDIR /frontend-app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the React code into the container
COPY . .

# Build the React app
RUN npm run build --no-cache

# Expose the port for the frontend
EXPOSE 3000

# Serve the React app
CMD ["npm", "start"]
