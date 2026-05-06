# 🏢 Nexus Estates

Plataforma moderna de gestão imobiliária baseada em Microserviços e Next.js.

## 🗺️ Navegação do Repositório

Este projeto é um **Monorepo** organizado da seguinte forma:

* **[`/backend`](./backend)**: Microserviços Java/Spring Boot.
* **[`/frontend`](./frontend)**: Aplicação Next.js (App Router) com Bun.
* **[`/infrastructure`](./infrastructure)**: Configurações de Docker e Kubernetes.
* **[`/docs`](./docs)**: Documentação técnica detalhada e diagramas.

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

## Como correr (2 modos)

### Modo A — Deploy/Apresentação (100% em containers)

Este modo levanta **Postgres + RabbitMQ + todos os microserviços + frontend** automaticamente, sem precisares de clonar o repositório.

Windows (PowerShell):
```powershell
curl.exe -L -o docker-compose.deploy.yml "https://raw.githubusercontent.com/kanekiTakitos/Nexus-Estates/main/infrastructure/docker-compose.deploy.yml" ; docker compose -f docker-compose.deploy.yml up -d --pull always
```

Linux / Mac / WSL:
```bash
curl -L -o docker-compose.deploy.yml "https://raw.githubusercontent.com/kanekiTakitos/Nexus-Estates/main/infrastructure/docker-compose.deploy.yml" && docker compose -f docker-compose.deploy.yml up -d --pull always
```

Acessos:
* Frontend: `http://localhost:3000`
* API Gateway: `http://localhost:8080`
* Swagger UI: `http://localhost:8080/swagger-ui.html`

Credenciais de teste:
* Email: `dev@nexus.com`
* Password: `12345`

Parar e limpar dados (reset):
```bash
docker compose -f docker-compose.deploy.yml down -v
```

Remoção completa (cleanup total):

Linux / Mac / WSL:
```bash
docker compose -f docker-compose.deploy.yml down -v --rmi all && rm docker-compose.deploy.yml
```

Windows (PowerShell):
```powershell
docker compose -f docker-compose.deploy.yml down -v --rmi all ; del docker-compose.deploy.yml
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
