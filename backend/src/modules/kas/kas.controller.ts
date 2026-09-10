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
  @Roles(Role.BENDAHARA_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mencatat transaksi kas / set saldo awal (Khusus Bendahara RT)' })
  async createKas(
    @CurrentUser() user: any,
    @Body() body: { tipe: TipeKas; kategori: string; nominal: number; keterangan: string; buktiNotaUrl?: string },
  ) {
    return this.kasService.createKasEntry(user.rtId, user.id, body);
  }

  @Post('catat')
  @Roles(Role.BENDAHARA_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Mencatat transaksi kas masuk atau keluar (Khusus Bendahara RT)' })
  async createKasAlias(
    @CurrentUser() user: any,
    @Body() body: { tipe: TipeKas; kategori: string; nominal: number; keterangan: string; buktiNotaUrl?: string },
  ) {
    return this.kasService.createKasEntry(user.rtId, user.id, body);
  }
}
