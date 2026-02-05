## 🏠 Ideia do Projeto

Sistema de Gestão de Reservas e Disponibilidade de Imóveis

O projeto consiste no desenvolvimento de um sistema centralizado para **gerir reservas, ocupação e disponibilidade** de imóveis (casas, apartamentos, prédios), capaz de:

* gerir estados de ocupação (disponível, reservado, ocupado, limpeza, manutenção);
* prevenir conflitos de reservas no mesmo intervalo temporal;
* sincronizar automaticamente a disponibilidade quando uma reserva é feita ou cancelada;
* integrar (de forma simulada) múltiplas plataformas externas de reservas, garantindo que uma reserva feita numa plataforma bloqueia a disponibilidade nas restantes.

O sistema atua como a **fonte única da verdade** para a disponibilidade dos imóveis, resolvendo problemas reais de **overbooking** e **inconsistência entre plataformas**.

---

## 🧠 Principais Funcionalidades

* Gestão de imóveis e respetivos atributos
* Motor de disponibilidade e ocupação
* Criação, cancelamento e gestão de reservas
* Regras de negócio (penalizações, bloqueios, aprovação manual)
* Integração simulada com plataformas externas (ex.: Airbnb/Booking)
* Notificações e histórico de ações

---

## 🧱 Arquitetura

* Arquitetura baseada em **microserviços**
* Backend separado em múltiplas APIs REST
* Comunicação síncrona (REST) e assíncrona (eventos)
* Execução reprodutível através de containers

---

## 🛠️ Linguagens e Stack Tecnológica

### 🔹 Backend

* **Java 17+**
* **Spring Boot**
* Spring Data JPA (Hibernate)
* Spring Security (JWT)
* PostgreSQL
* Flyway (migrações da BD)

Cada microserviço é uma aplicação Spring Boot independente.

---

### 🔹 Frontend

* **Next.js**
* **TypeScript**
* Interface web simples para utilizadores, gestores e administradores

---

### 🔹 Infraestrutura & DevOps

* **Docker**
* docker-compose
* GitHub Actions (CI)
* Git (pull requests, code review)

---

### 🔹 Integrações Externas

* APIs externas **simuladas** (Airbnb/Booking-like)
* Serviço dedicado para sincronização de disponibilidade

---

## 🧑‍🤝‍🧑 Organização do Grupo

* Backend dividido por microserviços (responsabilidades claras)
* Frontend separado
* Possibilidade de módulos opcionais mais técnicos sem afetar o core

---

## 🎯 Por que esta stack é uma boa escolha

* Java + Spring Boot → robustez, concorrência, defesa académica forte
* Next.js + TypeScript → frontend moderno e bem separado
* Docker → execução reprodutível e alinhada com o enunciado
* Microserviços → justificados pelo domínio (integrações, regras, escalabilidade)

---

/
├── .github/
│   └── workflows/          # Pipelines de CI (Build, Test, Lint) 
├── backend/                # Root para os serviços Java
│   ├── property-service/   # Spring Boot: Imóveis, atributos, fotos
│   ├── booking-service/    # Spring Boot: Motor de reservas e disponibilidade
│   ├── sync-service/       # (Novo) Serviço dedicado à integração externa/webhooks
│   └── .gitignore          # Ignorar target/, .mvn/, .idea/
├── frontend/               # Next.js + TypeScript
│   ├── src/
│   ├── public/
│   └── .gitignore          # Ignorar node_modules/, .next/
├── infrastructure/         # Infraestrutura as Code
│   ├── docker-compose.yml  # Orquestração local de todos os serviços
│   └── postgres/           # Scripts de init da BD (se não usares Flyway no boot)
├── docs/                   # Relatório Técnico e Diagramas [cite: 51]
│   ├── architecture/       # Diagramas C4 ou UML [cite: 53]
│   └── decisions/          # ADRs (Architecture Decision Records) [cite: 55]
├── .gitignore              # Gitignore global (ficheiros de SO, IDEs)
├── README.md               # Entry point do projeto (instruções de setup) [cite: 57]
└── CONTRIBUTING.md         # O teu guia de commits e regras