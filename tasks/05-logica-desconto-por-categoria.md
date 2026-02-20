# Task 05 – Lógica de Desconto por Categoria

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 3.3 Lógica de Desconto por Categoria  
**Prioridade:** 🟠 Alta | **Tipo:** Feature

---

## Situação atual

- As opções de desconto rápido não seguem a lógica de recomendação do Nexus para cada categoria.

## Requisitos – Escolhas Rápidas de Desconto por Categoria

| Categoria       | Recomendação Nexus | Opções Rápidas     |
|-----------------|--------------------|--------------------|
| Liquidação      | ~20%               | 10% / 15% / 20%    |
| Capital Parado  | ~40%               | 30% / 35% / 40%    |
| Oportunidade    | Manter / Aumento   | A definir conforme lógica de aumento |

- [ ] Barra de ajuste manual deve continuar disponível para customização fora das opções rápidas.

## Critérios de aceite

- Na criação de campanha, as "opções rápidas" de desconto variam por categoria conforme a tabela acima.
- Oportunidade: opções de aumento (a definir) alinhadas à lógica existente em `recommendations.ts` (`getRecommendedIncrease`).
- Ajuste manual (slider/input) permanece disponível.

## Referências no código

- `src/features/campaigns/utils/recommendations.ts` (`getRecommendedDiscount`, `getRecommendedIncrease`, `isValidDiscount`, `isValidIncrease`).
- UI de criação de campanha: seleção de desconto/aumento, `DiscountSelector`, etc.

## Notas técnicas

- Reutilizar `getRecommendedDiscount(alert, originalPrice)` e `getRecommendedIncrease(alert, originalPrice)` para sugerir e validar opções rápidas.
- Garantir que testes em `recommendations.spec.ts` continuem passando após alterações.

---

**Status:** A fazer  
**Próximo:** Task 06 – Política de cancelamento 7 dias (CDC)
