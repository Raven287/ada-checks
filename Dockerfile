# Use the latest official Node.js image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code (your static HTML files)
COPY . .

# Install axe-core, axe-cli, and serve
RUN npm install --save-dev axe-core axe-cli serve

# Start the server to serve the static HTML files and run axe-cli tests
CMD serve -s . -l 5000 & sleep 5 && npx axe-cli http://localhost:5000/index.html --save && npx axe-cli http://localhost:5000/page2.html --save
