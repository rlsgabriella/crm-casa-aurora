# CRM Casa Aurora

Painel administrativo interno para gestão do restaurante Casa Aurora. Projeto separado do app do cliente — ambos compartilham o mesmo banco Supabase e a mesma infraestrutura de automação (n8n + WAHA + Redis).

## Dois projetos, um ecossistema

| | Casa Aurora (app do cliente) | CRM Restaurante (este repo) |
|---|---|---|
| **Usuário** | Cliente final | Equipe interna |
| **Stack** | React + Vite, Node + Express | Next.js 14, Node + Express |
| **Front** | localhost:5173 | localhost:5174 |
| **API** | localhost:3333 | localhost:3334 |
| **Banco** | Supabase compartilhado | Supabase compartilhado |
| **Auth** | Clerk (app cliente) | Clerk (app CRM separado) |

O CRM lê as tabelas existentes do Casa Aurora (`usuarios`, `reservas`, `mesas`) e adiciona as suas próprias (conversas, mensagens, pedidos, estoque, etc.) no **mesmo banco**.

## Pré-requisitos

- Node.js 20+
- Docker do Casa Aurora rodando (n8n, WAHA, Redis via `docker-compose up`)
- Conta Supabase (mesma do Casa Aurora)
- App Clerk separado para o CRM (criar em [clerk.com](https://clerk.com))

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

**API (packages/api/.env):**
```bash
cp packages/api/.env.example packages/api/.env
# Preencher DATABASE_URL, DIRECT_URL, CLERK_SECRET_KEY, etc.
```

**Dashboard (packages/dashboard/.env.local):**
```bash
cp packages/dashboard/.env.example packages/dashboard/.env.local
# Preencher NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
# NEXT_PUBLIC_SUPABASE_* é opcional — sem elas funciona com polling 5s
```

### 3. Sincronizar schema com o Supabase

```bash
cd packages/api

# Importa as tabelas existentes do Casa Aurora (rodar SEMPRE antes do push)
npx prisma db pull

# Aplica as tabelas novas do CRM sem alterar as existentes
npx prisma db push

# Gera o Prisma Client
npx prisma generate
```

> **IMPORTANTE**: nunca pule o `db:pull`. Ele garante que o schema parte do estado real do banco.

### 4. Popular dados de teste (opcional)

```bash
cd packages/api
node prisma/seed.js
# Cria: 1 restaurante, 4 atendentes, 5 conversas, 18 mensagens
# Anote o restauranteId gerado e coloque em DEFAULT_RESTAURANTE_ID no .env
```

## Como rodar

```bash
# Terminal 1 — API (porta 3334)
cd packages/api && npm run dev

# Terminal 2 — Dashboard (porta 5174)
cd packages/dashboard && npm run dev
```

Acesse: http://localhost:5174

## Configurar WhatsApp (Fase 2)

### Importar workflow n8n

1. Acesse http://localhost:5678
2. **Workflows → Import from file** → selecionar `docs/n8n-workflow-waha-crm.json`
3. Ativar o workflow
4. Verificar credenciais: Redis, Google Gemini(PaLM) API, WAHA

### Apontar WAHA para o n8n

No dashboard WAHA (http://localhost:3000/dashboard), configure o webhook:

- **Dentro do Docker**: `http://n8n-youtube:5678/webhook/menu-cliente`
- **Fora do Docker**: `http://localhost:5678/webhook/menu-cliente`

> Veja `docs/waha-webhook-setup.md` para instruções detalhadas e testes curl.

### Nota sobre Docker networking

O n8n roda em Docker e precisa acessar a API CRM (porta 3334) no host. As URLs no workflow usam `host.docker.internal:3334` (funciona no Docker Desktop para Windows/Mac). Em Linux sem Docker Desktop, substituir por `172.17.0.1:3334` ou adicionar `extra_hosts: ["host.docker.internal:host-gateway"]` no `docker-compose.yml` do n8n.

## Infraestrutura compartilhada

A infra Docker está no repo do Casa Aurora. O CRM **não tem docker-compose próprio**.

| Serviço | URL | Uso no CRM |
|---|---|---|
| n8n | http://localhost:5678 | Automação WhatsApp + IA |
| WAHA | http://localhost:3000 | WhatsApp API |
| Redis | localhost:6379 | Histórico de conversa da Sofia |
| Supabase | Painel online | Banco + Realtime |

Rede Docker: `n8n-network-youtube`

## Estrutura do projeto

```
crm-casa-aurora/
├── packages/
│   ├── api/                    # Express ESM — porta 3334
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Schema mestre (tabelas existentes + CRM)
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── index.js
│   │       ├── modules/
│   │       │   ├── clientes/
│   │       │   ├── reservas/
│   │       │   ├── mesas/
│   │       │   ├── conversas/  # Inbox WhatsApp
│   │       │   ├── mensagens/  # Mensagens + envio WAHA
│   │       │   ├── equipe/     # Atendentes
│   │       │   ├── webhooks/   # WAHA + n8n (sem auth Clerk)
│   │       │   └── dashboard/  # Métricas
│   │       ├── middleware/     # auth, errorHandler, validate
│   │       └── lib/            # prisma, waha, resend, n8n, calendar
│   │
│   └── dashboard/              # Next.js 14 App Router — porta 5174
│       ├── app/
│       │   └── dashboard/
│       │       ├── page.tsx        # Visão geral + StatCards
│       │       ├── atendimento/    # Inbox WhatsApp (split-panel)
│       │       ├── clientes/
│       │       ├── reservas/
│       │       ├── mesas/
│       │       └── equipe/
│       ├── components/
│       │   ├── ui/             # Badge, Button, Card, Modal, Table…
│       │   └── atendimento/    # ConversasList, ChatPanel, ChatInput…
│       └── hooks/
│           ├── useRealtimeMessages.ts   # Supabase Realtime + polling fallback
│           └── useRealtimeConversas.ts  # Supabase Realtime + polling fallback
│
└── docs/
    ├── n8n-workflow-waha-crm.json   # Workflow importável (Sofia + CRM)
    ├── waha-webhook-setup.md        # Guia de configuração WAHA ↔ n8n
    └── supabase-realtime-setup.md   # Habilitar Realtime no Supabase
```

## Fases de implementação

- **Fase 1** ✅ Fundação — API + schema + módulos Cliente/Reserva/Mesa + dashboard dark
- **Fase 2** ✅ Atendimento — Inbox WhatsApp, Sofia (IA), workflow n8n, atendentes, Realtime
- **Fase 3** Operação — Pedidos, Estoque, baixa automática, notificações
- **Fase 4** Financeiro — Pagamentos, NF-e, relatórios

## Convenções

- **Backend**: ESM (`import/export`), async/await, respostas `{ success, data }` ou `{ success, error }`
- **Frontend**: TypeScript obrigatório, Server Components por padrão, `'use client'` explícito
- **Commits**: Conventional commits em português (`feat:`, `fix:`, `docs:`)
- **Rotas**: em português (`/api/conversas`, `/api/atendentes`)
- **Webhooks**: `/api/webhooks/*` são públicos (sem auth Clerk) — registrados antes das rotas protegidas
