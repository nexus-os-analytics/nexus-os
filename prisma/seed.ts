import { PrismaClient, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function tableExists(tableName: string) {
  const { rows } = await pool.query<{ oid: string | null }>('SELECT to_regclass($1) as oid', [
    `public.${tableName}`,
  ]);
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

  // Webhook events (independent)
  await safeDelete('webhook_events', () => prisma.webhookEvent.deleteMany());

  // Campaign (depends on User and BlingProduct)
  await safeDelete('campaigns', () => prisma.campaign.deleteMany());

  // Mercado Livre - child tables first
  await safeDelete('meli_alerts', () => prisma.meliAlert.deleteMany());
  await safeDelete('meli_stock_balance', () => prisma.meliStockBalance.deleteMany());
  await safeDelete('meli_order_history', () => prisma.meliOrderHistory.deleteMany());
  await safeDelete('meli_product_settings', () => prisma.meliProductSettings.deleteMany());
  await safeDelete('meli_products', () => prisma.meliProduct.deleteMany());
  await safeDelete('meli_categories', () => prisma.meliCategory.deleteMany());
  await safeDelete('meli_sync_jobs', () => prisma.meliSyncJob.deleteMany());
  await safeDelete('meli_integrations', () => prisma.meliIntegration.deleteMany());

  // Bling - child tables first
  await safeDelete('bling_alerts', () => prisma.blingAlert.deleteMany());
  await safeDelete('bling_stock_balance', () => prisma.blingStockBalance.deleteMany());
  await safeDelete('bling_sales_history', () => prisma.blingSalesHistory.deleteMany());
  await safeDelete('bling_product_settings', () => prisma.blingProductSettings.deleteMany());
  await safeDelete('bling_products', () => prisma.blingProduct.deleteMany());
  await safeDelete('bling_categories', () => prisma.blingCategory.deleteMany());
  await safeDelete('bling_sync_jobs', () => prisma.blingSyncJob.deleteMany());
  await safeDelete('bling_integrations', () => prisma.blingIntegration.deleteMany());

  // User-related tables
  await safeDelete('manual_pix_payments', () => prisma.manualPixPayment.deleteMany());
  await safeDelete('email_delivery_logs', () => prisma.emailDeliveryLog.deleteMany());
  await safeDelete('user_invitations', () => prisma.userInvitation.deleteMany());
  await safeDelete('security_incidents', () => prisma.securityIncident.deleteMany());
  await safeDelete('audit_logs', () => prisma.auditLog.deleteMany());
  await safeDelete('login_activities', () => prisma.loginActivity.deleteMany());
  await safeDelete('api_keys', () => prisma.apiKey.deleteMany());
  await safeDelete('sessions', () => prisma.session.deleteMany());
  await safeDelete('accounts', () => prisma.account.deleteMany());

  // Independent tables
  await safeDelete('verification_tokens', () => prisma.verificationToken.deleteMany());
  await safeDelete('data_registries', () => prisma.dataRegistry.deleteMany());

  // Finally, delete users
  await safeDelete('users', () => prisma.user.deleteMany());

  // Verificação mínima para seguir com criação de dados obrigatórios
  const hasUsers = await tableExists('users');
  if (!hasUsers) {
    console.error(
      '❌ As tabelas obrigatórias não existem. Execute as migrações antes de rodar o seed:\n' +
        '   - pnpm postinstall (aplica generate + migrate deploy)\n' +
        '   - ou: npx prisma migrate deploy (prod) / npx prisma migrate dev (dev)\n'
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
