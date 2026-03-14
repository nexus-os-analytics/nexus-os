# Arquitetura de Integrações NexusOS

Este documento é a referência canônica para criar novas integrações no NexusOS. Siga este guia sempre que adicionar um novo provider.

---

## 1. Visão geral

O sistema de integrações possui um componente compartilhado — `ConnectPage` — que encapsula **todo o fluxo de UI de conexão**: animação de progresso, detecção de `?success=`, exibição de erros, cards de value proposition e redirecionamento final.

Cada provider implementa apenas um wrapper fino que define a configuração e delega a renderização ao `ConnectPage`. Isso garante UI consistente e evita duplicação de lógica de estado.

```
Provider Page (Server Component)
  └── <ProviderConnect canConnect={...} />          ← wrapper fino ("use client")
        └── <ConnectPage config={...} onConnect={...} />  ← componente compartilhado
```

---

## 2. Componente `ConnectPage`

**Localização:** [src/features/integrations/components/ConnectPage/index.tsx](./components/ConnectPage/index.tsx)

### Interface `ConnectPageConfig`

| Campo            | Tipo                                   | Padrão | Descrição                                                                                                                                                                                   |
| ---------------- | -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`          | `string`                               | —      | Token de cor do Mantine (ex: `"green.9"`, `"yellow"`, `"orange"`)                                                                                                                           |
| `logoSrc`        | `string`                               | —      | Caminho da logo do provider (de `/public`)                                                                                                                                                  |
| `logoAlt`        | `string`                               | —      | Texto alternativo da logo                                                                                                                                                                   |
| `logoWidth`      | `number?`                              | `180`  | Largura da logo em px                                                                                                                                                                       |
| `logoHeight`     | `number?`                              | `180`  | Altura da logo em px                                                                                                                                                                        |
| `providerName`   | `string`                               | —      | Nome de exibição do provider (ex: `"Bling"`)                                                                                                                                                |
| `successParam`   | `string`                               | —      | Valor do param `?success=xxx` enviado pelo callback OAuth. **Deve ser igual ao retorno de `getSuccessParam(provider)`** em [src/lib/integrations/utils.ts](../../lib/integrations/utils.ts) |
| `analysisLabel`  | `string`                               | —      | Substantivo usado em `"Analisando {analysisLabel}..."` (ex: `"produtos"`)                                                                                                                   |
| `itemsLabel`     | `string`                               | —      | Substantivo usado nos stats simulados: `"X {itemsLabel} encontrados"` (ex: `"produtos"`)                                                                                                    |
| `funFact`        | `string?`                              | —      | Curiosidade exibida durante a animação de sincronização                                                                                                                                     |
| `valuePropCards` | `Array<{ emoji, title, description }>` | —      | Exatamente 3 cards mostrados na tela idle                                                                                                                                                   |

### Props `ConnectPageProps`

```ts
interface ConnectPageProps {
  config: ConnectPageConfig;
  canConnect: boolean; // false bloqueia o botão (e-mail não verificado)
  loading: boolean; // exibe loading no botão
  onConnect: () => Promise<string>; // retorna a authUrl para redirect OAuth
}
```

---

## 3. Fluxo de navegação padrão

O fluxo abaixo usa Bling como referência, mas se aplica a todos os providers.

```
1. Usuário clica em "Conectar"
   └── handleConnect() → onConnect() → authUrl
       └── window.location.href = authUrl

2. Provider OAuth redireciona para /api/integrations/{provider}/callback
   └── Callback: salva tokens, define syncStatus=SYNCING, dispara evento Inngest
       └── Redireciona para ?success={successParam}  (ex: ?success=bling_connected)

3. Frontend detecta ?success={successParam} no useEffect
   └── setState('analyzing') + setProgress(50)

4. Barra de progresso atinge 100%
   └── setState('complete')

5. Após 1500ms (COMPLETE_DELAY_MS)
   └── router.push('/visao-geral')
```

### Fluxo de erro

```
Callback → ?error={código}
  └── Frontend lê o param e exibe a mensagem do mapa ERROR_MESSAGES
