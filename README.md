# 🏠 Nexus Estates: Sistema de Gestão de Reservas Distribuído (PMS)

O **Nexus Estates** não é apenas um site de reservas, mas um **Sistema Distribuído Resiliente** focado na **Consistência de Dados** entre a plataforma interna e canais externos (Airbnb/Booking), eliminando o risco de *Overbooking*.

Este projeto utiliza uma **Arquitetura Baseada em Eventos (Event-Driven Architecture)** para garantir escalabilidade e robustez.

---

## 📘 Master Plan

### 1. Visão Geral e Objetivo
O problema central a resolver é a sincronização em tempo real de disponibilidade. Abandonámos a arquitetura monolítica tradicional em favor de microserviços independentes que comunicam de forma assíncrona.

### 2. A Stack Tecnológica (O "Arsenal") 🛠️

#### 🔹 Backend: O Núcleo Robusto
*   **Java 17+**: Robustez, tipagem forte e gestão de memória empresarial.
*   **Spring Boot 3.x**: Padrão de indústria para microserviços.
*   **Spring Data JPA (Hibernate)**: Abstração de SQL através de Entidades.
*   **Spring Security + JWT**: Autenticação *stateless* e segura.

#### 🔹 Comunicação & Mensageria
*   **Síncrona (REST)**: `OpenFeign` para chamadas diretas onde a resposta imediata é necessária.
*   **Assíncrona (Eventos)**: **RabbitMQ** (AMQP + JSON payload). Garante que, se um serviço falhar, as mensagens são processadas assim que ele recuperar (desacoplamento temporal).

#### 🔹 Base de Dados
*   **PostgreSQL 15**: SGBD principal.
*   **Estratégia**: *Database per Service*. O isolamento total previne acoplamento de dados.
*   **Flyway**: Gestão automática de migrações SQL.

#### 🔹 Frontend
*   **Next.js (React) + TypeScript**: Rendering híbrido (SSR/SSG) e tipagem estática para integridade com o backend.

#### 🔹 Infraestrutura
*   **Docker & Docker Compose**: Todo o ecossistema (serviços Java, Gateway, RabbitMQ, Postgres e Frontend) num só comando.

---

## 🧱 Arquitetura Detalhada dos Componentes

#### 🚪 1. API Gateway (O Porteiro)
*   **Tecnologia**: Spring Cloud Gateway.
*   **Roteamento**: Único ponto de entrada; redireciona pedidos para os serviços internos apropriados.
*   **Segurança**: Centraliza a validação de tokens JWT.

#### 👤 2. User Service (Identidade)
*   **Função**: Gestão de perfis (ADMIN, MANAGER, GUEST) e emissão de tokens.

#### 🏠 3. Property Service (O Catálogo)
*   **Função**: CRUD de imóveis (título, descrição, fotos, preços). É a fonte estática da informação dos imóveis.

#### 📅 4. Booking Service (O Maestro Síncrono)
*   **Lógica**: Recebe pedidos de reserva, valida disponibilidade local, grava como `PENDING` e publica o evento no RabbitMQ. Implementa o padrão **Outbox** para máxima resiliência.

#### 🔄 5. Sync Service (O Worker Assíncrono)
*   **Função**: Integração real com APIs externas (Airbnb/Stripe). Processa eventos do RabbitMQ e confirma ou cancela reservas baseando-se no sucesso das integrações externas.

---

## 🔄 Fluxo de Dados e Consistência (O Padrão Saga)

Implementamos o padrão **Saga Coreografada** para a **Consistência Eventual**:

1.  **Fase 1 (Venda Rápida)**: Reserva criada como `PENDING`. Feedback instantâneo ao utilizador.
2.  **Fase 2 (Processamento Background)**: O *Sync Service* comunica com APIs externas (lentas).
3.  **Fase 3 (Feedback Loop)**: O estado é atualizado para `CONFIRMED` ou `FAILED` via RabbitMQ.

> **Racional**: Priorizamos a experiência do utilizador e a garantia da venda, tratando da burocracia externa de forma assíncrona.

---

## 📂 Estrutura do Projeto

```text
├── .github/
│   └── workflows/          # CI Pipeline (Build, Test, Lint)
├── backend/
│   ├── pom.xml             # Parent POM
│   ├── common-library/     # Código partilhado (DTOs, Eventos)
│   ├── api-gateway/        # Spring Cloud Gateway
│   ├── user-service/       # Autenticação e JWT
│   ├── property-service/   # Gestão de Imóveis
│   ├── booking-service/    # Motor de Reservas
│   └── sync-service/       # Integrações Externas & RabbitMQ
├── frontend/               # Next.js + TypeScript
├── infrastructure/
│   ├── docker-compose.yml  # Orquestração completa
│   └── postgres/           # Scripts de inicialização multi-db
├── docs/                   # Relatório Técnico
└── README.md
```

---

## 🎯 Defesa das Decisões de Engenharia

*   **Microserviços vs Monólito**: Permite escalar o *Sync Service* (I/O intensivo) independentemente e isolar falhas de APIs externas.
*   **RabbitMQ**: Essencial para não perder reservas. HTTP é efêmero, filas são persistentes.
*   **PostgreSQL Isolado**: Evita que mudanças num schema quebrem múltiplos serviços inadvertidamente.

---
🚀 **Nexus Estates** - Construindo o futuro da gestão imobiliária distribuída.