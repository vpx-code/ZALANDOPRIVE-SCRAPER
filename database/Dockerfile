FROM mongo:4.4.0

WORKDIR /app

RUN mkdir -p /app/datasets
COPY datasets/*.json /app/datasets/

COPY mongo-init.sh /docker-entrypoint-initdb.d/mongo-init.sh
RUN chmod +x /docker-entrypoint-initdb.d/mongo-init.sh