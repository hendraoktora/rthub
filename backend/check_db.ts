import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        role: true,
        rtId: true,
        profile: { select: { namaLengkap: true, noRumah: true } },
      },
      take: 10,
    });
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const rumah = await prisma.rumah.findMany({
      select: {
        id: true,
        noRumah: true,
        rtId: true,
        _count: { select: { tagihanWarga: true } },
      },
      take: 10,
    });
    console.log('--- RUMAH ---');
    console.log(JSON.stringify(rumah, null, 2));

    const tagihan = await prisma.tagihanWarga.findMany({
      include: {
        masterTagihan: true,
        rumah: true,
      },
      take: 10,
    });
    console.log('--- TOTAL TAGIHAN:', tagihan.length);
    console.log(JSON.stringify(tagihan.slice(0, 3), null, 2));

    const masters = await prisma.masterTagihan.findMany();
    console.log('--- MASTER TAGIHAN:', JSON.stringify(masters, null, 2));
  } catch (err) {
    console.error('Check error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
