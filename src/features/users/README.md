# Users Feature - Documentação Técnica

## Visão Geral

Este módulo gerencia o ciclo de vida completo de usuários no sistema, incluindo criação, atualização, listagem e **soft delete** com randomização de e-mail.

## Soft Delete com Randomização de E-mail

### Motivação

No passado, quando um usuário era removido do sistema (soft delete), apenas o campo `deletedAt` era preenchido. O e-mail permanecia inalterado, impedindo que novos usuários se cadastrassem com o mesmo endereço devido à constraint `@unique`.

### Solução Implementada

Ao executar soft delete, o sistema agora:
1. Define `deletedAt` para a data/hora atual
2. **Randomiza o e-mail** para o formato: `deleted-<timestamp>-<shortId>@removed.local`

Isso libera o endereço de e-mail original para reutilização por novos usuários.

### Formato de E-mail Deletado

```
deleted-<timestamp>-<shortId>@removed.local
```

**Componentes:**
- `deleted-`: Prefixo fixo para fácil identificação
- `<timestamp>`: Unix timestamp em milissegundos do momento da exclusão
- `<shortId>`: Primeiros 8 caracteres do UUID do usuário
- `@removed.local`: Domínio inválido seguindo RFC 2606

**Exemplo:**
```typescript
// Usuário: a1b2c3d4-e5f6-7890-abcd-ef1234567890
// Email original: joao@example.com
// Após delete: deleted-1739587200000-a1b2c3d4@removed.local
```

### Uso

#### Deletar um Usuário

```typescript
import { deleteUser } from '@/features/users/services/user.service';

// Soft delete com randomização automática
await deleteUser('user-uuid-here');
```

**O que acontece:**
1. Busca o usuário e seu e-mail original
2. Gera e-mail randomizado usando `generateDeletedEmail(userId)`
3. Atualiza `deletedAt` e `email` em transação atômica
4. Cria registro de auditoria com e-mail original
5. Gera log estruturado (Pino) com todos os detalhes

#### Verificar se Email Está Disponível

**✅ CORRETO - Ignora usuários deletados:**
```typescript
const existingUser = await prisma.user.findFirst({
  where: {
    email: 'novo@example.com',
    deletedAt: null, // ← CRUCIAL
  },
});

if (existingUser) {
  throw new Error('E-mail já está em uso');
}
```

**❌ ERRADO - Pode encontrar usuários deletados:**
```typescript
const existingUser = await prisma.user.findUnique({
  where: { email: 'novo@example.com' },
});
// Pode retornar usuário deletado, bloqueando cadastro
```

### Componentes Atualizados

Todos os seguintes endpoints/funções foram atualizados para filtrar `deletedAt: null`:

| Componente | Arquivo | Função |
|------------|---------|--------|
| Sign-Up | `src/app/api/auth/sign-up/route.ts` | Verificação de e-mail existente |
| Invite Accept | `src/app/api/users/invite/accept/route.ts` | Verificação de e-mail existente |
| NextAuth Credentials | `src/lib/next-auth/index.ts` | Authorize callback |
| NextAuth OAuth | `src/lib/next-auth/index.ts` | SignIn callback |
| Forgot Password | `src/app/api/auth/forgot-password/route.ts` | Busca de usuário |
| Activate Account | `src/app/api/auth/activate/route.ts` | Ativação de conta |
| Bling Settings | `src/features/bling/actions/saveUserSettings.ts` | Busca de usuário |
| List Users | `src/features/users/services/user.service.ts` | Listagem padrão |

### Auditoria e Logging

#### Audit Log
Cada soft delete gera um registro em `AuditLog`:
```typescript
{
  userId: 'user-uuid',
  action: 'USER_DELETED',
  resource: 'User',
  metadata: 'Email changed from joao@example.com to deleted-1739587200000-a1b2c3d4@removed.local'
}
```

#### Structured Logging (Pino)
```json
{
  "level": "info",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userName": "João Silva",
  "originalEmail": "joao@example.com",
  "deletedEmail": "deleted-1739587200000-a1b2c3d4@removed.local",
  "deletedAt": "2026-02-15T12:00:00.000Z",
  "msg": "User soft deleted with email randomization"
}
```

