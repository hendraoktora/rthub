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
async function main() {
    console.log('🚀 Creating test accounts for Duitku Onboarding & Verification Team...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    const kelurahan = await prisma.kelurahan.upsert({
        where: {
            nama_kecamatan_kota: {
                nama: 'Kota Baru',
                kecamatan: 'Bekasi Barat',
                kota: 'Kota Bekasi',
            },
        },
        update: {},
        create: {
            nama: 'Kota Baru',
            kecamatan: 'Bekasi Barat',
            kota: 'Kota Bekasi',
            provinsi: 'Jawa Barat',
            kodePos: '17133',
        },
    });
    const rw = await prisma.rW.upsert({
        where: {
            nomor_kelurahanId: {
                nomor: '04',
                kelurahanId: kelurahan.id,
            },
        },
        update: {},
        create: {
            nomor: '04',
            kelurahanId: kelurahan.id,
        },
    });
    const rt = await prisma.rT.upsert({
        where: {
            nomor_rwId: {
                nomor: '04',
                rwId: rw.id,
            },
        },
        update: {
            namaJalan: 'Jl. Cempedak Blok AH 1 No. 2',
        },
        create: {
            nomor: '04',
            rwId: rw.id,
            namaJalan: 'Jl. Cempedak Blok AH 1 No. 2',
        },
    });
    console.log(`✅ Wilayah RT 004 / RW 004 Kel. Kota Baru verified (RT ID: ${rt.id})`);
    const accounts = [
        {
            phone: '081211110001',
            email: 'ketua.rt@rthub.id',
            nama: 'Budi Santoso (Ketua RT 004)',
            role: client_1.Role.ADMIN_RT,
            noRumah: 'Blok AH 1 No. 1',
            keterangan: 'Ketua RT - Akses Penuh Dashboard Lingkungan',
        },
        {
            phone: '081211110002',
            email: 'wakil.rt@rthub.id',
            nama: 'Ahmad Fauzi (Wakil Ketua RT 004)',
            role: client_1.Role.ADMIN_RT,
            noRumah: 'Blok AH 1 No. 2',
            keterangan: 'Wakil Ketua RT - Pendamping Pengurus & Operasional',
        },
        {
            phone: '081211110003',
            email: 'sekretaris.rt@rthub.id',
            nama: 'Siti Rahmawati (Sekretaris RT 004)',
            role: client_1.Role.SEKRETARIS_RT,
            noRumah: 'Blok AH 1 No. 3',
            keterangan: 'Sekretaris RT - Pengelolaan Surat Digital & Data Warga',
        },
        {
            phone: '081211110004',
            email: 'bendahara.rt@rthub.id',
            nama: 'Dewi Lestari (Bendahara RT 004)',
            role: client_1.Role.BENDAHARA_RT,
            noRumah: 'Blok AH 1 No. 4',
            keterangan: 'Bendahara RT - Pengelolaan Kas, Fee & Pencairan Dana',
        },
        {
            phone: '081211110005',
            email: 'satpam.rt@rthub.id',
            nama: 'Agus Prayitno (Danru Satpam RT 004)',
            role: client_1.Role.SECURITY,
            noRumah: 'Pos Keamanan Utama',
            keterangan: 'Petugas Keamanan / Satpam - Patroli, CCTV & Panic Button',
        },
        {
            phone: '081211110006',
            email: 'warga.rt@rthub.id',
            nama: 'Bambang Wijaya (Warga RT 004)',
            role: client_1.Role.WARGA,
            noRumah: 'Blok AH 1 No. 10',
            keterangan: 'Warga - Pembayaran Iuran Kas (Duitku Sandbox) & Lapak UMKM',
        },
    ];
    let bendaharaId = '';
    for (const acc of accounts) {
        const user = await prisma.user.upsert({
            where: { phone: acc.phone },
            update: {
                email: acc.email,
                passwordHash,
                role: acc.role,
                kelurahanId: kelurahan.id,
                rwId: rw.id,
                rtId: rt.id,
                isActive: true,
            },
            create: {
                phone: acc.phone,
                email: acc.email,
                passwordHash,
                role: acc.role,
                kelurahanId: kelurahan.id,
                rwId: rw.id,
                rtId: rt.id,
                isActive: true,
                profile: {
                    create: {
                        namaLengkap: acc.nama,
                        noRumah: acc.noRumah,
                    },
                },
            },
        });
        if (acc.role === client_1.Role.BENDAHARA_RT) {
            bendaharaId = user.id;
        }
        await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                namaLengkap: acc.nama,
                noRumah: acc.noRumah,
            },
            create: {
                userId: user.id,
                namaLengkap: acc.nama,
                noRumah: acc.noRumah,
            },
        });
        console.log(`✅ [${acc.role}] ${acc.nama} -> Phone: ${acc.phone} | Email: ${acc.email}`);
    }
    const existingKas = await prisma.kasRT.findFirst({
        where: { rtId: rt.id },
    });
    if (!existingKas && bendaharaId) {
        await prisma.kasRT.create({
            data: {
                rtId: rt.id,
                createdById: bendaharaId,
                tipe: client_1.TipeKas.PEMASUKAN,
                kategori: 'Iuran Kas Warga',
                nominal: 2500000,
                saldoBerjalan: 2500000,
                keterangan: 'Saldo awal kas digital RT 04 (Simulasi Sandbox)',
            },
        });
        console.log('✅ Initial Kas RT recorded: Rp 2.500.000');
    }
    const wargaUser = await prisma.user.findUnique({
        where: { phone: '081211110006' },
    });
    if (wargaUser) {
        const rumahWarga = await prisma.rumah.upsert({
            where: {
                rtId_noRumah: {
                    rtId: rt.id,
                    noRumah: 'Blok AH 1 No. 10',
                },
            },
            update: {
                alamatLengkap: 'Jl. Cempedak Blok AH 1 No. 10, RT.004/RW.004',
            },
            create: {
                rtId: rt.id,
                noRumah: 'Blok AH 1 No. 10',
                alamatLengkap: 'Jl. Cempedak Blok AH 1 No. 10, RT.004/RW.004',
                statusHunian: 'TETAP',
            },
        });
        const masterTagihan = await prisma.masterTagihan.upsert({
            where: { id: `master-${rt.id}-ipl` },
            update: {
                nominalPokok: 50000,
                namaTagihan: 'Iuran Pengelolaan Lingkungan (IPL)',
            },
            create: {
                id: `master-${rt.id}-ipl`,
                rtId: rt.id,
                namaTagihan: 'Iuran Pengelolaan Lingkungan (IPL)',
                nominalPokok: 50000,
                adminFee: 1500,
                deskripsi: 'Iuran bulanan kebersihan, keamanan, dan kas RT 04',
            },
        });
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const existingTagihan = await prisma.tagihanWarga.findFirst({
            where: {
                rumahId: rumahWarga.id,
                masterTagihanId: masterTagihan.id,
                periodeBulan: currentMonth,
                periodeTahun: currentYear,
            },
        });
        if (!existingTagihan) {
            await prisma.tagihanWarga.create({
                data: {
                    masterTagihanId: masterTagihan.id,
                    rumahId: rumahWarga.id,
                    periodeBulan: currentMonth,
                    periodeTahun: currentYear,
                    nominalPokok: 50000,
                    adminFee: 1500,
                    totalBayar: 51500,
                    status: client_1.StatusTagihan.UNPAID,
                    jatuhTempo: new Date(currentYear, currentMonth, 10),
                },
            });
            console.log('✅ Unpaid tagihan created: Rp 51.500 (IPL + Admin Fee) for Warga testing');
        }
        else {
            console.log('✅ Tagihan already exists for testing');
        }
    }
    console.log('\n🎉 All 6 Duitku testing accounts successfully prepared in Database!');
}
main()
    .catch((e) => {
    console.error('❌ Error creating accounts:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-duitku-test-accounts.js.map