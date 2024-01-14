#!/bin/sh
envsubst '$$DOMAIN_NAME' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

nginx

sleep 10

certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --agree-tos --non-interactive --email $EMAIL_ADDRESS

nginx -s reload
