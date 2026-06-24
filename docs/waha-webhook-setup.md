# Configurando WAHA para enviar mensagens ao n8n

## Pré-requisitos

- WAHA rodando em `http://localhost:3000`
- n8n rodando em `http://localhost:5678`
- Sessão WhatsApp ativa no WAHA
- CRM API rodando em `http://localhost:3334`

---

## 1. Importar o workflow n8n

1. Acesse o n8n: http://localhost:5678
2. Vá em **Workflows → Import from file**
3. Selecione o arquivo `docs/n8n-workflow-waha-crm.json`
4. Ative o workflow (toggle no canto superior direito)
5. A URL do webhook será:
   - **Dentro do Docker**: `http://n8n-youtube:5678/webhook/menu-cliente`
   - **Fora do Docker**: `http://localhost:5678/webhook/menu-cliente`

> O path é `menu-cliente` — o mesmo do workflow original do Casa Aurora.
> Não altere o path para não perder a configuração já existente no WAHA.

---

## 2. Configurar credenciais no n8n

As credenciais abaixo já devem existir no seu n8n (mantidas do workflow original).
Verifique se os IDs estão corretos ao importar:

| Credencial | ID | Tipo |
|---|---|---|
| WAHA account | `Ud79kfNRiIutDWYl` | HTTP Header Auth |
| Redis account | `83G677gqgZUn1I8v` | Redis |
| Google Gemini(PaLM) Api account | `4JxZSKaMdO8oSwA5` | Google PaLM API |

Se o n8n pedir para reconfigurar credenciais após importar, crie-as com os mesmos nomes.

### Redis (se precisar recriar)

1. **Settings → Credentials → New Credential → Redis**
2. Nome: `Redis account`
3. Host: `redis` (dentro do Docker) ou `localhost`
4. Port: `6379`

### Google Gemini (se precisar recriar)

