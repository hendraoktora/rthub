import { LapakService } from './lapak.service';
export declare class LapakController {
    private readonly lapakService;
    constructor(lapakService: LapakService);
    getProdukDefault(user: any): Promise<({
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
    getProduk(user: any): Promise<({
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
    getKontrakan(user: any): Promise<({
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
    createProdukDefault(user: any, body: {
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
    createProduk(user: any, body: {
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
