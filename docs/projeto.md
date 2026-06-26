# CRM Casa Aurora — Status do Projeto

*Atualizado em: 26/06/2026*

---

## Alterações realizadas (ordem cronológica)

### Sessão 1 — Arquitetura e Scaffold

1. Definição da arquitetura completa do CRM (módulos, fluxo de dados, modelo de dados)
2. Criação do CLAUDE.md e prompt inicial para Claude Code
3. Scaffold do monorepo com npm workspaces (packages/api + packages/dashboard)
4. Decisão de separar CRM do Casa Aurora (repos independentes, banco compartilhado)
5. Reescrita do CLAUDE.md e prompt refletindo a separação
6. Consolidação de estrutura duplicada (back-end/ e front-end/ antigos removidos)
7. Migração de lógica útil: webhooks WAHA/n8n, serviços de email, calendar, WAHA helper

### Sessão 2 — Banco de dados e configuração

8. Configuração do Prisma schema mestre (3 tabelas existentes do Casa Aurora + 12 novas do CRM + 7 enums)
9. Adição de directUrl no datasource do Prisma (necessário para db push via Supabase)
10. Criação das 15 tabelas no Supabase via prisma db push
11. Execução do seed: 1 restaurante, 10 mesas, 5 clientes, 4 atendentes, 5 conversas, 18 mensagens
12. DEFAULT_RESTAURANTE_ID definido: cmqhje7ng0000gkzbvvxrkbaj
13. Habilitação do Supabase Realtime nas tabelas Mensagem, Conversa e Atendente
14. Criação de Clerk app separado para o CRM (app_3FBcLW2tzcrEuZocg0iJEuudQfA)

### Sessão 3 — Dashboard (Fase 1)

15. Dashboard migrado de React+Vite para Next.js 15 + App Router + TypeScript
16. Design system aplicado: dark theme, Playfair Display + DM Sans, paleta terracota/dourado
17. 9 componentes UI tipados (.tsx): Button, Input, Card, Badge, Table, Pagination, Modal, EmptyState, StatCard, PageHeader
18. Páginas funcionais: Dashboard (métricas + gráfico), Clientes (tabela + busca), Reservas (filtros + ações), Mesas (grid visual)
19. Páginas placeholder: Atendimento, Pedidos, Estoque, Financeiro, Equipe
20. Conversão dos 3 arquivos restantes de .js para .ts (useApi, useIsAdmin, api)
21. Layout com sidebar escura, navegação com ícones Lucide, UserButton do Clerk

### Sessão 4 — Atendimento e WhatsApp (Fase 2)

22. Backend: módulos Conversas (CRUD + atribuição automática round-robin), Mensagens (cursor-based + envio WAHA), Equipe (CRUD + métricas)
23. Backend: webhook WAHA reescrito (normalização telefone, busca/cria cliente+conversa, detecção tokens)
24. Backend: webhook n8n/response atualizado (ATENDENTE_HUMANO, RESERVA_JSON, resposta normal)
25. Dashboard: lib/supabase.ts com client para Realtime
26. Dashboard: hooks useRealtimeMessages.ts e useRealtimeConversas.ts com fallback polling 5s
27. Dashboard: 8 componentes de atendimento (ConversasList, ConversaCard, ChatPanel, ChatHeader, ChatMessages, MessageBubble, ChatInput, TransferModal)
28. Dashboard: página /dashboard/atendimento — inbox split-panel completo
29. Dashboard: página /dashboard/equipe — tabela de atendentes + modal criação + toggle status
30. Dashboard: StatCard "Conversas Abertas" + mini lista no dashboard principal

### Sessão 6 — Correção de reservas WhatsApp + Google Calendar

45. Diagnóstico e correção do bug: reservas via WhatsApp não eram salvas no banco
    - Causa: `Processar Resposta` extraía `dadosReserva` mas os nodes seguintes descartavam o campo e enviavam só texto
    - A API procurava o token `RESERVA_JSON` no texto, que já havia sido removido pelo node anterior
46. Backend `webhooks.service.js`: `processarRespostaN8n` refatorado para aceitar `tipo` e `dadosReserva` no body
    - Novo caminho `tipo === 'reserva'`: cria reserva direto do objeto estruturado, parse de data DD/MM/AAAA e AAAA-MM-DD
    - Novo caminho `tipo === 'humano'`: lógica de transferência ativada por campo, não por token no texto
    - Caminhos antigos por token mantidos como fallback (retrocompatibilidade)
47. Workflow n8n (versionId 4): 3 nodes atualizados
    - `Registrar Reserva CRM`: adicionados `tipo` e `dadosReserva` no body
    - `Transferir Humano CRM`: substituído token hardcoded `ATENDENTE_HUMANO:{...}` por `tipo: 'humano'`
    - `Registrar Resposta CRM`: adicionado `tipo: 'conversa'`
