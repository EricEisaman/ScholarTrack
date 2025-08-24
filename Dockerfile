# Use Node.js 24 Alpine for smaller image size
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Create dist directory
RUN mkdir -p dist/server

# Build the application
RUN npm run build:server
RUN npm run build:client

# Expose port
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV VITE_TEACHER_CODE=5678

# Start the application
CMD ["npm", "start"]
