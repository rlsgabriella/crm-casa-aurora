# CRM Restaurante

Painel administrativo interno para gestão de restaurantes. Projeto separado do [Casa Aurora](../casa-aurora) — ambos compartilham o mesmo banco Supabase e a mesma infraestrutura de automação.

## Relação com o Casa Aurora

| | Casa Aurora | CRM Restaurante |
|---|---|---|
| **Usuário** | Cliente final | Equipe interna |
| **Front** | localhost:5173 | localhost:5174 |
| **API** | localhost:3333 | localhost:3334 |
| **Banco** | Supabase compartilhado | Supabase compartilhado |

O CRM lê as tabelas `usuarios`, `reservas` e `mesas` criadas pelo Casa Aurora e adiciona suas próprias tabelas (conversas, pedidos, estoque, etc.) no mesmo banco.

## Pré-requisitos

- Node.js 20+
- Infra Docker do Casa Aurora rodando (`n8n`, `WAHA`, `Redis`)
- Conta Supabase (mesma do Casa Aurora)
- Conta Clerk (pode ser a mesma organização, aplicativo separado)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

**Backend:**
```bash
cp packages/api/.env.example packages/api/.env
# Preencher DATABASE_URL, CLERK_SECRET_KEY, WAHA_API_KEY, etc.
```

**Frontend:**
```bash
cp packages/dashboard/.env.example packages/dashboard/.env
# Preencher VITE_CLERK_PUBLISHABLE_KEY
```

### 3. Sincronizar schema com o Supabase

```bash
cd packages/api

# Importa as tabelas existentes do Casa Aurora
npm run db:pull

# Revise o schema.prisma gerado e adicione/ajuste os models do CRM
# Depois aplique as tabelas novas:
npm run db:push

# Gera o client Prisma
npm run db:generate
```

> **IMPORTANTE**: Sempre rode `db:pull` antes de `db:push` para não perder dados existentes.

## Como rodar

Abra dois terminais:

**Terminal 1 — API:**
```bash
cd packages/api
npm run dev
# API disponível em http://localhost:3334
```

**Terminal 2 — Dashboard:**
```bash
cd packages/dashboard
npm run dev
# Dashboard disponível em http://localhost:5174
```

## Infraestrutura compartilhada

A infraestrutura Docker (n8n, WAHA, Redis) está no repo do Casa Aurora. Certifique-se de que o `docker-compose up` do Casa Aurora está ativo antes de usar as funcionalidades de WhatsApp e automação:

| Serviço | URL |
|---|---|
| n8n | http://localhost:5678 |
| WAHA | http://localhost:3000 |
| Redis | localhost:6379 |

## Estrutura do projeto

```
crm-restaurante/
├── packages/
│   ├── api/         # Express + Prisma — porta 3334
│   └── dashboard/   # React + Vite — porta 5174
└── docs/            # Referências de workflows n8n
```

## Fases de implementação

- **Fase 1** (atual): Clientes, Reservas, Mesas, Dashboard de métricas
- **Fase 2**: Atendimento WhatsApp, Equipe, Inbox ao vivo
- **Fase 3**: Pedidos, Estoque, Baixa automática
- **Fase 4**: Financeiro, NF-e, Relatórios
