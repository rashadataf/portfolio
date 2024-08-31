#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  envsubst '$$DOMAIN_NAME$$PORT' < /etc/nginx/templates/production.conf.template > /etc/nginx/conf.d/default.conf
else
  envsubst '$$DOMAIN_NAME$$PORT' < /etc/nginx/templates/dev.conf.template > /etc/nginx/conf.d/default.conf
fi

nginx &

sleep 15

nginx -s reload

tail -f /var/log/nginx/access.log
