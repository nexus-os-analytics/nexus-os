# Task 10 – Tour Guiado (Onboarding)

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 2.1 Tour Guiado  
**Prioridade:** 🟡 Média | **Tipo:** Feature

---

## Situação atual

- Não existe onboarding ou guia de uso para novos usuários.

## Requisitos

- [ ] Implementar um **Tour Guiado interativo**:
  - Ativado **automaticamente no primeiro acesso**.
  - Acessível a qualquer momento via botão **"?"** ou **"Tour"**.

- [ ] O tour deve cobrir:
  - Explicação de cada seção do painel.
  - Definição dos termos: Capital Parado, Liquidação, Oportunidade, Saudável, Risco de Ruptura.
  - Significado dos alertas e como agir em cada um.
  - Como usar o módulo Gerar Campanha com IA.

**Objetivo:** Reduzir volume de suporte e aumentar taxa de ativação e retenção de novos usuários.

## Critérios de aceite

- Tour é exibido automaticamente na primeira visita ao painel (ex.: flag em user ou localStorage).
- Botão "?" ou "Tour" visível no layout (header/dashboard) reabre o tour.
- Conteúdo cobre seções do painel, termos e Gerar Campanha com IA.

## Referências no código

- Dashboard: `src/features/dashboard/`, `src/app/(private)/dashboard/`, `src/app/(private)/visao-geral/`.
- User: `onboardingCompleted` em Prisma/User; possível uso para "primeiro acesso".
- UI: Mantine Spotlight, Modal, Stepper ou biblioteca de tour (ex.: Driver.js, React Joyride) — conforme padrão do projeto.

## Notas técnicas

- Usar Mantine quando possível (AGENTS.md). Persistir "tour visto" em user ou localStorage para não mostrar sempre.
- Evitar dependências pesadas; preferir componente leve com steps e overlay.

---

**Status:** A fazer  
**Próximo:** Task 11 – Logo + Nome clicável na navbar
