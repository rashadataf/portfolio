FROM nginx:latest

RUN apk add --no-cache certbot certbot-nginx

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]