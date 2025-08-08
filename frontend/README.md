# Concert Journal Frontend

This is the frontend application for the Concert Journal project, built with React, TypeScript, and Vite.

## Development Approaches

This project supports two development approaches:

1. **Hybrid Approach (Recommended)**: Run the frontend locally and the backend in Docker
2. **Full Docker Approach**: Run both frontend and backend in Docker

The hybrid approach is recommended for frontend development as it provides a significantly better developer experience with faster hot reloading.

### Core Requirements for Hot Reloading

1. **Vite Configuration**
   - HMR settings in `vite.config.ts` with proper host and port
   - WebSocket port exposed in Docker
   - File watching configured with polling (checks every 500ms)
   - **Note:** Despite the polling interval configuration, actual hot reloading may take around 10 seconds in practice due to Docker volume performance and rebuild time

2. **Docker Configuration**
   - Source code mounted as a volume
   - Node modules in a named volume
   - HMR WebSocket port (24678) exposed

3. **Environment Variables**
   - NODE_ENV set to "development"
   - HMR-related variables properly configured

4. **CORS Configuration**
   - Backend allowing connections from the frontend development server

### Running in Development Mode

To start the application in development mode with hot reloading:

```bash
# Using the development script
./frontend/dev.sh

# Or manually with docker-compose
NODE_ENV=development docker-compose up frontend
```

### Testing Hot Reloading

1. Open your browser at http://localhost:3000
2. Make a change to a source file (e.g., frontend/src/components/LandingPage.tsx)
3. Observe the browser automatically updating with your changes

### Troubleshooting

If hot reloading isn't working:

1. Check browser console for WebSocket connection errors
2. Verify Docker container logs for Vite errors
3. Ensure the HMR port (24678) is properly exposed
4. Check that volume mounts are correctly configured
5. Verify CORS settings in the backend allow connections from the frontend

### Performance Considerations

#### Why Hot Reload is Slow in Docker

Hot Module Replacement (HMR) in Docker environments is inherently slower than on a local machine for several reasons:

1. **Docker Volume Mounting Overhead**
   - File changes must propagate from the host to the container filesystem
   - The `:delegated` mount flag improves performance but still adds latency
   - I/O operations across container boundaries have significant overhead

2. **Polling vs. Native File System Events**
   - Docker environments must use polling instead of native filesystem events
   - Polling checks file timestamps at intervals rather than receiving immediate notifications
   - Even with a 200ms polling interval, the actual detection can be delayed

3. **Rebuild Process Complexity**
   - After detecting a change, Vite must:
     - Determine which modules are affected
     - Transpile TypeScript/JSX files
     - Update the dependency graph
     - Bundle the affected modules
     - Send updates via WebSocket to the browser

4. **Resource Constraints**
   - Docker containers often have limited CPU/memory compared to the host
   - Node.js memory constraints affect build performance

#### Optimization Options

You can adjust the polling settings in `vite.config.ts`:
```javascript
watch: {
    usePolling: true,
    interval: 200,         // Polling interval for regular files (ms)
    binaryInterval: 200    // Polling interval for binary files (ms)
}
```

For significantly better development performance, consider:
1. Running the frontend directly on your host machine (outside Docker)
2. Increasing container resources in docker-compose.yml
3. Using named volumes with proper synchronization
4. Reducing the size of your application or splitting it into smaller modules

### Key Files

- **vite.config.ts**: Contains the essential HMR configuration
- **docker-compose.yml**: Configures the Docker environment for development
- **.env.dev-local**: Sets environment variables for local development (hybrid approach)
- **package.json**: Contains simplified npm scripts for development

**Note:** The hybrid approach only requires the `.env.dev-local` file. If you want to use the full Docker approach or build for production, you would need to create additional environment files (`.env.development` and `.env.production`).

## Hybrid Development Approach (Recommended)

### Why Hybrid Development?

Running the frontend locally while keeping the backend in Docker provides several advantages:

- **Much faster hot reloading** - Changes are detected instantly via native file system events
- **Better developer experience** - Immediate feedback loop improves productivity
- **Simpler frontend setup** - Fewer configuration files and environment variables to manage
- **Consistent backend environment** - Backend services still run in Docker for consistency

### Setup Instructions

1. **Start the backend services in Docker:**
   ```bash
   # Start only the backend and database
   docker-compose up backend mysql
   ```

2. **Install frontend dependencies locally:**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the frontend locally:**
   ```bash
   # From the frontend directory
   npm run start:local
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Troubleshooting

- If you encounter CORS issues, ensure the backend's CORS configuration includes `http://localhost:3000`
- If you can't connect to the backend, check that the backend container is running and accessible
- If hot reloading isn't working, ensure you're using the `start:local` script which disables polling

### How It Works

The hybrid approach uses:

- **Local frontend**: Runs directly on your machine using native file system events for instant hot reloading
- **Containerized backend**: Runs in Docker for consistent environment and dependencies
- **Configuration**:
  - `.env.dev-local` file for local environment settings
  - `vite.config.ts` detects dev-local mode and optimizes settings
  - Backend CORS allows connections from localhost:3000

#### Helper Script

We've provided a helper script (`local-dev.sh`) in the root of the repository that sets up everything for you:

```bash
# Make the script executable (if needed)
chmod +x local-dev.sh

# Run the script
./local-dev.sh
```

This script will:
1. Start the backend services in Docker
2. Wait for them to be ready
3. Start the frontend locally with the correct configuration

- If you encounter CORS issues, ensure the backend's CORS configuration includes `http://localhost:3000`
- If you can't connect to the backend, check that the backend container is running and accessible

## Full Docker Approach

If you prefer to run everything in Docker (e.g., for full-stack testing or CI/CD), you can still use the Docker setup:

```bash
# Start everything in Docker
docker-compose up
```

See the "Performance Considerations" section for information about hot reloading performance in Docker.

## Available Scripts

- `npm run start:local`: Start the development server locally (outside Docker)
- `npm run start:dev`: Start the development server with HMR in Docker
- `npm run start:prod`: Serve the production build
- `npm run build`: Build for production
- `npm run test`: Run tests