```

> **Regra:** Não usar polling de API no fluxo de conexão. Todo o progresso é simulado no cliente — o sync real acontece via Inngest em background.

---

## 4. Como adicionar uma nova integração

Siga o checklist na ordem abaixo:

1. **Adicionar o provider ao enum** em `src/types/integrations.ts`:

   ```ts
   export enum IntegrationProvider {
     BLING = 'BLING',
     MERCADO_LIVRE = 'MERCADO_LIVRE',
     SHOPEE = 'SHOPEE',
     NOVA_PLATAFORMA = 'NOVA_PLATAFORMA', // ← adicione aqui
   }
   ```

2. **Criar o hook** `src/hooks/useNovaPlataformaIntegration.ts` seguindo o padrão de [`useBlingIntegration.ts`](../../hooks/useBlingIntegration.ts). O hook deve expor: `connect`, `disconnect`, `refresh`, `sync`.

3. **Criar o wrapper** `src/features/nova-plataforma/pages/NovaPlataformaConnect/index.tsx` (ver exemplo na seção 5).

4. **Criar a page** `src/app/(private)/nova-plataforma/page.tsx` seguindo o padrão de [`src/app/(private)/meli/page.tsx`](<../../app/(private)/meli/page.tsx>):

   ```ts
   // Server Component — busca canConnect via Prisma antes de renderizar
   export default async function NovaPlataformaPage() {
     const session = await getServerSession(authOptions);
     let canConnect = false;
     if (session?.user?.id) {
       const user = await prisma.user.findUnique({ where: { id: session.user.id } });
       canConnect = !!user?.emailVerified;
     }
     return <NovaPlataformaConnect canConnect={canConnect} />;
   }
   ```

5. **Criar as rotas de API** em `src/app/api/integrations/nova-plataforma/`:
   - `connect/route.ts` — gera e retorna a `authUrl`
   - `callback/route.ts` — troca código por tokens, inicia sync
   - `status/route.ts` — retorna status da integração
   - `disconnect/route.ts` — revoga tokens e limpa dados
   - `sync/route.ts` — dispara sync manual via Inngest

6. **Usar os helpers de redirect** no callback:

   ```ts
   import {
     getIntegrationSuccessRedirect,
     getIntegrationErrorRedirect,
   } from '@/lib/integrations/utils';

   // sucesso
   redirect(getIntegrationSuccessRedirect(IntegrationProvider.NOVA_PLATAFORMA));

   // erro
   redirect(getIntegrationErrorRedirect(IntegrationProvider.NOVA_PLATAFORMA, 'auth_failed'));
   ```

7. **Adicionar o card** na página de seleção `src/features/integrations/pages/IntegrationSelection/index.tsx`.

---

## 5. Exemplo mínimo de wrapper

```tsx
// src/features/nova-plataforma/pages/NovaPlataformaConnect/index.tsx
'use client';

import {
  ConnectPage,
  type ConnectPageConfig,
} from '@/features/integrations/components/ConnectPage';
import { useNovaPlataformaIntegration } from '@/hooks/useNovaPlataformaIntegration';

const CONFIG: ConnectPageConfig = {
  color: 'violet',
  logoSrc: '/assets/nova-plataforma-logo.png',
  logoAlt: 'Nova Plataforma Logo',
  providerName: 'Nova Plataforma',
  successParam: 'nova_plataforma_connected', // deve bater com getSuccessParam()
  analysisLabel: 'pedidos',
  itemsLabel: 'pedidos',
  funFact: 'A Nova Plataforma processa mais de 1 milhão de pedidos por dia.',
  valuePropCards: [
    {
      emoji: '📦',
      title: 'Controle de estoque em tempo real',
      description: 'Sincronize seu estoque automaticamente e evite rupturas.',
    },
    {
      emoji: '📈',
      title: 'Análise de tendências de vendas',
      description: 'Identifique produtos em alta antes da concorrência.',
    },
    {
      emoji: '🔔',
      title: 'Alertas inteligentes',
      description: 'Receba notificações de estoque crítico antes de perder vendas.',
    },
  ],
};

export function NovaPlataformaConnect({ canConnect = false }: { canConnect?: boolean }) {
  const { loading, connect } = useNovaPlataformaIntegration();

  return (
    <ConnectPage config={CONFIG} canConnect={canConnect} loading={loading} onConnect={connect} />
  );
}
```

---

## 6. Parâmetros de erro padrão

Todos os redirects de erro devem usar um dos códigos abaixo. As mensagens são traduzidas automaticamente pelo `ERROR_MESSAGES` no `ConnectPage`.

| Código                  | Mensagem exibida                                        | Quando usar                                    |
| ----------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `auth_failed`           | Falha na autenticação. Tente novamente.                 | Erro genérico de OAuth                         |
| `connection_failed`     | Erro ao conectar. Verifique suas credenciais.           | Falha ao estabelecer conexão                   |
| `invalid_callback`      | Callback inválido. Tente novamente.                     | Parâmetros do callback ausentes/inválidos      |
| `unauthorized`          | Usuário não autorizado. Faça login e tente novamente.   | Sessão inválida ou expirada                    |
| `token_exchange_failed` | Erro ao trocar token de acesso.                         | Falha na troca de authorization code por token |
| `config_missing`        | Configuração do servidor incompleta. Contate o suporte. | Variáveis de ambiente ausentes                 |

---

## 7. Providers ativos

| Provider      | Cor       | `successParam`     | Status      |
| ------------- | --------- | ------------------ | ----------- |
| Bling         | `green.9` | `bling_connected`  | ✅ Ativo    |
| Mercado Livre | `yellow`  | `meli_connected`   | ✅ Ativo    |
| Shopee        | `orange`  | `shopee_connected` | ✅ Ativo    |
| Olist         | `blue`    | `olist_connected`  | 🚧 Em breve |
