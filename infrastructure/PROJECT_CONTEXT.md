# Infrastructure Context
This folder contains Docker Compose configurations and database bootstrap scripts used by Nexus Estates.

- docker-compose.yml: Local development infrastructure (Postgres + RabbitMQ).
- docker-compose.deploy.yml: Full-stack deployment via containers (frontend + gateway + microservices + infra).
- postgres/init-multiple-dbs.sh: Creates multiple databases on Postgres startup.
