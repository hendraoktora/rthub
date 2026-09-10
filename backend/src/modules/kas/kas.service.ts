import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipeKas } from '@prisma/client';

@Injectable()
export class KasService {
  constructor(private prisma: PrismaService) {}

  async getKasSummary(rtId?: string) {
    let targetRtId = rtId;
    if (!targetRtId) {
      const defaultRt = await this.prisma.rT.findFirst();
      targetRtId = defaultRt?.id;
    }

    const whereClause = targetRtId ? { rtId: targetRtId } : {};

    const kasList = await this.prisma.kasRT.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalPemasukan = await this.prisma.kasRT.aggregate({
      where: { ...whereClause, tipe: TipeKas.PEMASUKAN },
      _sum: { nominal: true },
    });

    const totalPengeluaran = await this.prisma.kasRT.aggregate({
      where: { ...whereClause, tipe: TipeKas.PENGELUARAN },
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
    const nominalNum = Number(data.nominal);
    if (!nominalNum || nominalNum <= 0) {
      throw new BadRequestException('Nominal kas harus lebih dari 0.');
    }

    let targetRtId = rtId;
    if (!targetRtId) {
      const defaultRt = await this.prisma.rT.findFirst();
      targetRtId = defaultRt?.id;
    }

    if (!targetRtId) {
      throw new BadRequestException('Wilayah RT tidak ditemukan.');
    }

    const currentSummary = await this.getKasSummary(targetRtId);
    const newSaldo = data.tipe === TipeKas.PEMASUKAN
      ? currentSummary.saldoKas + nominalNum
      : currentSummary.saldoKas - nominalNum;

    return this.prisma.kasRT.create({
      data: {
        rtId: targetRtId,
        createdById: userId,
        tipe: data.tipe,
        kategori: data.kategori,
        nominal: nominalNum,
        saldoBerjalan: newSaldo,
        keterangan: data.keterangan,
        buktiNotaUrl: data.buktiNotaUrl || null,
      },
    });
  }
}
