# Nexus OS - Sistema Inteligente de Otimização de Inventário

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-brightgreen)

## 📋 Visão Geral do Produto

**Nexus OS** é um sistema inteligente de otimização de inventário e suporte à decisão que conecta-se a ERPs (inicialmente Bling) para analisar desempenho de estoque, identificar riscos e oportunidades, e fornecer recomendações acionáveis que melhoram diretamente os resultados financeiros. O sistema transforma dados operacionais brutos em ações priorizadas, contextuais e financeiramente mensuráveis.

### 🎯 Objetivos Principais

| Objetivo | Meta | Status |
|----------|------|--------|
| Reduzir rupturas de estoque | Diminuir eventos de falta em 35% | 🎯 |
| Reduzir dead stock | Diminuir capital parado em 25% | 🎯 |
| Otimizar preços | Aumentar margem em 15% | 🎯 |
| Insights priorizados | Tempo de execução < 10 minutos | ✅ |
| Automação de decisões | 20% das ações automatizadas | 🔄 |

## 🚀 Começando

### Pré-requisitos

- Node.js 22+
- PostgreSQL 16+
- Conta no Bling ERP (para integração)
- Variáveis de ambiente configuradas

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-org/nexus-os.git
cd nexus-os

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Configure o banco de dados
npx prisma generate
npx prisma db push

# Execute em modo desenvolvimento
pnpm dev
```

## 🏗️ Arquitetura

### Stack Tecnológica

- **Frontend**: Next.js 16 (App Router), React, Mantine UI
- **Backend**: Next.js API Routes, Server Actions, Inngest (background jobs)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Logging**: Pino
- **Testes**: E2E Playwright
- **Observabilidade**: OpenTelemetry
- **Deploy**: Containerizado com Docker, CI/CD GitHub Actions

### Estrutura do Projeto

```
nexus-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Rotas de autenticação
│   │   ├── (public)/           # Rotas públicas
│   │   ├── (private)/          # Rotas privadas (dashboard)
│   │   ├── api/                # API Routes
│   │   │   ├── alerts/         # API de alertas
│   │   │   ├── auth/           # API de autenticação
│   │   │   ├── inngest/        # API de uso do Inngest
│   │   │   └── integrations/   # Integrações
│   │   │       └── bling/      # Integração Bling
│   │   └── layout.tsx          # Layout principal
│   ├── components/             # Componentes React
│   │   ├── alerts/             # Componentes de alerta
│   │   ├── dashboard/          # Componentes do dashboard
│   │   └── ui/                 # Componentes de UI
│   ├── handlers/               # Inngest functions
│   │   └── generate-alerts.ts  # Geração de alertas
│   ├── lib/                    # Utilitários e configurações
│   │   ├── bling/              # Integração Bling
│   │   │   ├── bling-types.ts  # Tipos TypeScript
│   │   │   ├── bling-utils.ts  # Funções auxiliares
│   │   │   └── bling-price-engine.ts # Motor de preços
│   │   ├── prisma.ts           # Cliente Prisma
│   │   └── utils.ts            # Utilitários gerais
│   └── types/                  # Tipos TypeScript
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── public/                     # Arquivos estáticos
└── package.json
```

## 📊 Funcionalidades

### 🚨 Sistema de Alertas

#### Tipos de Alertas
1. **Ruptura de Estoque** - Risco de falta do produto em estoque
   - Calcula VVD (Vendas por Dia)
   - Dias restantes de estoque
   - Ponto de reposição do estoque
   - Níveis de risco: Crítico, Alto, Médio, Baixo

2. **Capital Parado** - Valor em dinheiro parado em estoque
   - Identifica produtos sem vendas
   - Calcula capital imobilizado
   - Sugere estratégias de liquidação

3. **Oportunidades** - Crescimento e preço
   - Detecta crescimento de demanda
   - Sugere ajustes de preço
   - Identifica novos produtos promissores

### 🔧 Motor de Recomendações

#### Cálculos Implementados
- **VVD Real**: Vendas por dia considerando apenas dias com estoque
- **VVD Simples**: Média sobre janela completa
- **Dias Restantes**: Stock / VVD
- **Ponto de reposição**: VVD × (Tempo Reposição + Dias Segurança)
- **Capital Imobilizado**: Stock × (Custo ou 60% do Preço Venda)
- **Custo de Capital**: 2% ao mês sobre capital imobilizado
- **Custo de Armazenamento**: 1% ao mês sobre capital imobilizado

### 📈 Dashboard

#### Principais Métricas
- **Overview Financeiro**: Capital total imobilizado, perda esperada
- **Rupturas Críticas**: Produtos com menos de 5 dias de estoque
- **Dead Stock**: Produtos sem venda há mais de 90 dias
- **Oportunidades**: Produtos com crescimento >30%

## 🔌 Integração Bling

### Fluxo de Sincronização

```typescript
// Exemplo de fluxo
1. OAuth 2.0 com Bling
2. Importação de produtos
3. Importação de histórico de vendas (30, 60, 90 dias)
4. Importação de estoques atualizados
5. Processamento em background
6. Geração de alertas
7. Atualização do dashboard
```

### Webhooks Suportados
- Novas vendas
- Atualizações de estoque
- Mudanças de preço
- Novos produtos

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

## 🚀 Deployment

### Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/db"

# Autenticação
NEXTAUTH_SECRET=""
NEXTAUTH_URL="https://seusite.com"

# Bling
BLING_CLIENT_ID=""
BLING_CLIENT_SECRET=""
BLING_REDIRECT_URI=""

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

### Scripts de Deploy

```bash
# Build de produção
npm run build

# Executar migrações
npx prisma migrate deploy

# Iniciar produção
npm start
```

## 📈 Métricas de Sucesso

### KPIs Monitorados
1. **Taxa de Ruptura**: < 5% de falsos positivos
2. **Tempo de Resposta**: API < 150ms
3. **Cobertura de Código**: > 80%
4. **Uptime**: 99.9%
5. **Satisfação do Usuário**: NPS > 50

### Logs e Monitoramento
- Logs estruturados com Pino
- Métricas de performance
- Alertas de erro em tempo real
- Dashboard de analytics

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções de Código
- TypeScript estrito
- ESLint configurado
- Prettier para formatação
- Commits semânticos

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Documentação**: [docs.nexusos.com](https://docs.nexusos.com)
- **Suporte Técnico**: support@nexusos.com
- **Comunidade**: [Discord](https://discord.gg/nexusos)
- **Status**: [status.nexusos.com](https://status.nexusos.com)

## 🙏 Agradecimentos

- Equipe de desenvolvimento Nexus OS
- Comunidade open source
- Usuários beta testers
- Parceiros de integração

---

**Nexus OS** - Transformando dados de estoque em lucro.
