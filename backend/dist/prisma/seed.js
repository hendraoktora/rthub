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
    console.log('🌱 Starting RtHub Database Seeding...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);
    const superadmin = await prisma.user.upsert({
        where: { phone: '081111111111' },
        update: {},
        create: {
            phone: '081111111111',
            email: 'superadmin@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.SUPERADMIN,
            profile: {
                create: {
                    namaLengkap: 'Superadmin Platform RtHub',
                },
            },
        },
    });
    console.log('✅ Superadmin created: superadmin@rthub.id / 081111111111');
    let kelurahan = await prisma.kelurahan.findFirst({ where: { nama: 'Sukamaju' } });
    if (!kelurahan) {
        kelurahan = await prisma.kelurahan.create({
            data: {
                nama: 'Sukamaju',
                kecamatan: 'Cilodong',
                kota: 'Depok',
                provinsi: 'Jawa Barat',
                kodePos: '16415',
            },
        });
    }
    let rw05 = await prisma.rW.findFirst({ where: { nomor: '05', kelurahanId: kelurahan.id } });
    if (!rw05) {
        rw05 = await prisma.rW.create({
            data: {
                nomor: '05',
                kelurahanId: kelurahan.id,
            },
        });
    }
    await prisma.user.upsert({
        where: { phone: '081211110005' },
        update: {},
        create: {
            phone: '081211110005',
            email: 'rw05@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.ADMIN_RW,
            kelurahanId: kelurahan.id,
            rwId: rw05.id,
            profile: {
                create: {
                    namaLengkap: 'Bpk. H. Rahmat Hidayat (Ketua RW 05)',
                },
            },
        },
    });
    let rt03 = await prisma.rT.findFirst({ where: { nomor: '03', rwId: rw05.id } });
    if (!rt03) {
        rt03 = await prisma.rT.create({
            data: {
                nomor: '03',
                namaJalan: 'Jl. Melati Raya Kompleks Sukamaju Asri',
                rwId: rw05.id,
            },
        });
    }
    await prisma.user.upsert({
        where: { phone: '081234567890' },
        update: {},
        create: {
            phone: '081234567890',
            email: 'rt03@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.ADMIN_RT,
            kelurahanId: kelurahan.id,
            rwId: rw05.id,
            rtId: rt03.id,
            profile: {
                create: {
                    namaLengkap: 'Bpk. Hendra Gunawan (Ketua RT 03)',
                    noRumah: 'Blok C3 No. 12',
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { phone: '081288880001' },
        update: {
            role: client_1.Role.SEKRETARIS_RT,
            passwordHash: defaultPasswordHash,
        },
        create: {
            phone: '081288880001',
            email: 'sekretaris.rt03@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.SEKRETARIS_RT,
            kelurahanId: kelurahan.id,
            rwId: rw05.id,
            rtId: rt03.id,
            profile: {
                create: {
                    namaLengkap: 'Bpk. Aditya Pratama (Sekretaris RT 03)',
                    noRumah: 'Blok C3 No. 08',
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { phone: '081398765432' },
        update: {
            passwordHash: defaultPasswordHash,
        },
        create: {
            phone: '081398765432',
            email: 'bendahara.rt03@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.BENDAHARA_RT,
            kelurahanId: kelurahan.id,
            rwId: rw05.id,
            rtId: rt03.id,
            profile: {
                create: {
                    namaLengkap: 'Ibu Hj. Siti Aminah (Bendahara RT 03)',
                    noRumah: 'Blok C3 No. 05',
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { phone: '087812345678' },
        update: {
            passwordHash: defaultPasswordHash,
        },
        create: {
            phone: '087812345678',
            email: 'security.rw05@rthub.id',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.SECURITY,
            kelurahanId: kelurahan.id,
            rwId: rw05.id,
            rtId: rt03.id,
            profile: {
                create: {
                    namaLengkap: 'Pak Joko Supriyadi (Satpam / Keamanan)',
                    noRumah: 'Pos Satpam Utama',
                },
            },
        },
    });
    const masterTagihan = await prisma.masterTagihan.upsert({
        where: { id: 'master-tagihan-rt03-default' },
        update: {},
        create: {
            id: 'master-tagihan-rt03-default',
            rtId: rt03.id,
            namaTagihan: 'Iuran Kas RT & Pengelolaan Sampah',
            nominalPokok: 50000.00,
            adminFee: 2000.00,
            deskripsi: 'Iuran wajib bulanan: Kas RT Rp 30.000 + Sampah Rp 20.000',
        },
    });
    const wargaData = [
        { noRumah: 'Blok C3 No. 01', namaKepala: 'Bpk. Ahmad Fauzi', istri: 'Ibu Siti Khodijah', anak: ['Rian Fauzi', 'Anisa Fauzi'], phone: '081211110001', nik: '3276010101800001', kk: '3276010101809901', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 02', namaKepala: 'Bpk. Bambang Soediro', istri: 'Ibu Sri Wahyuni', anak: ['Dimas Soediro'], phone: '081211110002', nik: '3276010101800002', kk: '3276010101809902', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 03', namaKepala: 'Bpk. Candra Wijaya', istri: 'Ibu Ratna Dewi', anak: ['Kevin Wijaya', 'Tasya Wijaya'], phone: '081211110003', nik: '3276010101800003', kk: '3276010101809903', statusTagihan: 'UNPAID', statusHunian: 'KONTRAK' },
        { noRumah: 'Blok C3 No. 04', namaKepala: 'Bpk. Dedi Kusnandar', istri: 'Ibu Maya Rosalina', anak: ['Aldi Kusnandar'], phone: '081211110004', nik: '3276010101800004', kk: '3276010101809904', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 05', namaKepala: 'Bpk. H. Mansyur', istri: 'Ibu Hj. Siti Aminah', anak: ['Fahri Mansyur', 'Laila Mansyur'], phone: '081398765432', nik: '3276010101800005', kk: '3276010101809905', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 06', namaKepala: 'Bpk. Eko Prasetyo', istri: 'Ibu Nurul Hidayati', anak: ['Bagas Prasetyo'], phone: '081211110006', nik: '3276010101800006', kk: '3276010101809906', statusTagihan: 'UNPAID', statusHunian: 'KONTRAK' },
        { noRumah: 'Blok C3 No. 07', namaKepala: 'Bpk. Firman Utina', istri: 'Ibu Indah Pertiwi', anak: ['Rizky Utina', 'Putri Utina'], phone: '081211110007', nik: '3276010101800007', kk: '3276010101809907', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 08', namaKepala: 'Bpk. Gunawan Wibisono', istri: 'Ibu Kartika Sari', anak: ['Arya Wibisono'], phone: '081211110008', nik: '3276010101800008', kk: '3276010101809908', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 09', namaKepala: 'Bpk. Harry Sugianto', istri: 'Ibu Hesty Purwanti', anak: ['Gita Sugianto', 'Bima Sugianto'], phone: '081211110009', nik: '3276010101800009', kk: '3276010101809909', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 10', namaKepala: 'Bpk. Irfan Bachdim', istri: 'Ibu Jennifer Bachdim', anak: ['Kenji Bachdim'], phone: '081211110010', nik: '3276010101800010', kk: '3276010101809910', statusTagihan: 'UNPAID', statusHunian: 'KONTRAK' },
        { noRumah: 'Blok C3 No. 11', namaKepala: 'Bpk. Joko Susilo', istri: 'Ibu Yuliana', anak: ['Rangga Susilo'], phone: '081211110011', nik: '3276010101800011', kk: '3276010101809911', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
        { noRumah: 'Blok C3 No. 12', namaKepala: 'Bpk. Hendra Gunawan', istri: 'Ibu Linda Susanti', anak: ['Naufal Gunawan', 'Alya Gunawan'], phone: '081234567890', nik: '3276010101800012', kk: '3276010101809912', statusTagihan: 'LUNAS', statusHunian: 'TETAP' },
    ];
    for (const w of wargaData) {
        let rumah = await prisma.rumah.findFirst({ where: { rtId: rt03.id, noRumah: w.noRumah } });
        if (!rumah) {
            rumah = await prisma.rumah.create({
                data: {
                    rtId: rt03.id,
                    noRumah: w.noRumah,
                    alamatLengkap: `${w.noRumah}, Jl. Melati Raya, RT 03 / RW 05 Sukamaju`,
                    statusHunian: w.statusHunian,
                },
            });
        }
        const existingWargaUser = await prisma.user.findUnique({ where: { phone: w.phone } });
        let wargaUser = existingWargaUser;
        if (!wargaUser) {
            wargaUser = await prisma.user.create({
                data: {
                    phone: w.phone,
                    passwordHash: defaultPasswordHash,
                    role: client_1.Role.WARGA,
                    kelurahanId: kelurahan.id,
                    rwId: rw05.id,
                    rtId: rt03.id,
                    profile: {
                        create: {
                            namaLengkap: w.namaKepala,
                            noRumah: w.noRumah,
                            nik: w.nik,
                            noKk: w.kk,
                        },
                    },
                },
            });
        }
        let kartuKeluarga = await prisma.kartuKeluarga.findUnique({ where: { noKk: w.kk } });
        if (!kartuKeluarga) {
            kartuKeluarga = await prisma.kartuKeluarga.create({
                data: {
                    noKk: w.kk,
                    rumahId: rumah.id,
                    namaKepala: w.namaKepala,
                    anggota: {
                        create: [
                            { nama: w.namaKepala, nik: w.nik, hubungan: 'KEPALA_KELUARGA', noHp: w.phone },
                            { nama: w.istri, hubungan: 'ISTRI' },
                            ...w.anak.map(anakNama => ({ nama: anakNama, hubungan: 'ANAK' })),
                        ],
                    },
                },
            });
        }
        const existingTagihan = await prisma.tagihanWarga.findFirst({
            where: { masterTagihanId: masterTagihan.id, rumahId: rumah.id, periodeBulan: 9, periodeTahun: 2026 },
        });
        if (!existingTagihan) {
            await prisma.tagihanWarga.create({
                data: {
                    masterTagihanId: masterTagihan.id,
                    rumahId: rumah.id,
                    periodeBulan: 9,
                    periodeTahun: 2026,
                    nominalPokok: 50000.00,
                    adminFee: 2000.00,
                    totalBayar: 52000.00,
                    status: w.statusTagihan === 'LUNAS' ? client_1.StatusTagihan.PAID : client_1.StatusTagihan.UNPAID,
                    jatuhTempo: new Date('2026-09-10'),
                    paidAt: w.statusTagihan === 'LUNAS' ? new Date() : null,
                },
            });
        }
    }
    const countKas = await prisma.kasRT.count({ where: { rtId: rt03.id } });
    if (countKas === 0) {
        const adminUser = await prisma.user.findFirst({ where: { phone: '081234567890' } });
        if (adminUser) {
            await prisma.kasRT.createMany({
                data: [
                    {
                        rtId: rt03.id,
                        createdById: adminUser.id,
                        tipe: client_1.TipeKas.PEMASUKAN,
                        kategori: 'Saldo Awal Pembukuan',
                        nominal: 15600000.00,
                        saldoBerjalan: 15600000.00,
                        keterangan: 'Sisa saldo kas RT tahun buku sebelumnya',
                    },
                    {
                        rtId: rt03.id,
                        createdById: adminUser.id,
                        tipe: client_1.TipeKas.PEMASUKAN,
                        kategori: 'Iuran Warga',
                        nominal: 3800000.00,
                        saldoBerjalan: 19400000.00,
                        keterangan: 'Penerimaan iuran warga September 2026 (76 KK)',
                    },
                    {
                        rtId: rt03.id,
                        createdById: adminUser.id,
                        tipe: client_1.TipeKas.PENGELUARAN,
                        kategori: 'Kebersihan',
                        nominal: 950000.00,
                        saldoBerjalan: 18450000.00,
                        keterangan: 'Honor petugas sampah & perawatan lampu jalan',
                    },
                ],
            });
        }
    }
    const countBerita = await prisma.berita.count();
    if (countBerita === 0) {
        const adminUser = await prisma.user.findFirst({ where: { phone: '081234567890' } });
        if (adminUser) {
            await prisma.berita.create({
                data: {
                    authorId: adminUser.id,
                    scope: client_1.ScopeWilayah.RW,
                    rwId: rw05.id,
                    judul: 'Jadwal Pemadaman Listrik Sementara untuk Perawatan Trafo',
                    konten: 'Diberitahukan kepada seluruh warga RW 05 bahwa PLN akan melakukan pemeliharaan trafo gardu pada hari Kamis, 11 September 2026 pukul 09:00 - 12:00 WIB.',
                    isPinned: true,
                },
            });
            await prisma.agendaKegiatan.createMany({
                data: [
                    {
                        scope: client_1.ScopeWilayah.RT,
                        rtId: rt03.id,
                        judul: 'Kerja Bakti Bersih Saluran Air & Selokan',
                        kategori: 'KERJA_BAKTI',
                        tanggalMulai: new Date('2026-09-09T07:00:00'),
                        lokasi: 'Sepanjang Jl. Melati Blok C & D',
                    },
                    {
                        scope: client_1.ScopeWilayah.RW,
                        rwId: rw05.id,
                        judul: 'Fogging Nyamuk DBD Serentak RW 05',
                        kategori: 'FOGGING',
                        tanggalMulai: new Date('2026-09-12T15:30:00'),
                        lokasi: 'Seluruh Lingkungan RW 05',
                    },
                ],
            });
        }
    }
    const countLapak = await prisma.lapakProduk.count();
    if (countLapak === 0) {
        const wargaLinda = await prisma.user.findFirst({ where: { phone: '081234567890' } });
        const wargaDedi = await prisma.user.findFirst({ where: { phone: '081211110004' } });
        const wargaSiti = await prisma.user.findFirst({ where: { phone: '081398765432' } });
        if (wargaLinda && wargaDedi && wargaSiti) {
            await prisma.lapakProduk.createMany({
                data: [
                    {
                        sellerId: wargaLinda.id,
                        rtId: rt03.id,
                        rwId: rw05.id,
                        kelurahanId: kelurahan.id,
                        judul: 'Katering Nasi Kuning & Tumpeng Mini',
                        deskripsi: 'Menerima pesanan katering nasi box, tumpeng syukuran, dan snack box arisan. Rasa dijamin lezat!',
                        harga: 25000.00,
                        kategori: 'Kuliner',
                        kontakWa: '081234567890',
                        isActive: true,
                    },
                    {
                        sellerId: wargaDedi.id,
                        rtId: rt03.id,
                        rwId: rw05.id,
                        kelurahanId: kelurahan.id,
                        judul: 'Jasa Servis & Cuci AC Rumah Bergaransi',
                        deskripsi: 'Melayani cuci AC split, tambah freon R32/R410, dan perbaikan AC wilayah RT 03 & RW 05.',
                        harga: 75000.00,
                        kategori: 'Jasa',
                        kontakWa: '081211110004',
                        isActive: true,
                    },
                    {
                        sellerId: wargaSiti.id,
                        rtId: rt03.id,
                        rwId: rw05.id,
                        kelurahanId: kelurahan.id,
                        judul: 'Kue Basah & Aneka Gorengan Hangat',
                        deskripsi: 'Tersedia risol mayo, lemper ayam, pastel, dan bolu kukus siap antar setiap pagi.',
                        harga: 3000.00,
                        kategori: 'Kuliner',
                        kontakWa: '081398765432',
                        isActive: true,
                    },
                ],
            });
        }
    }
    const countLaporan = await prisma.laporanWarga.count();
    if (countLaporan === 0) {
        const wargaCandra = await prisma.user.findFirst({ where: { phone: '081211110003' } });
        const wargaAhmad = await prisma.user.findFirst({ where: { phone: '081211110001' } });
        if (wargaCandra && wargaAhmad) {
            await prisma.laporanWarga.createMany({
                data: [
                    {
                        userId: wargaAhmad.id,
                        rtId: rt03.id,
                        judul: 'Lampu Penerangan Jalan Blok C Dekat Gardu Mati',
                        deskripsi: 'Lampu PJU di dekat tiang listrik nomor 3 padam sejak kemarin malam, jalanan cukup gelap.',
                        kategori: 'Fasilitas Umum',
                        status: client_1.StatusLaporan.RESOLVED,
                        tanggapanRT: 'Sudah diganti dengan bohlam LED baru oleh pengurus RT.',
                    },
                    {
                        userId: wargaCandra.id,
                        rtId: rt03.id,
                        judul: 'Dahan Pohon Menutupi Kabel Listrik & Jalan',
                        deskripsi: 'Dahan pohon mangga di depan jalan blok C3 menjuntai rendah membahayakan kendaraan yang lewat.',
                        kategori: 'Kebersihan',
                        status: client_1.StatusLaporan.IN_PROGRESS,
                        tanggapanRT: 'Petugas kebersihan dijadwalkan merapikan dahan pada kerja bakti besok pagi.',
                    },
                ],
            });
        }
    }
    console.log('🎉 Seeding completed successfully with full Warga, KK, Rumah, Kas, Lapak, Laporan, and Pengurus!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map