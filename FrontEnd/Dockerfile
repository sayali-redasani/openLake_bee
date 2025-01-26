# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first
COPY package*.json ./

# Install the dependencies
RUN npm -f install

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on (default for React is 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
