# CRM Casa Aurora — Contexto do Projeto

## Visão geral

Painel administrativo (CRM) para gestão interna de restaurantes. Este é um projeto **separado** do Casa Aurora (app voltado ao cliente). Ambos compartilham o mesmo banco de dados (Supabase) e a mesma infraestrutura de automação (n8n + WAHA + Redis).

## Dois projetos, um ecossistema

```
Casa Aurora (projeto existente, repo separado)
  → App do CLIENTE: landing page, reservas, pagamento Stripe, login
  → Stack: React + Vite, Node + Express, Clerk, Prisma, Supabase
  → Roda em: localhost:5173 (front) + localhost:3333 (back)

CRM Restaurante (ESTE PROJETO)
  → App da EQUIPE INTERNA: dashboard, inbox WhatsApp, pedidos, estoque, financeiro
  → Stack: Next.js 14 App Router + TypeScript, Node + Express, Clerk, Prisma, Supabase
  → Roda em: localhost:5174 (dashboard) + localhost:3334 (api)

Infraestrutura compartilhada (Docker Compose no repo do Casa Aurora)
  → n8n: localhost:5678
  → WAHA: localhost:3000
  → Redis: localhost:6379
  → Rede: n8n-network-youtube
```

### Fluxo entre os dois projetos

```
Cliente reserva no Casa Aurora ──→ Supabase (banco compartilhado)
                                       ↕
                                  n8n (automação)
                                       ↕
                              CRM Restaurante (equipe vê e gerencia)
                                       ↕
                                  WAHA (WhatsApp)
                                       ↕
                              Cliente recebe confirmação
```

## Banco de dados compartilhado

O CRM conecta no MESMO Supabase do Casa Aurora (mesma DATABASE_URL).

### Estratégia de schema

O Prisma schema do CRM é o **schema mestre** — contém todas as tabelas (as que o Casa Aurora já usa + as novas do CRM). Ao rodar `prisma db push`, ele adiciona as tabelas novas sem alterar as existentes.

Tabelas existentes do Casa Aurora (não alterar estrutura, só referenciar):
- `usuarios` / `User` — clientes registrados via Clerk
- `reservas` / `Reserva` — reservas com pagamento Stripe
- `mesas` / `Mesa` — mesas do restaurante

Tabelas novas do CRM (criar):
- `Conversa`, `Mensagem` — inbox WhatsApp
- `Atendente` — equipe interna com roles
- `Pedido`, `ItemPedido` — gestão de pedidos
- `Produto`, `Insumo`, `FichaTecnica`, `MovimentacaoEstoque` — estoque
- `Pagamento` — financeiro
- `ClienteTag`, `Segmento` — CRM e segmentação

**IMPORTANTE**: antes de criar o schema Prisma, faça `prisma db pull` para importar as tabelas que já existem no Supabase. Isso garante que o schema parte do estado real do banco, não de suposições.

## Tech stack

### Backend (packages/api)
- Node.js + Express 4 (ESM — `"type": "module"`)
- Prisma ORM com PostgreSQL (Supabase compartilhado)
- Clerk para autenticação (roles: admin, gerente, garcom, atendente)
- Zod para validação de request bodies
- Linguagem: JavaScript ESM (sem TypeScript no backend)
- Porta: 3334

### Dashboard (packages/dashboard)
- **Next.js 14** com App Router
- **TypeScript** em todos os arquivos (`.ts` / `.tsx`)
- `@clerk/nextjs` — auth + middleware
- Clerk App ID: `app_3FBcLW2tzcrEuZocg0iJEuudQfA` (app separado do Casa Aurora)
- Tailwind CSS v4 via `@tailwindcss/postcss`
- Lucide React para ícones
- Recharts para gráficos
- Supabase Realtime para inbox ao vivo (Fase 2)
- Fontes: **Playfair Display** (títulos/valores) + **DM Sans** (corpo) via `next/font/google`
- Tema: dark fixo — fundo `#0F0A0A`, cards `#1F1515`, accent terracota `#C0603A`, dourado `#C9A84C`
- Proxy API: rewrite no `next.config.js` (`/api/*` → `http://localhost:3334/api/*`)
- Porta: 5174 (explícito para não conflitar com WAHA na 3000)

