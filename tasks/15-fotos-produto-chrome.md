# Task 15 – Fotos de Produto no Chrome

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 7.2 Fotos de Produto (Exibição)  
**Prioridade:** 🟢 Baixa | **Tipo:** Bug

---

## Situação atual

- Fotos de produto não aparecem corretamente em alguns ambientes (relatado para Chrome). Funcionam no Mac e mobile.

## Requisitos

- [ ] Investigar se é problema de **CORS**, **cache** ou **URL relativa/absoluta** das imagens.
- [ ] Garantir **exibição consistente** em todos os navegadores e plataformas.
- [ ] Implementar **imagem de fallback (placeholder)** para produtos sem foto.

## Critérios de aceite

- Fotos de produto carregam corretamente no Chrome (e demais browsers testados).
- Produtos sem foto exibem placeholder em vez de quebra ou espaço vazio.

## Referências no código

- Componentes que exibem imagem de produto: `ProductCard`, `ProductDetails`, `AlertCard`, listagens do dashboard e Gerar Campanha.
- Next.js `Image`: `src`, `unoptimized`, domínios externos em `next.config.ts` se imagens forem de URL externa (Bling).
- Bling: `image` em `BlingProductType`, URL da imagem.

## Notas técnicas

- Se imagens vêm de domínio externo (Bling), configurar `images.domains` no Next e tratar CORS no servidor de imagens se necessário.
- Placeholder: usar Mantine `Image` com `fallbackSrc` ou componente customizado com estado de erro.

---

**Status:** A fazer  
**Fim da lista de tasks**
