#!/bin/bash

# Local development script for Concert Journal
#
# Strategy (ADR-007 in docs/architecture): containerize the *dependencies*
# (MySQL), run the Spring Boot backend on the host for fast feedback
# (debugger, DevTools, native file watching), and the frontend locally via Vite.

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_PID=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping backend (pid $BACKEND_PID)...${NC}"
    kill "$BACKEND_PID" 2>/dev/null
    wait "$BACKEND_PID" 2>/dev/null
  fi
  echo -e "${YELLOW}MySQL container is left running (volume kept).${NC}"
  echo -e "To stop it too: docker-compose down"
}
trap cleanup EXIT INT TERM

echo -e "${YELLOW}Starting Concert Journal (MySQL in Docker, backend + frontend on host)...${NC}"

if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Make sure no stale backend container occupies port 8080
docker-compose --profile dev rm -sf backend 2>/dev/null

# Start MySQL
echo -e "${YELLOW}Starting MySQL in Docker...${NC}"
docker-compose --profile dev up -d mysql

echo -e "${YELLOW}Waiting for MySQL to be healthy...${NC}"
until [ "$(docker inspect --format='{{.State.Health.Status}}' concert-journal-mysql 2>/dev/null)" = "healthy" ]; do
  sleep 2
done
echo -e "${GREEN}MySQL is ready.${NC}"

# Secrets & config for the host-run backend
export JWT_SECRET="${JWT_SECRET:-local-dev-secret-that-is-definitely-over-32-bytes-long}"
echo -e "${YELLOW}JWT_SECRET exported (${JWT_SECRET:0:8}...).${NC}"

# Start backend on the host in the background
echo -e "${YELLOW}Starting backend on host (profile dev)...${NC}"
cd "$SCRIPT_DIR/backend"
./mvnw spring-boot:run -Dspring.profiles.active=dev -q &
BACKEND_PID=$!

echo -e "${YELLOW}Waiting for backend to come up (first run may download dependencies)...${NC}"
for i in $(seq 1 60); do
  if curl -sf http://localhost:8080/actuator/health > /dev/null; then
    echo -e "${GREEN}Backend is up and running!${NC}"
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}Backend process exited. Check its log output above.${NC}"
    exit 1
  fi
  [ "$i" = 60 ] && echo -e "${RED}Backend did not answer within 120s — continuing anyway.${NC}"
  sleep 2
done

# Start the frontend locally (foreground; Ctrl+C stops backend too via trap)
echo -e "${YELLOW}Starting frontend locally...${NC}"
cd "$SCRIPT_DIR/frontend"
NODE_ENV=development npx vite --port 3000 --mode dev-local
