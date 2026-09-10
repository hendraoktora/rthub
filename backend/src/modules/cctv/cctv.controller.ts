import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CctvService } from './cctv.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('CCTV Lingkungan (Live Stream RT & RW)')
@Controller('api/cctv')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CctvController {
  constructor(private readonly cctvService: CctvService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar live streaming CCTV di RT dan RW pengguna' })
  async getCctvList(@CurrentUser() user: any) {
    return this.cctvService.getCctvList(user);
  }

  @Post()
  @Roles(Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Menambahkan titik live streaming CCTV baru (Khusus RT & Sekretaris)' })
  async createCctv(
    @CurrentUser() user: any,
    @Body() body: { namaTitik: string; streamUrl: string; thumbnailUrl?: string },
  ) {
    return this.cctvService.createCctv(user, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Menghapus titik CCTV (Khusus RT & Sekretaris)' })
  async deleteCctv(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.cctvService.deleteCctv(id, user);
  }
}

