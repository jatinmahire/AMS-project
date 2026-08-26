const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { loginId: 'admin' } });
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      loginId: 'admin',
      passwordHash,
      role: 'ADMIN',
      fullName: 'System Admin',
    },
  });

  console.log('Seeded admin user — loginId: admin, password: Admin@123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
