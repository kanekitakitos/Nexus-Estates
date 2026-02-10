# 🏢 Nexus Estates

Plataforma moderna de gestão imobiliária baseada em Microserviços e Next.js.

## 🗺️ Navegação do Repositório

Este projeto é um **Monorepo** organizado da seguinte forma:

* **[`/backend`](./backend)**: Microserviços Java/Spring Boot.
* **[`/frontend`](./frontend)**: Aplicação Next.js (App Router) com Bun.
* **[`/infrastructure`](./infrastructure)**: Configurações de Docker e Kubernetes.
* **[`/docs`](./docs)**: Documentação técnica detalhada e diagramas.

---

## 🚀 Quick Start (Geral)

Para ter o sistema todo a rodar localmente:

1. **Infraestrutura (Bases de Dados & RabbitMQ):**
   ```bash
   cd infrastructure
   docker-compose up -d
   ```

2. **Backend (APIs):** Abra a pasta `backend` no IntelliJ e inicie os serviços (começando pelo `api-gateway`).

3. **Frontend (UI):**
   ```bash
   cd frontend
   bun install && bun dev
   ```

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
