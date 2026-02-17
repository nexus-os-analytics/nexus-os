# Padronização de Cores dos Alertas - Nexus OS

**Data:** 17 de Fevereiro de 2026
**Versão:** 2.0.0
**Status:** Implementado

---

## Visão Geral

Este documento descreve o sistema de cores padronizado para alertas de produtos no Nexus OS. O sistema utiliza Mantine UI como framework de styling único, garantindo consistência visual e facilidade de manutenção.

## Paleta de Cores

### 1. RUPTURA (Vermelho) - 🔴 Crítico

**Descrição:** Risco iminente de ruptura de estoque. Ação urgente necessária.

**Cores:**

- Primária: Red 500 (`#EF4444`)
- Fundo Claro: Red 100 (`#FEE2E2`)
- Texto Escuro: Red 900 (`#991B1B`)

**Quando usar:**

- Estoque zerado ou vai zerar em < 7 dias
- `alert.type === 'RUPTURE'`
- `riskLevel === 'CRITICAL' || riskLevel === 'HIGH'`

**Mantine Color Key:** `red`

---

### 2. CAPITAL PARADO (Dourado/Âmbar) - 🟧 Importante

**Descrição:** Produto sem venda há 30+ dias com capital travado. Ação necessária.

**Cores:**

- Primária: Amber 500 (`#F5B12C`)
- Fundo Claro: Amber 100 (`#FEF3C7`)
- Texto Escuro: Amber 900 (`#92400E`)

**Quando usar:**

- Produto não vendeu em 30+ dias
- `alert.type === 'DEAD_STOCK'`
- `daysSinceLastSale > 30`

**Mantine Color Key:** `deadStock`

---

### 3. LIQUIDAÇÃO (Laranja) - 🟠 Moderado

**Descrição:** Excesso de estoque em relação às vendas estimadas.

**Cores:**

- Primária: Orange 500 (`#F97316`)
- Fundo Claro: Orange 100 (`#FFEDD5`)
- Texto Escuro: Orange 900 (`#9A3412`)

**Quando usar:**

- Excesso de estoque > 200%
- `alert.type === 'LIQUIDATION'`
- `excessPercentage > 200`

**Mantine Color Key:** `liquidation`

---

### 4. OPORTUNIDADE (Verde) - 🟢 Positivo

**Descrição:** Produto em crescimento de demanda. Ação de crescimento.

**Cores:**

- Primária: Green 500 (`#10B981`)
- Fundo Claro: Green 100 (`#D1FAE5`)
- Texto Escuro: Green 900 (`#065F46`)

**Quando usar:**

- Crescimento de demanda > 50%
- `alert.type === 'OPPORTUNITY'`
- `growthTrend > 50`

**Mantine Color Key:** `opportunity`

---

### 5. SAUDÁVEL (Cinza Neutro) - ✅ Normal

**Descrição:** Estoque em situação saudável, sem problemas.

**Cores:**

- Primária: Gray 500 (`#6B7280`)
- Fundo Claro: Gray 100 (`#F3F4F6`)
- Texto Escuro: Gray 700 (`#374151`)

**Quando usar:**

- Estoque em situação normal
- `alert.type === 'FINE'`
- Sem alertas críticos

**Mantine Color Key:** `fine`

---

## Hierarquia de Urgência Visual

```
┌─────────────────────────────────────┐
│ 🔴 RUPTURA      (CRÍTICO)           │ ← Ação imediata
│ 🟧 CAPITAL PARADO (IMPORTANTE)     │ ← Ação necessária
│ 🟠 LIQUIDAÇÃO     (MODERADO)        │ ← Ação recomendada
│ 🟢 OPORTUNIDADE   (CRESCIMENTO)     │ ← Positivo
│ ✅ SAUDÁVEL       (NORMAL)          │ ← Ok
└─────────────────────────────────────┘
```

---

## Implementação no Código

### Constantes Centralizadas

Todo metadado de alertas (cores, labels, emojis) está centralizado em:

**Arquivo:** [src/lib/constants/alert-config.ts](../src/lib/constants/alert-config.ts)

```typescript
import { getAlertTypeColor, getAlertTypeLabel, getAlertTypeEmoji } from '@/lib/constants';

// Obter cor do Mantine theme
const color = getAlertTypeColor('RUPTURE'); // retorna 'red'

// Obter label em português
const label = getAlertTypeLabel('DEAD_STOCK'); // retorna 'CAPITAL PARADO'

// Obter emoji
const emoji = getAlertTypeEmoji('OPPORTUNITY'); // retorna '🟢'
```

### Componentes Genéricos

#### AlertBadge

Renderiza um badge com cor e emoji automáticos.

**Arquivo:** [src/components/commons/AlertBadge.tsx](../src/components/commons/AlertBadge.tsx)

```typescript
import { AlertBadge } from '@/components/commons/AlertBadge';

// Uso básico
<AlertBadge alertType="RUPTURE" />
// Output: 🔴 RUPTURA (com fundo vermelho)

// Sem emoji
<AlertBadge alertType="OPPORTUNITY" showEmoji={false} />
// Output: OPORTUNIDADE (com fundo verde)

// Com tamanho customizado
<AlertBadge alertType="DEAD_STOCK" size="lg" />
```

#### AlertCard

Renderiza um Alert do Mantine com styling automático.

**Arquivo:** [src/components/commons/AlertCard.tsx](../src/components/commons/AlertCard.tsx)

