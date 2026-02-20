# Task 04 – Cores e Visuais dos Cards no Gerar Campanha

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 3.2 Visual dos Cards de Produto na Campanha  
**Prioridade:** 🟠 Alta | **Tipo:** UX

---

## Situação atual

- Os produtos listados na tela de criação de campanha aparecem sem cores ou indicadores visuais — apenas texto branco, sem identidade visual de categoria.

## Requisitos

- [ ] Os cards de produto dentro do Gerar Campanha devem seguir o **mesmo sistema de cores e indicadores visuais** do painel principal:
  - **Liquidação:** cor correspondente (vide item 3.5 / badge Liquidação).
  - **Capital Parado:** cor correspondente.
  - **Oportunidade:** verde.
- [ ] O cliente deve identificar visualmente a categoria do produto sem precisar ler o rótulo.

## Critérios de aceite

- Cada card de produto no fluxo Gerar Campanha exibe cor/indicador conforme categoria (Liquidação, Capital Parado, Oportunidade, etc.).
- Cores alinhadas com o painel (usar mesmo token/constante do tema ou `getAlertTypeColor` / `ALERT_TYPE_CONFIG`).

## Referências no código

- Painel: `src/lib/constants/alert-config.ts` (`getAlertTypeColor`, `ALERT_TYPE_CONFIG`), componentes de alerta.
- Gerar Campanha: `src/features/campaigns/`, `src/features/products/` (ProductCard, ProductCampaingGenerator, listagem de produtos para campanha).

## Notas técnicas

- Reutilizar `getAlertTypeColor(type)` ou mapeamento de `BlingAlertType` para cores nos cards do Gerar Campanha.
- Manter consistência com Task 12 (Badge de Liquidação) se a cor de Liquidação for refinada.

---

**Status:** A fazer  
**Próximo:** Task 05 – Lógica de desconto por categoria
