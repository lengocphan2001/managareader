# Use the official Node.js 20 image as the base image
FROM node:20-alpine

# Create and set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Set environment variables from the .env file (if it exists)
COPY .env.docker.local* .env

# Build the Next.js application
RUN run build

# Expose the port that the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["yarn", "start"]
