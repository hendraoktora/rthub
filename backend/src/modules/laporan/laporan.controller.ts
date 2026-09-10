import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LaporanService } from './laporan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StatusLaporan } from '@prisma/client';

@ApiTags('Laporan Warga & Keluhan Lingkungan (Lapor RT)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post()
  @ApiOperation({ summary: 'Buat laporan keluhan RT baru (Bisa dilakukan semua role kecuali Superadmin)' })
  async createLaporan(
    @CurrentUser() user: any,
    @Body() body: {
      judul: string;
      deskripsi: string;
      kategori: string;
      fotoUrl?: string;
      isAnonymous?: boolean;
    },
  ) {
    return this.laporanService.createLaporan(user, body);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar laporan warga di lingkungan RT' })
  async getLaporanList(@CurrentUser() user: any) {
    return this.laporanService.getLaporanList(user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status laporan dan berikan tanggapan RT' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: StatusLaporan; tanggapanRT?: string },
  ) {
    return this.laporanService.updateStatus(id, body);
  }
}
