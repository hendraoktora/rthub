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

  @Post(':id/bayar')
  @ApiOperation({ summary: 'Bayar tagihan iuran (Split otomatis: Kas RT + Fee Admin)' })
  async bayar(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { paymentMethod: PaymentMethod },
  ) {
    return this.tagihanService.bayarTagihan(id, user.id, body.paymentMethod || PaymentMethod.QRIS);
  }
}
