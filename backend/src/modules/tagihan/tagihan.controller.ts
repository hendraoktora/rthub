import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagihanService } from './tagihan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, PaymentMethod } from '@prisma/client';

@ApiTags('Tagihan & Pembayaran (IPL, Kas & Fee Admin)')
@Controller('api/tagihan')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TagihanController {
  constructor(private readonly tagihanService: TagihanService) {}

  @Get('master')
  @ApiOperation({ summary: 'Mendapatkan daftar master tagihan di RT pengguna' })
  async getMaster(@CurrentUser() user: any) {
    return this.tagihanService.getMasterTagihan(user.rtId);
  }

  @Post('master')
  @Roles(Role.BENDAHARA_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Atur / Ubah nominal tarif iuran bulanan RT (Khusus Bendahara RT)' })
  async setMaster(
    @CurrentUser() user: any,
    @Body() body: { namaTagihan?: string; nominalPokok: number; deskripsi?: string },
  ) {
    return this.tagihanService.setMasterTagihan(user.rtId, body);
  }

  @Post('generate-bulanan')
  @Roles(Role.BENDAHARA_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Menerbitkan tagihan iuran bulanan massal ke seluruh rumah di RT (Khusus Bendahara RT)' })
  async generateBulanan(
    @CurrentUser() user: any,
    @Body() body: { masterTagihanId: string; bulan: number; tahun: number },
  ) {
    return this.tagihanService.generateTagihanBulanan(user.rtId, body.masterTagihanId, body.bulan, body.tahun);
  }

  @Get('saya')
  @ApiOperation({ summary: 'Mendapatkan riwayat dan tagihan aktif rumah pengguna' })
  async getTagihanSaya(@CurrentUser() user: any) {
    return this.tagihanService.getTagihanSaya(user);
  }

  @Get('pending-verifikasi')
  @Roles(Role.BENDAHARA_RT, Role.ADMIN_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Daftar bukti pembayaran iuran warga yang menunggu persetujuan (Khusus Bendahara RT)' })
  async getPendingVerifikasi(@CurrentUser() user: any) {
    return this.tagihanService.getPendingVerifikasi(user.rtId);
  }

  @Get(':id/instruksi')
  @ApiOperation({ summary: 'Mendapatkan instruksi bayar beserta no rek & QRIS RT' })
  async getInstruksi(@Param('id') id: string) {
    return this.tagihanService.getInstruksiBayar(id);
  }

  @Post(':id/konfirmasi')
  @ApiOperation({ summary: 'Warga mengonfirmasi pembayaran dan upload bukti transfer / QRIS' })
  async konfirmasiBayar(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { paymentMethod: PaymentMethod; buktiBayarUrl?: string; catatan?: string },
  ) {
    return this.tagihanService.konfirmasiBayarWarga(id, user.id, body);
  }

  @Post(':id/terima-tunai')
  @Roles(Role.BENDAHARA_RT, Role.ADMIN_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Bendahara menandai tagihan dibayar tunai langsung secara fisik' })
  async terimaTunai(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tagihanService.terimaTunai(id, user.id);
  }

  @Post('transaksi/:transaksiId/approve')
  @Roles(Role.BENDAHARA_RT, Role.ADMIN_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Bendahara menyetujui bukti transfer / QRIS warga' })
  async approveTransaksi(@Param('transaksiId') transaksiId: string, @CurrentUser() user: any) {
    return this.tagihanService.approveTransaksi(transaksiId, user.id);
  }

  @Post(':id/bayar')
  @ApiOperation({ summary: 'Simulasi bayar tagihan iuran instan' })
  async bayar(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { paymentMethod: PaymentMethod },
  ) {
    return this.tagihanService.bayarTagihan(id, user.id, body.paymentMethod || PaymentMethod.QRIS);
  }
}
