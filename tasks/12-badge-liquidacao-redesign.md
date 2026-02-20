# Task 12 – Badge de Liquidação (Redesign)

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 4.2 Badge de Liquidação no Gerar Campanha  
**Prioridade:** 🟡 Média | **Tipo:** Design

---

## Situação atual

- O badge da categoria Liquidação está em azul e com aparência visual ruim, incompatível com o sistema de cores do produto.

## Requisitos

- [ ] Redesenhar o badge de Liquidação com visual mais refinado.
- [ ] **Cor:** seguir a lógica do sistema — se Oportunidade = verde, Liquidação deve ter cor própria (sugestão: **laranja ou amarelo**, a definir com design).
- [ ] O azul pode ser mantido para elementos do módulo Gerar Campanha (remete ao META Ads), mas **não** deve ser aplicado à categoria Liquidação.

## Critérios de aceite

- Badge "Liquidação" usa cor distinta (laranja/amarelo ou aprovada pelo design), não azul.
- Consistência com `alert-config` e demais badges do painel (Capital Parado, Oportunidade, etc.).

## Referências no código

- `src/lib/constants/alert-config.ts`: `ALERT_TYPE_CONFIG`, `getAlertTypeColor` — adicionar ou ajustar cor para LIQUIDATION.
- Componentes: `AlertBadge`, cards no Gerar Campanha que exibem categoria (ver Task 04).

## Notas técnicas

- Centralizar cor de Liquidação no tema/alert-config para reuso no painel e no Gerar Campanha.
- Garantir contraste acessível (WCAG) na cor escolhida.

---

**Status:** A fazer  
**Próximo:** Task 13 – Estrutura Free vs PRO no Gerar Campanha
