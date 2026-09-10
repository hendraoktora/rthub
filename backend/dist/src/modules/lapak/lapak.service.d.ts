import { PrismaService } from '../../prisma/prisma.service';
export declare class LapakService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeedLapak(user: any): Promise<({
        rt: {
            nomor: string;
        };
        seller: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
        };
    } & {
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        judul: string;
        kategori: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
    })[]>;
    getFeedKontrakan(user: any): Promise<({
        rt: {
            nomor: string;
        };
    } & {
        id: string;
        kelurahanId: string;
        rwId: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        status: string;
        judul: string;
        fotoUrl: string | null;
        kontakWa: string;
        ownerId: string;
        hargaSewa: import("@prisma/client/runtime/library").Decimal;
        periodeSewa: string;
        alamat: string;
        fasilitas: string | null;
    })[]>;
    createProduk(user: any, data: {
        judul: string;
        deskripsi: string;
        harga: number;
        kategori: string;
        kontakWa: string;
        fotoUrl?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        judul: string;
        kategori: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
    }>;
    deleteProduk(id: string, user: any): Promise<{
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        judul: string;
        kategori: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
    }>;
}
