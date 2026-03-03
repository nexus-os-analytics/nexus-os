## 1. Stack

- **Runtime:** Node >= 20
- **Package Manager:** pnpm >= 10 (obrigatório)
- **Framework:** Next.js 16 (App Router)
- **UI:** Mantine 8
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query v5
- **Auth:** NextAuth
- **Database:** PostgreSQL + Prisma 7
- **Async Jobs:** Inngest
- **Payments:** Stripe
- **Observability:** Sentry
- **Tests:** Vitest

---

## 2. Regras Gerais

1. Nunca usar npm ou yarn. Sempre `pnpm`.
2. Nunca acessar banco direto via SQL se existir modelo Prisma.
3. Toda validação de input deve usar **Zod**.
4. Nenhuma lógica crítica deve ficar apenas no client.
5. Não criar abstrações genéricas sem uso real.
6. Seguir tipagem estrita. Não usar `any`.
7. Manter funções pequenas e puras sempre que possível.

---

## 3. Estrutura Arquitetural

### Frontend

- Componentes devem ser:
  - Presentacionais (UI)
  - Containers (data + lógica)

- Evitar lógica pesada dentro de componentes.
- Requisições via React Query.
- Estados globais apenas quando estritamente necessário.

### Backend (API Routes / Server Actions)

- Validar entrada com Zod.
- Isolar regras de negócio em serviços.
- Não misturar regra de negócio com camada HTTP.
- Sempre tratar erros explicitamente.

---

## 4. Banco de Dados

- Toda alteração exige migration Prisma.
- Nunca alterar schema manualmente no banco.
- Seeds devem ser idempotentes.
- Consultas complexas devem estar encapsuladas.

---

## 5. Assíncrono / Eventos

- Processos longos devem usar Inngest.
- Nunca bloquear request HTTP com tarefas pesadas.
- Eventos devem ter payload mínimo necessário.

---

## 6. Pagamentos

- Stripe é fonte da verdade para status de pagamento.
- Sempre validar webhook.
- Nunca confiar apenas em retorno do client.

---

## 7. Qualidade

Antes de qualquer PR:

```
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Nenhum erro permitido.

---

## 8. Segurança

- Nunca expor secrets no client.
- Validar permissões no server.
- Sanitizar qualquer input externo.
- Não confiar em dados vindos do frontend.

---

## 9. Performance

- Evitar re-renders desnecessários.
- Prefetch quando fizer sentido.
- Queries devem ser cacheáveis sempre que possível.
- Não fazer N+1 queries no Prisma.

---

## 10. Padrão de Código

- Nome de variáveis explícito.
- Arquivos pequenos.
- Código deve ser legível sem comentários excessivos.
- Comentários apenas quando explicam **por quê**, não **o quê**.
