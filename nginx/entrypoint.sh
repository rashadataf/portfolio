#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  envsubst '$$DOMAIN_NAME' < /etc/nginx/templates/production.conf.template > /etc/nginx/conf.d/default.conf
else
  envsubst '$$DOMAIN_NAME' < /etc/nginx/templates/dev.conf.template > /etc/nginx/conf.d/default.conf
fi

nginx &

# Wait for Nginx to start
sleep 15

# if [ "$NODE_ENV" = "production" ]; then
#   certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --agree-tos --non-interactive --email $EMAIL_ADDRESS
#   nginx -s reload

#   # Set up a cron job to renew certificates
#   echo "0 0 * * * /opt/certbot/bin/certbot renew --quiet --renew-hook 'nginx -s reload'" | crontab -
#   cron
# fi

# Tail Nginx logs or run a sleep loop
tail -f /var/log/nginx/access.log
