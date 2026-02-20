# Task 03 – Integração PIX (Pagamento)

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 5.1 Integração PIX no App e na Landing Page  
**Prioridade:** 🔴 Alta | **Tipo:** Feature

---

## Situação atual

- O botão de upgrade/ação na landing page e dentro do app direciona apenas para pagamento via cartão de crédito.
- O fluxo "Ver Planos" não abre a página de planos com opção de pagamento via PIX.

## Requisitos

- [ ] Adicionar opção de pagamento via **PIX** como método alternativo ao cartão.
- [ ] Na tela de upgrade (dentro do app): o usuário deve poder **escolher entre Cartão e PIX** antes de prosseguir.
- [ ] No botão "Ver Planos" da landing page: deve abrir a página de planos com **ambas as opções de pagamento visíveis**.
- [ ] PIX pode ser configurado com geração de QR Code e prazo de validade de 30 minutos.
- [ ] Considerar integração com gateway que suporte ambos os métodos (ex.: Stripe + Asaas, Pagar.me, Mercado Pago).

## Critérios de aceite

- Tela de upgrade/checkout exibe opção Cartão e opção PIX.
- Landing page "Ver Planos" leva à página de planos com Cartão e PIX visíveis.
- Fluxo PIX (QR Code, validade 30 min) funcional conforme gateway escolhido.

## Referências no código

- Billing: `src/features/billing/`, `src/app/api/stripe/`, `create-checkout-session`, Stripe checkout/portal.
- Landing / preços: `src/app/(public)/precos/`, botão "Ver Planos".
- Constantes de preço: PRO R$ 97/mês ou R$ 970/ano.

## Notas técnicas

- Projeto já usa Stripe; avaliar Stripe + outro gateway para PIX ou solução única que suporte PIX e cartão.
- Manter AGENTS.md e envs atualizados (novas variáveis de gateway PIX se houver).

---

**Status:** A fazer  
**Próximo:** Task 04 – Cores e visuais dos cards no Gerar Campanha
