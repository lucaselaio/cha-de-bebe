# Cha de Bebe

Aplicacao Vue para lista de presentes do cha de bebe.

## Persistencia das reservas

- Em desenvolvimento local, as reservas continuam sendo salvas em `data/selections.json`.
- Na Vercel, as reservas agora precisam de um Redis persistente.
- O caminho recomendado e conectar o app ao `Upstash Redis` pelo Marketplace da Vercel.

## Como configurar na Vercel

1. Abra o projeto na Vercel.
2. Em `Storage`, conecte um banco `Upstash Redis`.
3. Confirme que as variaveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` foram adicionadas ao projeto.
4. Faça um novo deploy.

Sem essas variaveis em producao, a API retorna erro em vez de fingir que salvou as reservas.
