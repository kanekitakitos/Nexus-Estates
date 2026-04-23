# 🎨 Nexus Estates - Frontend

A interface de utilizador moderna, elegante e reativa do Nexus Estates. Construída com as tecnologias mais recentes para garantir performance e uma experiência premium.

## ⚡ Stack Tecnológica

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS 4.0](https://tailwindcss.com/)
* **Runtime & Package Manager:** [Bun](https://bun.sh/) (Obrigatório)

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