48. Google Calendar integrado ao fluxo de reservas
    - `src/lib/calendar.js` implementado com googleapis + Service Account (substituiu placeholder)
    - Chamada ao Calendar inserida após criação da reserva, em try/catch isolado (falha no Calendar não cancela a reserva)
    - Suporte a convite por email: se o cliente informar email, recebe convite via Google Calendar
    - `.env.example` atualizado com `GOOGLE_APPLICATION_CREDENTIALS` e `GOOGLE_CALENDAR_ID`
    - `credentials.json` adicionado ao `.gitignore`
49. Prompt da Sofia atualizado (versionId 5): coleta email como 5° campo opcional, formato de data no RESERVA_JSON alterado para AAAA-MM-DD
50. `googleapis@^173.0.0` adicionado às dependências do `packages/api`

### Sessão 5 — Integração n8n + correções

31. Webhooks (/api/webhooks/*) movidos para ANTES do middleware Clerk (acesso público)
32. src/lib/waha.js corrigido: bug do prefixo "+" no chatId
33. Adaptação do workflow n8n existente (Casa Aurora Menu Interativo) para integrar com CRM
34. Adição de 6 nodes novos ao workflow: Registrar no CRM, Tem Atendente?, Tipo de Ação (Switch), Registrar Reserva CRM, Transferir Humano CRM, Registrar Resposta CRM
35. Remoção do node Google Sheets (reservas agora vão pro banco via API)
36. Correção do node "Extrair Mensagem": payload WAHA vem em item.body.payload
37. Correção do node "Processar Resposta": compatibilidade com output do node nativo Gemini (content.parts[0].text)
38. Substituição do node HTTP Request do Gemini por node nativo "Message a Model" do n8n
39. Correção das URLs dos nodes CRM: localhost → host.docker.internal:3334 (Docker → host)
40. Correção das URLs dos nodes WAHA: usar waha:3000 (dentro da rede Docker)
41. Correção dos campos Chat Id e Text nos nodes WAHA: referenciar Extrair Mensagem e Processar Resposta
42. Correção do Switch "Tipo de Ação": Fallback Output de 0 para 2 (terceira saída para conversas normais)
43. Correção do .env: remoção de \r (carriage return Windows) com sed
44. Correção do .env: DATABASE_URL revertida para conexão direta (pooler não funciona no free tier sem IPv4 add-on)

---

## Fases do projeto — estado atual

### ✅ FASE 1 — Fundação (COMPLETA)

**Backend (API Express — porta 3334):**
- [x] Servidor Express com cors, helmet, morgan
- [x] Prisma ORM com PostgreSQL (Supabase)
- [x] Schema mestre: 15 tabelas (3 existentes + 12 novas) + 7 enums
- [x] Middleware: Clerk auth, error handler, Zod validation
- [x] Módulo Clientes: GET lista/busca/histórico, PATCH
- [x] Módulo Reservas: GET lista/hoje, PATCH status
- [x] Módulo Mesas: GET todas/disponíveis, PATCH status
- [x] Módulo Webhooks: POST waha, n8n/response, reserva-landing
- [x] Módulo Dashboard: GET métricas, reservas-semana
- [x] Libs: prisma singleton, waha helper, n8n helper, resend, calendar
- [x] Seed: restaurante + mesas + clientes exemplo

**Dashboard (Next.js 15 — porta 5174):**
- [x] Next.js 15 + App Router + TypeScript
- [x] Clerk auth (app separado do CRM)
- [x] Design system: dark theme, Playfair Display + DM Sans, terracotta + gold
- [x] 9 componentes UI tipados
- [x] Dashboard principal com métricas e gráfico
- [x] Página Clientes com tabela e busca
- [x] Página Reservas com filtros e ações
- [x] Página Mesas com grid visual

---

### 🔧 FASE 2 — Atendimento WhatsApp (90% COMPLETA)

**Backend:**
- [x] Módulo Conversas: CRUD + atribuição automática round-robin
- [x] Módulo Mensagens: listagem cursor-based + envio via WAHA
- [x] Módulo Equipe: CRUD atendentes + métricas
- [x] Webhook WAHA: normalização telefone, busca/cria cliente+conversa
- [x] Webhook n8n/response: aceita `tipo` + `dadosReserva` estruturado (caminho principal) + fallback por token (retrocompat)
- [x] Webhooks públicos (sem Clerk)
- [x] waha.js corrigido
- [x] Google Calendar: `criarEventoCalendar` implementado com Service Account, suporte a convite por email

**Dashboard:**
- [x] Supabase Realtime client + hooks com fallback polling
- [x] 8 componentes de atendimento
- [x] Inbox split-panel (/dashboard/atendimento)
- [x] Página Equipe funcional
- [x] StatCard "Conversas Abertas" no dashboard

**Workflow n8n:**
- [x] Workflow adaptado com 16 nodes (6 novos)
- [x] Node "Extrair Mensagem" corrigido para payload WAHA
- [x] Node "Processar Resposta" corrigido para output Gemini nativo
- [x] Node Gemini trocado de HTTP Request para "Message a Model"
- [x] Switch "Tipo de Ação" com 3 saídas (reserva/humano/conversa)
- [x] URLs corrigidas (host.docker.internal, waha:3000)
- [x] Nodes CRM atualizados: `tipo` + `dadosReserva` no body (versionId 5)
- [x] Prompt da Sofia: email opcional como 5° campo, formato data AAAA-MM-DD no RESERVA_JSON

**⚠️ O QUE FALTA NA FASE 2:**
- [ ] Colocar `credentials.json` da Service Account em `packages/api/` e configurar `GOOGLE_CALENDAR_ID` no `.env`
- [ ] Reimportar workflow n8n (versionId 5) na interface do n8n
- [ ] Testar fluxo end-to-end completo (mensagem WhatsApp → dashboard → resposta → WhatsApp)
- [ ] Verificar se a conexão direta do banco está estável com a rede atual
- [ ] Ativar o workflow no n8n (toggle de produção)
- [ ] Configurar webhook do WAHA apontando para http://n8n-youtube:5678/webhook/menu-cliente
- [ ] Testar cenário Sofia responde automaticamente
- [ ] Testar cenário ATENDENTE_HUMANO (transferência para humano)
- [ ] Testar cenário reserva com email → evento criado no Calendar + convite enviado ao cliente
- [ ] Testar cenário reserva sem email → evento criado no Calendar sem convite
- [ ] Testar resposta do atendente pelo dashboard → chega no WhatsApp do cliente
- [ ] Confirmar que Supabase Realtime atualiza o chat ao vivo (ou fallback polling funciona)

---

### ⏳ FASE 3 — Operação (NÃO INICIADA)

**Backend:**
- [ ] Módulo Pedidos: CRUD com status (recebido → preparando → pronto → entregue)
- [ ] Módulo Produtos: CRUD cardápio
- [ ] Módulo Estoque (Insumos): CRUD + movimentações
- [ ] Módulo FichaTecnica: ligação produto ↔ insumos
- [ ] Baixa automática de estoque ao confirmar pedido
- [ ] Alertas de estoque baixo via n8n
- [ ] Notificações de status de pedido via WhatsApp

**Dashboard:**
- [ ] Página Pedidos: lista com status, ações de atualizar status
- [ ] Página Estoque: insumos, movimentações, alertas visuais
- [ ] Integração: pedido criado → baixa de estoque → notificação automática

---

### ⏳ FASE 4 — Financeiro e Relatórios (NÃO INICIADA)

**Backend:**
- [ ] Módulo Pagamentos: CRUD com métodos (pix/cartão/dinheiro)
- [ ] Integração NF-e via API terceira (Focus NFe / eNotas)
- [ ] Endpoints de relatórios: faturamento, ticket médio, ocupação

**Dashboard:**
- [ ] Página Financeiro: registro de pagamentos, controle de recebimentos
- [ ] Relatórios: faturamento diário/semanal/mensal, gráficos de evolução
- [ ] Exportação de dados (CSV/PDF)

---

## Infraestrutura atual

```
CRM Casa Aurora (este projeto)
├── packages/api        → Express, porta 3334
├── packages/dashboard  → Next.js 15, porta 5174
└── Banco: Supabase (edypndfqbfikkonnqfrp), conexão direta porta 5432

Casa Aurora (repo separado)
├── Frontend cliente    → React + Vite, porta 5173
├── Backend cliente     → Express, porta 3333
└── Banco: mesmo Supabase

Docker (rede n8n-network-youtube)
├── n8n-youtube         → porta 5678
├── waha                → porta 3000
└── redis               → porta 6379

Clerk
├── Casa Aurora (cliente) → app_3FBc3AXrfebwJybAP0ybkXJOPJb
└── CRM Restaurante       → app_3FBcLW2tzcrEuZocg0iJEuudQfA
```

---

## Próximo passo imediato

1. Configurar `credentials.json` (Service Account Google) em `packages/api/` e adicionar `GOOGLE_CALENDAR_ID` ao `.env`
2. Reimportar o workflow n8n (versionId 5) na interface do n8n
3. Testar o fluxo end-to-end: mensagem WhatsApp → Sofia coleta dados (incluindo email) → reserva criada no banco → evento no Calendar → cliente recebe confirmação

Depois disso, a Fase 2 está 100% completa e o CRM está funcional para gestão de reservas, clientes, mesas, atendimento WhatsApp e integração com Google Calendar.