import { LapakService } from './lapak.service';
export declare class LapakController {
    private readonly lapakService;
    constructor(lapakService: LapakService);
    getProdukDefault(user: any): Promise<any[]>;
    getProduk(user: any): Promise<any[]>;
    getKontrakan(user: any): Promise<({
        rt: {
            nomor: string;
        };
    } & {
        rtId: string;
        id: string;
        kelurahanId: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        deskripsi: string;
        judul: string;
        fotoUrl: string | null;
        kontakWa: string;
        ownerId: string;
        hargaSewa: import("@prisma/client/runtime/library").Decimal;
        periodeSewa: string;
        alamat: string;
        fasilitas: string | null;
    })[]>;
    createProdukDefault(user: any, body: {
        judul: string;
        deskripsi: string;
        harga: number;
        kategori: string;
        kontakWa: string;
        fotoUrl?: string;
    }): Promise<{
        rtId: string;
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        kategori: string;
        judul: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
        isPromoted: boolean;
        promotedBadge: string | null;
        paketIklan: string | null;
        promotedAt: Date | null;
        promotedUntil: Date | null;
    }>;
    createProduk(user: any, body: {
        judul: string;
        deskripsi: string;
        harga: number;
        kategori: string;
        kontakWa: string;
        fotoUrl?: string;
    }): Promise<{
        rtId: string;
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        kategori: string;
        judul: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
        isPromoted: boolean;
        promotedBadge: string | null;
        paketIklan: string | null;
        promotedAt: Date | null;
        promotedUntil: Date | null;
    }>;
    boostProduk(id: string, user: any, body: {
        packageType?: string;
        scope?: string;
        durationDays?: number;
        price?: number;
        paymentMethod?: string;
        promotedUntil?: string;
    }): Promise<{
        sisaDurasiHari: number;
        sisaDurasiJam: number;
        rt: {
            nomor: string;
        };
        seller: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
            phone: string;
            id: string;
        };
        rtId: string;
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        kategori: string;
        judul: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
        isPromoted: boolean;
        promotedBadge: string | null;
        paketIklan: string | null;
        promotedAt: Date | null;
        promotedUntil: Date | null;
    }>;
    deleteProduk(id: string, user: any): Promise<{
        rtId: string;
        id: string;
        isActive: boolean;
        kelurahanId: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string;
        kategori: string;
        judul: string;
        sellerId: string;
        harga: import("@prisma/client/runtime/library").Decimal;
        fotoUrl: string | null;
        kontakWa: string;
        isPromoted: boolean;
        promotedBadge: string | null;
        paketIklan: string | null;
        promotedAt: Date | null;
        promotedUntil: Date | null;
    }>;
}