### Automação (já existente, repo do Casa Aurora)
- n8n (porta 5678) — motor de automação
- WAHA (porta 3000) — WhatsApp API
- Redis (porta 6379) — histórico de conversas da Sofia
- Docker Compose já configurado no projeto Casa Aurora
- O CRM NÃO tem seu próprio docker-compose — usa a infra existente

## Convenções de código

### Backend (packages/api)
- ESM imports (`import/export`, nunca `require`)
- Async/await em todos os handlers
- Middleware de erro centralizado em `src/middleware/errorHandler.js`
- Respostas padronizadas: `{ success: true, data: {} }` ou `{ success: false, error: { code, message } }`
- Status HTTP: 201 criação, 200 leitura/update, 204 delete
- Variáveis de ambiente em `.env`, acessadas via `process.env`
- Rotas em português: `/api/clientes`, `/api/reservas`, `/api/pedidos`, `/api/conversas`
- Webhooks do n8n usam prefixo `/api/webhooks/`

### Dashboard (packages/dashboard)
- **TypeScript obrigatório** — sem arquivos `.jsx` ou `.js`
- Componentes funcionais com hooks; `'use client'` explícito onde necessário (interatividade/hooks)
- Pages sem `'use client'` são Server Components por padrão
- Imports usam alias `@/` (configurado no `tsconfig.json` → `"@/*": ["./*"]`)
- Interfaces tipadas em todos os componentes de UI
- Custom hooks em `hooks/` com tipos de retorno explícitos
- API calls via `lib/api.ts` (`createApi`) com generics: `api.get<T>(path)`
- Resposta padrão: `ApiResponse<T> = { success, data: T, error? }`
- Auth: `useUser()` para dados do usuário e metadata, `useAuth()` para token
- Role do usuário: `user?.publicMetadata?.role` (não sessionClaims)

### Prisma
- Models em PascalCase singular: `Cliente`, `Reserva`, `Mesa`, `Pedido`
- Campos em camelCase: `nomeCompleto`, `dataCriacao`
- Toda tabela NOVA tem `restauranteId` (multi-tenant desde o início)
- Tabelas existentes do Casa Aurora: manter os nomes e campos atuais
- Soft delete com campo `deletedAt` (nullable DateTime) nas tabelas novas
- Timestamps: `criadoEm`, `atualizadoEm` nas tabelas novas

### Git
- Conventional commits em português: `feat: adiciona módulo de reservas`
- Branch por feature: `feat/modulo-atendimento`, `feat/modulo-pedidos`

## Estrutura de pastas