1. **Settings → Credentials → New Credential → Google PaLM API**
2. Nome: `Google Gemini(PaLM) Api account`
3. API Key: sua chave do Google AI Studio (https://aistudio.google.com/app/apikey)

### WAHA (se precisar recriar)

1. **Settings → Credentials → New Credential → HTTP Header Auth**
2. Nome: `WAHA account`
3. Header Name: `apikey`
4. Header Value: sua API key do WAHA (ou deixe vazio se WAHA sem auth)

---

## 3. Configurar webhook no WAHA

O WAHA deve enviar mensagens recebidas para o n8n, que as processa e chama o CRM.

### Via Dashboard WAHA

1. Acesse: http://localhost:3000/dashboard
2. Vá em **Sessions → default** (ou a sessão ativa)
3. Clique em **Edit** → seção **Webhooks**
4. Configure:
   - **URL**: `http://n8n-youtube:5678/webhook/menu-cliente`
     - Se WAHA fora do Docker: `http://localhost:5678/webhook/menu-cliente`
   - **Events**: marque apenas `message`
5. Clique em **Save**

### Via API WAHA (alternativa)

```bash
curl -X PUT http://localhost:3000/api/sessions/default \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [
        {
          "url": "http://n8n-youtube:5678/webhook/menu-cliente",
          "events": ["message"]
        }
      ]
    }
  }'
```

> **Rede Docker**: dentro da rede `n8n-network-youtube`, use `n8n-youtube` como host.
> O CRM API (porta 3334) é acessado pelo n8n como `http://localhost:3334`
> (ou `http://host.docker.internal:3334` se n8n está em Docker e CRM fora).

---

## 4. Variáveis de ambiente da CRM API

No arquivo `packages/api/.env`:

```env
DEFAULT_RESTAURANTE_ID=id_do_restaurante_no_banco
WAHA_API_URL=http://localhost:3000
WAHA_API_KEY=                     # vazio se WAHA sem autenticação
```

---

## 5. Nós novos adicionados ao workflow

O workflow original foi adaptado com os seguintes nós:

### Novo: "Registrar no CRM" (após Extrair Mensagem)
```
POST http://localhost:3334/api/webhooks/waha
Body: { from: chatId, body: mensagem, session: "default" }
```
Cria ou reutiliza cliente + conversa no banco. Retorna `conversaId` e `temAtendente`.

### Novo: "Tem Atendente?" (IF após Registrar no CRM)
```
Condição: data.temAtendente === true
```
- **SIM**: para a execução (atendente humano responde pelo dashboard)
- **NÃO**: continua para Sofia (Gemini)

### "Tipo de Ação" (Switch, substituiu "É Reserva?" IF)
```
Switch no campo: tipo (vem do Processar Resposta)
  → "reserva": Registrar Reserva CRM → WAHA Confirma Reserva
  → "humano":  Transferir Humano CRM → WAHA Avisa Transferência
  → default:   Registrar Resposta CRM → WAHA Responde
```

### Novo: "Registrar Reserva CRM" / "Transferir Humano CRM" / "Registrar Resposta CRM"
```
POST http://localhost:3334/api/webhooks/n8n/response
Body: { conversaId, conteudo: textoResposta, chatId }
```
Salva a resposta da Sofia no banco. Para transferências, envia token `ATENDENTE_HUMANO`
que o CRM processa (muda status da conversa, atribui atendente, notifica cliente via WAHA).

---

## 6. Testar o fluxo completo

### Teste 1 — Webhook CRM sem auth Clerk

```bash
curl -X POST http://localhost:3334/api/webhooks/waha \
  -H "Content-Type: application/json" \
  -d '{"from": "5585912345678@c.us", "body": "Olá!", "session": "default"}'
```
Esperado: `{"success": true, "data": {"ok": true, "conversaId": "...", "temAtendente": false}}`

### Teste 2 — Resposta normal da Sofia

```bash
curl -X POST http://localhost:3334/api/webhooks/n8n/response \
  -H "Content-Type: application/json" \
  -d '{"conversaId": "ID_AQUI", "chatId": "5585912345678@c.us", "conteudo": "Olá! Como posso ajudar?"}'
```

### Teste 3 — Transferência para atendente humano

```bash
curl -X POST http://localhost:3334/api/webhooks/n8n/response \
  -H "Content-Type: application/json" \
  -d '{"conversaId": "ID_AQUI", "chatId": "5585912345678@c.us", "conteudo": "ATENDENTE_HUMANO:{\"acao\":\"transferir\"}"}'
```
Esperado: `{"success": true, "data": {"ok": true, "acao": "aguardando_humano", "atendente": {...}}}`

---

## 7. Fluxo completo

```
Cliente envia WhatsApp
        ↓
WAHA recebe e dispara POST /webhook/menu-cliente (n8n)
        ↓
n8n: Extrair Mensagem → extrai chatId e texto
        ↓
n8n: Registrar no CRM → POST /api/webhooks/waha → cria cliente/conversa
        ↓
n8n: Tem Atendente? (IF)
   ├── SIM → PARA (atendente responde pelo /dashboard/atendimento)
   └── NÃO → continua para Sofia
                    ↓
         Redis GET (historico:chatId)
                    ↓
         Montar Histórico
                    ↓
         Sofia — Gemini (gemini-2.5-flash)
                    ↓
         Processar Resposta (detecta tipo: conversa | reserva | humano)
                    ↓
         Redis SET (salva histórico, TTL 24h)
                    ↓
         Tipo de Ação (Switch)
            ├── reserva → Registrar Reserva CRM → WAHA Confirma
            ├── humano  → Transferir Humano CRM → WAHA Avisa
            └── conversa→ Registrar Resposta CRM → WAHA Responde

Atendente no Dashboard (após transferência)
        ↓ digita no ChatInput
POST /api/conversas/:id/mensagens { remetente: "atendente" }
        ↓
CRM → salva no banco → envia via WAHA → dashboard atualiza (Realtime ou polling 5s)
```
