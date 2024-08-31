FROM nginx:latest AS base

RUN apt-get update && apt-get install -y python3 python3-venv libaugeas0

RUN python3 -m venv /opt/certbot/

RUN /opt/certbot/bin/pip install --upgrade pip

RUN /opt/certbot/bin/pip install certbot certbot-nginx

RUN ln -s /opt/certbot/bin/certbot /usr/bin/certbot

FROM base AS nginx

ARG CHALLENGE_DIR

RUN mkdir -p $CHALLENGE_DIR

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]

FROM base AS certbot

COPY certbot_entrypoint.sh /certbot_entrypoint.sh

RUN chmod +x /certbot_entrypoint.sh

CMD ["/certbot_entrypoint.sh"]