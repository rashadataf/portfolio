#!/bin/sh

mkdir -p ${CHALLENGE_DIR}

if [ "$NODE_ENV" = "production" ] && [ "$WITH_CERTBOT" = "true" ]; then
  envsubst '$$DOMAIN_NAME$$PORT' < /etc/nginx/templates/production.conf.template > /etc/nginx/conf.d/default.conf
  nginx &
  sleep 15
  certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --agree-tos --non-interactive --email $EMAIL_ADDRESS
  nginx -s reload
elif [ "$RESET_CONFIG" = "true" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    envsubst '$$DOMAIN_NAME$$PORT' < /etc/nginx/templates/production.conf.template > /etc/nginx/conf.d/default.conf
  else
    envsubst '$$DOMAIN_NAME$$PORT' < /etc/nginx/templates/dev.conf.template > /etc/nginx/conf.d/default.conf
  fi
  echo "Nginx configuration reloaded with new template settings"
fi

if [ ! -f /etc/nginx/conf.d/default.conf ]; then
  echo "Error: Nginx configuration file /etc/nginx/conf.d/default.conf is missing."
  exit 1
fi

nginx &

sleep 15
tail -f /var/log/nginx/access.log