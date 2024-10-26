#!/bin/bash

function dev() {
  RESET_CONFIG=true docker compose --profile dev up
}

function dev_reset() {
  RESET_CONFIG=false docker compose --profile dev up
}

function restart_production() {
  WITH_CERTBOT=false RESET_CONFIG=false docker compose --profile production up --build
}

function production_ssl() {
  WITH_CERTBOT=true docker compose --profile production up --build
}

function nginx_reload() {
  docker compose exec nginx nginx -s reload
}

function clear_docker() {
  echo "Stopping all containers..."
  docker compose down

  echo "Prune docker builder..."
  docker builder prune -f -a
  
  echo "Prune docker system..."
  docker system prune -f -a

  echo "Removing all networks not used by at least one container..."
  docker network prune -f
  
  echo "Removing all unused volumes..."
  docker volume rm $(docker volume ls -q)
  
  echo "Docker environment is clean."
}

"$@"
