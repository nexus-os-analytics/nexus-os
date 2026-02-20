# Task 07 – Correção do Label "Saudável" no Dashboard

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 1. Dashboard – First Impact (Cards de Resumo)  
**Prioridade:** 🟡 Média | **Tipo:** Bug

---

## Situação atual

- O card **"Saudável"** não está sendo exibido corretamente no painel principal — aparece como **"Observar"** em vez de **"Saudável"**.

## Requisitos

- [ ] Corrigir o label do card para exibir **"Saudável"** conforme definido na proposta de valor do produto.
- [ ] Garantir consistência de nomenclatura entre o First Impact e o Painel (Dashboard).

## Critérios de aceite

- Onde o tipo de alerta for FINE (estoque saudável), o label exibido é "Saudável", não "Observar".
- Cards de resumo (First Impact) e listagem do painel usam a mesma nomenclatura.

## Referências no código

- `src/lib/constants/alert-config.ts`: `ALERT_TYPE_CONFIG.FINE.label` = `'SAUDÁVEL'`; `getAlertTypeLabel`.
- `src/lib/bling/bling-utils.ts`: `mapAlertTypeToPtLabel` usa `getAlertTypeLabel`.
- Dashboard: componentes que exibem tipo de alerta (cards de resumo, lista de alertas).

## Notas técnicas

- O código em `alert-config.ts` já define FINE como "SAUDÁVEL"; verificar todos os pontos que exibem label (possível uso de "OBSERVAR" ou outro mapeamento antigo).
- Teste em `bling-utils.spec.ts` já espera `mapAlertTypeToPtLabel('FINE')` = 'SAUDÁVEL'; manter consistência.

---

**Status:** A fazer  
**Próximo:** Task 08 – Ordem de alertas no painel
