import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ScopeWilayah } from '@prisma/client';

@ApiTags('Agenda & Jadwal Kegiatan Lingkungan (Kalender RT/RW)')
@Controller('api/agenda')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar jadwal kegiatan / kalender lingkungan (Kerja bakti, rapat, posyandu, ronda)' })
  async getAgenda(@CurrentUser() user: any) {
    return this.agendaService.getAgenda(user);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat jadwal kegiatan baru' })
  async createAgenda(
    @CurrentUser() user: any,
    @Body() body: { judul: string; kategori: string; deskripsi?: string; tanggalMulai: string; tanggalSelesai?: string; lokasi?: string; scope?: ScopeWilayah },
  ) {
    return this.agendaService.createAgenda(user, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mengubah jadwal kegiatan' })
  async updateAgenda(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { judul?: string; kategori?: string; deskripsi?: string; tanggalMulai?: string; tanggalSelesai?: string; lokasi?: string },
  ) {
    return this.agendaService.updateAgenda(id, user, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus jadwal kegiatan' })
  async deleteAgenda(@Param('id') id: string, @CurrentUser() user: any) {
    return this.agendaService.deleteAgenda(id, user);
  }
}
