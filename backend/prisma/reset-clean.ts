import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanReset() {
  console.log('🧹 Mulai pembersihan total database RtHub...');

  // Matikan Foreign Key Checks sementara untuk truncation yang aman dan bersih
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const tables = [
    'SystemFeeLog',
    'TransaksiPembayaran',
    'TagihanWarga',
    'MasterTagihan',
    'KasRT',
    'LaporanWarga',
    'AlertPanic',
    'AbsensiSecurity',
    'Berita',
    'AgendaKegiatan',
    'LapakProduk',
    'InfoKontrakan',
    'CCTV',
    'AnggotaKeluarga',
    'KartuKeluarga',
    'Profile',
    'Rumah',
    'User',
    'RT',
    'RW',
    'Kelurahan',
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  ✓ Table \`${table}\` dikosongkan.`);
    } catch (e: any) {
      // Jika truncate gagal karena FK, fallback ke DELETE FROM
      await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
      console.log(`  ✓ Table \`${table}\` dibersihkan (via DELETE).`);
    }
  }

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('✅ Seluruh tabel berhasil dibersihkan (0 data dummy).');

  // Buat Superadmin Utama yang diminta user
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('P@ssw0rd123', salt);

  const superadmin = await prisma.user.create({
    data: {
      phone: '085155163110',
      email: 'admin@rthub.id',
      passwordHash,
      role: Role.SUPERADMIN,
      profile: {
        create: {
          namaLengkap: 'Superadmin Platform RtHub',
        },
      },
    },
  });

  console.log('👑 Superadmin Berhasil Dibuat:');
  console.log(`   ID: ${superadmin.id}`);
  console.log('   Phone: 085155163110');
  console.log('   Email: admin@rthub.id');
  console.log('   Password: P@ssw0rd123');
  console.log('   Role: SUPERADMIN');
}

cleanReset()
  .catch((e) => {
    console.error('❌ Error saat reset database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
