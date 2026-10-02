import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const cols: any = await prisma.$queryRawUnsafe('DESCRIBE KasRT');
    console.log('KasRT columns:', cols.map((c: any) => c.Field));

    const rtCols: any = await prisma.$queryRawUnsafe('DESCRIBE RT');
    console.log('RT columns:', rtCols.map((c: any) => c.Field));

    // Test getKasSummary directly
    const rts = await prisma.rT.findMany({ take: 1 });
    console.log('Found RT:', rts[0]?.id);
    if (rts[0]?.id) {
      const rtId = rts[0].id;
      const kasList = await prisma.kasRT.findMany({ where: { rtId }, take: 5 });
      console.log('Kas list count:', kasList.length);
      const tunaiIn = await prisma.kasRT.aggregate({
        where: {
          rtId,
          tipe: 'PEMASUKAN',
          OR: [
            { metodeKas: 'TUNAI' },
            { kategori: { contains: 'Tunai' } },
          ],
        },
        _sum: { nominal: true },
      });
      console.log('Tunai in:', tunaiIn);
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
