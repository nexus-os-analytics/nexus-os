# PRD: Refatoração de Soft Delete de Usuários com Randomização de E-mail

## Introdução

Atualmente, quando um usuário é removido do sistema (soft delete), apenas o campo `deletedAt` é preenchido com a data/hora da remoção. O e-mail do usuário permanece inalterado no banco de dados, o que cria um problema: devido à constraint `@unique` no campo `email`, não é possível criar um novo usuário com o mesmo endereço de e-mail.

Esta refatoração resolve esse problema randomizando o e-mail do usuário no momento do soft delete, permitindo que o mesmo endereço de e-mail seja reutilizado por novos usuários no futuro.

## Goals

- Permitir que e-mails de usuários deletados sejam reutilizados por novos cadastros
- Manter histórico auditável de usuários deletados (preservando timestamp)
- Garantir que todas as verificações de "usuário existente" considerem corretamente usuários deletados
- Implementar padrão consistente de randomização de e-mail: `deleted-<timestamp>-<uuid>@removed.local`
- Manter integridade referencial e constraints do banco de dados

## User Stories

### US-001: Randomizar e-mail no soft delete
**Descrição:** Como desenvolvedor, preciso que o e-mail seja randomizado automaticamente quando um usuário for excluído, para liberar o endereço original para reutilização.

**Acceptance Criteria:**
- [ ] Quando `deleteUser()` é chamado, além de setar `deletedAt`, o campo `email` deve ser atualizado
- [ ] Formato do novo e-mail: `deleted-<timestamp>-<uuid>@removed.local`
  - `<timestamp>`: Unix timestamp em milissegundos do momento da exclusão
  - `<uuid>`: primeiros 8 caracteres do ID do usuário
  - Exemplo: `deleted-1739587200000-a1b2c3d4@removed.local`
- [ ] Atualização deve ser atômica (usar transação se necessário)
- [ ] Operação deve preservar `deletedAt` existente
- [ ] Typecheck e lint passam

### US-002: Criar função utilitária para gerar e-mail deletado
**Descrição:** Como desenvolvedor, preciso de uma função reutilizável para gerar o formato padronizado de e-mail deletado.

**Acceptance Criteria:**
- [ ] Criar arquivo `src/features/users/utils/deleted-email.ts`
- [ ] Função `generateDeletedEmail(userId: string): string`
- [ ] Função deve retornar formato `deleted-<timestamp>-<shortId>@removed.local`
- [ ] Incluir testes de unidade validando formato (quando framework de testes estiver implementado)
- [ ] Exportar função no barrel export do feature
- [ ] Typecheck e lint passam

### US-003: Atualizar verificação de e-mail em sign-up
**Descrição:** Como sistema, preciso ignorar usuários com `deletedAt` preenchido ao verificar se um e-mail já está em uso durante cadastro.

**Acceptance Criteria:**
- [ ] Atualizar `src/app/api/auth/sign-up/route.ts`
- [ ] Modificar query `findUnique` para `findFirst` com filtro `deletedAt: null`
- [ ] Usuários deletados não devem bloquear novos cadastros com mesmo e-mail
- [ ] Mensagem de erro continua clara: "O e-mail informado já está em uso"
- [ ] Typecheck e lint passam

### US-004: Atualizar verificação de e-mail em aceitação de convite
**Descrição:** Como sistema, preciso permitir que convites sejam aceitos mesmo se houver histórico de usuário deletado com aquele e-mail.

**Acceptance Criteria:**
- [ ] Atualizar `src/app/api/users/invite/accept/route.ts`
- [ ] Modificar query para adicionar filtro `deletedAt: null`
- [ ] Permitir aceitação de convite se e-mail pertence apenas a usuário deletado
- [ ] Mensagem de erro mantém clareza
- [ ] Typecheck e lint passam

### US-005: Atualizar verificações no NextAuth
**Descrição:** Como sistema de autenticação, preciso garantir que apenas usuários ativos (não deletados) possam fazer login.

