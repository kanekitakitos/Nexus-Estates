# Nexus Estates — Contexto Técnico (para IA)

Este ficheiro resume o contexto do monorepo **Nexus Estates** para acelerar entendimento por ferramentas/assistentes (sem reanalisar o repositório). Não substitui a documentação detalhada em `docs/`, mas descreve o fluxo end-to-end e os contratos mais relevantes.

## Estrutura do Monorepo

- `backend/`: Microserviços Java 23 + Spring Boot 3.3 (Maven multi-module).
- `frontend/`: Next.js (App Router) + TypeScript + Tailwind + Bun.
- `infrastructure/`: Docker Compose (Postgres + RabbitMQ) e scripts de bootstrap.

## Infra Local (Docker Compose)

- Postgres 16 (um container com múltiplas DBs): `booking_db`, `property_db`, `user_db`, `sync_db`, `finance_db`
- RabbitMQ (AMQP + Management UI)

Config: `infrastructure/docker-compose.yml`

## Backend (Microserviços + Portas)

- `api-gateway` `:8080`
  - Ponto de entrada único para o frontend: `/api/*`
  - Valida JWT e injeta headers `X-User-*` para downstream
  - Faz proxy dos OpenAPI docs para evitar CORS: `/v3/api-docs/{service}`
- `booking-service` `:8081`
  - Domínio de reservas + disponibilidade + endpoints de pagamento (delegados)
  - Publica/consome eventos via RabbitMQ (exchange `booking.exchange`)
- `property-service` `:8082`
  - Catálogo de propriedades + regras operacionais + sazonalidade + amenities
  - Endpoint crítico `POST /api/properties/{id}/quote` (valida e calcula cotação)
- `user-service` `:8083`
  - Autenticação JWT (login/registo/password reset) + perfis
  - Integração opcional com Clerk (troca token Clerk por JWT interno)
- `sync-service` `:8084`
  - Integrações externas (OTAs), chat/realtime (Ably opcional), webhooks outbound, utilitários (ICS)
  - Consome `booking.created` e publica `booking.status.updated`
  - Aplica resiliência (Retry/Circuit Breaker/Timeout) para chamadas externas
- `finance-service` `:8085`
  - Pagamentos (Stripe), webhook assinado e idempotente
  - Notifica o booking-service em sucesso via callback server-to-server
- `common-library`
  - DTOs, mensagens e enums partilhados (contratos estáveis entre serviços)

## Gateway: Autenticação e Propagação de Contexto

- Frontend envia `Authorization: Bearer <JWT>`
- O `api-gateway` valida o JWT e propaga:
  - `X-User-Id`
  - `X-User-Role`
  - `X-User-Email`
- O gateway aplica whitelist de endpoints públicos (auth, search, webhooks stripe, swagger).

## Frontend: Comunicação com Backend

- Base URL do Gateway: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api`)
- Axios central (`src/lib/axiosAPI.ts`) injeta `Authorization` via `AuthService.getAuthHeaders()`
- `AuthService` guarda sessão no `localStorage`:
  - `token`, `userId`, `userEmail`, `userRole`

## Fluxos Principais (End-to-End)

### 1) Autenticação

- `POST /api/users/auth/register` / `POST /api/users/auth/login`
- Retorna JWT interno (guardado pelo frontend)
- Clerk (opcional):
  - Frontend obtém token Clerk e chama `POST /api/users/auth/clerk/exchange` para obter JWT interno

### 2) Pesquisa Pública de Propriedades

- `GET /api/properties/search` é público (whitelist no gateway)
- Frontend consome via `PropertyService.getAllProperties()`

### 3) Criação de Reserva (com anti-overbooking)

1. Frontend: `POST /api/bookings`
2. Booking Service:
   - Anti-overbooking com lock pessimista (estado bloqueante: `CONFIRMED`, `BLOCKED`, `PENDING_PAYMENT`)
   - Chama Property Service para validar + cotar:
     - `POST /api/properties/{id}/quote` (regras operacionais + sazonalidade)
   - Cria reserva com estado inicial `PENDING_PAYMENT`
   - Publica evento `booking.created` no RabbitMQ

### 4) Sincronização Assíncrona (Saga coreografada simplificada)

- Sync Service consome `booking.created`
- Chama integração externa (conector genérico) com resiliência (Retry/CircuitBreaker/Timeout)
- Publica `booking.status.updated`
- Booking Service consome `booking.status.updated` e atualiza estado na BD

Observação: há potencial de competição de “fonte de verdade” do estado quando existem flows paralelos (sync vs pagamento); se for necessário endurecer consistência, introduzir guard rails (ex.: rejeitar transições inválidas, versionamento/estado final, ou Saga mais explícita).

### 5) Pagamentos (Booking → Finance → Stripe → Callback)

- Frontend usa endpoints no Booking Service (não chama finance diretamente):
  - `POST /api/bookings/{bookingId}/payments/intent`
  - `POST /api/bookings/{bookingId}/payments/confirm`
  - `POST /api/bookings/{bookingId}/payments/direct`
  - `POST /api/bookings/{bookingId}/payments/refund`
- Booking Service delega para Finance Service via Spring Declarative HTTP Client.
- Stripe Webhook:
  - Finance Service expõe `POST /api/finance/webhooks/stripe` (público no gateway)
  - Valida assinatura `Stripe-Signature`
  - Garante idempotência via tabela `processed_events`
  - Em sucesso, chama callback no booking-service:
    - `POST /api/bookings/{bookingId}/payments/succeeded`
  - Booking Service marca reserva `CONFIRMED` e publica `booking.updated`

### 6) Bloqueios de Calendário Externo (.ics)

- Sync Service (admin) parseia `.ics` e publica `calendar.block` no RabbitMQ
- Booking Service consome e cria bloqueio técnico (reserva sem custo) para impedir overbooking

### 7) Chat / Realtime (Ably opcional)

- Frontend abre canal `booking-chat:{bookingId}`
- Sync Service fornece token para realtime e persiste histórico de mensagens
- Conector Ably só é carregado se existir `ably.api.key` na configuração

## Mensageria (RabbitMQ) — Convenções

- Exchange principal (default): `booking.exchange`
- Routing keys relevantes:
  - `booking.created` → consumido pelo sync-service
  - `booking.status.updated` → consumido pelo booking-service
  - `calendar.block` → consumido pelo booking-service
- Há DLQs para filas principais.

## CI (Frontend E2E API)

- Workflow do frontend levanta Postgres + RabbitMQ, compila e inicia os microserviços e corre Playwright API tests contra o Gateway (`http://localhost:8080/api`).
  - Serviços iniciados no CI: user, property, booking, sync, finance, gateway

