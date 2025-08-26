# Use Node.js 24 for better compatibility
FROM node:24

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

# Build the application (unified build process)
RUN npm run build

# Ensure proper file permissions for static assets (after build)
RUN chmod -R 755 client/dist/ && \
    if [ -d "client/dist/icons" ]; then \
        chmod -R 755 client/dist/icons/; \
    else \
        echo "Warning: client/dist/icons directory not found"; \
    fi

# Expose port
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV VITE_TEACHER_CODE=5678

# Start the application
CMD ["npm", "start"]
