# Task 09 – Filtro de Categoria no Painel

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 2.3 Filtro de Produtos no Painel  
**Prioridade:** 🟡 Média | **Tipo:** Feature

---

## Situação atual

- Não existe filtro por categoria no painel.

## Requisitos

- [ ] Adicionar **filtro rápido por categoria** para que o usuário possa visualizar apenas os produtos de uma categoria por vez.
- [ ] Categorias filtráveis:
  - Produtos em Risco (ruptura de estoque)
  - Oportunidade
  - Produtos em Liquidação / Dinheiro Parado
  - Saudável
  - Observar

- [ ] **"Produtos em Liquidação"** e **"Dinheiro Parado"** devem ser **unificados** como uma mesma categoria no filtro (estoque alto ou sem vendas por período prolongado).

## Critérios de aceite

- UI do painel exibe controle de filtro (dropdown, chips ou tabs) com as opções acima.
- Ao selecionar uma categoria, apenas alertas daquela categoria são exibidos.
- Liquidação + Capital Parado (Dinheiro Parado) = uma única opção de filtro que mostra ambos os tipos (LIQUIDATION + DEAD_STOCK, ou equivalente).

## Referências no código

- API: `src/app/api/dashboard/alerts/route.ts` (já aceita `type` e `risk`); `getProductAlerts` com `filters`.
- Dashboard: `src/features/dashboard/`, filtros existentes (se houver), listagem de alertas.
- Tipos: `BlingAlertType`, `BlingRuptureRisk` em Prisma.

## Notas técnicas

- Mapear opções de filtro para `type`/`risk` aceitos pela API; agrupar LIQUIDATION e DEAD_STOCK em uma opção "Liquidação / Dinheiro Parado" (enviar ambos no filtro ou valor composto).

---

**Status:** A fazer  
**Próximo:** Task 10 – Tour Guiado
