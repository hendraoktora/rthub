import { Controller, Get, Post, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LapakService } from './lapak.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Lapak UMKM & Sewa Kontrakan (Cross-RT se-RW/Kelurahan)')
@Controller('api/lapak')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LapakController {
  constructor(private readonly lapakService: LapakService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar produk & jasa warga se-RW dan Kelurahan' })
  async getProdukDefault(@CurrentUser() user: any) {
    return this.lapakService.getFeedLapak(user);
  }

  @Get('produk')
  @ApiOperation({ summary: 'Mendapatkan daftar produk & jasa warga se-RW dan Kelurahan' })
  async getProduk(@CurrentUser() user: any) {
    return this.lapakService.getFeedLapak(user);
  }

  @Get('kontrakan')
  @ApiOperation({ summary: 'Mendapatkan listing sewa rumah / kontrakan / kos se-RW dan Kelurahan' })
  async getKontrakan(@CurrentUser() user: any) {
    return this.lapakService.getFeedKontrakan(user);
  }

  @Post()
  @ApiOperation({ summary: 'Pasang produk / jasa baru di lapak warga (Semua role kecuali Superadmin)' })
  async createProdukDefault(
    @CurrentUser() user: any,
    @Body() body: { judul: string; deskripsi: string; harga: number; kategori: string; kontakWa: string; fotoUrl?: string },
  ) {
    if (user.role === Role.SUPERADMIN) {
      throw new BadRequestException('Superadmin tidak diperkenankan memasang lapak UMKM.');
    }
    return this.lapakService.createProduk(user, body);
  }

  @Post('produk')
  @ApiOperation({ summary: 'Pasang produk / jasa baru di lapak warga (Semua role kecuali Superadmin)' })
  async createProduk(
    @CurrentUser() user: any,
    @Body() body: { judul: string; deskripsi: string; harga: number; kategori: string; kontakWa: string; fotoUrl?: string },
  ) {
    if (user.role === Role.SUPERADMIN) {
      throw new BadRequestException('Superadmin tidak diperkenankan memasang lapak UMKM.');
    }
    return this.lapakService.createProduk(user, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus produk lapak' })
  async deleteProduk(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lapakService.deleteProduk(id, user);
  }
}
