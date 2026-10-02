"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const cols = await prisma.$queryRawUnsafe('DESCRIBE KasRT');
        console.log('KasRT columns:', cols.map((c) => c.Field));
        const rtCols = await prisma.$queryRawUnsafe('DESCRIBE RT');
        console.log('RT columns:', rtCols.map((c) => c.Field));
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
    }
    catch (err) {
        console.error('Test error:', err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check_db.js.map