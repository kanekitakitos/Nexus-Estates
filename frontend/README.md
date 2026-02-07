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
│   ├── (dashboard)/        # Painel de Gestão
│   └── page.tsx            # Landing Page
│
├── components/             # 🧱 UI Kit Global
│   ├── ui/                 # Componentes Atómicos (Botões, Inputs, Cards)
│   └── layout/             # Componentes de Estrutura (Nav, Footer)
│
├── features/               # 🧠 Lógica de Negócio (O Coração)
│   ├── auth/               # Login, Registo, Perfil
│   ├── properties/         # Listagem e Detalhes de Imóveis
│   └── bookings/           # Gestão de Reservas
│       ├── components/     # UI específica da reserva
│       ├── services/       # Chamadas à API (Backend)
│       └── types/          # Tipos de dados da feature
│
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
