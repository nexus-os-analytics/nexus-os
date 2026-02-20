# Task 01 – Otimização Mobile (Dashboard)

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 2.4 Otimização Mobile  
**Prioridade:** 🔴 Urgente | **Tipo:** Bug / UX

---

## Situação atual

- Na versão mobile, as fotos dos produtos estão com dimensões muito grandes ("estouradas"), dificultando a leitura.
- Os alertas ocupam muito espaço vertical, tornando a rolagem cansativa e prejudicando a experiência.

## Requisitos

- [x] Definir tamanho máximo para imagens de produto no mobile (sugestão: **max-height 80–100px** nos cards de alerta).
- [x] Reduzir altura dos cards de alerta em mobile para exibir mais itens por tela.
- [ ] Realizar testes em dispositivos iOS e Android antes do deploy.

## Critérios de aceite

- Imagens de produto nos cards de alerta respeitam max-height definido em viewport mobile.
- Cards de alerta têm altura reduzida em breakpoint mobile (ex.: `max-width: 48em` ou Mantine `hiddenFrom="sm"`).
- Layout testado em iOS e Android (ou emulador).

## Referências no código

- Dashboard / painel principal: alertas e cards de produto.
- Componentes de alerta (ex.: `AlertCard`, listagem de alertas).
- Estilos responsivos Mantine (`sx`, `styles`, breakpoints).

## Notas técnicas

- Usar tokens do tema Mantine e `useMantineTheme()` / `useMantineBreakpoint()` para consistência.
- Evitar valores fixos em px quando possível; preferir `rem` ou tokens do tema.

---

**Status:** Concluído (implementação; testes em dispositivos reais pendentes)  
**Próximo:** Task 02 – Bug de cálculo de estoque no Gerar Campanha
