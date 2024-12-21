# Use the official Node.js image.
FROM node:14

# Set the working directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application.
COPY . .

# Build native modules (if needed).
# This step can be useful if you have native dependencies that need to be rebuilt.
RUN npm rebuild bcrypt --build-from-source

# Expose the port.
EXPOSE 5000

# Start the application.
CMD ["npm", "start"]
