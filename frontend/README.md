# Concert Journal Frontend

This is the frontend application for the Concert Journal project, built with React, TypeScript, and Vite.

## Documentation

For comprehensive documentation, including setup instructions, development approaches, and troubleshooting, please refer to the [main README](../README.md) in the root of the repository.

## Key Points

- **Hybrid Development Approach** (strongly recommended): Run the frontend locally and the backend in Docker for the best development experience with fast hot reloading
- **Helper Script**: Use `./local-dev.sh` in the root directory to set up the recommended development environment
- **Available Scripts**:
  - `npm run start:local`: Start the development server locally (outside Docker)
  - `npm run start:dev`: Start the development server with HMR in Docker
  - `npm run start:prod`: Serve the production build
  - `npm run build`: Build for production
  - `npm run test`: Run tests