```
crm-casa-aurora/
├── claude.md                   # Este arquivo
├── package.json                # Workspace root (npm workspaces)
├── docs/
│   └── n8n-workflows.json
├── packages/
│   ├── api/                    # Backend Express — porta 3334
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema mestre (tabelas existentes + novas)
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── modules/
│   │   │   │   ├── clientes/
│   │   │   │   ├── reservas/
│   │   │   │   ├── mesas/
│   │   │   │   ├── conversas/
│   │   │   │   ├── mensagens/
│   │   │   │   ├── pedidos/
│   │   │   │   ├── produtos/
│   │   │   │   ├── estoque/
│   │   │   │   ├── pagamentos/
│   │   │   │   ├── equipe/
│   │   │   │   └── webhooks/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.js
│   │   │   │   ├── errorHandler.js
│   │   │   │   └── validate.js
│   │   │   └── lib/
│   │   │       ├── prisma.js
│   │   │       ├── resend.js
│   │   │       ├── waha.js
│   │   │       ├── n8n.js
│   │   │       └── calendar.js
│   │   ├── package.json
│   │   └── .env
│   └── dashboard/              # Next.js 14 App Router — porta 5174
│       ├── app/
│       │   ├── globals.css             # Tailwind v4 + CSS vars da paleta
│       │   ├── layout.tsx              # ClerkProvider + fontes
│       │   ├── page.tsx                # Redirect → /dashboard
│       │   ├── sign-in/[[...sign-in]]/
│       │   ├── sign-up/[[...sign-up]]/
│       │   └── dashboard/
│       │       ├── layout.tsx          # Sidebar Casa Aurora
│       │       ├── page.tsx            # Visão geral (StatCards + reservas)
│       │       ├── clientes/page.tsx
│       │       ├── reservas/page.tsx
│       │       ├── mesas/page.tsx
│       │       ├── atendimento/page.tsx
│       │       ├── pedidos/page.tsx
│       │       ├── estoque/page.tsx
│       │       ├── financeiro/page.tsx
│       │       └── equipe/page.tsx
│       ├── components/
│       │   └── ui/                     # 9 componentes .tsx tipados
│       │       ├── Badge.tsx
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── EmptyState.tsx
│       │       ├── Input.tsx
│       │       ├── Modal.tsx
│       │       ├── PageHeader.tsx
│       │       ├── StatCard.tsx
│       │       └── Table.tsx
│       ├── hooks/
│       │   ├── useApi.ts               # Generic hook: useApi<T>(path, deps?)
│       │   └── useIsAdmin.ts           # Retorna { isAdmin, isLoaded }
│       ├── lib/
│       │   └── api.ts                  # createApi + ApiResponse<T>
│       ├── middleware.ts               # Clerk auth matcher
│       ├── next.config.js              # Rewrite /api → localhost:3334
│       ├── package.json
│       ├── postcss.config.js
│       └── tsconfig.json              # paths: { "@/*": ["./*"] }
└── .gitignore
```

## Fases de implementação

**Fase 1 — Fundação** ✅: API + schema (db pull + novas tabelas) + módulos Cliente, Reserva, Mesa + dashboard com tema dark Casa Aurora + StatCards + PageHeader

**Fase 2 — Atendimento**: Conversa, Mensagem, Equipe + inbox WhatsApp no dashboard + distribuição automática + webhooks WAHA

**Fase 3 — Operação**: Pedido, Produto, Estoque + baixa automática + notificações via n8n

**Fase 4 — Financeiro**: Pagamento + integração NF-e + relatórios

## Tabelas novas do CRM (resumo)

Estas são as tabelas que o CRM adiciona ao banco. As tabelas do Casa Aurora (usuarios, reservas, mesas) já existem e são referenciadas via FK.

- **Restaurante**: id, nome, endereco, telefone, cnpj (multi-tenant)
- **Conversa**: id, restauranteId, clienteId, atendenteId, canal (whatsapp/web), status (aberta/aguardando/fechada), iniciadaEm, finalizadaEm
- **Mensagem**: id, conversaId, remetente (cliente/bot/atendente), conteudo, tipo (texto/imagem/audio/documento), enviadaEm
- **Atendente**: id, restauranteId, clerkUserId, nome, role (admin/gerente/garcom/atendente), status (online/offline/pausa), atendimentosAtivos
- **Pedido**: id, restauranteId, clienteId, mesaId, atendenteId, status (recebido/preparando/pronto/entregue/cancelado), total, observacoes
- **ItemPedido**: id, pedidoId, produtoId, quantidade, precoUnitario, observacoes
- **Produto**: id, restauranteId, nome, descricao, preco, categoria, ativo
- **Insumo**: id, restauranteId, nome, unidade, quantidadeAtual, quantidadeMinima
- **FichaTecnica**: id, produtoId, insumoId, quantidadePorUnidade
- **MovimentacaoEstoque**: id, insumoId, tipo (entrada/saida), quantidade, motivo, pedidoId, criadoEm
- **Pagamento**: id, restauranteId, pedidoId, reservaId, valor, metodo (pix/cartao/dinheiro), status (pendente/confirmado/estornado), externalId
