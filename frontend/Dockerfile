# Base stage for shared dependencies
FROM node:20-slim AS base
WORKDIR /app
# Copy package files first for better caching
COPY package*.json ./
# Install dependencies with npm install to update lock file
RUN npm install && \
    # Install additional packages needed for development
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Build stage
FROM base AS build
# Copy source files after dependency installation to leverage caching
COPY . .

# Set environment variables
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV="production"

# Copy source files after dependency installation to leverage caching
COPY . .

# Build the application with explicit environment variables
RUN NODE_ENV=production \
    VITE_ENSURE_COMPONENTS=true \
    npm run build

# Development stage - serve static files
FROM node:20-slim
WORKDIR /app
# Copy built files from build stage
COPY --from=build /app/dist ./dist
# Install serve globally for production mode
RUN npm install -g serve

# Expose ports
EXPOSE 3000
EXPOSE 24678

# Use environment variable to determine startup command - this is only used for the build stage
CMD ["serve", "-s", "dist", "-p", "3000", "--single"]

# Development stage for local development with HMR
FROM base AS development
# No need to copy source files as they will be mounted as volumes
# Set environment variables for development
ENV NODE_ENV=development \
    VITE_HMR=true \
    VITE_FAST_REFRESH=true \
    HMR_HOST=0.0.0.0 \
    HMR_PORT=24678

# Expose ports for development
EXPOSE 3000
EXPOSE 24678

# Start development server
CMD ["npm", "run", "start:docker"]
