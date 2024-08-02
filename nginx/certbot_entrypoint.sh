#!/bin/sh

# Run Nginx to serve the challenges
nginx &

# Wait for Nginx to start
sleep 15

# Run Certbot to issue or renew certificates
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --agree-tos --non-interactive --email $EMAIL_ADDRESS

# Reload Nginx to apply the new certificates
nginx -s reload