```typescript
import { AlertCard } from '@/components/commons/AlertCard';

// Uso com título customizado
<AlertCard
  alertType="DEAD_STOCK"
  title="Raquete de Tênis"
  message="Sem vendas há 999 dias. Capital travado: R$ 11.250,00"
/>

// Uso com descrição automática
<AlertCard alertType="OPPORTUNITY" message="Crescimento de 150%" />

// Uso sem emoji
<AlertCard alertType="FINE" showEmoji={false} />
```

### Cores no Tema Mantine

As cores estão adicionadas ao `theme.colors` em [src/providers/theme.ts](../src/providers/theme.ts):

```typescript
const theme = createTheme({
  colors: {
    deadStock: [
      /* 10 shades */
    ],
    liquidation: [
      /* 10 shades */
    ],
    opportunity: [
      /* 10 shades */
    ],
    fine: [
      /* 10 shades */
    ],
  },
});
```

---

## Atualizações de Componentes

### Dashboard - Overview

**Arquivo:** [src/features/dashboard/pages/Overview/index.tsx](../src/features/dashboard/pages/Overview/index.tsx)

Os "Top 3 Ações Recomendadas" agora usam cores dinâmicas baseadas no tipo de alerta:

```typescript
const color = getAlertTypeColor(action.alertType);

<Badge color={color} variant="light">
  {getAlertTypeLabel(action.alertType)}
</Badge>
```

### Dashboard - Página Principal

**Arquivo:** [src/features/dashboard/pages/Dashboard/index.tsx](../src/features/dashboard/pages/Dashboard/index.tsx)

O filtro de "Tipo de alerta" agora exibe emoji + label automático:

```typescript
data={[
  { value: 'RUPTURE', label: `${ALERT_TYPE_CONFIG.RUPTURE.emoji} ${ALERT_TYPE_CONFIG.RUPTURE.label}` },
  { value: 'DEAD_STOCK', label: `${ALERT_TYPE_CONFIG.DEAD_STOCK.emoji} ${ALERT_TYPE_CONFIG.DEAD_STOCK.label}` },
  // ...
]}
```

### Função Utilitária

**Arquivo:** [src/lib/bling/bling-utils.ts](../src/lib/bling/bling-utils.ts)

A função `mapAlertTypeToPtLabel` agora usa constantes centralizadas:

```typescript
export function mapAlertTypeToPtLabel(type: BlingAlertType): string {
  return getAlertTypeLabel(type);
}
```

---

## Usando as Cores em Novos Componentes

### 1. Adicionar o Import

```typescript
import { getAlertTypeColor, getAlertTypeLabel, getAlertTypeEmoji } from '@/lib/constants';
```

### 2. Obter Valores

```typescript
const color = getAlertTypeColor(alertType); // 'red', 'deadStock', etc
const label = getAlertTypeLabel(alertType); // 'RUPTURA', 'CAPITAL PARADO', etc
const emoji = getAlertTypeEmoji(alertType); // '🔴', '🟧', etc
```

### 3. Usar com Mantine Components

```typescript
import { Badge, Alert, ThemeIcon } from '@mantine/core';

// Badge
<Badge color={color} variant="light">{label}</Badge>

// Alert
<Alert color={color} title={label} icon={emoji}>
  Mensagem do alerta
</Alert>

// ThemeIcon
<ThemeIcon color={color} radius="md" variant="light">
  <Icon size={18} />
</ThemeIcon>
```

---

## Dark Mode

As cores foram definidas com suporte automático a dark mode via Mantine. O sistema ajusta automaticamente as tonalidades conforme o esquema de cores selecionado.

---

## Acessibilidade

Todas as cores atendem aos requisitos de contraste WCAG AA:

- Texto escuro sobre fundo claro: ✅ Contraste suficiente
- Texto claro sobre fundo escuro: ✅ Contraste suficiente
- Emojis fornecem informação visual redundante: ✅ Acessível

---

## Tipos TypeScript

As constantes são totalmente tipadas:

```typescript
interface AlertTypeConfig {
  label: string;
  emoji: string;
  color: MantineColor;
  colorShade: number;
  description: string;
}
```

---

## Referência Rápida

| Tipo        | Color Key     | Emoji | Label          | Urgência      |
| ----------- | ------------- | ----- | -------------- | ------------- |
| RUPTURE     | `red`         | 🔴    | RUPTURA        | 🔴 Crítica    |
| DEAD_STOCK  | `deadStock`   | 🟧    | CAPITAL PARADO | 🟧 Importante |
| LIQUIDATION | `liquidation` | 🟠    | LIQUIDAÇÃO     | 🟠 Moderada   |
| OPPORTUNITY | `opportunity` | 🟢    | OPORTUNIDADE   | 🟢 Positiva   |
| FINE        | `fine`        | ✅    | SAUDÁVEL       | ✅ Normal     |

---

## Versionamento

- **v2.0.0:** Implementação inicial com Mantine UI
  - Cores adicionadas ao theme.colors
  - Constantes centralizadas em alert-config.ts
  - Componentes genéricos AlertBadge e AlertCard
  - Componentes existentes atualizados

---

## Suporte e Contribuições

Para adicionar um novo tipo de alerta ou modificar cores:

1. Adicione à paleta em [src/providers/theme.ts](../src/providers/theme.ts)
2. Atualize [src/lib/constants/alert-config.ts](../src/lib/constants/alert-config.ts)
3. Execute `pnpm typecheck` e `pnpm lint:fix`
4. Teste visualmente em diferentes breakpoints e color schemes
