# Guia de Contribuição e Padrões

Este documento define o fluxo de trabalho e os padrões de codificação para o projeto **Nexus Estates**, garantindo consistência, qualidade e um histórico de Git profissional.

---

## 🌳 Fluxo de Trabalho (Gitflow Simplificado)

### 1. Branching
**Nunca faças commit diretamente na branch `main`.** Todo o desenvolvimento deve ocorrer em branches de funcionalidade ou correção, nomeadas a partir da tarefa correspondente no Jira.

**Padrão de nomeação:**
- `feature/<Ticket-ID>-<descrição-curta>`
- `fix/<Ticket-ID>-<descrição-curta>`

**Exemplos:**
- `feature/NEX-12-criar-login`
- `fix/NEX-45-erro-calculo-datas`

### 2. Pull Requests (PR)
O merge para a `main` requer obrigatoriamente:
- **Aprovação de pelo menos um colega** (Code Review obrigatório).
- Passagem em todos os testes automatizados (CI).
- Histórico de commits limpo e seguindo o padrão abaixo.

---

## 📝 Padrão de Commits

Seguimos a convenção **Conventional Commits**. Isto facilita a leitura do histórico e permite a geração automática de changelogs.

### Estrutura
```plaintext
<Tipo>(<Escopo Opcional>): <Título no Imperativo> [Ticket-ID]

[Corpo opcional com detalhes em tópicos]
```

### Tipos Permitidos
| Tipo | Descrição |
| :--- | :--- |
| `feat` | Nova funcionalidade para o utilizador. |
| `fix` | Correção de bugs. |
| `docs` | Alterações apenas na documentação. |
| `style` | Formatação, pontos e vírgulas (sem alteração de lógica). |
| `refactor` | Alteração de código que não corrige bug nem adiciona feature. |
| `test` | Adição ou correção de testes. |
| `chore` | Atualização de tarefas de build, configs de ferramentas, etc. |

### Regras de Ouro
1. **Título no Imperativo**: Use "adiciona", "corrige", "refatora" em vez de "adicionado" ou "corrigindo".
2. **Ticket ID**: Sempre inclua o ID do Jira ao final do título (ex: `[NEX-10]`).
3. **Escopo**: Use o parênteses para indicar o módulo afetado (ex: `auth`, `api`, `ui`).

---

### Exemplos Reais

#### ✨ Feature
```plaintext
feat(auth): implementa validação de token JWT [NEX-10]

- Adiciona filtro de segurança no Spring Security
- Cria exceção personalizada para tokens expirados
```

#### 🐞 Fix
```plaintext
fix(booking): corrige sobreposição de datas na reserva [NEX-22]

- Adiciona validação no serviço de disponibilidade
- Garante que check-out no dia X permite check-in no mesmo dia
```

#### 📚 Documentação
```plaintext
docs: atualiza guia de instalação no README [NEX-05]
```