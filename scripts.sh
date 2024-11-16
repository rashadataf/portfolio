#!/bin/bash

function dev() {
   WITH_CERTBOT=false RESET_CONFIG=true docker compose --profile dev up
}

function restart_dev() {
  RESET_CONFIG=false docker compose --profile dev up --build
}

function restart_production() {
  WITH_CERTBOT=false RESET_CONFIG=false docker compose --profile production up --build --detach
}

function production_ssl() {
  WITH_CERTBOT=true RESET_CONFIG=true docker compose --profile production up --build --detach
}

function production_no_ssl() {
  WITH_CERTBOT=false RESET_CONFIG=true docker compose --profile production up --build --detach
}

function nginx_reload() {
  docker compose exec nginx nginx -s reload
}

function clear_docker() {
  echo "Stopping nginx_production container..."
  docker stop nginx_production

  echo "Stopping production container..."
  docker stop production

  echo "Killing all containers..."
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

function clear_all() {
  clear_docker

  echo "Removing node_modules folder ..."
  rm -rf node_modules

  echo "Removing certs folder ..."
  rm -rf certs

  echo "Removing certs data folder ..."
  rm -rf data

  echo "Removing logs folder ..."
  rm -rf logs

  echo "Removing nginx config folder ..."
  rm -rf nginx/conf
}

"$@"