**Acceptance Criteria:**
- [ ] Atualizar `src/lib/next-auth/index.ts`
- [ ] Na busca de usuário em `authorize` (credentials), filtrar `deletedAt: null`
- [ ] Na busca em OAuth callback (`signIn`), validar `deletedAt` explicitamente
- [ ] Mensagens de erro mantêm clareza ("Conta desativada")
- [ ] Typecheck e lint passam

### US-006: Atualizar serviço de listagem de usuários
**Descrição:** Como administrador, quero que a listagem de usuários exiba apenas usuários ativos por padrão, mas opcionalmente possa incluir deletados.

**Acceptance Criteria:**
- [ ] Atualizar `src/features/users/services/user.service.ts`
- [ ] Função `listUsers()` já filtra `deletedAt: null` ✓ (verificar se há outras funções)
- [ ] Considerar adicionar parâmetro opcional `includeDeleted?: boolean` para casos especiais
- [ ] Documentar comportamento padrão
- [ ] Typecheck e lint passam

### US-007: Atualizar serviço de recuperação de senha
**Descrição:** Como sistema, preciso garantir que apenas usuários ativos possam solicitar redefinição de senha.

**Acceptance Criteria:**
- [ ] Atualizar `src/app/api/auth/forgot-password/route.ts`
- [ ] Adicionar filtro `deletedAt: null` na busca de usuário
- [ ] Usuários deletados não devem receber e-mail de recuperação
- [ ] Mensagem de resposta não deve revelar se usuário está deletado (segurança)
- [ ] Typecheck e lint passam

### US-008: Atualizar serviço de ativação de conta
**Descrição:** Como sistema, preciso prevenir ativação de contas que foram deletadas.

**Acceptance Criteria:**
- [ ] Atualizar `src/app/api/auth/activate/route.ts`
- [ ] Adicionar filtro `deletedAt: null` na busca de usuário
- [ ] Retornar erro apropriado se conta foi deletada
- [ ] Typecheck e lint passam

### US-009: Atualizar configurações do Bling por e-mail
**Descrição:** Como sistema de integração, preciso garantir que apenas usuários ativos possam ter configurações atualizadas.

**Acceptance Criteria:**
- [ ] Atualizar `src/features/bling/actions/saveUserSettings.ts`
- [ ] Adicionar filtro `deletedAt: null` na busca por e-mail
- [ ] Operação deve falhar silenciosamente ou retornar erro apropriado
- [ ] Typecheck e lint passam

### US-010: Criar migration para limpar dados históricos (opcional)
**Descrição:** Como desenvolvedor, preciso de uma migration para aplicar randomização de e-mail em usuários já deletados.

**Acceptance Criteria:**
- [ ] Criar migration Prisma para atualizar usuários existentes com `deletedAt IS NOT NULL`
- [ ] Aplicar formato `deleted-<timestamp>-<uuid>@removed.local` para registros históricos
- [ ] Usar `deletedAt` existente como timestamp de referência
- [ ] Migration deve ser idempotente (pode ser executada múltiplas vezes)
- [ ] Documentar migration com comentários claros
- [ ] Testar em ambiente de desenvolvimento antes de produção

### US-011: Adicionar logging e auditoria
**Descrição:** Como administrador, preciso que a randomização de e-mail seja registrada no sistema de auditoria.

**Acceptance Criteria:**
- [ ] Função `deleteUser()` deve criar registro de auditoria
- [ ] Log deve incluir: e-mail original (antes da randomização), userId, timestamp
- [ ] Usar Pino para logging estruturado (não console.log)
- [ ] Audit log deve registrar ação com tipo apropriado
- [ ] Typecheck e lint passam

### US-012: Atualizar documentação técnica
**Descrição:** Como desenvolvedor futuro, preciso de documentação clara sobre o comportamento do soft delete.

