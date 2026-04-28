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
docker-compose up -d
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
