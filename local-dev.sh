#!/bin/bash

# Local development script for Concert Journal
# This script helps run the frontend locally while using containerized backend services

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Concert Journal in hybrid mode...${NC}"
echo -e "${YELLOW}This will run the frontend locally and the backend in Docker${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start the backend services
echo -e "${YELLOW}Starting backend services in Docker...${NC}"
docker-compose up -d mysql backend

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend services to be ready...${NC}"
echo -e "${YELLOW}This may take a few moments...${NC}"
sleep 10

# Check if backend is accessible
echo -e "${YELLOW}Checking if backend is accessible...${NC}"
if curl -s http://localhost:8080/actuator/health > /dev/null; then
  echo -e "${GREEN}Backend is up and running!${NC}"
else
  echo -e "${YELLOW}Backend may not be fully initialized yet. Check docker logs for details:${NC}"
  echo -e "docker-compose logs backend"
fi

# Start the frontend locally
echo -e "${YELLOW}Starting frontend locally...${NC}"
cd frontend

# Run vite directly with environment variables instead of using cross-env
echo -e "${YELLOW}Running vite directly with NODE_ENV=development...${NC}"
NODE_ENV=development npx vite --port 3000 --mode dev-local

# Note: The script will stay with the frontend process
# To stop everything when done:
# 1. Stop the frontend with Ctrl+C
# 2. Run: docker-compose down