**Acceptance Criteria:**
- [ ] Adicionar comentários JSDoc na função `deleteUser()`
- [ ] Documentar formato de e-mail deletado
- [ ] Criar ou atualizar README em `src/features/users/` explicando fluxo
- [ ] Incluir exemplos de uso
- [ ] Documentar como buscar usuários deletados se necessário

## Functional Requirements

### Geração de E-mail Deletado
- **FR-1**: O sistema DEVE gerar e-mails deletados no formato `deleted-<timestamp>-<shortId>@removed.local`
- **FR-2**: O timestamp DEVE ser Unix timestamp em milissegundos
- **FR-3**: O shortId DEVE ser derivado do UUID do usuário (primeiros 8 caracteres)
- **FR-4**: O domínio DEVE ser sempre `@removed.local` para fácil identificação

### Soft Delete
- **FR-5**: Ao executar soft delete, o sistema DEVE atomicamente:
  - Setar `deletedAt` para data/hora atual
  - Atualizar `email` usando a função de geração de e-mail deletado
- **FR-6**: O soft delete DEVE preservar todos os outros campos do usuário
- **FR-7**: Toggle de status (reativar usuário) DEVE restaurar situação anterior (isso pode ou não incluir restaurar email - decisão de negócio)

### Verificação de Existência
- **FR-8**: Todas as verificações de "usuário existe por e-mail" DEVEM incluir filtro `deletedAt: null`
- **FR-9**: Endpoints de autenticação DEVEM rejeitar login de usuários com `deletedAt` não-nulo
- **FR-10**: Verificações de unicidade de e-mail DEVEM ignorar usuários deletados

### Auditoria
- **FR-11**: Operações de soft delete DEVEM gerar registro em `AuditLog`
- **FR-12**: Logs DEVEM incluir e-mail original antes da randomização
- **FR-13**: Sistema DEVE usar Pino para logging estruturado

### Integridade de Dados
- **FR-14**: Constraint `@unique` no e-mail DEVE ser mantida
- **FR-15**: Índices existentes DEVEM continuar funcionando corretamente
- **FR-16**: Relações com outras tabelas DEVEM ser preservadas

## Non-Goals (Out of Scope)

- **Hard delete de usuários** - Continuamos usando apenas soft delete
- **Recuperação de conta deletada com e-mail original** - Uma vez deletado e randomizado, o e-mail não é restaurável automaticamente
- **Interface UI para administradores verem usuários deletados** - Isso pode ser adicionado futuramente
- **Anonimização de outros campos de PII** (name, phone, etc.) - Esta refatoração foca apenas no e-mail
- **Alteração na retenção de dados** - `retentionUntil` e policies de retenção não são alteradas
- **Cascade delete de dados relacionados** - Mantemos referências intactas
- **Notificação ao usuário sobre deleção de conta** - Assumimos que isso já existe ou será tratado separadamente

## Design Considerations

### Formato de E-mail Deletado

Escolhemos `deleted-<timestamp>-<shortId>@removed.local` porque:
- **Timestamp legível**: Facilita identificar quando foi deletado sem consultar `deletedAt`
- **ShortId**: Adiciona unicidade mesmo se múltiplos usuários forem deletados no mesmo milissegundo
- **Domínio `.local`**: Domínio claramente inválido para e-mail real, seguindo RFC 2606
- **Prefixo "deleted"**: Identificação imediata em queries e logs

### Exemplo de Implementação

```typescript
// src/features/users/utils/deleted-email.ts
export function generateDeletedEmail(userId: string): string {
  const timestamp = Date.now();
  const shortId = userId.slice(0, 8);
  return `deleted-${timestamp}-${shortId}@removed.local`;
}

// src/features/users/services/user.service.ts
export async function deleteUser(id: string) {
  const deletedEmail = generateDeletedEmail(id);
  
  return prisma.$transaction(async (tx) => {
    // Buscar e-mail original para auditoria
    const user = await tx.user.findUnique({
      where: { id },
      select: { email: true }
    });

    // Soft delete com randomização
    const updated = await tx.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        email: deletedEmail
      },
    });

    // Auditoria
    await tx.auditLog.create({
      data: {
        userId: id,
        action: 'USER_DELETED',
        resource: 'User',
        metadata: `Email changed from ${user?.email} to ${deletedEmail}`,
      },
    });

    return updated;
  });
}
```

