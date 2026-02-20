# Task 13 – Estrutura Free vs PRO no Gerar Campanha

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 3.4 Tipos de Conteúdo Gerado pela IA  
**Prioridade:** 🟢 Baixa | **Tipo:** Estratégico

---

## Situação atual

- O módulo atual gera 3 versões de campanha mais detalhadas e específicas, perdendo o formato anterior que gerava conteúdo para canais distintos (WhatsApp, Instagram, Marketplace).

## Requisitos – Proposta de Estrutura por Plano

**Plano Free:**
- Geração de **copies rápidas por canal:** mensagem WhatsApp, post Instagram, anúncio Marketplace.
- Conteúdo mais curto e direto.

**Plano PRO:**
- Manter as **3 versões detalhadas e específicas** atuais (tom de voz configurável, mais contexto).
- Acesso à funcionalidade **"Publicar Campanha"** (futura integração com META Ads).

**Observação:** O botão "Publicar Campanha" pode permanecer visível mas deve indicar claramente que a integração com META está **prevista para versão futura**, evitando confusão do usuário.

## Critérios de aceite

- Usuário FREE: vê opção de gerar copies por canal (WhatsApp, Instagram, Marketplace), conteúdo curto/direto.
- Usuário PRO: vê 3 versões detalhadas + tom de voz; botão "Publicar Campanha" visível com disclaimer de "em breve" / "versão futura".
- Lógica de plano: usar `user.planTier` ou equivalente para exibir funcionalidades.

## Referências no código

- Billing: `src/features/billing/entitlements.ts`, `PlanTier`, `getPlanEntitlements`.
- Campanhas: `src/features/campaigns/` (wizard, geração de cópia, variações), `campaign-ai.service.ts`, telas de resultado (CampaingResults, etc.).
- Auth: `useAuth()`, `user.planTier`.

## Notas técnicas

- Não implementar integração META Ads neste escopo; apenas UI e mensagem "em breve".
- Garantir que testes de entitlements e campanhas continuem passando.

---

**Status:** A fazer  
**Próximo:** Task 14 – Favicon Chrome
