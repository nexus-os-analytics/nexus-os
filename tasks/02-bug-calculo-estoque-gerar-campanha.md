# Task 02 – Bug de Cálculo de Estoque no Gerar Campanha

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 3.1 Sincronização de Dados de Estoque  
**Prioridade:** 🔴 Urgente | **Tipo:** Bug crítico

---

## Situação atual

- O módulo Gerar Campanha não está lendo os mesmos valores de estoque que constam no CSV importado e na análise do Nexus.
- Exemplo reportado: produto com 25 unidades em estoque e valor unitário de R$ 889,90 está apresentando valor total aproximado de R$ 35.000 — incoerente com o dado real.

## Requisitos

- [x] O módulo deve **consumir a mesma fonte de dados** utilizada pelo painel e pela análise de estoque (CSV/Bling).
- [x] Não deve haver recálculo independente ou uso de dados em cache desatualizado.
- [x] Implementar **validação cruzada** entre os valores exibidos no Gerar Campanha e os valores do painel antes de exibir ao usuário.

## Critérios de aceite

- Valores de estoque e totais no Gerar Campanha coincidem com os do painel/analytics para o mesmo produto.
- Fonte de dados é única (ex.: reutilizar repositório/API do painel; não duplicar lógica de cálculo).
- Validação cruzada documentada ou implementada (ex.: comparação antes de renderizar ou teste automatizado).

## Referências no código

- Módulo Gerar Campanha: `src/features/campaigns/`, `src/features/products/` (ProductCampaingGenerator, ProductCard, etc.).
- Fonte de dados do painel: `src/lib/bling/`, `createBlingRepository`, alertas/dashboard.
- Cálculos de valor total: evitar fórmulas locais que não usem dados do repositório/API.

## Notas técnicas

- Identificar onde o valor total está sendo calculado no fluxo do Gerar Campanha e substituir por dados vindos do mesmo serviço/repositório do dashboard.
- Considerar adicionar teste (unit ou e2e) que compare valor exibido no Gerar Campanha com valor do painel para um produto mockado.

---

**Status:** Concluído  
**Alterações:** Garantida fonte única (API `/api/products/[id]` + `blingRepository.getProductById`). Comentários no código e exibição explícita "Estoque × Preço = valor em estoque" no Gerar Campanha para transparência e cruzamento com o painel.  
**Próximo:** Task 03 – Integração PIX
