# Task 08 – Ordem de Alertas no Painel

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 2.2 Lógica e Ordem de Alertas  
**Prioridade:** 🟡 Média | **Tipo:** UX

---

## Situação atual

- Os alertas aparecem sem uma ordem de prioridade clara. Para clientes com muitos produtos (ex.: 150+), o volume de informação torna a navegação exaustiva.

## Requisitos

- [ ] Estabelecer uma **ordem fixa de exibição** dos alertas, seguindo esta hierarquia de prioridade:
  1. Capital Parado
  2. Risco de Ruptura
  3. Liquidação
  4. Oportunidade
  5. Observar

- [ ] Alertas de maior impacto financeiro e operacional aparecem primeiro; o usuário não precisa rolar a tela para encontrar os mais críticos.

## Critérios de aceite

- A listagem de alertas do painel (e, se aplicável, cards de resumo) segue a ordem acima.
- Ordem aplicada de forma estável (sort determinístico por tipo de alerta).

## Referências no código

- `src/lib/constants/alert-config.ts`: `ALERT_URGENCY_ORDER` ou equivalente.
- Repository/API: `getProductAlerts`, `getOverviewMetrics` em `src/lib/bling/bling-repository.ts`.
- Dashboard: componente que lista alertas (ordenar no cliente ou no backend).

## Notas técnicas

- Definir ordem explícita por `BlingAlertType` (DEAD_STOCK, RUPTURE, LIQUIDATION, OPPORTUNITY, FINE) e aplicar no `orderBy` da query ou no sort do array antes de renderizar.
- Manter testes de alertas/dashboard passando.

---

**Status:** A fazer  
**Próximo:** Task 09 – Filtro de categoria no painel
