# Tasks – Nexus OS

Pasta de tarefas derivadas do **PRD – Nexus OS: Documento de Melhorias e Requisitos de Produto** (v1.0, Fev/2026).

## Ordem de prioridade (execução sugerida)

| # | Arquivo | Resumo | Prioridade |
|---|---------|--------|------------|
| 01 | [01-otimizacao-mobile-dashboard.md](01-otimizacao-mobile-dashboard.md) | Otimização mobile (imagens e cards) | 🔴 Urgente |
| 02 | [02-bug-calculo-estoque-gerar-campanha.md](02-bug-calculo-estoque-gerar-campanha.md) | Bug de cálculo de estoque no Gerar Campanha | 🔴 Urgente |
| 03 | [03-integracao-pix.md](03-integracao-pix.md) | Integração PIX | 🔴 Alta |
| 04 | [04-cores-cards-gerar-campanha.md](04-cores-cards-gerar-campanha.md) | Cores e visuais dos cards no Gerar Campanha | 🟠 Alta |
| 05 | [05-logica-desconto-por-categoria.md](05-logica-desconto-por-categoria.md) | Lógica de desconto por categoria | 🟠 Alta |
| 06 | [06-politica-cancelamento-7-dias-cdc.md](06-politica-cancelamento-7-dias-cdc.md) | Política de cancelamento 7 dias (CDC) | 🟠 Alta |
| 07 | [07-label-saudavel-dashboard.md](07-label-saudavel-dashboard.md) | Correção do label "Saudável" no dashboard | 🟡 Média |
| 08 | [08-ordem-alertas-painel.md](08-ordem-alertas-painel.md) | Ordem de alertas no painel | 🟡 Média |
| 09 | [09-filtro-categoria-painel.md](09-filtro-categoria-painel.md) | Filtro de categoria no painel | 🟡 Média |
| 10 | [10-tour-guiado.md](10-tour-guiado.md) | Tour guiado | 🟡 Média |
| 11 | [11-logo-nome-navbar.md](11-logo-nome-navbar.md) | Logo + nome clicável na navbar | 🟡 Média |
| 12 | [12-badge-liquidacao-redesign.md](12-badge-liquidacao-redesign.md) | Badge de Liquidação (redesign) | 🟡 Média |
| 13 | [13-estrutura-free-pro-gerar-campanha.md](13-estrutura-free-pro-gerar-campanha.md) | Estrutura Free vs PRO no Gerar Campanha | 🟢 Baixa |
| 14 | [14-favicon-chrome.md](14-favicon-chrome.md) | Favicon no Chrome | 🟢 Baixa |
| 15 | [15-fotos-produto-chrome.md](15-fotos-produto-chrome.md) | Fotos de produto no Chrome | 🟢 Baixa |

## Como usar

- Abrir a task correspondente (ex.: `01-otimizacao-mobile-dashboard.md`).
- Implementar os requisitos e marcar os checkboxes `[ ]` → `[x]`.
- Ao concluir: rodar `pnpm test`, `pnpm typecheck` e `pnpm lint`; garantir que nada quebrou.
- Atualizar o **Status** no final do arquivo da task (ex.: "Concluído").

## Outros documentos na pasta

- `prd-stripe-webhook-resilience.md` – resiliência de webhooks Stripe (outro escopo).
- `prd-user-soft-delete-email-randomization.md` – soft delete e randomização de e-mail (outro escopo).
