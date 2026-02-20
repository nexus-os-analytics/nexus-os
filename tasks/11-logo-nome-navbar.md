# Task 11 – Logo + Nome na Barra de Navegação

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 4.1 Logo + Nome na Barra de Navegação  
**Prioridade:** 🟡 Média | **Tipo:** UX

---

## Situação atual

- Apenas o logo aparece no lado esquerdo da barra de navegação, sem o nome do produto.

## Requisitos

- [ ] Exibir **LOGO + "NEXUS OS"** lado a lado na barra de navegação.
- [ ] O conjunto logo + nome deve ser **clicável** e redirecionar para a página inicial do painel.
- [ ] Aplicar tanto na **versão web** quanto **mobile**.

## Critérios de aceite

- Navbar (admin/private layout) mostra logo e texto "NEXUS OS".
- Clicar no conjunto leva à página inicial do painel (ex.: `/dashboard` ou `/visao-geral`).
- Comportamento idêntico em viewport desktop e mobile.

## Referências no código

- `src/components/layout/AdminLayout/AdminHeader.tsx`: logo atual, link para `/dashboard`.
- Layout público: `PublicHeader` se precisar do mesmo padrão.

## Notas técnicas

- Manter acessibilidade (alt no logo, texto legível). Usar componente Link do Next.js para navegação.

---

**Status:** A fazer  
**Próximo:** Task 12 – Badge de Liquidação (redesign)