### Considerações de Reativação

Atualmente existe `toggleUserStatus()` que pode reativar usuários. Decisões de negócio necessárias:

1. **Opção A** (Recomendada): Reativar não restaura e-mail original
   - Usuário reativado precisa ter e-mail manualmente atualizado por admin
   - Mais seguro, evita conflitos

2. **Opção B**: Armazenar e-mail original em campo separado antes de deletar
   - Adiciona campo `originalEmail` ao schema
   - Permite restauração automática
   - Aumenta complexidade

**Recomendação**: Implementar **Opção A** por simplicidade. Se reativação for necessária, admin deve manualmente atualizar o e-mail.

### Índices e Performance

O índice atual é:
```prisma
@@index([email, createdAt, deletedAt])
```

Este índice permanece eficiente porque:
- Queries continuam filtrando por `email` e `deletedAt`
- E-mails randomizados não afetam performance de lookup por e-mail "real"

## Technical Considerations

### Componentes Afetados

| Componente | Arquivo | Tipo de Mudança |
|------------|---------|-----------------|
| User Service | `src/features/users/services/user.service.ts` | Modificação da função `deleteUser()` |
| Utils | `src/features/users/utils/deleted-email.ts` | Novo arquivo |
| Sign-Up API | `src/app/api/auth/sign-up/route.ts` | Atualizar query |
| Invite Accept API | `src/app/api/users/invite/accept/route.ts` | Atualizar query |
| NextAuth Config | `src/lib/next-auth/index.ts` | Atualizar queries (2 lugares) |
| Forgot Password | `src/app/api/auth/forgot-password/route.ts` | Atualizar query |
| Activate Account | `src/app/api/auth/activate/route.ts` | Atualizar query |
| Bling Settings | `src/features/bling/actions/saveUserSettings.ts` | Atualizar query |

### Dependências

- **Prisma Client**: Já instalado ✓
- **Logging (Pino)**: Já configurado em `src/lib/pino` ✓
- **Transaction Support**: Prisma `$transaction` disponível ✓

### Considerações de Migração

#### Para Dados Existentes

Se houver usuários já deletados (com `deletedAt` preenchido mas e-mail não randomizado):

```sql
-- Migration para dados históricos
UPDATE users 
SET email = CONCAT('deleted-', 
                   EXTRACT(EPOCH FROM "deletedAt")::bigint * 1000, 
                   '-',
                   SUBSTRING(id, 1, 8),
                   '@removed.local')
WHERE "deletedAt" IS NOT NULL
  AND email NOT LIKE 'deleted-%@removed.local';
```

#### Rollback

Se necessário reverter, será necessário:
1. Restaurar código anterior
2. **NÃO é possível** restaurar e-mails originais automaticamente (foram sobrescritos)
3. Por isso, recomendamos manter backup antes de aplicar em produção

### Testing Strategy

Quando framework de testes estiver implementado:

```typescript
// tests/features/users/delete-user.test.ts
describe('deleteUser', () => {
  it('should randomize email on soft delete', async () => {
    const user = await createTestUser({ email: 'test@example.com' });
    await deleteUser(user.id);
    
    const deleted = await getUserById(user.id);
    expect(deleted.email).toMatch(/^deleted-\d+-[a-f0-9]{8}@removed\.local$/);
    expect(deleted.deletedAt).not.toBeNull();
  });

  it('should allow creating new user with previously deleted email', async () => {
    await createTestUser({ email: 'reuse@example.com' });
    await deleteUser(user1.id);
    
    // Deve ser possível criar novo usuário com mesmo email
    const user2 = await createTestUser({ email: 'reuse@example.com' });
    expect(user2.id).not.toBe(user1.id);
  });
});
```

