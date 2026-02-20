# Task 06 – Política de Cancelamento 7 Dias (CDC)

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 6. Política de Cancelamento – Código de Defesa do Consumidor  
**Prioridade:** 🟠 Alta | **Tipo:** Legal

---

## Situação atual

- Política de cancelamento em 7 dias não implementada.

## Requisitos

- [ ] Implementar direito de cancelamento em até **7 dias corridos** a partir da assinatura (Art. 49 CDC).
- [ ] **Reembolso integral automático** para cancelamentos dentro do prazo legal.
- [ ] Fluxo de cancelamento acessível no app: **Configurações > Assinatura > Cancelar**.
- [ ] Exibir informação sobre a política de 7 dias na **tela de checkout** e na **área de assinatura**.
- [ ] Registrar **timestamp de assinatura** para cálculo do prazo de forma auditável.

## Critérios de aceite

- Usuário pode cancelar pela rota Configurações > Assinatura > Cancelar.
- Se cancelar dentro de 7 dias da assinatura: reembolso integral automático (via Stripe ou gateway).
- Checkout e área de assinatura exibem texto sobre direito de arrependimento em 7 dias.
- Data de assinatura persistida (ex.: `currentPeriodStart` ou campo dedicado) e usada para decidir se aplica reembolso integral.

## Referências no código

- Billing: `src/features/billing/`, Stripe subscription, webhooks (subscription-deleted, etc.).
- User/Subscription: `prisma/schema.prisma` (User: `currentPeriodEnd`, `stripeSubscriptionId`, etc.).
- Páginas: checkout, portal, minha-conta/assinatura.

## Notas técnicas

- Stripe: usar `subscription.created` ou equivalente para guardar data de início; em cancelamento, comparar com "hoje" e acionar reembolso se ≤ 7 dias.
- Textos devem ser claros e em português (CDC).

---

**Status:** A fazer  
**Próximo:** Task 07 – Correção do label "Saudável" no dashboard
