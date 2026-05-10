FROM postgres:16-alpine

COPY init-multiple-dbs.sh /docker-entrypoint-initdb.d/init-multiple-dbs.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-multiple-dbs.sh
