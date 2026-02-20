# Task 14 – Favicon no Chrome

**PRD:** Nexus OS – Documento de Melhorias e Requisitos de Produto v1.0 (Fev/2026)  
**Seção:** 7.1 Favicon no Chrome  
**Prioridade:** 🟢 Baixa | **Tipo:** Bug

---

## Situação atual

- O favicon do app não aparece corretamente no Chrome (exibe ícone azul genérico). Funciona corretamente no Mac e Mobile.

## Requisitos

- [ ] Configurar o arquivo **favicon.ico** e variantes (**favicon-32x32.png**, **apple-touch-icon.png**) corretamente no `<head>` da aplicação.
- [ ] Verificar se o **manifest.json** está apontando para os arquivos corretos.
- [ ] Testar em **Chrome Windows** e **Chrome Mac**.

## Critérios de aceite

- Chrome (Windows e Mac) exibe o favicon correto da aplicação.
- Head contém referências adequadas; manifest.json (se existir) com ícones corretos.

## Referências no código

- `src/app/layout.tsx`: `<head>`, `<link rel="icon">`, metadata.
- `public/`: favicon.ico, favicon-32x32.png, apple-touch-icon.png, manifest.json (se houver).
- Next.js: `metadata.icons` na App Router.

## Notas técnicas

- Next.js 16: usar `metadata.icons` no layout ou múltiplos `<link rel="icon">` com sizes.
- Garantir arquivos em `public/` ou em `app/` conforme convenção do Next.

---

**Status:** A fazer  
**Próximo:** Task 15 – Fotos de produto no Chrome
