import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ensuring clean Superadmin user...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('P@ssw0rd123', salt);

  const superadmin = await prisma.user.upsert({
    where: { phone: '085155163110' },
    update: {
      email: 'admin@rthub.id',
      passwordHash: defaultPasswordHash,
      role: Role.SUPERADMIN,
    },
    create: {
      phone: '085155163110',
      email: 'admin@rthub.id',
      passwordHash: defaultPasswordHash,
      role: Role.SUPERADMIN,
      profile: {
        create: {
          namaLengkap: 'Superadmin Platform RtHub',
        },
      },
    },
  });

  console.log('✅ Clean Superadmin created/verified: admin@rthub.id / 085155163110');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
