import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WilayahService } from './wilayah.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Wilayah (Hierarki Kelurahan, RW, RT & Manajemen Warga & Pengurus)')
@Controller('api/wilayah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WilayahController {
  constructor(private readonly wilayahService: WilayahService) {}

  @Get('kelurahan')
  @ApiOperation({ summary: 'Daftar semua Kelurahan terdaftar' })
  async getKelurahanList() {
    return this.wilayahService.getKelurahanList();
  }

  @Get('kelurahan/:kelurahanId/rw')
  @ApiOperation({ summary: 'Daftar RW di bawah Kelurahan tertentu' })
  async getRwByKelurahan(@Param('kelurahanId') kelurahanId: string) {
    return this.wilayahService.getRwByKelurahan(kelurahanId);
  }

  @Get('rw/:rwId/rt')
  @ApiOperation({ summary: 'Daftar RT di bawah RW tertentu' })
  async getRtByRw(@Param('rwId') rwId: string) {
    return this.wilayahService.getRtByRw(rwId);
  }

  @Get('rt-summary-all')
  @ApiOperation({ summary: 'Daftar ringkasan semua RT terdaftar (Superadmin real-time)' })
  async getAllRtSummary() {
    return this.wilayahService.getAllRtSummary();
  }

  @Get('rt/:rtId/warga')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Daftar lengkap warga dan unit rumah per RT' })
  async getWargaByRt(@Param('rtId') rtId: string) {
    return this.wilayahService.getWargaByRt(rtId);
  }

  @Post('rt/:rtId/warga')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Tambah warga baru langsung oleh Ketua RT / Sekretaris RT' })
  async addWargaToRt(
    @Param('rtId') rtId: string,
    @Body() body: {
      namaLengkap: string;
      phone: string;
      noRumah: string;
      nik?: string;
      noKk?: string;
      statusHunian?: string;
      namaIstri?: string;
      anggotaKeluarga?: string[];
    },
  ) {
    return this.wilayahService.addWargaToRt(rtId, body);
  }

  // Pengurus Endpoints
  @Get('rt/:rtId/pengurus')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Daftar struktur pengurus RT aktif' })
  async getPengurusByRt(@Param('rtId') rtId: string) {
    return this.wilayahService.getPengurusByRt(rtId);
  }

  @Post('rt/:rtId/pengurus')
  @ApiBearerAuth()
  @Roles(Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Tambah atau ubah jabatan pengurus RT (Khusus Ketua RT & Sekretaris RT)' })
  async addOrUpdatePengurus(
    @Param('rtId') rtId: string,
    @Body() body: {
      namaLengkap: string;
      phone: string;
      role: Role;
      noRumah?: string;
      email?: string;
    },
  ) {
    return this.wilayahService.addOrUpdatePengurus(rtId, body);
  }

  @Delete('rt/:rtId/pengurus/:userId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Hapus pengurus RT (Khusus Ketua RT & Sekretaris RT)' })
  async deletePengurus(@Param('userId') userId: string) {
    return this.wilayahService.deletePengurus(userId);
  }
}
