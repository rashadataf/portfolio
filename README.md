
# Rashad Ataf's Portfolio

This repository contains the source code for Rashad Ataf's personal portfolio website. It is built using Next.js and is containerized with Docker for easy deployment and scalability. The website is served using Nginx as a reverse proxy with SSL/TLS encryption managed by Certbot.

## Technologies Used

- **Next.js**: A React framework for building the user interface and handling server-side rendering.
- **Docker**: Used to containerize the application, ensuring consistency across different environments.
- **Nginx**: Acts as a reverse proxy to serve the Next.js application, providing enhanced security and performance.
- **Certbot**: Automatically handles SSL certificate issuance and renewal with Let's Encrypt for secure HTTPS connections.

## Getting Started

To run this project locally, you will need Docker installed on your machine. Follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rashadataf/portfolio.git
   cd portfolio
   ```
2. **Start Docker container in dev mode:**
   ```bash
   ./scripts.sh dev
   ```
   This command builds the Next.js application and sets up Nginx in their respective containers.
3. **Access the application:**
   - Open your web browser and navigate to http://localhost:3000 or http://localhost to view the portfolio.

## Contributing
Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is open source and available under the MIT License.

## Author
**Rashad Ataf** - [Portfolio](https://www.rashadataf.com/)

Thank you for visiting my portfolio repository!

---

## Scripts Documentation

The following `scripts.sh` functions facilitate different development, production, and Docker cleanup tasks. Each function streamlines specific actions and can be run by invoking `./scripts.sh <function-name>`.

### Functions

#### `dev`
```bash
function dev() {
  RESET_CONFIG=true docker compose --profile dev up
}
```
Starts the development environment with nginx configuration reset enabled.

#### `restart_dev`
```bash
function restart_dev() {
  RESET_CONFIG=false docker compose --profile dev up --build
}
```
Starts the development environment without resetting nginx configuration.

#### `restart_production`
```bash
function restart_production() {
  WITH_CERTBOT=false RESET_CONFIG=false docker compose --profile production up --build --detach
}
```
Restarts the production environment without Certbot and without resetting the configuration.

It's mainly to deploy changes.

#### `production_ssl`
```bash
function production_ssl() {
  WITH_CERTBOT=true RESET_CONFIG=true docker compose --profile production up --build --detach
}
```
Starts the production environment with SSL enabled using Certbot and resets configuration as required for SSL.

#### `production_no_ssl`
```bash
function production_no_ssl() {
  WITH_CERTBOT=false RESET_CONFIG=true docker compose --profile production up
}
```
Starts production without SSL and resets configuration.

Mainly for test cases on local machine with production environment, but without ssl as it requires a domain.

#### `nginx_reload`
```bash
function nginx_reload() {
  docker compose exec nginx nginx -s reload
}
```
Reloads the Nginx configuration in the running container.

#### `clear_docker`
```bash
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
```
Stops all containers, removes unused Docker images, networks, and volumes to clear the Docker environment.

#### `clear_all`
```bash
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
```
Performs a comprehensive cleanup, including `clear_docker` and removing local folders like `node_modules`, `certs`, `data`, `logs`, and Nginx configuration.

---

Use these commands for efficient and streamlined deployment, management, and cleanup of your portfolio application.
