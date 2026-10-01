const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({ where: { loginId: 'admin' } });
  if (!existingAdmin) {
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
  } else {
    console.log('Admin user already exists, skipping seed.');
  }

  const supervisor = await prisma.supervisor.findUnique({ where: { supervisorCode: 'SUP001' } });
  if (supervisor) {
    const existingSupervisorUser = await prisma.user.findUnique({ where: { supervisorId: supervisor.id } });
    if (!existingSupervisorUser) {
      const passwordHash = await bcrypt.hash('Supervisor@123', 10);
      await prisma.user.create({
        data: {
          loginId: 'suresh.patil',
          passwordHash,
          role: 'SUPERVISOR',
          fullName: supervisor.fullName,
          supervisorId: supervisor.id,
        },
      });
      console.log('Seeded supervisor user — loginId: suresh.patil, password: Supervisor@123');
    } else {
      console.log('A user is already linked to supervisor SUP001, skipping seed.');
    }
  } else {
    console.log('Supervisor record SUP001 not found, skipping supervisor user seed.');
  }

  const contractor = await prisma.contractor.findUnique({ where: { contractorCode: 'CON001' } });
  if (contractor) {
    const existingContractorUser = await prisma.user.findUnique({ where: { contractorId: contractor.id } });
    if (!existingContractorUser) {
      const passwordHash = await bcrypt.hash('Contractor@123', 10);
      await prisma.user.create({
        data: {
          loginId: 'shree.constructions',
          passwordHash,
          role: 'CONTRACTOR',
          fullName: contractor.contractorName,
          contractorId: contractor.id,
        },
      });
      console.log('Seeded contractor user — loginId: shree.constructions, password: Contractor@123');
    } else {
      console.log('A user is already linked to contractor CON001, skipping seed.');
    }
  } else {
    console.log('Contractor record CON001 not found, skipping contractor user seed.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
