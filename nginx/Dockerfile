FROM nginx:latest

RUN apt-get update && apt-get install -y certbot python3-certbot-nginx

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]