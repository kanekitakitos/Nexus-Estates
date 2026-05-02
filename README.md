# 🏢 Nexus Estates

Plataforma moderna de gestão imobiliária baseada em Microserviços e Next.js.

## 🗺️ Navegação do Repositório

Este projeto é um **Monorepo** organizado da seguinte forma:

* **[`/backend`](./backend)**: Microserviços Java/Spring Boot.
* **[`/frontend`](./frontend)**: Aplicação Next.js (App Router) com Bun.
* **[`/infrastructure`](./infrastructure)**: Configurações de Docker e Kubernetes.
* **[`/docs`](./docs)**: Documentação técnica detalhada e diagramas.

### Estrutura do Frontend (`/frontend/src`)
* **`app/`**: Rotas e layouts (Next.js App Router).
* **`features/`**: Módulos por domínio (ex.: `bookings`, `property`, `profile`) com as suas views e sub-componentes.
* **`components/`**: Componentes reutilizáveis e layout (ex.: `components/ui/*`, `components/layout/*`).
* **`services/`**: Camada de comunicação com APIs (Axios/WebClient via Gateway) e lógica de integração.
* **`types/`**: Tipos/DTOs partilhados (contratos entre UI ↔ services).
* **`lib/`**: Utilitários e infraestrutura (ex.: axios central, helpers).

---

## ✅ Pré-requisitos

### Para correr tudo via containers (Deploy / “demo”)
* **Docker Desktop** (ou Docker Engine) com **Docker Compose v2** (`docker compose`)

### Para desenvolvimento local (DEV)
* **Docker Desktop** (para Postgres/RabbitMQ)
* **Java 23** (backend)
* **Bun** (frontend)
* (Recomendado) **IntelliJ IDEA** para gerir múltiplos serviços Spring Boot

---

## 🚀 Como correr (2 modos)

### Modo A — Deploy/Apresentação (100% em containers) (Recomendado para professores)

Este modo levanta **Postgres + RabbitMQ + todos os microserviços + frontend** automaticamente.

1. Na raiz do repositório:
   ```bash
   docker compose -f infrastructure/docker-compose.deploy.yml up -d --build
   ```

2. Acessos:
   * Frontend: `http://localhost:3000`
   * API Gateway: `http://localhost:8080`
   * Swagger UI (via Gateway): `http://localhost:8080/swagger-ui.html`

3. Notas importantes:
   * Só **frontend (3000)** e **api-gateway (8080)** expõem portas para o host.
   * Os restantes serviços, Postgres e RabbitMQ ficam acessíveis apenas dentro da rede Docker (segurança por defeito).
   * As variáveis para deploy estão pré-preparadas em `infrastructure/env/*.env` (um ficheiro por serviço) para simplificar o arranque.

Para parar:
```bash
docker compose -f infrastructure/docker-compose.deploy.yml down
```

---

### Modo B — DEV (infra em Docker + apps localmente)

Este modo é ideal para programar: a infraestrutura corre em Docker e tu corres os serviços localmente.

1. Levantar apenas infraestrutura (Postgres + RabbitMQ):
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d
   ```

2. Backend (Spring Boot):
   * Opção recomendada: abrir `./backend` no IntelliJ e iniciar os serviços (começa pelo `api-gateway`).
   * Alternativa (terminal, na pasta `backend`):
     ```bash
     mvn -pl api-gateway -am spring-boot:run
     ```
     Repete para cada microserviço conforme necessário.

3. Frontend (Next.js + Bun):
   ```bash
   cd frontend
   bun install
   bun dev
   ```

4. Acessos (DEV):
   * Frontend: `http://localhost:3000`
   * Gateway: `http://localhost:8080`

---

## 🤝 Contribuição
Por favor leia o nosso Guia de Contribuição antes de submeter código.

**Regras de Ouro:**
* Use **Bun** no frontend.
* Use **Java 23** no backend.
* Commits devem seguir a convenção **Conventional Commits**.

---


## 🤝 Devs

- **Brandon Mejia** - 79261 " [kanekiTakitos](https://github.com/kanekiTakitos) " 
- **Luís Moreira** - 81432 " [DanielFisherMan](https://github.com/DanielFisherMan) "
- **Miguel Correia** - 71369 " [KorteXPoison](https://github.com/KorteXPoison) "
- **Tiago Antunes** - 76920 " [truta02](https://github.com/truta02) "

---
