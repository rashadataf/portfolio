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
2. **start Docker container in dev mode:**
   ```bash
   docker compose up dev
   ```
   This command builds the Next.js application and sets up Nginx and Certbot in their respective containers.
3. **Access the application:**
   - Open your web browser and navigate to http://localhost:3000 to view the portfolio.

## Contributing
Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is open source and available under the MIT License.

## Author
**Rashad Ataf** - [Portfolio](https://www.rashadataf.tech/)

Thank you for visiting my portfolio repository!