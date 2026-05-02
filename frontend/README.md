# 🎨 Nexus Estates - Frontend

A interface de utilizador moderna, elegante e reativa do Nexus Estates. Construída com as tecnologias mais recentes para garantir performance e uma experiência premium.

## ⚡ Stack Tecnológica

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS 4.0](https://tailwindcss.com/)
* **Runtime & Package Manager:** [Bun](https://bun.sh/) (Obrigatório)

---

## ✅ Pré-requisitos (Frontend)
* **Bun**
* (Opcional em DEV) **Docker Desktop** (se quiseres levantar o backend/infra via containers)

---

## 🚀 Como correr o Frontend (2 modos)

### Modo A — Deploy/Apresentação (frontend dentro de Docker)

O modo mais simples para professores: levanta tudo (frontend + gateway + microserviços + BD + RabbitMQ).

```bash
docker compose -f ../infrastructure/docker-compose.deploy.yml up -d --build
```

Acessos:
* UI: `http://localhost:3000`
* API (via Gateway): `http://localhost:8080/api`

Notas:
* O `NEXT_PUBLIC_API_URL` é injectado no build do container do frontend via `docker-compose.deploy.yml`.

---

### Modo B — DEV (frontend local + backend/infra à escolha)

1. Instalar dependências:
```bash
bun install
```

2. Correr em modo desenvolvimento:
```bash
bun dev
```

O frontend fica em `http://localhost:3000`.

Se o backend estiver a correr localmente (via IntelliJ) ou via gateway em Docker, aponta sempre para o gateway (`http://localhost:8080`).

## 📂 Estrutura do Projeto (Feature-First)

Utilizamos uma arquitetura orientada a funcionalidades para facilitar a manutenção e escalabilidade.

```text
src/
├── app/                    # 🚦 Routing (Apenas Páginas e Layouts)
│   ├── (auth)/             # Fluxos de Autenticação
│   ├── booking/            # Página do módulo de reservas
│   ├── dashboard/          # Página do painel
│   ├── profile/            # Página de perfil
│   ├── properties/         # Página do módulo de propriedades
│   └── page.tsx            # Landing Page
│
├── components/             # 🧱 UI Kit Global
│   ├── ui/                 # Componentes Atómicos (Botões, Inputs, Cards)
│   ├── layout/             # Componentes de Estrutura (Nav, Footer)
│   └── effects/            # Efeitos reutilizáveis (texto/ruído/particles)
│
├── providers/              # 🔌 Context Providers (composição em app/layout.tsx)
│
├── features/               # 🧠 Lógica de Negócio (O Coração)
│   ├── auth/               # Login, Registo, Recuperação, integrações de IdP
│   ├── bookings/           # Fluxo: list → details → checkout
│   ├── chat/               # Provider + strategies (ex.: Ably)
│   ├── finance/            # UI de pagamentos (ex.: Stripe)
│   ├── landing/            # Landing page e secções
│   ├── profile/            # Perfil (tabs, integrações, webhooks)
│   └── property/           # Propriedades (listagem, criação, gestão)
│
├── services/               # 🌐 Chamadas ao backend (Axios via API Gateway)
├── types/                  # 📦 Tipos/DTOs partilhados (contratos UI ↔ services)
└── lib/                    # ⚙️ Utilitários e Configurações (Axios, etc)
```

## 🚀 Guia de Iniciação (Bun)

⚠️ **Nota:** Este projeto utiliza **Bun** para máxima performance. Evita usar `npm` ou `yarn`.

### 1. Instalar Dependências
```bash
bun install
```

### 2. Iniciar Ambiente de Desenvolvimento
```bash
bun dev
```

O frontend ficará disponível em `http://localhost:3000`.
