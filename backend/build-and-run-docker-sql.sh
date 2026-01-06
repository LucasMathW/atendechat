#!/bin/bash
COMPOSE_FILE="-f docker-compose.databases.yml"
export $(grep -v '^#' .env | xargs)
docker compose $COMPOSE_FILE build --no-cache
docker compose $COMPOSE_FILE up $SERVICES_TO_COMPOSE_UP_SQL "$@"
