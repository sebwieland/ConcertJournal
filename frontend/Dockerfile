# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Create non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodeuser && \
    chown -R nodeuser:nodejs /app

# Copy package files first for better caching
COPY --chown=nodeuser:nodejs package*.json ./

# Install dependencies with specific versions and cleanup in a single layer
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ && \
    npm ci --only=production && \
    # Create a directory for dev dependencies that will be removed in production
    mkdir -p /app/node_modules/.cache && \
    # Set proper permissions
    chown -R nodeuser:nodejs /app && \
    # Remove build dependencies to reduce image size
    apk del .build-deps

# Build stage
FROM base AS build
USER nodeuser

# Set environment variables
ENV NODE_OPTIONS="--max-old-space-size=4096" \
    NODE_ENV="production"

# Copy source files with proper ownership
COPY --chown=nodeuser:nodejs . .

# Build the application with explicit environment variables and cache optimization
RUN NODE_ENV=production \
    VITE_ENSURE_COMPONENTS=true \
    npm run build && \
    # Remove source maps in production for security and size
    find dist -name "*.map" -delete

# Production stage - serve static files
FROM node:20-alpine AS production
WORKDIR /app

# Create and use non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodeuser && \
    chown -R nodeuser:nodejs /app

# Install serve with specific version
RUN npm install -g serve@14.2.1

# Copy built files from build stage with proper ownership
COPY --from=build --chown=nodeuser:nodejs /app/dist ./dist

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1

# Use environment variable to determine startup command
CMD ["serve", "-s", "dist", "-p", "3000", "--single"]

# Development stage for local development with HMR
FROM base AS development
USER nodeuser

# Copy only necessary development files
COPY --chown=nodeuser:nodejs .eslintrc* .prettierrc* vite.config.* tsconfig.* ./

# Set environment variables for development
ENV NODE_ENV=development \
    VITE_HMR=true \
    VITE_FAST_REFRESH=true \
    HMR_HOST=0.0.0.0 \
    HMR_PORT=24678

# Expose ports for development
EXPOSE 3000
EXPOSE 24678

# Add health check for development
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1

# Start development server
CMD ["npm", "run", "start:dev"]