### Migration de Dados Históricos

Uma migration foi criada para atualizar usuários já deletados:

**Arquivo:** `prisma/migrations/20260215091751_randomize_deleted_user_emails/migration.sql`

Esta migration é **idempotente** e pode ser executada múltiplas vezes com segurança. Ela só atualiza usuários que:
- Têm `deletedAt IS NOT NULL`
- Ainda não têm e-mail no formato `deleted-*@removed.local`

### Buscar Usuários Deletados (Admin)

Se necessário consultar usuários deletados para fins administrativos:

```typescript
// Buscar apenas deletados
const deletedUsers = await prisma.user.findMany({
  where: {
    deletedAt: { not: null },
  },
  select: {
    id: true,
    name: true,
    email: true, // Será o email randomizado
    deletedAt: true,
  },
});

// Para ver o e-mail original, consultar audit logs:
const auditLog = await prisma.auditLog.findFirst({
  where: {
    userId: 'user-uuid',
    action: 'USER_DELETED',
  },
  orderBy: { createdAt: 'desc' },
});
// auditLog.metadata contém: "Email changed from original@example.com to deleted-..."
```

### Reativação de Usuários

A função `toggleUserStatus()` pode reativar usuários, mas **NÃO restaura o e-mail original automaticamente**.

**Comportamento atual:**
```typescript
await toggleUserStatus(userId, false); // disabled = false (reativar)
// Define deletedAt = null, mas email permanece randomizado
```

**Se reativação for necessária:**
1. Admin deve manualmente atualizar o e-mail para um novo endereço válido
2. OU implementar sistema de armazenamento de e-mail original (feature futura)

### Testes

#### Teste Manual - Reutilização de E-mail
```bash
# 1. Criar usuário
curl -X POST /api/auth/sign-up -d '{"email":"test@example.com","password":"123456","name":"Test"}'

# 2. Deletar usuário (via UI ou API)
# Verificar que email foi randomizado no banco

# 3. Criar novo usuário com mesmo email
curl -X POST /api/auth/sign-up -d '{"email":"test@example.com","password":"123456","name":"Test 2"}'
# ✅ Deve funcionar sem erros
```

#### Teste Manual - Login Bloqueado
```bash
# Tentar login com usuário deletado deve falhar
curl -X POST /api/auth/signin -d '{"email":"deleted-xxx@removed.local","password":"123456"}'
# ✅ Deve retornar erro de credenciais inválidas
```

### Performance

**Impacto:** Mínimo
- Índice existente `@@index([email, createdAt, deletedAt])` continua eficiente
- Queries filtram por `deletedAt: null`, que é coberto pelo índice
- Transação de delete inclui 3 operações (select, update, insert audit) < 200ms

### Segurança

✅ **Benefícios:**
- E-mails randomizados não revelam informação sobre usuário deletado
- Domínio `.local` garante que e-mails randomizados nunca sejam válidos
- Audit trail completo preserva histórico

⚠️ **Considerações:**
- E-mail original é preservado em `AuditLog.metadata` (texto plano)
- Se LGPD/GDPR exigir remoção completa de PII, considerar anonimizar também `name`, `phone`, etc.

## Utilitários

### `generateDeletedEmail(userId: string)`

**Arquivo:** `src/features/users/utils/deleted-email.ts`

Gera e-mail randomizado seguindo o padrão estabelecido.

```typescript
import { generateDeletedEmail } from '@/features/users/utils';

const email = generateDeletedEmail('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
// Returns: 'deleted-1739587200000-a1b2c3d4@removed.local'
```

**Parâmetros:**
- `userId`: UUID do usuário (formato string)

**Retorna:**
- String no formato `deleted-<timestamp>-<shortId>@removed.local`

## Referências

- **PRD:** `tasks/prd-user-soft-delete-email-randomization.md`
- **Schema Prisma:** `prisma/schema.prisma` (modelo User)
- **Service:** `src/features/users/services/user.service.ts`
- **Utils:** `src/features/users/utils/deleted-email.ts`

---

**Última atualização:** 2026-02-15  
**Versão:** 1.0
