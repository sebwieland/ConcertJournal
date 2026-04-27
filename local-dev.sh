#!/bin/bash

# Local development script for Concert Journal
#
# Usage:
#   ./local-dev.sh          # Backend in Docker (default)
#   ./local-dev.sh native   # Backend via Maven (faster, needs Java 21)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MODE="${1:-docker}"

# Check if Docker is running (needed for MySQL in both modes)
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

if [ "$MODE" = "native" ]; then
  echo -e "${YELLOW}Starting Concert Journal (native backend)...${NC}"

  # Start only MySQL
  docker-compose up -d mysql
  echo -e "${YELLOW}Waiting for MySQL...${NC}"
  until docker exec concert-journal-mysql mysqladmin ping -h localhost -u user -ppassword --silent 2>/dev/null; do
    sleep 2
  done
  echo -e "${GREEN}MySQL is ready!${NC}"

  # Start backend in background
  echo -e "${YELLOW}Starting backend via Maven...${NC}"
  cd backend
  JWT_SECRET='dev-secret-change-in-production!' ./mvnw spring-boot:run -Dspring.profiles.active=dev &
  BACKEND_PID=$!
  cd ..

  # Wait for backend
  echo -e "${YELLOW}Waiting for backend...${NC}"
  until curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; do
    sleep 2
  done
  echo -e "${GREEN}Backend is up!${NC}"

else
  echo -e "${YELLOW}Starting Concert Journal (Docker backend)...${NC}"

  docker-compose --profile dev up -d mysql backend

  echo -e "${YELLOW}Waiting for backend...${NC}"
  until curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; do
    sleep 2
  done
  echo -e "${GREEN}Backend is up!${NC}"
fi

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd frontend
npm run start:local

# Cleanup on exit
if [ -n "$BACKEND_PID" ]; then
  echo -e "${YELLOW}Stopping backend...${NC}"
  kill $BACKEND_PID 2>/dev/null
fi
