import { PrismaClient, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function tableExists(tableName: string) {
  const { rows } = await pool.query<{ oid: string | null }>(
    'SELECT to_regclass($1) as oid',
    [`public.${tableName}`],
  );
  return Boolean(rows?.[0]?.oid);
}

async function safeDelete(actionName: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2021') {
      console.warn(`⚠️  Pulando exclusão de ${actionName}: tabela não existe.`);
      return;
    }
    throw e;
  }
}

async function main() {
  // Ordem de exclusão: das tabelas filhas para as pai
  await safeDelete('security_incidents', () => prisma.securityIncident.deleteMany());
  await safeDelete('audit_logs', () => prisma.auditLog.deleteMany());
  await safeDelete('login_activities', () => prisma.loginActivity.deleteMany());
  await safeDelete('api_keys', () => prisma.apiKey.deleteMany());
  await safeDelete('sessions', () => prisma.session.deleteMany());
  await safeDelete('accounts', () => prisma.account.deleteMany());
  await safeDelete('verification_tokens', () => prisma.verificationToken.deleteMany());
  await safeDelete('data_registries', () => prisma.dataRegistry.deleteMany());
  await safeDelete('bling_sync_jobs', () => prisma.blingSyncJob.deleteMany());

  // Agora pode excluir os usuários
  await safeDelete('users', () => prisma.user.deleteMany());

  // Verificação mínima para seguir com criação de dados obrigatórios
  const hasUsers = await tableExists('users');
  if (!hasUsers) {
    console.error(
      '❌ As tabelas obrigatórias não existem. Execute as migrações antes de rodar o seed:\n' +
      '   - pnpm postinstall (aplica generate + migrate deploy)\n' +
      '   - ou: npx prisma migrate deploy (prod) / npx prisma migrate dev (dev)\n',
    );
    return;
  }

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@email.com',
      hashedPassword: await bcrypt.hash('Asdf@1234', 10),
      role: UserRole.SUPER_ADMIN,
      acceptedTerms: true,
      emailVerified: new Date(),
    },
  });

  // Opcional: criar alguns dados de exemplo para outras tabelas
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SEED_EXECUTED',
      resource: 'System',
    },
  });

  console.warn('🌱 Seed completed!');
  console.warn('👑 SUPER_ADMIN created:', superAdmin.email);
  console.warn('📧 Email:', superAdmin.email);
  console.warn('🔑 Password: Asdf@1234');
}

main()
  .then(async () => {
    console.log('Seed script finished successfully.');
  })
  .catch((e) => {
    console.error('❌ A error occurs on seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
