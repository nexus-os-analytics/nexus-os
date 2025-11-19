import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Ordem de exclusão: das tabelas filhas para as pai
  await prisma.securityIncident.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.loginActivity.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.dataRegistry.deleteMany();

  // Agora pode excluir os usuários
  await prisma.user.deleteMany();

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
  .catch((e) => {
    console.error('❌ A error occurs on seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
