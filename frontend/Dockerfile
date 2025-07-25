# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
# Add logging and install dependencies
RUN echo "Node version: $(node -v)" && \
    echo "NPM version: $(npm -v)" && \
    # Install dependencies with npm install to update lock file
    npm install && \
    # Skip Rollup native dependencies on Alpine (musl) - they're optional
    echo "Skipping Rollup native dependencies on Alpine Linux"

# We'll mount the source code as a volume
EXPOSE 3000
EXPOSE 24678
# The command will be provided by docker-compose.yml

# Build stage
FROM base AS build
# Add logging and install dependencies
RUN echo "Node version: $(node -v)" && \
    echo "NPM version: $(npm -v)" && \
    # Install dependencies with npm install to update lock file
    npm install && \
    # Skip Rollup native dependencies on Alpine (musl) - they're optional
    echo "Skipping Rollup native dependencies on Alpine Linux"

# Copy source files after dependency installation to leverage caching
COPY . .

# Build the application with explicit environment variables
RUN NODE_ENV=production \
    VITE_ENSURE_COMPONENTS=true \
    npm run build

# Production stage - using smaller alpine image
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-p", "80"]
