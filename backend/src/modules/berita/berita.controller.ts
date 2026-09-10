import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BeritaService } from './berita.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ScopeWilayah } from '@prisma/client';

@ApiTags('Berita & Pengumuman (Hierarkis RT, RW, Kelurahan)')
@Controller('api/berita')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BeritaController {
  constructor(private readonly beritaService: BeritaService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Mendapatkan feed berita hierarkis (Otomatis menggabungkan berita RT, RW, dan Kelurahan)' })
  async getFeed(@CurrentUser() user: any) {
    return this.beritaService.getFeed(user);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat berita baru (Sesuai scope RT / RW / Kelurahan)' })
  async createBerita(
    @CurrentUser() user: any,
    @Body() body: { judul: string; konten: string; scope: ScopeWilayah; coverUrl?: string; isPinned?: boolean },
  ) {
    return this.beritaService.createBerita(user, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mengubah berita / pengumuman' })
  async updateBerita(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { judul?: string; konten?: string; scope?: ScopeWilayah; coverUrl?: string; isPinned?: boolean },
  ) {
    return this.beritaService.updateBerita(id, user, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus berita / pengumuman' })
  async deleteBerita(@Param('id') id: string, @CurrentUser() user: any) {
    return this.beritaService.deleteBerita(id, user);
  }
}
