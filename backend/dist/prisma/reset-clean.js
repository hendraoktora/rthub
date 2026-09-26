"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function cleanReset() {
    console.log('🧹 Mulai pembersihan total database RtHub...');
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
        }
        catch (e) {
            await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
            console.log(`  ✓ Table \`${table}\` dibersihkan (via DELETE).`);
        }
    }
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Seluruh tabel berhasil dibersihkan (0 data dummy).');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('P@ssw0rd123', salt);
    const superadmin = await prisma.user.create({
        data: {
            phone: '085155163110',
            email: 'admin@rthub.id',
            passwordHash,
            role: client_1.Role.SUPERADMIN,
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
//# sourceMappingURL=reset-clean.js.map