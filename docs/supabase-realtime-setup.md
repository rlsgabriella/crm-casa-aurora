# Habilitando Realtime no Supabase

O inbox de atendimento usa Supabase Realtime para atualizar mensagens e conversas sem polling.

## 1. Habilitar as tabelas via Dashboard

1. Acesse **Supabase Dashboard → Database → Replication**
2. Na seção "Supabase Realtime", habilite as tabelas:
   - `Mensagem` — para atualização do chat ao vivo
   - `Conversa` — para atualização da lista de conversas
   - `Atendente` — para status online/offline em tempo real

## 2. Ou via SQL (Supabase SQL Editor)

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE "Mensagem";
ALTER PUBLICATION supabase_realtime ADD TABLE "Conversa";
ALTER PUBLICATION supabase_realtime ADD TABLE "Atendente";
```

## 3. Configurar variáveis de ambiente

No arquivo `packages/dashboard/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

Esses valores estão no **Supabase Dashboard → Settings → API**.

## 4. Verificar conexão

Abra o painel de atendimento em `/dashboard/atendimento`. Um pequeno indicador de status
aparece nos hooks — se o Realtime conectar, novas mensagens aparecerão sem reload.

## Observações

- O `anon key` é seguro para uso no frontend (é a chave de acesso público).
- As Row Level Security (RLS) do Supabase devem estar configuradas para que o anon key
  só leia dados permitidos. Para o CRM interno, você pode desabilitar RLS nas tabelas CRM
  (já que o acesso é controlado pelo Clerk no nível da API).
- Para produção, habilite RLS e use políticas baseadas em JWT do Clerk.
