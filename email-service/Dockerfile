# Dockerfile
FROM node:14

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose the port
EXPOSE 5005

# Start the application
CMD ["node", "src/app.js"]
