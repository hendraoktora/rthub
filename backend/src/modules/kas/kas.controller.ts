import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KasService } from './kas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, TipeKas } from '@prisma/client';

@ApiTags('Kas RT (Pembukuan & Saldo Lingkungan)')
@Controller('api/kas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KasController {
  constructor(private readonly kasService: KasService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan saldo kas, pemasukan, pengeluaran & mutasi RT' })
  async getSummary(@CurrentUser() user: any) {
    return this.kasService.getKasSummary(user.rtId);
  }

  @Post()
  @Roles(Role.BENDAHARA_RT, Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mencatat transaksi kas / set saldo awal (Khusus Pengurus RT)' })
  async createKas(
    @CurrentUser() user: any,
    @Body() body: { tipe: TipeKas; kategori: string; nominal: number; keterangan: string; buktiNotaUrl?: string },
  ) {
    return this.kasService.createKasEntry(user.rtId, user.id, body);
  }

  @Post('catat')
  @Roles(Role.BENDAHARA_RT, Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mencatat transaksi kas masuk atau keluar (Khusus Pengurus RT)' })
  async createKasAlias(
    @CurrentUser() user: any,
    @Body() body: { tipe: TipeKas; kategori: string; nominal: number; keterangan: string; buktiNotaUrl?: string },
  ) {
    return this.kasService.createKasEntry(user.rtId, user.id, body);
  }

  // ================= PENARIKAN KAS RT (BENDAHARA) =================

  @Get('penarikan/riwayat')
  @Roles(Role.BENDAHARA_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Melihat riwayat pengajuan penarikan dana kas RT (Khusus Bendahara RT & Superadmin)' })
  async getRiwayatPenarikan(@CurrentUser() user: any) {
    return this.kasService.getRiwayatPenarikan(user.rtId);
  }

  @Post('penarikan/ajukan')
  @Roles(Role.BENDAHARA_RT)
  @ApiOperation({ summary: 'Mengajukan pencairan dana kas RT ke rekening bank (Khusus Bendahara RT)' })
  async ajukanPenarikan(
    @CurrentUser() user: any,
    @Body() body: { bankName: string; nomorRekening: string; namaPemilik: string; nominalTarik: number },
  ) {
    return this.kasService.ajukanPenarikanKas(user.rtId, user.id, body);
  }

  // ================= SUPERADMIN AUDIT & REVENUE =================

  @Get('superadmin/penarikan-list')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mendapatkan daftar pengajuan penarikan kas RT lengkap dengan multi-layer verification audit (Superadmin)' })
  async getPenarikanSuperadmin() {
    return this.kasService.getAllPenarikanSuperadmin();
  }

  @Post('superadmin/penarikan-approve')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Menyetujui dan mencairkan penarikan dana kas RT (Superadmin)' })
  async approvePenarikan(
    @CurrentUser() user: any,
    @Body() body: { penarikanId: string },
  ) {
    return this.kasService.approvePenarikan(body.penarikanId, user.id);
  }

  @Post('superadmin/penarikan-reject')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Menolak permohonan penarikan kas RT (Superadmin)' })
  async rejectPenarikan(
    @Body() body: { penarikanId: string; alasan?: string },
  ) {
    return this.kasService.rejectPenarikan(body.penarikanId, body.alasan);
  }

  @Get('superadmin/uang-masuk')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Monitoring rincian seluruh arus uang masuk dari iuran & iklan lapak (Superadmin)' })
  async getSuperadminUangMasuk() {
    return this.kasService.getSuperadminUangMasuk();
  }

  @Get('superadmin/fee-config')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mendapatkan konfigurasi tarif dan fee platform RtHub' })
  async getFeeConfig() {
    return this.kasService.getPlatformFeeConfig();
  }

  @Post('superadmin/fee-config')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Memperbarui konfigurasi tarif dan fee platform RtHub (Khusus Superadmin)' })
  async updateFeeConfig(
    @Body() body: {
      feeTransaksiIuran?: number;
      feePenarikanKas?: number;
      feeVirtualAccount?: number;
      biayaAddonBulanan?: number;
    },
  ) {
    return this.kasService.updatePlatformFeeConfig(body);
  }
}
