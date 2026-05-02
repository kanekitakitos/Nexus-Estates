# 🏰 Nexus Estates - Backend

O motor do sistema Nexus Estates. Construído com uma arquitetura de **Microserviços** robusta, utilizando Java 23 e Spring Boot 3.3.

## 🏗️ Arquitetura & Módulos

O projeto é um **Maven Multi-Module Project**.

| Módulo | Porta | Descrição | Base de Dados |
| :--- | :--- | :--- | :--- |
| **`api-gateway`** | `:8080` | Ponto de entrada único. Roteia pedidos para os serviços e valida tokens JWT. | *N/A* |
| **`booking-service`** | `:8081` | Gestão de reservas. Implementa o padrão **Outbox** para resiliência de eventos. | `booking_db` |
| **`property-service`** | `:8082` | Catálogo de imóveis, preços e imagens. | `property_db` |
| **`user-service`** | `:8083` | Autenticação (JWT), perfis e segurança. | `user_db` |
| **`sync-service`** | `:8084` | Integração com APIs externas (Airbnb/Stripe). Processa eventos assíncronos. | `sync_db` |
| **`finance-service`** | `:8085` | Pagamentos (Stripe), Webhooks assinados e idempotência. | `finance_db` |
| **`common-library`** | *N/A* | Código partilhado (DTOs, Eventos, Exceções). | *N/A* |

---

## ✅ Pré-requisitos (Backend)
* **Java 23**
* **Docker Desktop** (para Postgres/RabbitMQ em DEV) ou para correr tudo em deploy

---

## 🚀 Como correr o Backend (2 modos)

### Modo A — Deploy/Apresentação (backend dentro de Docker)

Este modo é o mais simples para “subir tudo” (inclui frontend e infraestrutura):

```bash
docker compose -f ../infrastructure/docker-compose.deploy.yml up -d --build
```

* Gateway: `http://localhost:8080`
* Swagger via Gateway: `http://localhost:8080/swagger-ui.html`

Notas:
* Os microserviços comunicam entre si por DNS interno do Docker (`http://<nome-do-serviço>:<porta>`).
* As variáveis de ambiente já estão preparadas em `../infrastructure/env/*.env` (um ficheiro por serviço).

---

### Modo B — DEV (infra em Docker + serviços Spring Boot localmente)

1. Levantar Postgres + RabbitMQ:
```bash
docker compose -f ../infrastructure/docker-compose.yml up -d
```

2. Executar serviços:
* IntelliJ (recomendado): abre `./backend` e inicia cada serviço (começa pelo `api-gateway`).
* Terminal (na pasta `backend`):
```bash
mvn -pl api-gateway -am spring-boot:run
```

Repete o comando trocando o módulo (`booking-service`, `property-service`, etc.) conforme necessário.

## 💳 Pagamentos (finance-service)

O processamento de pagamentos é isolado no **`finance-service`**, mantendo o `booking-service` focado em domínio de reservas.

- O `booking-service` chama o `finance-service` de forma síncrona via **Spring Declarative HTTP Client** (padrão `Proxy` + `NexusClients.financeClient`)
- O `finance-service` expõe endpoints REST de pagamentos e um endpoint público de webhook: `POST /api/finance/webhooks/stripe`
- O webhook valida `Stripe-Signature` e aplica idempotência via tabela `processed_events`
- Em eventos de pagamento com sucesso, o `finance-service` notifica o `booking-service` via `POST /api/bookings/{bookingId}/payments/succeeded` para confirmar a reserva

## 🔄 Consistência de Dados (Padrão Saga)

Implementamos o padrão **Saga Coreografada** para garantir a consistência eventual entre serviços:

1. **Reserva Pendente**: O `booking-service` cria a reserva e publica um evento no RabbitMQ.
2. **Sincronização**: O `sync-service` consome o evento e comunica com APIs externas.
3. **Confirmação/Cancelamento**: Com base na resposta externa, a reserva é atualizada para `CONFIRMED` ou `FAILED`.

## 🛠️ Stack Tecnológica

* **Linguagem:** Java 23
* **Framework:** Spring Boot 3.3.x
* **Persistência:** Spring Data JPA + PostgreSQL 16
* **Mensageria:** RabbitMQ (AMQP + JSON)
* **Segurança:** Spring Security + JWT
* **Migrações:** Flyway 10.x

## 🚀 Como Correr

### Pré-requisitos
* **Java SDK 23**
* **Docker & Docker Compose** (para a infraestrutura)

### Passo 1: Infraestrutura
Certifica-te que as bases de dados e o broker estão ativos:
```bash
cd ../infrastructure
docker compose -f docker-compose.yml up -d
```

### Passo 2: Executar os Serviços
Recomendamos o uso do **IntelliJ IDEA** para gerir os múltiplos serviços, mas podes correr via terminal:

```bash
# Na raiz do backend
./mvnw clean install

# Para cada serviço:
cd [nome-do-serviço]
./mvnw spring-boot:run
```

Se não tiveres Maven Wrapper no repositório, usa:

```bash
# Na raiz do backend
mvn clean install

# Para cada serviço:
cd [nome-do-serviço]
mvn spring-boot:run
```