## Success Metrics

### Funcionais
- ✅ E-mail de usuário deletado segue padrão `deleted-*@removed.local`
- ✅ Possível criar novo usuário com e-mail de usuário previamente deletado
- ✅ Zero falsos positivos em "e-mail já existe" devido a usuários deletados

### Técnicos
- ✅ Todos os typechecks passam (`pnpm typecheck`)
- ✅ Todos os lints passam (`pnpm lint`)
- ✅ Nenhuma regressão em funcionalidades existentes
- ✅ Logs estruturados aparecem corretamente em desenvolvimento

### Performance
- ✅ Tempo de soft delete < 200ms (incluindo auditoria)
- ✅ Queries de verificação de e-mail mantêm performance atual

### Auditoria
- ✅ 100% dos soft deletes geram registro em `AuditLog`
- ✅ E-mail original é preservado em logs antes da randomização

## Open Questions

1. **Reativação de Usuários**: Na função `toggleUserStatus()`, ao reativar um usuário (usar `deletedAt: null`):
   - [ ] Devemos restaurar automaticamente o e-mail original? (requer armazenamento adicional)
   - [ ] Ou requer intervenção manual do admin para setar novo e-mail?
   - **Recomendação inicial**: Intervenção manual

2. **Migration Histórica**: Devemos aplicar migration para usuários já deletados?
   - [ ] Sim, aplicar em produção durante deploy
   - [ ] Não, deixar registros antigos como estão
   - **Recomendação**: Sim, por consistência

3. **Outros campos PII**: Além do e-mail, devemos randomizar `phone`, `name`, etc?
   - [ ] Sim, implementar anonimização completa
   - [ ] Não, apenas e-mail por enquanto
   - **Recomendação**: Não por enquanto, pode ser feature futura

4. **Retry de E-mail**: Se houver (improvável) colisão no e-mail randomizado:
   - [ ] Adicionar retry com novo timestamp
   - [ ] Deixar Prisma lançar erro de unique constraint
   - **Recomendação**: Colisão é estatisticamente impossível, não tratar

5. **Notificação ao Usuário**: Devemos enviar e-mail de confirmação de deleção?
   - [ ] Sim, com instruções de recuperação
   - [ ] Não, assumir que fluxo de deleção já trata isso
   - **Recomendação**: Fora do escopo desta refatoração

## Implementation Checklist

### Preparação
- [ ] Criar branch: `feature/user-soft-delete-email-randomization`
- [ ] Review deste PRD com time

### Desenvolvimento (seguir ordem das User Stories)
- [ ] US-002: Criar função utilitária
- [ ] US-001: Atualizar `deleteUser()`
- [ ] US-011: Adicionar logging/auditoria
- [ ] US-003: Atualizar sign-up
- [ ] US-004: Atualizar invite accept
- [ ] US-005: Atualizar NextAuth
- [ ] US-007: Atualizar forgot password
- [ ] US-008: Atualizar activate
- [ ] US-009: Atualizar Bling settings
- [ ] US-006: Revisar user service
- [ ] US-010: Criar migration histórica (opcional)
- [ ] US-012: Atualizar documentação

### Testes
- [ ] Teste manual: criar usuário, deletar, criar novo com mesmo e-mail
- [ ] Teste manual: tentar login com usuário deletado
- [ ] Teste manual: verificar audit logs
- [ ] Rodar `pnpm typecheck`
- [ ] Rodar `pnpm lint`

### Deploy
- [ ] Code review
- [ ] Testar em ambiente de staging
- [ ] Backup de banco de dados de produção
- [ ] Deploy em produção
- [ ] Monitorar logs por 24h

---

**Autor**: GitHub Copilot  
**Data**: 2026-02-15  
**Versão**: 1.0
