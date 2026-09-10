import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipeKas } from '@prisma/client';

@Injectable()
export class KasService {
  constructor(private prisma: PrismaService) {}

  async getKasSummary(rtId: string) {
    const kasList = await this.prisma.kasRT.findMany({
      where: { rtId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalPemasukan = await this.prisma.kasRT.aggregate({
      where: { rtId, tipe: TipeKas.PEMASUKAN },
      _sum: { nominal: true },
    });

    const totalPengeluaran = await this.prisma.kasRT.aggregate({
      where: { rtId, tipe: TipeKas.PENGELUARAN },
      _sum: { nominal: true },
    });

    const sumIn = Number(totalPemasukan._sum.nominal || 0);
    const sumOut = Number(totalPengeluaran._sum.nominal || 0);
    const saldoKas = sumIn - sumOut;

    return {
      saldoKas,
      totalPemasukan: sumIn,
      totalPengeluaran: sumOut,
      recentTransactions: kasList,
    };
  }

  async createKasEntry(rtId: string, userId: string, data: {
    tipe: TipeKas;
    kategori: string;
    nominal: number;
    keterangan: string;
    buktiNotaUrl?: string;
  }) {
    if (data.nominal <= 0) {
      throw new BadRequestException('Nominal kas harus lebih dari 0.');
    }

    const currentSummary = await this.getKasSummary(rtId);
    const newSaldo = data.tipe === TipeKas.PEMASUKAN
      ? currentSummary.saldoKas + Number(data.nominal)
      : currentSummary.saldoKas - Number(data.nominal);

    return this.prisma.kasRT.create({
      data: {
        rtId,
        createdById: userId,
        tipe: data.tipe,
        kategori: data.kategori,
        nominal: data.nominal,
        saldoBerjalan: newSaldo,
        keterangan: data.keterangan,
        buktiNotaUrl: data.buktiNotaUrl || null,
      },
    });
  }
}
